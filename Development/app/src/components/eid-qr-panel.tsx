"use client";

import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { VerifiedTick } from "@/components/ui";
import { maskNik } from "@/lib/dna";
import {
  advanceVerification,
  createVerification,
  readVerification,
  type VerificationSession,
} from "@/lib/verifier";

/**
 * PRD FR-01/TC-EID-01 — login terdesentralisasi lewat pemindaian QR.
 * QR, status, dan klaim seluruhnya berasal dari Verifier API di backend; panel
 * ini hanya menggambar dan menanyakan statusnya sampai holder menyetujui.
 */
const POLL_MS = 2000;

const steps = [
  "Buka aplikasi Dompet e.id di ponsel Anda.",
  "Pindai QR di samping ini.",
  "Setujui klaim yang diminta — akun langsung terisi.",
];

/** Klaim yang diminta ParaKarsa — cocok dengan required_claims di PRD 3.2.2. */
const requestedClaims = [
  { key: "name", label: "Nama lengkap", placeholder: "Sesuai KTP", source: "KYC Vida" },
  { key: "nik", label: "NIK", placeholder: "16 digit, tersamar", source: "KYC Vida" },
  { key: "phone_number", label: "Nomor WhatsApp", placeholder: "Terhubung", source: "Membership L1" },
  {
    key: "whatsapp_status",
    label: "Status WhatsApp",
    placeholder: "Aktif",
    source: "Membership L1",
  },
];

const statusCopy: Record<VerificationSession["status"], { label: string; detail: string }> = {
  waiting: {
    label: "Menunggu pemindaian",
    detail: "QR berlaku 2 menit. Jangan tutup halaman ini.",
  },
  scanned: {
    label: "QR terbaca di ponsel Anda",
    detail: "Lanjutkan di Dompet e.id: setujui klaim yang diminta.",
  },
  approved: {
    label: "Kredensial disetujui",
    detail: "Tanda tangan diverifikasi di IDChain. Mengalihkan ke profil…",
  },
  rejected: {
    label: "Permintaan ditolak",
    detail: "Anda menolak berbagi kredensial. Muat QR baru untuk mencoba lagi.",
  },
  expired: {
    label: "QR kedaluwarsa",
    detail: "Masa berlaku dua menit habis. Muat QR baru untuk melanjutkan.",
  },
};

export function EidQrPanel() {
  const router = useRouter();
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      // Semua perubahan state terjadi setelah await, supaya efek pemanggilnya
      // tidak memicu render berantai.
      const created = await createVerification();
      setError(null);
      setQrSvg(null);
      setSession(created);
    } catch {
      setError("Backend verifier tidak dapat dihubungi. Pastikan API di port 4000 berjalan.");
    }
  }, []);

  useEffect(() => {
    // Sesi pertama diminta sekali saat panel muncul; seluruh setState di dalam
    // start() terjadi setelah await, jadi tidak ada render berantai.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void start();
  }, [start]);

  // QR digambar dari payload yang diberikan gateway, bukan pola karangan.
  useEffect(() => {
    if (!session) return;
    let active = true;
    QRCode.toString(session.qr, { type: "svg", margin: 0, errorCorrectionLevel: "M" })
      .then((svg) => active && setQrSvg(svg))
      .catch(() => active && setError("QR gagal digambar."));
    return () => {
      active = false;
    };
  }, [session]);

  const pollable = session?.status === "waiting" || session?.status === "scanned";

  useEffect(() => {
    if (!session || !pollable) return;
    const timer = setInterval(async () => {
      try {
        setSession(await readVerification(session.id));
      } catch {
        clearInterval(timer);
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [session, pollable]);

  // Cookie sesi sudah dipasang backend saat status berubah jadi approved;
  // di sini tinggal memindahkan pengguna ke profilnya.
  useEffect(() => {
    if (session?.status !== "approved" || !session.signedIn) return;
    const timer = setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, 1200);
    return () => clearTimeout(timer);
  }, [session, router]);

  const status = session ? statusCopy[session.status] : null;
  const claims = session?.claims;

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6 md:p-8">
      <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start">
        <QrFrame svg={qrSvg} status={session?.status} />

        <div className="min-w-0">
          <h2 className="display text-xl">Masuk dengan Dompet e.id</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Kredensial Anda tetap di ponsel. ParaKarsa hanya memeriksa tanda tangan digitalnya —
            kami tidak pernah memegang kata sandi Anda.
          </p>

          <ol className="mt-5 space-y-2.5">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-ink-soft">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-semibold text-primary">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {session?.simulated && (
            <p className="mt-4 rounded-lg bg-badge-amber px-3 py-2 text-xs font-medium text-accent">
              Simulation Mode — kredensial verifier e.id belum dipasang, jadi QR ini belum
              terhubung ke Dompet e.id.
            </p>
          )}
        </div>
      </div>

      <div className="mt-7 rounded-lg border border-hairline bg-canvas p-5">
        <p className="eyebrow text-ink-muted">
          {claims ? "Data yang diterima" : "Data yang diminta"}
        </p>
        <ul className="mt-3 space-y-2.5">
          {requestedClaims.map((claim) => (
            <li key={claim.key} className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className="font-medium">{claim.label}</span>
              <span className={claims ? "text-ink" : "text-ink-muted"}>
                {claims ? displayClaim(claim.key, claims[claim.key]) : claim.placeholder}
              </span>
              <span className="ml-auto rounded bg-badge-green px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {claim.source}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-ink-muted">
          NIK berasal dari KTP Anda yang sudah diverifikasi vendor KYC Vida. ParaKarsa menyimpan
          versi tersamar saja, dan Anda bisa mencabut akses kapan pun lewat Privasi Data.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusDot status={session?.status} />
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {error ?? status?.label ?? "Menyiapkan sesi verifikasi…"}
          </p>
          <p className="text-xs text-ink-muted">
            {error ? "Jalankan backend, lalu muat ulang QR." : (status?.detail ?? "")}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          {session?.simulated && pollable && (
            <button
              type="button"
              onClick={async () => setSession(await advanceVerification(session.id))}
              className="text-xs font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              Simulasikan langkah berikutnya
            </button>
          )}
          {(error || session?.status === "expired" || session?.status === "rejected") && (
            <button
              type="button"
              onClick={() => void start()}
              className="text-xs font-medium text-primary underline underline-offset-4"
            >
              Muat QR baru
            </button>
          )}
        </div>
      </div>

      {session?.status === "approved" && !session.signedIn && (
        <p className="mt-4 rounded-lg bg-badge-amber px-4 py-3 text-xs leading-relaxed text-accent">
          Kredensial terverifikasi, tetapi sesi ParaKarsa gagal diterbitkan. Coba muat QR baru.
        </p>
      )}
    </div>
  );
}

/** NIK tidak pernah tampil utuh, bahkan di layar pemiliknya sendiri. */
function displayClaim(key: string, value?: string): string {
  if (!value) return "—";
  return key === "nik" ? maskNik(value) : value;
}

function QrFrame({ svg, status }: { svg: string | null; status?: VerificationSession["status"] }) {
  const covered = status && status !== "waiting";

  return (
    <div className="relative mx-auto size-48 rounded-lg border border-hairline bg-surface p-3 sm:mx-0">
      {svg ? (
        <div className="size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="size-full animate-pulse rounded bg-canvas-alt" />
      )}

      {covered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-surface/92 text-center">
          {status === "approved" ? (
            <VerifiedTick className="size-8" />
          ) : status === "scanned" ? (
            <span className="size-8 animate-spin rounded-full border-2 border-hairline border-t-primary" />
          ) : (
            <span className="text-2xl">⏱</span>
          )}
          <span className="px-4 text-xs font-medium text-ink-soft">
            {status === "approved"
              ? "Terverifikasi"
              : status === "scanned"
                ? "Menunggu persetujuan"
                : "QR tidak berlaku"}
          </span>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status?: VerificationSession["status"] }) {
  const tone =
    status === "approved"
      ? "bg-primary"
      : status === "rejected" || status === "expired"
        ? "bg-ink-muted"
        : "bg-accent";
  const pulse = status === "waiting" || status === "scanned" ? "animate-pulse" : "";
  return <span className={`size-2.5 shrink-0 rounded-full ${tone} ${pulse}`} />;
}
