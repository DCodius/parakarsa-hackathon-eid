import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';
import { DatabaseService } from '../db/database.service.js';
import type { SignatureProof, VerifiedClaims } from '../verifier/verifier.types.js';

/** Cookie sesi ParaKarsa — hasil verifikasi kredensial, bukan kata sandi. */
export const PK_SESSION_COOKIE = 'pk_session';

export interface Account {
  id: string;
  fullname?: string;
  email?: string;
  phone?: string;
  nik_masked?: string;
  kyc_vendor?: string;
  tier: number;
  did_key?: string;
  simulated: number;
}

/** Sesi ParaKarsa berumur satu jam, sama dengan cookie OAuth SSO. */
const SESSION_TTL_MS = 60 * 60 * 1000;

/**
 * Akun dan sesi ParaKarsa yang lahir dari kredensial terverifikasi — bukan dari
 * formulir pendaftaran. Satu NIK terverifikasi menghasilkan satu akun, berapa
 * kali pun pemiliknya login ulang.
 */
@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  /**
   * NIK di-hash bersama pepper server: cukup untuk mengenali akun yang sama,
   * tidak cukup untuk membaca ulang nomornya dari isi database.
   */
  private fingerprint(nik: string): string {
    const pepper = this.config.get<string>('NIK_PEPPER') ?? 'parakarsa-dev-pepper';
    return createHash('sha256').update(`${pepper}:${nik.replace(/\D/g, '')}`).digest('hex');
  }

  /** TC-EID-01 — akun terbentuk otomatis dari klaim yang disetujui holder. */
  upsertFromClaims(claims: VerifiedClaims, options: { simulated: boolean; did?: string }): Account {
    const nik = claims.nik ?? '';
    const hash = nik ? this.fingerprint(nik) : `no-nik:${randomUUID()}`;
    const now = new Date().toISOString();

    const existing = this.database.db
      .prepare('SELECT id FROM accounts WHERE nik_hash = ?')
      .get(hash) as { id: string } | undefined;

    const id = existing?.id ?? randomUUID();
    this.database.db
      .prepare(
        `INSERT INTO accounts (id, fullname, email, phone, nik_hash, nik_masked, kyc_vendor,
                               tier, did_key, simulated, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           fullname = excluded.fullname, email = excluded.email, phone = excluded.phone,
           nik_masked = excluded.nik_masked, kyc_vendor = excluded.kyc_vendor,
           tier = excluded.tier, did_key = excluded.did_key, updated_at = excluded.updated_at`,
      )
      .run(
        id,
        claims.name ?? null,
        claims.email ?? null,
        claims.phone_number ?? null,
        hash,
        maskNik(nik),
        claims.kyc_vendor ?? null,
        // NIK terverifikasi vendor KYC berarti tier 2 (identitas formal).
        nik ? 2 : 1,
        options.did ?? null,
        options.simulated ? 1 : 0,
        existing ? now : now,
        now,
      );

    this.logger.log(`Akun ${existing ? 'diperbarui' : 'dibuat'} dari kredensial e.id: ${id}`);
    return this.byId(id)!;
  }

  byId(id: string): Account | null {
    return (this.database.db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) ??
      null) as Account | null;
  }

  createSession(accountId: string): string {
    const token = randomUUID();
    const now = Date.now();
    this.database.db
      .prepare('INSERT INTO sessions (token, account_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .run(
        token,
        accountId,
        new Date(now).toISOString(),
        new Date(now + SESSION_TTL_MS).toISOString(),
      );
    return token;
  }

  /** Sesi kedaluwarsa dihapus saat ditemui, jadi tidak perlu tugas pembersih. */
  bySessionToken(token: string): Account | null {
    const row = this.database.db
      .prepare('SELECT account_id, expires_at FROM sessions WHERE token = ?')
      .get(token) as { account_id: string; expires_at: string } | undefined;
    if (!row) return null;

    if (new Date(row.expires_at).getTime() < Date.now()) {
      this.revokeSession(token);
      return null;
    }
    return this.byId(row.account_id);
  }

  revokeSession(token: string): void {
    this.database.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  /**
   * PRD 3.1 — hash log verifikasi. Isi klaim tidak ikut tersimpan; yang dicatat
   * hanya sidik jarinya, statusnya, dan jejak on-chain-nya.
   */
  logVerification(input: {
    verificationId: string;
    accountId?: string;
    status: string;
    claims?: VerifiedClaims;
    proof?: SignatureProof;
    simulated: boolean;
  }): void {
    const claimsHash = createHash('sha256')
      .update(JSON.stringify(input.claims ?? {}))
      .digest('hex');

    this.database.db
      .prepare(
        `INSERT INTO verification_log
           (verification_id, account_id, status, did_key, on_chain_tx, claims_hash, simulated, at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(verification_id) DO UPDATE SET
           account_id = excluded.account_id, status = excluded.status,
           did_key = excluded.did_key, on_chain_tx = excluded.on_chain_tx,
           claims_hash = excluded.claims_hash, at = excluded.at`,
      )
      .run(
        input.verificationId,
        input.accountId ?? null,
        input.status,
        input.proof?.did_key ?? null,
        input.proof?.on_chain_tx ?? null,
        claimsHash,
        input.simulated ? 1 : 0,
        new Date().toISOString(),
      );
  }
}

/** Empat digit awal dan akhir sudah cukup bagi pemiliknya untuk mengenali. */
export function maskNik(nik: string): string {
  const digits = nik.replace(/\D/g, '');
  if (digits.length < 8) return '••••';
  return `${digits.slice(0, 4)} •••• •••• ${digits.slice(-4)}`;
}
