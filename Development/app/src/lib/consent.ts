/**
 * FR-04 / TC-EID-02 — Consent Control (DART).
 *
 * Sumber kebenarannya ada di backend, jadi pencabutan berlaku lintas perangkat
 * dan tetap terbaca saat diaudit.
 * ponytail: audit log masih di SQLite; pindahkan ke ledger IDChain begitu
 * endpoint consent-log on-chain tersedia.
 */
import { apiUrl } from "./api";

export type ConsentKey = "identity" | "phone" | "ep" | "third-party";

export const consentScopes: {
  key: ConsentKey;
  label: string;
  detail: string;
  locked: boolean;
}[] = [
  {
    key: "identity",
    label: "Identitas dasar (nama, email)",
    detail: "Wajib aktif — dipakai untuk membentuk akun EntreID Anda.",
    locked: true,
  },
  {
    key: "phone",
    label: "Nomor telepon & status WhatsApp",
    detail: "Dipakai mitra Hexa-Helix untuk menghubungi Anda soal program.",
    locked: false,
  },
  {
    key: "ep",
    label: "EP Score & diagram DNA",
    detail: "Menampilkan skor kesiapan Anda pada halaman publik dan listing RFQ.",
    locked: false,
  },
  {
    key: "third-party",
    label: "Akses pihak ketiga",
    detail: "Mengizinkan agregator dan investor terkurasi menarik profil Anda via API.",
    locked: false,
  },
];

export type ConsentState = Record<ConsentKey, boolean>;

export const defaultConsent: ConsentState = {
  identity: true,
  phone: true,
  ep: true,
  "third-party": false,
};

/** Bentuk entri audit log yang dikirim backend. */
export type ConsentEntry = {
  at: string;
  action: "DIBERIKAN" | "DICABUT";
  scope: string;
  /** Referensi pencatatan — berisi hash transaksi begitu ledger tersambung. */
  ref: string;
  /** Sidik jari entri; tiap entri mengunci entri sebelumnya. */
  entryHash: string;
};

/** Hasil pemeriksaan rantai audit di backend. */
export type ConsentChain = {
  intact: boolean;
  entries: number;
  head: string | null;
  brokenAt?: number;
};

export type ConsentPayload = {
  granted: ConsentState;
  log: ConsentEntry[];
  chain: ConsentChain;
};

const endpoint = `${apiUrl}/api/v1/consent`;

/** Null berarti belum masuk; consent hanya ada untuk akun yang terverifikasi. */
export async function fetchConsent(): Promise<ConsentPayload | null> {
  const response = await fetch(endpoint, { credentials: "include", cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as ConsentPayload;
}

export async function putConsent(scope: ConsentKey, granted: boolean): Promise<ConsentPayload> {
  const response = await fetch(`${endpoint}/${scope}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ granted }),
  });
  if (!response.ok) throw new Error(`Gagal menyimpan consent (HTTP ${response.status})`);
  return (await response.json()) as ConsentPayload;
}

/** Label manusiawi untuk entri audit log yang hanya membawa nama cakupan. */
export function scopeLabel(scope: string): string {
  return consentScopes.find((item) => item.key === scope)?.label ?? scope;
}
