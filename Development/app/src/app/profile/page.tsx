import Image from "next/image";
import { ProfileTabs } from "@/components/profile-tabs";
import { ButtonLink, VerifiedTick } from "@/components/ui";
import { artisan } from "@/lib/data";

import { getSession, loginHref, logoutHref, type EidProfile } from "@/lib/session";

const tiers = ["Belum terverifikasi", "Tier 1 · Email & telepon", "Tier 2 · Identitas formal"];

const statTone: Record<string, string> = {
  ink: "text-ink",
  accent: "text-accent",
  primary: "text-primary",
  blue: "text-[#2563eb]",
};

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <>
      <div className="relative h-56 w-full md:h-64">
        <Image src={artisan.cover} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
        {error && (
          <p className="mt-6 rounded-xl border border-accent bg-accent-50 px-5 py-4 text-sm text-accent">
            Login e.id gagal: {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="-mt-20 space-y-5">
            <IdentityCard session={session} />

            <SidebarCard heading="About">
              <p className="text-sm leading-relaxed text-ink-soft">{artisan.about}</p>
              <p className="mt-4 border-l-2 border-accent pl-3 text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">Visi.</span> {artisan.vision}
              </p>
              <p className="mt-3 border-l-2 border-primary pl-3 text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">Misi.</span> {artisan.mission}
              </p>
            </SidebarCard>

            <SidebarCard heading="Profil Usaha">
              <dl className="space-y-2.5">
                {artisan.facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline gap-3 text-sm">
                    <dt className="shrink-0 text-ink-muted">{fact.label}</dt>
                    <dd className="ml-auto text-right font-medium">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </SidebarCard>

            <SidebarCard heading="Legalitas">
              <ul className="space-y-3">
                {artisan.legality.map((doc) => (
                  <li key={doc.label} className="flex items-baseline gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-1.5">
                      {doc.verified ? (
                        <VerifiedTick className="size-3.5 shrink-0" />
                      ) : (
                        <span
                          className="size-3.5 shrink-0 rounded-full border border-dashed border-ink-muted"
                          aria-hidden
                        />
                      )}
                      <span className="truncate">{doc.label}</span>
                    </span>
                    <span
                      className={`ml-auto shrink-0 font-medium ${
                        doc.verified ? "" : "text-ink-muted"
                      }`}
                    >
                      {doc.value}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-hairline pt-3 text-xs text-ink-muted">
                Nomor ditampilkan sebagian. Mitra memverifikasi lewat kredensial e.id, bukan lewat
                halaman ini.
              </p>
            </SidebarCard>

            <SidebarCard heading="Sertifikasi">
              <ul className="space-y-2.5">
                {artisan.certifications.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <VerifiedTick className="size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </SidebarCard>

            <SidebarCard heading="Kolaborator">
              <div className="flex flex-wrap gap-2">
                {artisan.collaborators.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-canvas-alt px-3 py-1 text-xs text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </SidebarCard>

            <SidebarCard heading="Ulasan">
              <ul className="space-y-4">
                {artisan.reviews.map((review) => (
                  <li key={review.name}>
                    <span className="text-xs text-accent">★★★★★</span>
                    <p className="mt-1 text-sm italic leading-relaxed text-ink-soft">
                      “{review.quote}”
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">— {review.name}</p>
                  </li>
                ))}
              </ul>
            </SidebarCard>
          </aside>

          <div className="pt-6 lg:pt-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {artisan.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-hairline bg-surface px-5 py-6 text-center"
                >
                  <p className={`display text-2xl ${statTone[stat.tone]}`}>{stat.value}</p>
                  <p className="mt-1.5 text-xs text-ink-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <ProfileTabs />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * The one live card on the page: signed in, every field below comes from the
 * e.id wallet via OAuth SSO rather than a form the user filled in.
 */
function IdentityCard({ session }: { session: EidProfile | null }) {
  const profile = session?.profile;
  const tier = profile?.tier ?? 0;
  const name = profile?.fullname ?? artisan.handle;

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6 text-center">
      <div className="relative mx-auto size-24 overflow-hidden rounded-full ring-4 ring-surface">
        {profile?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar} alt="" className="size-full object-cover" />
        ) : (
          <Image src={artisan.avatar} alt="" fill sizes="96px" className="object-cover" />
        )}
      </div>

      <h1 className="display mt-4 flex items-center justify-center gap-2 text-xl">
        {name}
        {session && tier >= 1 && <VerifiedTick className="size-4" />}
      </h1>
      <p className="mt-1 text-xs text-ink-muted">
        {session ? (session.email ?? artisan.discipline) : artisan.discipline}
      </p>
      <p className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-muted">
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path
            d="M8 14s5-4.2 5-7.5A5 5 0 0 0 3 6.5C3 9.8 8 14 8 14Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle cx="8" cy="6.4" r="1.6" fill="currentColor" />
        </svg>
        {profile?.address?.trim() || artisan.location}
      </p>

      {session ? (
        <>
          <p className="mt-4 rounded-lg bg-badge-green px-3 py-2 text-[11px] font-medium text-primary">
            {tiers[tier] ?? tiers[0]}
          </p>
          <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-left">
            <Row term="Telepon" value={maskPhone(profile?.countryphonecode, profile?.phonenumber)} />
            <Row term="Sumber" value="e.id OAuth SSO" />
          </dl>
          <form action={logoutHref} method="post" className="mt-4">
            <button
              type="submit"
              className="w-full rounded-lg border border-hairline py-2.5 text-sm text-ink-soft transition hover:border-ink-muted"
            >
              Keluar
            </button>
          </form>
        </>
      ) : (
        <div className="mt-5 space-y-2.5">
          <ButtonLink href={loginHref} prefetch={false} className="w-full">
            <VerifiedTick className="size-4" />
            Masuk dengan e.id
          </ButtonLink>
          <button
            type="button"
            className="w-full rounded-lg border border-hairline py-2.5 text-sm text-ink-soft"
          >
            Message
          </button>
          <button
            type="button"
            className="w-full rounded-lg border border-hairline py-2.5 text-sm text-ink-soft"
          >
            Save Candidate
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ term, value }: { term: string; value?: string }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <dt className="text-ink-muted">{term}</dt>
      <dd className="ml-auto font-medium">{value?.trim() || "—"}</dd>
    </div>
  );
}

function SidebarCard({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-hairline bg-surface p-6">
      <h2 className="eyebrow text-ink-muted">{heading}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Keeps the first two and last two digits, per the PRD's masking rule. */
function maskPhone(countryCode?: string, number?: string): string | undefined {
  if (!number) return undefined;
  const masked =
    number.length > 4
      ? `${number.slice(0, 2)}${"x".repeat(number.length - 4)}${number.slice(-2)}`
      : number;
  return countryCode ? `+${countryCode} ${masked}` : masked;
}
