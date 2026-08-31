"use client";

import Image from "next/image";
import { useState } from "react";
import { formatRupiah, stores } from "@/lib/data";
import { Button } from "./ui";

const industries = ["Semua industri", "Kuliner", "Fesyen", "Aplikasi & Digital"];

export function StoreDirectory() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState(industries[0]);

  const needle = query.trim().toLowerCase();
  const visible = stores.filter(
    (store) =>
      (industry === industries[0] || store.industry === industry) &&
      (needle === "" ||
        [store.name, store.tagline, store.city, ...store.products.map((p) => p.name)]
          .join(" ")
          .toLowerCase()
          .includes(needle)),
  );

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
      <div className="flex flex-wrap items-center gap-4 py-8">
        <h2 className="display text-xl">Jelajah UMKM</h2>

        <label className="relative w-full max-w-xs">
          <span className="sr-only">Cari toko, produk, atau kota</span>
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          >
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari toko, produk, atau kota"
            className="w-full rounded-lg border border-hairline bg-surface py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-ink-muted focus:border-primary"
          />
        </label>

        <label>
          <span className="sr-only">Filter industri</span>
          <select
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
            className="rounded-lg border border-hairline bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            {industries.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <span className="ml-auto text-sm text-ink-muted">
          {visible.length} dari {stores.length} toko
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((store) => (
          <article
            key={store.slug}
            className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface"
          >
            <div className="relative aspect-[16/10] bg-canvas-alt">
              <Image
                src={store.image}
                alt={store.name}
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                  {store.initials}
                </span>
                <span className="ml-auto rounded bg-canvas-alt px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  {store.industry}
                </span>
              </div>

              <h3 className="display mt-4 text-lg">{store.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">{store.tagline}</p>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-muted">
                <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                  <path
                    d="M8 14s5-4.2 5-7.5A5 5 0 0 0 3 6.5C3 9.8 8 14 8 14Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="8" cy="6.4" r="1.6" fill="currentColor" />
                </svg>
                {store.city}
              </p>

              <ul className="mt-5 space-y-2 border-t border-hairline pt-4">
                {store.products.map((product) => (
                  <li key={product.name} className="flex items-baseline gap-3 text-sm">
                    <span className="min-w-0 truncate text-ink-soft">{product.name}</span>
                    <span className="ml-auto shrink-0 font-medium">
                      {formatRupiah(product.price)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-hairline pt-4">
                <Button>Detail</Button>
                <Button tone="outline">Profil</Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-16 text-center text-ink-muted">Tidak ada toko yang cocok.</p>
      )}
    </section>
  );
}
