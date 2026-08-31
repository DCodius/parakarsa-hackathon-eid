import Image from "next/image";
import { KaryaGrid } from "@/components/karya-grid";
import { ButtonLink, SectionTitle } from "@/components/ui";
import { testimonials, villageStory } from "@/lib/data";

export default function ShowcasesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Image
          src="/karya/k18.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-canvas/88" />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-28">
          <h1 className="display text-4xl text-primary md:text-5xl">
            Pusat Karya Terbaik UMKM Indonesia
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
            Temukan keunikan produk lokal dan dukung inisiatif kolektif wirausaha mandiri.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="#karya">Jelajahi Produk</ButtonLink>
            <ButtonLink href="/login" tone="accent">
              Gabung sebagai Mitra
            </ButtonLink>
          </div>
        </div>
      </section>

      <div id="karya">
        <KaryaGrid />
      </div>

      <section className="bg-canvas-alt py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <SectionTitle className="text-center">Testimoni</SectionTitle>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure
                key={item.name}
                className="flex flex-col rounded-xl border border-hairline bg-surface p-6"
              >
                <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-hairline pt-4">
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-full">
                    <Image src={item.avatar} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.name}</span>
                    <span className="block truncate text-xs text-ink-muted">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <SectionTitle>Kisah dari Desa</SectionTitle>
          <div className="mt-8 grid items-stretch gap-6 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl md:aspect-auto">
              <Image
                src={villageStory.image}
                alt={villageStory.title}
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-hairline bg-surface p-8">
              <span className="w-fit rounded bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {villageStory.eyebrow}
              </span>
              <h3 className="display mt-4 text-2xl">{villageStory.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{villageStory.body}</p>
              <span className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                Baca Kisah Selengkapnya
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                  <path
                    d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="display text-2xl md:text-3xl">Siap Mengakselerasi Bisnis Anda?</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            Bergabunglah dengan ribuan UMKM Indonesia lainnya yang telah terhubung dengan jaringan
            profesional global. Mulai bangun portofolio Anda hari ini.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/login" tone="accent">
              Mulai Sekarang Gratis
            </ButtonLink>
            <ButtonLink
              href="/events"
              className="border border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              Hubungi Tim Support
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
