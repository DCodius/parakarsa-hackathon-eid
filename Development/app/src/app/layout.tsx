import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ParaKarsa — Showcase & Kemitraan UMKM Terverifikasi",
  description:
    "Menghubungkan UMKM Indonesia ke panggung global lewat portofolio profesional dan kolaborasi strategis. Identitas usaha diverifikasi dengan kredensial e.id.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
