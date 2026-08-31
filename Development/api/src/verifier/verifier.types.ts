/** Status satu sesi verifikasi, dari QR terbit sampai kredensial disetujui. */
export type VerificationStatus = 'waiting' | 'scanned' | 'approved' | 'rejected' | 'expired';

/** Klaim yang diminta ParaKarsa — PRD 3.2.2 required_claims. */
export interface VerifiedClaims {
  name?: string;
  nik?: string;
  phone_number?: string;
  whatsapp_status?: string;
  kyc_vendor?: string;
  [claim: string]: string | undefined;
}

/** Blok bukti on-chain pada callback e.id — PRD 3.2.3. */
export interface SignatureProof {
  did_key?: string;
  on_chain_tx?: string;
}

export interface VerificationSession {
  id: string;
  status: VerificationStatus;
  /** Payload yang di-encode jadi QR di layar. */
  qr: string;
  /** true bila sesi ini tidak menyentuh gateway (kredensial verifier belum diisi). */
  simulated: boolean;
  createdAt: number;
  expiresAt: number;
  claims?: VerifiedClaims;
  proof?: SignatureProof;
  /** Terisi setelah klaim disetujui dan akun ParaKarsa diterbitkan. */
  accountId?: string;
  sessionToken?: string;
}

/** Bentuk sesi yang boleh dilihat browser — tanpa detail internal. */
export interface PublicSession {
  id: string;
  status: VerificationStatus;
  qr: string;
  simulated: boolean;
  expiresAt: string;
  claims?: VerifiedClaims;
  proof?: SignatureProof;
  /** true bila sesi ParaKarsa sudah terbit dan cookie-nya boleh dipasang. */
  signedIn: boolean;
}

/** Body yang dikirim e.id Gateway ke callback kita. */
export interface VerificationCallback {
  verification_id?: string;
  status?: string;
  claims?: VerifiedClaims;
  signature_proof?: SignatureProof;
  private_code?: string;
}
