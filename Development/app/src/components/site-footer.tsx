import Link from "next/link";

const columns = [
  {
    heading: "Platform",
    links: ["Showcase Produk", "Direktori UMKM", "White-Label Hub", "Verifikasi Partner"],
  },
  {
    heading: "Perusahaan",
    links: ["Tentang Kami", "Kisah Sukses", "Blog & Riset", "Kontak Kami"],
  },
  {
    heading: "Legal",
    links: ["Pusat Bantuan", "Kebijakan Privasi", "Syarat & Ketentuan"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4 md:px-8">
        <div>
          <Link href="/" className="display text-xl text-primary">
            ParaKarsa
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            Menghubungkan UMKM Indonesia ke panggung global melalui teknologi dan kolaborasi
            strategis.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.heading}>
            <h3 className="text-sm font-semibold text-ink">{column.heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link}>
                  <span className="text-sm text-ink-muted">{link}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-5 text-xs text-ink-muted md:px-8">
          <p>© 2026 ParaKarsa. Memberdayakan pengrajin Indonesia.</p>
          <p className="ml-auto">Identitas usaha diverifikasi melalui e.id</p>
        </div>
      </div>
    </footer>
  );
}
