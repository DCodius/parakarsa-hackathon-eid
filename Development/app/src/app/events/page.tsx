import Image from "next/image";
import Link from "next/link";
import { EventCityFilter } from "@/components/event-filters";
import { Badge, ButtonLink, Chip, VerifiedTick } from "@/components/ui";
import { events } from "@/lib/data";

const subNav = ["Dashboard", "Find Events", "Hosting Info", "New Event"];

export default function EventsPage() {
  return (
    <>
      <div className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2.5 md:px-8">
          {subNav.map((item) => (
            <span
              key={item}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                item === "Find Events"
                  ? "bg-primary-50 font-medium text-primary"
                  : "text-ink-soft"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="bg-gradient-to-b from-primary-50 to-canvas">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <h1 className="display text-3xl md:text-4xl">Available Events</h1>
          <div className="mt-6">
            <EventCityFilter />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-12 md:px-8">
        {events.map((event) => (
          <article
            key={event.slug}
            className="grid gap-6 rounded-xl border border-hairline bg-surface p-6 md:grid-cols-[160px_1fr]"
          >
            <Link
              href={`/events/${event.slug}`}
              className="relative hidden aspect-[3/4] overflow-hidden rounded-lg bg-canvas-alt md:block"
            >
              <Image src={event.poster} alt="" fill sizes="160px" className="object-cover" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="display flex flex-wrap items-center gap-2 text-xl">
                    <Link href={`/events/${event.slug}`} className="hover:underline">
                      {event.title}
                    </Link>
                    {event.pro && <Badge>Pro</Badge>}
                  </h2>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
                    {event.organizer}
                    <VerifiedTick className="size-3.5" />
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {event.location} • {event.dates}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2.5">
                  <ButtonLink href={`/events/${event.slug}`}>Register Now</ButtonLink>
                  <button
                    type="button"
                    className="rounded-lg border border-hairline px-5 py-2.5 text-sm font-medium text-ink-soft transition hover:border-ink-muted"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>

              <h3 className="mt-6 text-sm font-semibold">About Event &amp; Highlights</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                {event.about[0]}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {event.gallery.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg bg-canvas-alt"
                  >
                    <Image src={src} alt="" fill sizes="140px" className="object-cover" />
                  </div>
                ))}
                <div className="relative hidden aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-primary-900 sm:grid">
                  <span className="text-xs font-semibold text-white">+12 More</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
                <span className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white">
                  {event.attendees}
                </span>
                <span className="text-sm text-ink-soft">Peserta terdaftar untuk event ini</span>
                <Link
                  href={`/events/${event.slug}`}
                  className="ml-auto text-sm font-medium text-primary hover:underline"
                >
                  Event Details ›
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
