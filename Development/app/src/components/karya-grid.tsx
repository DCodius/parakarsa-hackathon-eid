"use client";

import Image from "next/image";
import { useState } from "react";
import {
  categories,
  formatCompact,
  karya,
  readinessLevels,
  regions,
  type Category,
  type Readiness,
  type Region,
} from "@/lib/data";

export function KaryaGrid() {
  const [category, setCategory] = useState<Category | null>(null);
  const [region, setRegion] = useState<Region | "">("");
  const [readiness, setReadiness] = useState<Readiness | "">("");

  const visible = karya.filter(
    (item) =>
      (category === null || item.category === category) &&
      (region === "" || item.region === region) &&
      (readiness === "" || item.readiness === readiness),
  );

  return (
    <>
      <div className="sticky top-[61px] z-40 border-y border-hairline bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-3 md:px-8">
          <Pill
            label="Semua Kategori"
            selected={category === null}
            onClick={() => setCategory(null)}
          />
          {categories.map((name) => (
            <Pill
              key={name}
              label={name}
              selected={category === name}
              onClick={() => setCategory(category === name ? null : name)}
            />
          ))}
          <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-4 text-sm text-ink-soft">
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path
                d="M2 4h12M4 8h8M6 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Newest
          </span>
        </div>

        {/* PRD 2.1.1: filter cepat wilayah dan Readiness Level B2B. */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 border-t border-hairline px-6 py-2.5 md:px-8">
          <Select
            label="Wilayah"
            value={region}
            options={regions}
            allLabel="Semua wilayah"
            onChange={(value) => setRegion(value as Region | "")}
          />
          <Select
            label="Kesiapan B2B"
            value={readiness}
            options={readinessLevels}
            allLabel="Semua tingkat"
            onChange={(value) => setReadiness(value as Readiness | "")}
          />
          <span className="ml-auto text-xs text-ink-muted">
            {visible.length} dari {karya.length} karya
          </span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((item) => (
            <article key={item.slug} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-canvas-alt">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-semibold text-ink-soft backdrop-blur">
                  {item.category}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold leading-snug">{item.title}</h3>
              <p className="mt-0.5 text-xs text-ink-muted">{item.maker}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {item.region} ·{" "}
                <span className={item.readiness === "Siap Kontrak" ? "text-primary" : undefined}>
                  {item.readiness}
                </span>
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                    <path
                      d="M8 14S2 10.5 2 6.5A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 6 2.5C14 10.5 8 14 8 14Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                  {formatCompact(item.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                    <path
                      d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle cx="8" cy="8" r="1.8" fill="currentColor" />
                  </svg>
                  {formatCompact(item.views)}
                </span>
              </div>
            </article>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="py-16 text-center text-ink-muted">
            Tidak ada karya yang cocok dengan filter ini.
          </p>
        )}
      </section>
    </>
  );
}

function Select({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-ink-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-hairline bg-canvas px-3 py-1.5 text-xs font-medium text-ink outline-none focus:border-primary"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${
        selected
          ? "bg-primary text-white"
          : "bg-canvas-alt text-ink-soft hover:bg-hairline"
      }`}
    >
      {label}
    </button>
  );
}
