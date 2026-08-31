import { redirect } from "next/navigation";
import { EidQrPanel } from "@/components/eid-qr-panel";
import { ButtonLink, VerifiedTick } from "@/components/ui";
import { getSession, loginHref } from "@/lib/session";

const benefits = [
  {
    title: "Identitas usaha terverifikasi",
    body: "Nama dan NIK ditarik dari KTP yang sudah dicek KYC Vida — tidak perlu isi formulir lagi.",
  },
  {
    title: "Data tetap milik Anda",
    body: "Kredensial disimpan di Dompet e.id Anda. Kami hanya menerima klaim yang Anda setujui.",
  },
  {
    title: "Bukti tercatat di IDChain",
    body: "Setiap persetujuan meninggalkan jejak tanda tangan digital yang bisa diperiksa siapa pun.",
  },
];

export default async function LoginPage() {
  if (await getSession()) redirect("/profile");

  return (
    <div className="grid min-h-[calc(100vh-61px)] lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="px-6 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="display text-3xl md:text-4xl">Masuk ke ParaKarsa.</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Satu identitas terverifikasi untuk showcase, kemitraan, dan event UMKM.
          </p>

          <div className="mt-8">
            <EidQrPanel />
          </div>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-xs text-ink-muted">tidak bisa memindai?</span>
            <span className="h-px flex-1 bg-hairline" />
          </div>

          <ButtonLink href={loginHref} prefetch={false} tone="outline" className="w-full">
            <VerifiedTick className="size-4" />
            Masuk lewat browser dengan e.id
          </ButtonLink>
          <p className="mt-2.5 text-center text-xs text-ink-muted">
            Anda akan diarahkan ke halaman consent e.id, lalu kembali ke sini.
          </p>

          <p className="mt-8 border-t border-hairline pt-6 text-sm text-ink-soft">
            Belum punya Dompet e.id? Unduh aplikasinya, daftar sekali, lalu pindai QR di atas —
            akun ParaKarsa Anda dibuat otomatis.
          </p>
        </div>
      </div>

      <aside className="flex flex-col bg-primary px-8 py-12 text-white md:px-10 md:py-16">
        <p className="eyebrow text-white/60">Kenapa lewat e.id?</p>
        <h2 className="display mt-6 text-2xl">
          Kredibilitas usaha Anda, dibuktikan secara kriptografis.
        </h2>

        <ul className="mt-8 space-y-6">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex gap-3">
              <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0" aria-hidden>
                <circle cx="8" cy="8" r="8" fill="var(--color-accent)" />
                <path
                  d="m4.6 8.2 2.2 2.2 4.6-4.8"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                <span className="block text-sm font-semibold">{benefit.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-white/75">
                  {benefit.body}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-auto pt-16 text-xs leading-relaxed text-white/55">
          Dipakai pelaku usaha dari 21 subsektor ekonomi kreatif. ParaKarsa berperan sebagai
          Verifier — bukan penyimpan identitas Anda.
        </p>
      </aside>
    </div>
  );
}
