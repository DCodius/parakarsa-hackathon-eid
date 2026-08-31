/**
 * TC-EID-03 — bukti tanda tangan digital di IDChain.
 *
 * Nilai di bawah adalah bukti sandbox: bentuknya persis seperti blok
 * `signature_proof` pada callback e.id (PRD 3.2.3), dan diganti data asli
 * begitu Verifier API tersambung. Ditandai Simulation Mode di UI supaya juri
 * tidak salah membacanya sebagai transaksi live.
 */
export const sandboxProof = {
  did: "did:idchain:0x9876543210fedcba9876543210fedcba98765432",
  address: "0x4f3a1c9d5e6b7a8c9d0e1f2a3b4c5d6e7f809a1b",
  tx: "0xabcde12345f6789012345678901234567890abcdef1234567890abcdef123456",
  recordedAt: "2026-09-01T03:12:44Z",
};

/**
 * Explorer publik IDChain belum punya URL resmi di techdoc e.id, jadi tautannya
 * dinyalakan lewat env — bukan ditebak. Tanpa env, UI menawarkan salin hash.
 */
export function explorerUrl(txHash: string): string | null {
  const base = process.env.NEXT_PUBLIC_IDCHAIN_EXPLORER;
  return base ? `${base.replace(/\/$/, "")}/tx/${txHash}` : null;
}

/** Hash panjang tidak muat di kartu: potong tengahnya, bukan ekornya. */
export function shortenHash(value: string, visible = 8): string {
  if (value.length <= visible * 2 + 3) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}
