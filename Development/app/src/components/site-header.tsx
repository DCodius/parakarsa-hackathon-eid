import Image from "next/image";
import Link from "next/link";
import { artisan } from "@/lib/data";
import { getSession } from "@/lib/session";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const session = await getSession();
  const avatar = session?.profile?.avatar;

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5 md:px-8">
        <Link href="/" className="display shrink-0 text-xl text-primary">
          ParaKarsa
        </Link>

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

          <Link
            href="/profile"
            className="relative size-9 overflow-hidden rounded-full ring-1 ring-hairline"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Profil Anda" className="size-full object-cover" />
            ) : (
              <Image src={artisan.avatar} alt="Profil Anda" fill sizes="36px" className="object-cover" />
            )}
          </Link>
        </div>
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
