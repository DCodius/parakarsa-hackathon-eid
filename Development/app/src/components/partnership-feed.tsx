"use client";

import Image from "next/image";
import { useState } from "react";
import { partnerships, type Partnership } from "@/lib/data";
import { epScore } from "@/lib/dna";
import { Badge, Chip, EpGate, VerifiedTick } from "./ui";

const filters = ["Semua", "Penawaran", "Permintaan"] as const;

const filterLabels: Record<(typeof filters)[number], string> = {
  Semua: "Semua",
  Penawaran: "Penawaran White-Label",
  Permintaan: "Permintaan B2B",
};

export function PartnershipFeed() {
  const [kind, setKind] = useState<(typeof filters)[number]>("Semua");
  const visible = partnerships.filter((item) => kind === "Semua" || item.kind === kind);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:px-8">
      <div className="flex flex-wrap items-center gap-2.5">
        {filters.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setKind(name)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              kind === name ? "bg-primary text-white" : "bg-surface text-ink-soft hover:bg-canvas-alt"
            }`}
          >
            {filterLabels[name]}
          </button>
        ))}
        <span className="ml-auto text-sm text-ink-muted">
          {visible.length} dari {partnerships.length} listing
        </span>
      </div>

      <div className="mt-8 space-y-6">
        {visible.map((item) => (
          <ListingCard key={item.slug} listing={item} />
        ))}
      </div>
    </section>
  );
}

function ListingCard({ listing }: { listing: Partnership }) {
  const offer = listing.kind === "Penawaran";

  return (
    <article className="grid gap-6 rounded-xl border border-hairline bg-surface p-6 md:grid-cols-[200px_1fr]">
      <div className="relative hidden aspect-[4/3] overflow-hidden rounded-lg bg-canvas-alt md:block">
        <Image src={listing.image} alt="" fill sizes="200px" className="object-cover" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={offer ? "green" : "amber"}>{filterLabels[listing.kind]}</Badge>
              <span className="text-xs text-ink-muted">{listing.industry}</span>
            </div>
            <h2 className="display mt-2 text-xl">{listing.title}</h2>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                {listing.initials}
              </span>
              {listing.company}
              <VerifiedTick className="size-3.5" />
              <span className="text-ink-muted">• {listing.city}</span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{listing.summary}</p>

        <dl className="mt-5 grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {listing.specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs text-ink-muted">{spec.label}</dt>
              <dd className="mt-1 text-sm font-medium">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {listing.tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>

        <div className="mt-5 border-t border-hairline pt-4">
          <EpGate epMin={listing.epMin} score={epScore}>
            <details className="group">
              <summary className="inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700">
                {offer ? "Ajukan RFQ" : "Kirim Proposal"}
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <RfqDraft listing={listing} />
            </details>
          </EpGate>
        </div>
      </div>
    </article>
  );
}

/**
 * Draf RFQ dirakit di klien dari data listing — mode simulasi PRD, belum
 * memanggil layanan kontrak.
 */
function RfqDraft({ listing }: { listing: Partnership }) {
  return (
    <div className="mt-4 rounded-lg border border-hairline bg-canvas-alt p-5">
      <p className="eyebrow text-accent">Draf otomatis</p>
      <p className="mt-2 text-sm font-medium">
        Permintaan kerja sama · {listing.title}
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
        <li>Kepada: {listing.company}, {listing.city}</li>
        {listing.specs.map((spec) => (
          <li key={spec.label}>
            {spec.label}: {spec.value}
          </li>
        ))}
        <li>Pemohon: profil e.id terverifikasi · EP Score {epScore}</li>
      </ul>
      <p className="mt-4 text-xs text-ink-muted">
        Draf ini dirakit dari kredensial e.id Anda. Pengiriman kontrak belum aktif pada mode
        simulasi.
      </p>
    </div>
  );
}
