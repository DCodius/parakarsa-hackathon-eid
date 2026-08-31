"use client";

import Image from "next/image";
import { useState } from "react";
import { artisan } from "@/lib/data";
import { CertificateUpload } from "./certificate-upload";
import { ConsentPanel } from "./consent-panel";
import { DnaRadar, dnaAxes, epScore } from "./dna-radar";

const tabs = ["Portfolios", "Liked", "Favourites", "Kredensial e.id"] as const;
type Tab = (typeof tabs)[number];

const filters = ["Semua Kategori", "Fashion", "Karya Seni", "Furniture"];

export function ProfileTabs() {
  const [tab, setTab] = useState<Tab>("Portfolios");
  const [filter, setFilter] = useState(filters[0]);

  return (
    <div>
      <div className="flex gap-6 border-b border-hairline">
        {tabs.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`relative pb-3 text-sm transition ${
              tab === name
                ? "font-semibold text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === "Kredensial e.id" ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-hairline bg-surface p-6">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold">Diagram DNA Kewirausahaan</h2>
              <span className="ml-auto text-sm text-ink-muted">EP Score {epScore}</span>
            </div>
            <DnaRadar />
            <ul className="grid gap-3 border-t border-hairline pt-5 sm:grid-cols-3">
              {dnaAxes.map((axis) => (
                <li key={axis.axis}>
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="font-medium">{axis.axis}</span>
                    <span className="ml-auto text-ink-muted">{axis.score}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-canvas-alt">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${axis.score}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ConsentPanel />
          <CertificateUpload />
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {filters.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setFilter(name)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  filter === name
                    ? "bg-primary text-white"
                    : "bg-canvas-alt text-ink-soft hover:bg-hairline"
                }`}
              >
                {name}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-1.5 text-sm text-ink-soft">
              <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Newest
            </span>
          </div>

          {tab === "Portfolios" ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {artisan.portfolio.map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-canvas-alt">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover transition duration-500 hover:scale-[1.04]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-sm text-ink-muted">
              Belum ada karya di tab {tab}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
