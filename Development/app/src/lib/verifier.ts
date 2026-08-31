import { apiUrl } from "./api";

/** Cermin PublicSession di backend (src/verifier/verifier.types.ts). */
export type VerificationStatus = "waiting" | "scanned" | "approved" | "rejected" | "expired";

export type VerificationSession = {
  id: string;
  status: VerificationStatus;
  qr: string;
  simulated: boolean;
  /** true bila cookie sesi ParaKarsa sudah dipasang backend. */
  signedIn: boolean;
  expiresAt: string;
  claims?: Record<string, string | undefined>;
  proof?: { did_key?: string; on_chain_tx?: string };
};

const base = `${apiUrl}/api/v1/verifier/sessions`;

async function call(url: string, method: "GET" | "POST"): Promise<VerificationSession> {
  const response = await fetch(url, { method, credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error(`Verifier ${method} ${url} gagal (HTTP ${response.status})`);
  return (await response.json()) as VerificationSession;
}

export const createVerification = () => call(base, "POST");
export const readVerification = (id: string) => call(`${base}/${id}`, "GET");
export const advanceVerification = (id: string) => call(`${base}/${id}/advance`, "POST");
