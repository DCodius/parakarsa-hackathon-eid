"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/partnerships", label: "Partnerships" },
  { href: "/", label: "Showcases" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/marketplace", label: "Network" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-8 md:flex">
      {links.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative py-1 text-sm transition ${
              active
                ? "font-semibold text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
