import { ButtonLink } from "@/components/ui";

export default function PartnershipsPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-28 text-center md:px-8">
      <p className="eyebrow text-accent">Partnerships</p>
      <h1 className="display mt-3 text-3xl text-primary md:text-4xl">
        Feed kemitraan sedang dibangun.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        Halaman ini akan memuat feed penawaran white-label dan permintaan kemitraan B2B sesuai
        rancangan Figma. Sementara itu, jelajahi karya dan direktori UMKM yang sudah aktif.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Lihat Showcases</ButtonLink>
        <ButtonLink href="/marketplace" tone="outline">
          Buka Marketplace
        </ButtonLink>
      </div>
    </section>
  );
}
