import Image from "next/image";
import { StoreDirectory } from "@/components/store-directory";

export default function MarketplacePage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-6 md:px-8">
        <section className="relative isolate h-64 overflow-hidden rounded-xl md:h-72">
          <Image src="/karya/k17.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 to-primary-900/25" />
          <div className="relative flex h-full flex-col justify-center px-8 md:px-12">
            <h1 className="display text-4xl text-white md:text-5xl">Marketplace</h1>
            <p className="mt-3 max-w-md text-sm text-white/85">
              Jelajahi UMKM lain dan buka kerja sama B2B.
            </p>
          </div>
        </section>
      </div>
      <StoreDirectory />
    </>
  );
}
