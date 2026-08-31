import Link from "next/link";
import { ButtonLink, VerifiedTick } from "@/components/ui";
import { loginHref } from "@/lib/session";

const benefits = [
  "Identitas usaha terverifikasi, tanpa isi formulir",
  "Data tetap di dompet Anda — kami hanya memverifikasi",
  "Satu akun untuk showcase, kemitraan, dan event",
];

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-61px)] lg:grid-cols-2">
      <div className="flex items-center justify-center bg-surface px-6 py-16 md:px-12">
        <div className="w-full max-w-sm">
          <h1 className="display text-3xl">Masuk ke ParaKarsa.</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Satu akun untuk showcase, kemitraan, dan event UMKM.
          </p>

          <ButtonLink href={loginHref} prefetch={false} className="mt-8 w-full">
            <VerifiedTick className="size-4" />
            Masuk dengan e.id
          </ButtonLink>
          <p className="mt-2.5 text-center text-xs text-ink-muted">
            Anda akan diarahkan ke halaman consent e.id
          </p>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-xs text-ink-muted">atau</span>
            <span className="h-px flex-1 bg-hairline" />
          </div>

          <fieldset disabled className="space-y-4 opacity-55">
            <legend className="sr-only">Masuk dengan email</legend>
            <label className="block">
              <span className="text-sm font-medium">Email atau nomor WhatsApp</span>
              <input
                type="email"
                placeholder="nama@usahamu.id"
                className="mt-1.5 w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm outline-none placeholder:text-ink-muted"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Kata sandi</span>
              <input
                type="password"
                placeholder="Kata sandi kamu"
                className="mt-1.5 w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm outline-none placeholder:text-ink-muted"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-lg bg-ink-muted py-2.5 text-sm font-medium text-white"
            >
              Masuk
            </button>
          </fieldset>
          <p className="mt-2.5 text-xs text-ink-muted">
            Login email menyusul. Untuk sekarang gunakan e.id.
          </p>

          <p className="mt-8 border-t border-hairline pt-6 text-sm text-ink-soft">
            Belum punya akun?{" "}
            <Link href={loginHref} prefetch={false} className="font-semibold text-primary">
              Daftar gratis dengan e.id
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-center bg-primary px-14 py-16 text-white lg:flex">
        <p className="eyebrow text-white/60">Showcase · Kemitraan · Event UMKM</p>
        <h2 className="display mt-8 max-w-md text-3xl">
          Kredibilitas usaha Anda, dibuktikan secara kriptografis.
        </h2>
        <ul className="mt-8 space-y-3.5">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm text-white/85">
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
              {benefit}
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-16 text-xs text-white/55">
          Dipakai pelaku usaha dari 21 subsektor ekonomi kreatif.
        </p>
      </div>
    </div>
  );
}
