"use client";

import Image from "next/image";
import { useState } from "react";
import { helices, programs, type Helix, type Program } from "@/lib/data";
import { epScore } from "@/lib/dna";
import { Button, Chip, EpGate, VerifiedTick } from "./ui";

export function ProgramHub() {
  const [helix, setHelix] = useState<Helix | null>(null);
  const visible = helix ? programs.filter((p) => p.helix === helix) : programs;
  const open = visible.filter((p) => epScore >= p.epMin).length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:px-8">
      <div className="flex flex-wrap items-center gap-2.5">
        <Pill label="Semua" selected={helix === null} onClick={() => setHelix(null)} />
        {helices.map((name) => (
          <Pill
            key={name}
            label={name}
            selected={helix === name}
            onClick={() => setHelix(helix === name ? null : name)}
          />
        ))}
      </div>

      <p className="mt-5 text-sm text-ink-muted">
        {visible.length} program ditampilkan · {open} terbuka untuk EP Score Anda ({epScore}).
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {visible.map((program) => (
          <ProgramCard key={program.slug} program={program} />
        ))}
      </div>
    </section>
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
      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
        selected ? "bg-primary text-white" : "bg-surface text-ink-soft hover:bg-canvas-alt"
      }`}
    >
      {label}
    </button>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
      <div className="relative aspect-[16/7] bg-canvas-alt">
        <Image
          src={program.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 560px"
          className="object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-primary-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {program.helix}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <Chip>{program.category}</Chip>
        <h2 className="display mt-3 text-xl">{program.title}</h2>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
          {program.partner}
          <VerifiedTick className="size-3.5" />
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{program.summary}</p>

        <ul className="mt-5 space-y-2">
          {program.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-ink-soft">
              <VerifiedTick className="mt-0.5 size-3.5 shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>

        <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-hairline pt-4">
          <Fact label="Kuota" value={program.quota} />
          <Fact label="Tenggat" value={program.deadline} />
          <Fact label="Format" value={program.format} />
        </dl>

        <div className="mt-5 border-t border-hairline pt-4">
          <EpGate epMin={program.epMin} score={epScore}>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Daftar Program</Button>
              <p className="text-sm text-ink-muted">Syarat EP Score ≥ {program.epMin} terpenuhi.</p>
            </div>
          </EpGate>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
