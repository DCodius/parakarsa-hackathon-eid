import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { AccountsService } from '../accounts/accounts.service.js';
import type { Envelope } from '../eid/eid.types.js';
import type {
  PublicSession,
  SignatureProof,
  VerificationCallback,
  VerificationSession,
  VerificationStatus,
  VerifiedClaims,
} from './verifier.types.js';

/**
 * Verifier API e.id (PRD 3.2) — login terdesentralisasi lewat pemindaian QR.
 *
 *   1. POST /oauth/token                       client_credentials -> Bearer token
 *   2. POST /api/v1/verifier/request-verification  minta QR untuk satu schema
 *   3. POST <callback_url>                     gateway mengirim claims + signature_proof
 *
 * Verifier API hidup di host Issuer (gateway-sandbox.e.id), berbeda dari host
 * OAuth SSO (api-dev.e.id) yang dipakai EidService.
 *
 * Selama kredensial verifier belum diberikan support e.id, layanan ini berjalan
 * dalam mode simulasi: alurnya identik, hanya isinya yang dibangkitkan lokal dan
 * ditandai `simulated` supaya UI bisa mengumumkannya.
 */
@Injectable()
export class VerifierService {
  private readonly logger = new Logger(VerifierService.name);
  private readonly sessions = new Map<string, VerificationSession>();
  private token?: { value: string; expiresAt: number };

  /** QR e.id berumur pendek; sesi yang lewat batas ini dianggap kedaluwarsa. */
  private static readonly SESSION_TTL_MS = 2 * 60 * 1000;

  /**
   * Batas atas sesi yang ditahan di memori. Pembatas laju sudah menjaga per IP,
   * tapi lalu lintas dari banyak IP tetap tidak boleh menggelembungkan memori.
   */
  private static readonly MAX_SESSIONS = 500;

  /** Klaim yang diminta ParaKarsa — sama persis dengan PRD 3.2.2. */
  private static readonly REQUIRED_CLAIMS = [
    'name',
    'nik',
    'phone_number',
    'whatsapp_status',
  ];

  constructor(
    private readonly config: ConfigService,
    private readonly accounts: AccountsService,
  ) {}

  private get base(): string {
    return this.config.get<string>('EID_VERIFIER_BASE_URL') ?? 'https://gateway-sandbox.e.id';
  }

  /**
   * Mode live hanya menyala kalau tiga hal ada: client id, secret, dan schema.
   * Kurang satu pun, seluruh alur jatuh ke simulasi daripada gagal separuh jalan.
   */
  get isLive(): boolean {
    return Boolean(
      this.config.get<string>('EID_VERIFIER_CLIENT_ID') &&
        this.config.get<string>('EID_VERIFIER_CLIENT_SECRET') &&
        this.config.get<string>('EID_VERIFIER_SCHEMA_ID'),
    );
  }

  /** Langkah 1 — token dipakai ulang sampai mendekati kedaluwarsa. */
  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now()) return this.token.value;

    const response = await this.fetch(`${this.base}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.config.get<string>('EID_VERIFIER_CLIENT_ID'),
        client_secret: this.config.get<string>('EID_VERIFIER_CLIENT_SECRET'),
        grant_type: 'client_credentials',
      }),
    });

    const data = await this.unwrap<{ token: string; ttl?: number }>(response);
    // Disegarkan semenit lebih awal supaya tidak ada request yang jatuh tepat di batas.
    const lifetime = ((data.ttl ?? 3600) - 60) * 1000;
    this.token = { value: data.token, expiresAt: Date.now() + lifetime };
    return data.token;
  }

  /** Langkah 2 — QR baru untuk satu percobaan login. */
  async createSession(): Promise<PublicSession> {
    this.pruneExpired();

    const session = this.isLive ? await this.requestVerification() : this.simulatedSession();

    // Map menjaga urutan penyisipan, jadi entri terlama ada di depan.
    while (this.sessions.size >= VerifierService.MAX_SESSIONS) {
      const oldest = this.sessions.keys().next().value;
      if (oldest === undefined) break;
      this.sessions.delete(oldest);
    }

    this.sessions.set(session.id, session);
    return toPublic(session);
  }

  private async requestVerification(): Promise<VerificationSession> {
    const token = await this.accessToken();
    const response = await this.fetch(`${this.base}/api/v1/verifier/request-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        schema_id: this.config.get<string>('EID_VERIFIER_SCHEMA_ID'),
        callback_url: this.callbackUrl,
        required_claims: VerifierService.REQUIRED_CLAIMS,
      }),
    });

    const data = await this.unwrap<{
      verification_id?: string;
      qr_token?: string;
      eid_oauth_url?: string;
    }>(response);

    const id = data.verification_id ?? randomUUID();
    return {
      id,
      status: 'waiting',
      // Dompet e.id memindai URL sesi; qr_token dipakai bila URL tidak dikirim.
      qr: data.eid_oauth_url ?? data.qr_token ?? id,
      simulated: false,
      ...this.window(),
    };
  }

  private simulatedSession(): VerificationSession {
    const id = `sim-${randomUUID()}`;
    return {
      id,
      status: 'waiting',
      qr: `${this.callbackUrl}?verification_id=${id}&mode=simulation`,
      simulated: true,
      ...this.window(),
    };
  }

  private window() {
    const createdAt = Date.now();
    return { createdAt, expiresAt: createdAt + VerifierService.SESSION_TTL_MS };
  }

  private get callbackUrl(): string {
    return (
      this.config.get<string>('EID_VERIFIER_CALLBACK_URL') ??
      'http://localhost:4000/api/v1/callback/e-id'
    );
  }

  /** Dibaca frontend sambil menunggu holder menyetujui di ponselnya. */
  readSession(id: string): PublicSession | null {
    const session = this.sessions.get(id);
    if (!session) return null;

    if (session.status === 'waiting' && session.expiresAt < Date.now()) {
      session.status = 'expired';
    }
    return toPublic(session);
  }

  /**
   * Langkah 3 — hasil dari gateway. Sesi yang tidak dikenal ditolak, karena
   * callback tanpa sesi berarti kita tidak pernah meminta verifikasi itu.
   */
  recordResult(payload: VerificationCallback): PublicSession {
    const id = payload.verification_id ?? '';
    const session = this.sessions.get(id);
    if (!session) {
      throw new ServiceUnavailableException(`Sesi verifikasi ${id || '(kosong)'} tidak dikenal`);
    }

    session.status = mapStatus(payload.status);
    session.claims = payload.claims ?? session.claims;
    session.proof = payload.signature_proof ?? session.proof;
    this.finalize(session);
    this.logger.log(`Verifikasi ${id}: ${session.status}`);
    return toPublic(session);
  }

  /**
   * Jalan pintas demo: memajukan sesi simulasi satu langkah, meniru pemindaian
   * lalu persetujuan di Dompet e.id. Sesi live tidak boleh disentuh dari sini.
   */
  advanceSimulation(id: string): PublicSession | null {
    const session = this.sessions.get(id);
    if (!session || !session.simulated) return null;

    if (session.status === 'waiting') {
      session.status = 'scanned';
    } else if (session.status === 'scanned') {
      session.status = 'approved';
      session.claims = SIMULATED_CLAIMS;
      session.proof = SIMULATED_PROOF;
      this.finalize(session);
    }
    return toPublic(session);
  }

  /**
   * TC-EID-01 — persetujuan holder langsung menjadi akun dan sesi ParaKarsa.
   * Tiap hasil verifikasi dicatat ke hash log, disetujui maupun ditolak.
   */
  private finalize(session: VerificationSession): void {
    if (session.status !== 'approved' || session.sessionToken) {
      this.accounts.logVerification({
        verificationId: session.id,
        status: session.status,
        claims: session.claims,
        proof: session.proof,
        simulated: session.simulated,
      });
      return;
    }

    const account = this.accounts.upsertFromClaims(session.claims ?? {}, {
      simulated: session.simulated,
      did: session.proof?.did_key,
    });
    session.accountId = account.id;
    session.sessionToken = this.accounts.createSession(account.id);

    this.accounts.logVerification({
      verificationId: session.id,
      accountId: account.id,
      status: session.status,
      claims: session.claims,
      proof: session.proof,
      simulated: session.simulated,
    });
  }

  /** Token sesi hanya boleh keluar lewat cookie, bukan lewat body JSON. */
  sessionTokenFor(id: string): string | undefined {
    return this.sessions.get(id)?.sessionToken;
  }

  /** Sesi kedaluwarsa tidak perlu disimpan; QR-nya sudah mati di sisi e.id. */
  private pruneExpired(): void {
    const cutoff = Date.now() - VerifierService.SESSION_TTL_MS;
    for (const [id, session] of this.sessions) {
      if (session.createdAt < cutoff) this.sessions.delete(id);
    }
  }

  /** Gateway bisa lambat di wifi lokasi lomba, jadi tiap panggilan dibatasi waktu. */
  private async fetch(url: string, init: RequestInit = {}): Promise<Response> {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
    } catch (error) {
      throw new ServiceUnavailableException(
        `Tidak bisa menghubungi Verifier e.id: ${(error as Error).message}`,
      );
    }
  }

  private async unwrap<T>(response: Response): Promise<T> {
    const body = (await response.json().catch(() => ({}))) as Envelope<T>;
    if (!response.ok || body.status === false || body.data == null) {
      throw new ServiceUnavailableException(
        body.message ?? `Permintaan Verifier e.id gagal (HTTP ${response.status})`,
      );
    }
    return body.data;
  }
}

/** Isi kredensial contoh untuk mode simulasi — bukan data orang sungguhan. */
const SIMULATED_CLAIMS: VerifiedClaims = {
  name: 'Irfan Fakhri Muhammad',
  nik: '3204012345678901',
  phone_number: '6281234567890',
  whatsapp_status: 'active',
  kyc_vendor: 'Vida',
};

const SIMULATED_PROOF: SignatureProof = {
  did_key: 'did:idchain:0x9876543210fedcba9876543210fedcba98765432',
  on_chain_tx: '0xabcde12345f6789012345678901234567890abcdef1234567890abcdef123456',
};

/** Kosakata status gateway lebih kaya dari milik kita; petakan seadanya. */
function mapStatus(status?: string): VerificationStatus {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'success':
    case 'finished':
      return 'approved';
    case 'rejected':
    case 'failed':
      return 'rejected';
    case 'scanned':
    case 'waiting_approval':
      return 'scanned';
    case 'expired':
      return 'expired';
    default:
      return 'waiting';
  }
}

function toPublic(session: VerificationSession): PublicSession {
  return {
    id: session.id,
    status: session.status,
    qr: session.qr,
    simulated: session.simulated,
    expiresAt: new Date(session.expiresAt).toISOString(),
    claims: session.claims,
    proof: session.proof,
    signedIn: Boolean(session.sessionToken),
  };
}
