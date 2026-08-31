"use client";

import { EVIDENCE_BONUS, EVIDENCE_CAP } from "@/lib/dna";

/**
 * Upload-first LMS evidence: the full LMS is out of scope for the hackathon
 * deploy, so entrepreneurs attach their own certificate or DNA report instead.
 * Daftar berkas dimiliki ProfileTabs karena tiap bukti menggeser diagram DNA.
 * ponytail: filename only, no storage — wire to object storage when the VPS is up.
 */
export function CertificateUpload({
  files,
  onAdd,
}: {
  files: string[];
  onAdd: (names: string[]) => void;
}) {

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6">
      <h2 className="text-lg font-semibold">Bukti kelulusan LMS</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Unggah sertifikat atau laporan DNA (PDF/PNG) untuk memperkuat pilar Talenta pada
        EP Score Anda. Tiap berkas menambah {EVIDENCE_BONUS} poin pilar Talenta, maksimal{" "}
        {EVIDENCE_CAP} poin.
      </p>

      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-hairline bg-canvas px-6 py-10 text-center transition hover:border-primary">
        <span className="text-sm font-medium">Pilih berkas</span>
        <span className="mt-1 text-xs text-ink-muted">PDF atau PNG, maksimal 5 MB</span>
        <input
          type="file"
          accept=".pdf,.png"
          multiple
          className="sr-only"
          onChange={(event) => onAdd(Array.from(event.target.files ?? []).map((file) => file.name))}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((name) => (
            <li
              key={name}
              className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm"
            >
              <span className="truncate">{name}</span>
              <span className="ml-auto shrink-0 text-xs text-ink-muted">menunggu verifikasi</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
