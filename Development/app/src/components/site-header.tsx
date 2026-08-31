import Link from "next/link";
import { ButtonLink, VerifiedTick } from "@/components/ui";
import { getSession, logoutHref } from "@/lib/session";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const session = await getSession();
  const avatar = session?.profile?.avatar;
  const fullname = session?.profile?.fullname;

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-surface print:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3.5 md:px-8">
        <Link href="/" className="display shrink-0 text-xl text-primary">
          ParaKarsa
        </Link>

        {/* PRD 4.3: juri harus bisa membedakan data live dari data simulasi. */}
        <span
          title={
            session?.demo
              ? "Sesi simulasi QR — kredensial belum berasal dari Dompet e.id"
              : "Terhubung ke lingkungan sandbox e.id (api-dev.e.id)"
          }
          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide sm:inline-flex ${
            session?.demo ? "bg-badge-amber text-accent" : "bg-canvas-alt text-ink-muted"
          }`}
        >
          {session?.demo ? "Simulation Mode" : "Sandbox"}
        </span>

        <div className="mx-auto">
          <NavLinks />
        </div>

        <label className="relative hidden w-72 shrink-0 lg:block">
          <span className="sr-only">Cari UMKM</span>
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          >
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Cari UMKM..."
            className="w-full rounded-full border border-hairline bg-canvas py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-ink-muted focus:border-primary"
          />
        </label>

        {session ? (
          <div className="ml-auto flex shrink-0 items-center gap-4 lg:ml-0">
            <IconButton label="Notifikasi">
              <path
                d="M6 8a4 4 0 1 1 8 0c0 3 1 4 1 4H5s1-1 1-4Zm2 7a2 2 0 0 0 4 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </IconButton>
            <IconButton label="Pesan">
              <path
                d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v7A1.5 1.5 0 0 1 15.5 14H8l-4 3v-3H4.5A1.5 1.5 0 0 1 3 12.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </IconButton>

            <UserMenu
              avatar={avatar}
              fullname={fullname}
              logoutAction={logoutHref}
            />
          </div>
        ) : (
          <ButtonLink href="/login" className="ml-auto shrink-0 px-4 py-2 lg:ml-0">
            <VerifiedTick className="size-4" />
            Masuk dengan e.id
          </ButtonLink>
        )}
      </div>
    </header>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} className="text-ink-soft transition hover:text-ink">
      <svg viewBox="0 0 20 20" className="size-5">
        {children}
      </svg>
    </button>
  );
}
