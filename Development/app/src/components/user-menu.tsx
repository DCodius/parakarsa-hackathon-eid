"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Menu akun di navbar: profil dan keluar. Keluar dipindah ke sini supaya satu
 * tempat saja yang mengurus sesi, apa pun halaman yang sedang dibuka.
 */
export function UserMenu({
  avatar,
  fullname,
  logoutAction,
}: {
  avatar?: string;
  fullname?: string;
  logoutAction: string;
}) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function dismiss(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && menu.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [open]);

  return (
    <div ref={menu} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={fullname ? `Menu akun ${fullname}` : "Menu akun"}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-xs font-semibold text-primary ring-1 ring-hairline transition hover:ring-ink-muted"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="size-full object-cover" />
        ) : (
          initials(fullname)
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 w-56 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-lg"
        >
          {fullname && (
            <p className="truncate border-b border-hairline px-4 py-2.5 text-xs text-ink-muted">
              Masuk sebagai <span className="font-semibold text-ink">{fullname}</span>
            </p>
          )}

          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink-soft transition hover:bg-canvas hover:text-ink"
          >
            Profil
          </Link>

          <form action={logoutAction} method="post">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-sm text-accent transition hover:bg-canvas"
            >
              Keluar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/** Fallback saat profil e.id tidak menyertakan foto. */
function initials(fullname?: string): string {
  const words = fullname?.trim().split(/\s+/) ?? [];
  if (words.length === 0) return "?";
  return (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase();
}
