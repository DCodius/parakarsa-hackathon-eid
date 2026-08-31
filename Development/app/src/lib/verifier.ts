import { io, type Socket } from "socket.io-client";
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

/**
 * PRD 3.3 — kabar perubahan status datang lewat WebSocket, jadi layar ikut
 * berubah saat holder menyetujui di ponselnya. Polling tetap dipertahankan
 * sebagai jaring pengaman bila jaringan lokasi memblokir WebSocket.
 */
export function watchVerification(
  sessionId: string,
  onUpdate: (session: VerificationSession) => void,
): () => void {
  const socket: Socket = io(apiUrl, {
    path: "/api/socket.io",
    withCredentials: true,
    // Tanpa ini socket.io mencoba long-polling dulu; keduanya dibiarkan supaya
    // wifi yang memblokir upgrade WebSocket tetap dapat kabar.
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => socket.emit("watch", sessionId));
  socket.on("verification:update", onUpdate);

  return () => {
    socket.emit("unwatch", sessionId);
    socket.disconnect();
  };
}
