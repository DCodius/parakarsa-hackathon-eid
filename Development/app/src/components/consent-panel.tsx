"use client";

import {
  consentScopes,
  scopeLabel,
  type ConsentEntry,
  type ConsentKey,
  type ConsentState,
} from "@/lib/consent";

/**
 * FR-04 Consent Control (DART). Status dan audit log dimiliki ProfileTabs,
 * supaya pencabutan akses langsung terlihat pada bagian profil yang digate.
 */
export function ConsentPanel({
  granted,
  log,
  signedIn,
  onToggle,
}: {
  granted: ConsentState;
  log: ConsentEntry[];
  signedIn: boolean;
  onToggle: (key: ConsentKey) => void;
}) {
  const thirdParty = granted["third-party"];

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6">
      <h2 className="text-lg font-semibold">Kendali Consent (DART)</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Data Anda tetap di dompet e.id. EntreID hanya memverifikasi — Anda yang menentukan
        bagian mana yang boleh dibaca.
      </p>

      <p
        className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
          thirdParty ? "bg-badge-green text-primary" : "bg-badge-amber text-accent"
        }`}
      >
        {thirdParty
          ? "Akses pihak ketiga: TERBUKA — agregator terkurasi dapat menarik profil Anda."
          : "Akses pihak ketiga: TERPUTUS — token eksternal ditolak sejak pencabutan terakhir."}
      </p>

      <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
        {consentScopes.map((scope) => (
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
              disabled={scope.locked || !signedIn}
              onClick={() => onToggle(scope.key)}
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
          <p className="mt-2 font-mono text-xs text-ink-muted">
            {signedIn
              ? "Belum ada perubahan. Riwayat tersimpan di server dan berlaku lintas perangkat."
              : "Masuk dengan e.id untuk mengatur consent dan melihat jejak auditnya."}
          </p>
        ) : (
          <ul className="mt-2 space-y-1 font-mono text-xs text-ink-muted">
            {log.map((entry) => (
              <li key={entry.ref} className="flex flex-wrap gap-x-2">
                <span>{new Date(entry.at).toLocaleString("id-ID")}</span>
                <span className={entry.action === "DICABUT" ? "text-accent" : "text-primary"}>
                  {entry.action}
                </span>
                <span className="text-ink-muted">— {scopeLabel(entry.scope)}</span>
                <span className="ml-auto">{entry.ref}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
