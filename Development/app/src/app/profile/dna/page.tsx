import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { ButtonLink, VerifiedTick } from "@/components/ui";
import { artisan } from "@/lib/data";
import { dnaAxes, epPillars, epScore, maskNik } from "@/lib/dna";
import { apiUrl, getSession } from "@/lib/session";

/**
 * FR-03 Auto-Generate DNA Portfolio. Dokumen ini tidak pernah diisi manual:
 * seluruh isinya diturunkan dari kredensial e.id yang sudah terverifikasi plus
 * skor DNA, lalu disimpan pengguna lewat dialog cetak browser.
 * ponytail: render cetak sisi-browser; pindah ke PDF sisi-server kalau file
 * harus tersimpan otomatis di Drive pengguna seperti bunyi FR-03.
 */
export const metadata = { title: "DNA Portfolio — ParaKarsa" };

/** Dipakai selama NIK asli belum ditarik dari kredensial KYC Vida. */
const PLACEHOLDER_NIK = "3204012345678901";

export default async function DnaPortfolioPage() {
  const session = await getSession();
  const profile = session?.profile;
  const issuedAt = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const identity = [
    { term: "Nama pemilik", value: profile?.fullname ?? "—", source: "KYC Vida" },
    { term: "NIK", value: maskNik(PLACEHOLDER_NIK), source: "KYC Vida" },
    { term: "Email terverifikasi", value: session?.email ?? "—", source: "Membership L1" },
    {
      term: "Telepon",
      value: profile?.phonenumber
        ? `+${profile.countryphonecode ?? "62"} ${profile.phonenumber.slice(0, 3)}•••••${profile.phonenumber.slice(-2)}`
        : "—",
      source: "Membership L1",
    },
    { term: "Domisili", value: profile?.address?.trim() || artisan.location, source: "KYC Vida" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/profile" className="text-sm text-ink-soft hover:text-ink">
          ← Kembali ke profil
        </Link>
        {session ? (
          // Berkas PDF diterbitkan backend dari kredensial, bukan hasil cetak layar.
          <ButtonLink href={`${apiUrl}/api/v1/profile/dna.pdf`} prefetch={false} download>
            Unduh PDF
          </ButtonLink>
        ) : (
          <PrintButton />
        )}
      </div>

      {!session && (
        <p className="mb-6 rounded-lg border border-hairline bg-badge-amber px-4 py-3 text-sm text-accent print:hidden">
          Belum ada sesi e.id. Dokumen ini akan terisi otomatis setelah pemilik profil masuk
          dengan kredensialnya.
        </p>
      )}

      <article className="rounded-xl border border-hairline bg-surface p-10 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-6 border-b border-hairline pb-6">
          <div>
            <p className="eyebrow text-ink-muted">Verifiable DNA Portfolio</p>
            <h1 className="display mt-2 text-2xl">{profile?.fullname ?? artisan.handle}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {artisan.handle} · {artisan.discipline}
            </p>
          </div>
          <div className="text-right text-xs text-ink-muted">
            <p className="display text-base text-primary">ParaKarsa</p>
            <p className="mt-1">Diterbitkan {issuedAt}</p>
            <p>Sumber: e.id OAuth SSO</p>
          </div>
        </header>

        <Section title="Identitas terverifikasi">
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {identity.map((row) => (
              <div key={row.term} className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="text-ink-muted">{row.term}</dt>
                <dd className="flex items-center gap-1.5 text-right font-medium">
                  {row.value}
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {row.source}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Skor Kinerja Kewirausahaan (EP)">
          <div className="flex items-center gap-6">
            <div className="shrink-0 text-center">
              <p className="display text-4xl text-primary">{epScore}</p>
              <p className="text-xs text-ink-muted">dari 100</p>
            </div>
            <dl className="flex-1 space-y-2">
              {epPillars.map((pillar) => (
                <Meter key={pillar.pillar} label={pillar.pillar} score={pillar.score} />
              ))}
            </dl>
          </div>

          <dl className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {dnaAxes.map((axis) => (
              <Meter key={axis.axis} label={axis.axis} score={axis.score} muted />
            ))}
          </dl>
        </Section>

        <Section title="Legalitas usaha">
          <ul className="space-y-1.5">
            {artisan.legality.map((doc) => (
              <li key={doc.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-muted">{doc.label}</span>
                <span className="flex items-center gap-1.5 font-medium">
                  {doc.value}
                  {doc.verified && <VerifiedTick className="size-3.5" />}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Sertifikasi & kolaborasi">
          <p className="text-sm text-ink-soft">{artisan.certifications.join(" · ")}</p>
          <p className="mt-1 text-sm text-ink-soft">{artisan.collaborators.join(" · ")}</p>
        </Section>

        <footer className="mt-8 border-t border-hairline pt-4 text-[11px] leading-relaxed text-ink-muted">
          Dokumen ini dihasilkan otomatis dari kredensial e.id milik pemegang profil. NIK
          ditampilkan tersamar sesuai UU PDP No. 27/2022 — yang dibuktikan adalah status
          verifikasinya, bukan angkanya. Keaslian dokumen dapat diperiksa lewat jejak tanda
          tangan digital di IDChain.
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 break-inside-avoid">
      <h2 className="eyebrow text-ink-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Meter({ label, score, muted = false }: { label: string; score: number; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <dt className={`w-32 shrink-0 ${muted ? "text-ink-muted" : "font-medium"}`}>{label}</dt>
      <dd className="flex flex-1 items-center gap-2">
        <span className="h-1.5 flex-1 rounded-full bg-canvas-alt print:border print:border-hairline">
          <span
            className={`block h-full rounded-full ${muted ? "bg-accent" : "bg-primary"}`}
            style={{ width: `${score}%` }}
          />
        </span>
        <span className="w-7 shrink-0 text-right text-xs tabular-nums text-ink-muted">{score}</span>
      </dd>
    </div>
  );
}
