import Image from "next/image";
import { PartnershipFeed } from "@/components/partnership-feed";

export default function PartnershipsPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-6 md:px-8">
        <section className="relative isolate h-64 overflow-hidden rounded-xl md:h-72">
          <Image src="/karya/k02.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 to-primary-900/25" />
          <div className="relative flex h-full flex-col justify-center px-8 md:px-12">
            <p className="eyebrow text-white/70">Partnerships</p>
            <h1 className="display mt-2 text-4xl text-white md:text-5xl">Kapasitas &amp; Kontrak</h1>
            <p className="mt-3 max-w-lg text-sm text-white/85">
              Penawaran kapasitas produksi longgar untuk skema white-label dan maklon, plus
              permintaan kemitraan B2B dari pembeli terverifikasi.
            </p>
          </div>
        </section>
      </div>
      <PartnershipFeed />
    </>
  );
}
