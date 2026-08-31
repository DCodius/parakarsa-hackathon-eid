import Image from "next/image";
import { notFound } from "next/navigation";
import { Button, Chip, SectionTitle, VerifiedTick } from "@/components/ui";
import { events } from "@/lib/data";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = events.find((item) => item.slug === slug);
  if (!event) notFound();

  return (
    <>
      <div className="relative h-64 w-full">
        <Image src={event.gallery[0]} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-primary-900/35" />
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16 md:px-8">
        <div className="-mt-24 rounded-xl border border-hairline bg-surface p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Chip>{event.kind}</Chip>
            <span className="text-xs text-ink-muted">{event.views} views</span>
          </div>
          <h1 className="display mt-4 text-3xl text-primary md:text-4xl">{event.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
            Diselenggarakan oleh
            <span className="font-semibold text-ink">{event.organizer}</span>
            <VerifiedTick className="size-4" />
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button tone="accent">Daftar Sekarang</Button>
            <Button tone="outline">Simpan Event</Button>
            <Button tone="outline" aria-label="Bagikan">
              Bagikan
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-xl border border-hairline">
              <Image src={event.poster} alt="" fill sizes="384px" className="object-cover" />
            </div>

            <SectionTitle className="mt-10">Tentang Event</SectionTitle>
            <div className="mt-4 space-y-4">
              {event.about.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>

            <SectionTitle className="mt-10">Jadwal Acara</SectionTitle>
            <ol className="mt-6 space-y-4 border-l-2 border-hairline pl-6">
              {event.schedule.map((slot) => (
                <li key={slot.title} className="relative">
                  <span className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-canvas" />
                  <div className="rounded-xl border border-hairline bg-surface p-4">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-sm font-semibold">{slot.title}</h3>
                      <span className="ml-auto text-xs text-ink-muted">{slot.time}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{slot.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <SectionTitle className="mt-10">Galeri Event</SectionTitle>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {event.gallery.map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>

            <SectionTitle className="mt-10">Speakers</SectionTitle>
            <ul className="mt-5 flex flex-wrap gap-8">
              {event.speakers.map((speaker) => (
                <li key={speaker.name} className="w-24 text-center">
                  <span className="relative mx-auto block size-16 overflow-hidden rounded-full">
                    <Image src={speaker.avatar} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="mt-2 block text-xs leading-snug">{speaker.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-5">
            <section className="rounded-xl border border-hairline bg-surface p-5">
              <h2 className="text-sm font-semibold">Info Penyelenggara</h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-semibold text-primary">
                  {event.organizer.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="truncate">{event.organizer}</span>
                    <VerifiedTick className="size-3.5 shrink-0" />
                  </span>
                  <span className="block text-xs text-ink-muted">{event.organizerSince}</span>
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">{event.organizerBio}</p>
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-primary py-2 text-xs font-medium text-primary transition hover:bg-primary-50"
              >
                Kunjungi Profil
              </button>
            </section>

            <section className="rounded-xl border border-hairline bg-surface p-5">
              <h2 className="text-sm font-semibold">Peta Lokasi</h2>
              <div className="mt-3 grid h-32 place-items-center rounded-lg bg-canvas-alt">
                <svg viewBox="0 0 16 16" className="size-6 text-primary" aria-hidden>
                  <path
                    d="M8 15s5-4.4 5-8A5 5 0 0 0 3 7c0 3.6 5 8 5 8Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="8" cy="6.8" r="1.7" fill="currentColor" />
                </svg>
              </div>
              <p className="mt-2 text-center text-xs text-ink-muted">{event.venue}</p>
            </section>

            <section className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
              <Detail label="Tanggal Event" value={event.dates} sub={event.hours} />
              <Detail label="Pendaftaran" value={event.registration} sub="Online via ParaKarsa" accent />
              <Detail label="Lokasi" value={event.venue} />
              <Detail label="Tiket Masuk" value={event.ticket} />
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}

function Detail({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="eyebrow text-ink-muted">{label}</p>
      <p className={`mt-1 text-sm font-medium ${accent ? "text-accent" : ""}`}>{value}</p>
      {sub && <p className="text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}
