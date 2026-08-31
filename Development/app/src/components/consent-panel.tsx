"use client";

import { useState } from "react";

/**
 * FR-04 Consent Control (DART). Toggles are local state only — the audit trail
 * they describe lands once the IDChain consent log is wired up.
 * ponytail: in-memory consent, persist to the backend when the API exists.
 */
const scopes = [
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
] as const;

export function ConsentPanel() {
  const [granted, setGranted] = useState<Record<string, boolean>>({
    identity: true,
    phone: true,
    ep: true,
    "third-party": false,
  });
  const [log, setLog] = useState<string[]>([]);

  function toggle(key: string, label: string) {
    const next = !granted[key];
    setGranted({ ...granted, [key]: next });
    const stamp = new Date().toLocaleTimeString("id-ID");
    setLog([`${stamp} · ${next ? "DIBERIKAN" : "DICABUT"} — ${label}`, ...log].slice(0, 5));
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6">
      <h2 className="text-lg font-semibold">Kendali Consent (DART)</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Data Anda tetap di dompet e.id. EntreID hanya memverifikasi — Anda yang menentukan
        bagian mana yang boleh dibaca.
      </p>

      <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
        {scopes.map((scope) => (
          <li key={scope.key} className="flex items-start gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{scope.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{scope.detail}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={granted[scope.key]}
              aria-label={scope.label}
              disabled={scope.locked}
              onClick={() => toggle(scope.key, scope.label)}
              className={`mt-0.5 h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${
                granted[scope.key] ? "bg-primary" : "bg-hairline"
              }`}
            >
              <span
                className={`block size-5 rounded-full bg-white transition-transform ${
                  granted[scope.key] ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <p className="eyebrow text-ink-muted">Audit log consent</p>
        {log.length === 0 ? (
          <p className="mt-2 font-mono text-xs text-ink-muted">Belum ada perubahan sesi ini.</p>
        ) : (
          <ul className="mt-2 space-y-1 font-mono text-xs text-ink-muted">
            {log.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
