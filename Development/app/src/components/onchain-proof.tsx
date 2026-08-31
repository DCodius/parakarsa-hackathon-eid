"use client";

import { useState } from "react";
import { explorerUrl, sandboxProof, shortenHash } from "@/lib/chain";
import { Badge, VerifiedTick } from "./ui";

/**
 * TC-EID-03: dari profil, siapa pun bisa memeriksa bukti tanda tangan digital
 * yang tercatat on-chain — tanpa perlu percaya pada ParaKarsa.
 */
export function OnchainProof() {
  const [copied, setCopied] = useState<string | null>(null);
  const explorer = explorerUrl(sandboxProof.tx);

  const rows = [
    { label: "DID penerbit", value: sandboxProof.did },
    { label: "Alamat on-chain", value: sandboxProof.address },
    { label: "Hash transaksi", value: sandboxProof.tx },
  ];

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-base font-semibold">Bukti verifikasi on-chain</h2>
        <Badge>
          <VerifiedTick className="size-3" />
          Tercatat di IDChain
        </Badge>
        <Badge tone="amber">Simulation Mode</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Setiap persetujuan kredensial meninggalkan tanda tangan digital di ledger IDChain.
        Cocokkan hash di bawah untuk membuktikan profil ini tidak diketik manual.
      </p>

      <dl className="mt-5 space-y-2 border-t border-hairline pt-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <dt className="w-36 shrink-0 text-ink-muted">{row.label}</dt>
            <dd className="flex min-w-0 flex-1 items-center gap-2">
              <code className="truncate font-mono text-xs">{shortenHash(row.value)}</code>
              <button
                type="button"
                onClick={() => copy(row.value)}
                className="ml-auto shrink-0 text-xs font-medium text-primary hover:underline"
              >
                {copied === row.value ? "Tersalin" : "Salin"}
              </button>
            </dd>
          </div>
        ))}
        <div className="flex items-center gap-3 text-sm">
          <dt className="w-36 shrink-0 text-ink-muted">Waktu pencatatan</dt>
          <dd className="text-xs">
            {new Date(sandboxProof.recordedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}{" "}
            WIB
          </dd>
        </div>
      </dl>

      {explorer ? (
        <a
          href={explorer}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Verifikasi di IDChain Explorer
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path
              d="M6 3h7v7M13 3 6.5 9.5M11 10.5V13H3V5h2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ) : (
        <p className="mt-5 rounded-lg bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-muted">
          Tautan explorer aktif begitu <code className="font-mono">NEXT_PUBLIC_IDCHAIN_EXPLORER</code>{" "}
          diisi alamat explorer IDChain. Sementara itu, salin hash di atas dan tempel di explorer
          Besu testnet.
        </p>
      )}
    </div>
  );
}
