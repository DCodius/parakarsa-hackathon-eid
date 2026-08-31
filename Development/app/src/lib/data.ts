/**
 * Demo dataset, transcribed from the Figma comps
 * (Master Product Design › development › ERP UI).
 *
 * The PRD's risk plan calls for a "Simulation Mode" fallback if the e.id gateway
 * is slow at SMESCO, so every catalogue page reads from here. Only the identity
 * block on /profile talks to a live service.
 */

export type Category =
  | "Fashion"
  | "Karya Seni"
  | "Furniture"
  | "Kuliner Kemasan"
  | "Batik Tradisional"
  | "Kriya Bambu"
  | "Agrikultur"
  | "Kesehatan";

export const categories: Category[] = [
  "Fashion",
  "Karya Seni",
  "Furniture",
  "Kuliner Kemasan",
  "Batik Tradisional",
  "Kriya Bambu",
  "Agrikultur",
  "Kesehatan",
];

/** PRD 2.1.1 — filter cepat Explore: wilayah regional dan kesiapan B2B. */
export const regions = [
  "Sumatera",
  "Jawa",
  "Bali & Nusa Tenggara",
  "Kalimantan",
  "Sulawesi",
] as const;
export type Region = (typeof regions)[number];

/**
 * Readiness Level dipakai calon mitra B2B untuk menyaring: siapa yang baru
 * bisa sampel, siapa yang sudah sanggup kontrak maklon berjalan.
 */
export const readinessLevels = ["Eksplorasi", "Siap Sampel", "Siap Kontrak"] as const;
export type Readiness = (typeof readinessLevels)[number];

export type Karya = {
  slug: string;
  title: string;
  maker: string;
  category: Category;
  region: Region;
  readiness: Readiness;
  image: string;
  likes: number;
  views: number;
};

export const karya: Karya[] = [
  { slug: "kopi-arabica-gayo", title: "Kopi Arabica Gayo Premium", maker: "Koperasi Tani Takengon", category: "Agrikultur", region: "Sumatera", readiness: "Siap Kontrak", image: "/karya/k16.jpg", likes: 4200, views: 12000 },
  { slug: "anyaman-rotan-modern", title: "Anyaman Rotan Modern Set", maker: "Kriya Nusantara Abadi", category: "Furniture", region: "Kalimantan", readiness: "Siap Kontrak", image: "/karya/k17.jpg", likes: 3800, views: 21000 },
  { slug: "kain-batik-tulis", title: "Kain Batik Tulis Kontemporer", maker: "Batik Warga Solo", category: "Batik Tradisional", region: "Jawa", readiness: "Siap Kontrak", image: "/karya/k01.jpg", likes: 5100, views: 18000 },
  { slug: "skincare-organik-bali", title: "Skincare Organik Bali", maker: "Natura Bali", category: "Kesehatan", region: "Bali & Nusa Tenggara", readiness: "Siap Sampel", image: "/karya/k07.jpg", likes: 2100, views: 7200 },
  { slug: "kopi-luwak-java", title: "Kopi Luwak Java", maker: "Java Heritage Coffee", category: "Agrikultur", region: "Jawa", readiness: "Siap Sampel", image: "/karya/k04.jpg", likes: 1500, views: 5200 },
  { slug: "tenun-ikat-ntt", title: "Tenun Ikat NTT", maker: "Tenun Sumba Collective", category: "Karya Seni", region: "Bali & Nusa Tenggara", readiness: "Eksplorasi", image: "/karya/k10.jpg", likes: 2700, views: 8400 },
  { slug: "set-keramik-glasir", title: "Set Keramik Glasir Estetik", maker: "Studio Tanah Liat Kasongan", category: "Karya Seni", region: "Jawa", readiness: "Siap Sampel", image: "/karya/k06.jpg", likes: 3200, views: 10000 },
  { slug: "ukiran-kayu-jati", title: "Ukiran Kayu Jati Jepara", maker: "Karya Seni Utama", category: "Furniture", region: "Jawa", readiness: "Siap Kontrak", image: "/karya/k08.jpg", likes: 4600, views: 19000 },
  { slug: "cokelat-artisan", title: "Cokelat Artisan Nusantara", maker: "Kakao Bali Maju", category: "Kuliner Kemasan", region: "Bali & Nusa Tenggara", readiness: "Siap Sampel", image: "/karya/k05.jpg", likes: 1800, views: 6800 },
  { slug: "perhiasan-perak-celuk", title: "Perhiasan Perak Celuk", maker: "Silver Smith Bali", category: "Karya Seni", region: "Bali & Nusa Tenggara", readiness: "Siap Kontrak", image: "/karya/k12.jpg", likes: 3800, views: 7900 },
  { slug: "pakaian-katun-ramah", title: "Pakaian Katun Ramah Lingkungan", maker: "Bumi & Kain", category: "Fashion", region: "Jawa", readiness: "Eksplorasi", image: "/karya/k14.jpg", likes: 4100, views: 7000 },
  { slug: "minyak-atsiri-nusantara", title: "Minyak Atsiri Murni Nusantara", maker: "Aroma Jaya Nusantara", category: "Kesehatan", region: "Sulawesi", readiness: "Siap Sampel", image: "/karya/k20.jpg", likes: 2500, views: 5800 },
];

export type Testimonial = { quote: string; name: string; role: string; avatar: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "ParaKarsa telah membantu produk anyaman kami menjangkau pasar yang lebih luas. Kini kami bisa memberdayakan lebih banyak ibu-ibu di desa.",
    name: "Ibu Ningsih",
    role: "Pengrajin Anyaman, Kriya Nusantara Abadi",
    avatar: "/karya/k13.jpg",
  },
  {
    quote:
      "Kualitas produk di sini sangat luar biasa. Saya berencana mendukung karya anak bangsa sambil mendapatkan kopi premium untuk kafe saya.",
    name: "Bapak Ridwan",
    role: "Pemilik Kafe, Jakarta",
    avatar: "/karya/k03.jpg",
  },
  {
    quote:
      "Proses transaksi sangat mudah dan transparan. Verifikasi yang saya beli benar-benar otentik dan berkualitas tinggi.",
    name: "Sarah Johnson",
    role: "Kolektor Seni, Bali",
    avatar: "/karya/k09.jpg",
  },
];

export const villageStory = {
  eyebrow: "Cerita Pengrajin",
  title: "Merajut Harapan di Kaki Gunung Rinjani",
  body:
    "Ikuti perjalanan Pak Wayan, seorang pengrajin tenun generasi ketiga yang mendedikasikan hidupnya untuk melestarikan seni anyaman tradisional sambil memberdayakan pemuda setempat.",
  image: "/karya/k19.jpg",
};

export type EventItem = {
  slug: string;
  title: string;
  organizer: string;
  organizerSince: string;
  organizerBio: string;
  city: string;
  location: string;
  venue: string;
  dates: string;
  hours: string;
  registration: string;
  ticket: string;
  pro: boolean;
  attendees: number;
  views: string;
  kind: string;
  tags: string[];
  about: string[];
  schedule: { time: string; title: string; detail: string }[];
  gallery: string[];
  speakers: { name: string; avatar: string }[];
  poster: string;
};

export const events: EventItem[] = [
  {
    slug: "bazaar-karya-nusantara-2026",
    title: "Bazaar Karya Nusantara 2026",
    organizer: "Paguyuban Pengrajin Solo",
    organizerSince: "Bergabung sejak 2021",
    organizerBio:
      "Komunitas pengrajin lokal dari Solo yang berdedikasi melestarikan kriya tradisional dengan sentuhan desain modern.",
    city: "Jakarta",
    location: "Jakarta, Indonesia",
    venue: "Gedung SMESCO, Jakarta Selatan, DKI Jakarta",
    dates: "15 – 17 Oktober 2026",
    hours: "09.00 – 17.00 WIB",
    registration: "1 – 10 Oktober 2026",
    ticket: "Gratis · Registrasi diperlukan",
    pro: true,
    attendees: 389,
    views: "1,2 rb",
    kind: "Bazaar UMKM",
    tags: ["Bazaar", "Crafts", "Networking", "Local Brands"],
    about: [
      "Bazaar Karya Nusantara adalah acara tahunan yang merayakan kekayaan kriya dan seni rupa Indonesia. Tahun ini kami menghadirkan lebih dari 100 pengrajin lokal terpilih dari seluruh nusantara untuk memamerkan karya terbaik mereka, mulai dari tekstil tradisional, keramik kontemporer, hingga perhiasan etnik dengan sentuhan modern.",
      "Tujuan utama acara ini adalah menjembatani para pengrajin lokal dengan pasar yang lebih luas, baik pembeli retail maupun mitra B2B. Selain area pameran dan penjualan, pengunjung juga dapat mengikuti sesi talkshow inspiratif dan demonstrasi pembuatan kriya secara langsung.",
    ],
    schedule: [
      { time: "08.00 WIB", title: "Opening Ceremony", detail: "Pembukaan resmi oleh Menteri Pariwisata dan Ekonomi Kreatif." },
      { time: "10.00 WIB", title: "Exhibition Open", detail: "Area pameran dan bazaar mulai dibuka untuk pengunjung umum." },
      { time: "13.00 WIB", title: "Talkshow: Masa Depan Kriya", detail: "Diskusi panel bersama ahli desain dan pakar ekspor kerajinan." },
    ],
    gallery: ["/karya/k17.jpg", "/karya/k08.jpg", "/karya/k18.jpg"],
    speakers: [
      { name: "Dr. Sarah Mitchell", avatar: "/karya/k13.jpg" },
      { name: "Prof. James Wilson", avatar: "/karya/k03.jpg" },
      { name: "Elena Rodriguez", avatar: "/karya/k09.jpg" },
    ],
    poster: "/karya/k11.jpg",
  },
  {
    slug: "workshop-tenun-ikat-klasik",
    title: "Workshop Tenun Ikat Klasik",
    organizer: "Studio Kain Nusantara",
    organizerSince: "Bergabung sejak 2019",
    organizerBio:
      "Studio tekstil yang memusatkan kerja pada pelestarian teknik tenun ikat dari Nusa Tenggara.",
    city: "Yogyakarta",
    location: "Yogyakarta, Indonesia",
    venue: "Studio Kain Nusantara, Bantul, DI Yogyakarta",
    dates: "20 Oktober 2026",
    hours: "09.00 – 15.00 WIB",
    registration: "1 – 18 Oktober 2026",
    ticket: "Rp 150.000 · Termasuk bahan",
    pro: true,
    attendees: 156,
    views: "820",
    kind: "Workshop",
    tags: ["Workshop", "Textiles", "Crafts", "Culture"],
    about: [
      "Ikuti pengalaman mendalam mempelajari teknik tenun tradisional langsung dari perajin ahli. Temukan warisan budaya yang kaya dan proses rumit di balik pembuatan kain ikat yang memukau.",
    ],
    schedule: [
      { time: "09.00 WIB", title: "Pengenalan Motif", detail: "Membaca makna motif ikat dan asal daerahnya." },
      { time: "11.00 WIB", title: "Praktik Pengikatan", detail: "Latihan mengikat benang lungsi sebelum pencelupan." },
      { time: "13.30 WIB", title: "Menenun Bersama", detail: "Menenun panel kecil di alat tenun bukan mesin." },
    ],
    gallery: ["/karya/k10.jpg", "/karya/k19.jpg", "/karya/k01.jpg"],
    speakers: [
      { name: "Ibu Ningsih", avatar: "/karya/k13.jpg" },
      { name: "Pak Wayan", avatar: "/karya/k12.jpg" },
    ],
    poster: "/karya/k10.jpg",
  },
];

export const eventCities = ["Jakarta", "Bandung", "Yogyakarta", "Bali"];

export type Store = {
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  city: string;
  industry: "Kuliner" | "Fesyen" | "Aplikasi & Digital";
  image: string;
  products: { name: string; price: number }[];
};

export const stores: Store[] = [
  {
    slug: "dapur-rempah-nusantara",
    name: "Dapur Rempah Nusantara",
    initials: "DR",
    tagline: "Grosir bumbu & frozen food",
    city: "Bandung",
    industry: "Kuliner",
    image: "/karya/k18.jpg",
    products: [
      { name: "Kopi Gayo Premium 200g", price: 68000 },
      { name: "Kopi Toraja Drip Bag isi 10", price: 54000 },
    ],
  },
  {
    slug: "kirana-hijab-fashion",
    name: "Kirana Hijab & Fashion",
    initials: "KH",
    tagline: "Busana muslim harga reseller",
    city: "Bekasi",
    industry: "Fesyen",
    image: "/karya/k14.jpg",
    products: [
      { name: "Gamis Basic Katun (M, Mocca)", price: 189000 },
      { name: "Gamis Basic Katun (L, Hitam)", price: 189000 },
    ],
  },
  {
    slug: "sinyal-cell-ppob",
    name: "Sinyal Cell & PPOB",
    initials: "SC",
    tagline: "Pulsa, token & pembayaran",
    city: "Sidoarjo",
    industry: "Aplikasi & Digital",
    image: "/karya/k03.jpg",
    products: [
      { name: "Kartu Perdana Sinyal Kita 8GB", price: 35000 },
      { name: "Voucher Data Fisik 3GB", price: 18000 },
    ],
  },
  {
    slug: "batik-larasati",
    name: "Batik Larasati",
    initials: "BL",
    tagline: "Batik seragam & korporat",
    city: "Solo",
    industry: "Fesyen",
    image: "/karya/k01.jpg",
    products: [
      { name: "Kemeja Batik Pria", price: 250000 },
      { name: "Kain Batik Tulis", price: 450000 },
    ],
  },
  {
    slug: "kopi-langit-senja",
    name: "Kopi Langit Senja",
    initials: "KS",
    tagline: "Suplai kopi B2B",
    city: "Yogyakarta",
    industry: "Kuliner",
    image: "/karya/k04.jpg",
    products: [
      { name: "Arabica Gayo 1kg", price: 180000 },
      { name: "Robusta Temanggung 1kg", price: 120000 },
    ],
  },
  {
    slug: "warung-digital-amanah",
    name: "Warung Digital Amanah",
    initials: "WA",
    tagline: "Hub PPOB & e-money",
    city: "Malang",
    industry: "Aplikasi & Digital",
    image: "/karya/k15.jpg",
    products: [
      { name: "Sistem Kasir Cloud", price: 150000 },
      { name: "Paket Reseller Pulsa", price: 50000 },
    ],
  },
];

/** The artisan whose profile page the demo signs into. */
export const artisan = {
  handle: "HRMNY",
  discipline: "Fashion | Designer | Art",
  location: "DKI Jakarta, Indonesia",
  cover: "/karya/k12.jpg",
  avatar: "/karya/k03.jpg",
  about:
    "Crafting Premium Brand Experiences. Kami studio kreatif yang berfokus mengangkat merek UMKM lewat desain yang matang, sistem identitas yang kuat, dan penceritaan visual yang meyakinkan.",
  vision:
    "Setiap UMKM Indonesia layak tampil sekelas merek global tanpa kehilangan akar ceritanya.",
  mission:
    "Mendampingi 500 pelaku usaha kecil membangun identitas merek yang konsisten, terdokumentasi, dan bisa dibuktikan ke mitra maupun investor.",
  /** LinkedIn Company Page block dari PRD 2.1.4. */
  facts: [
    { label: "Tahun berdiri", value: "2019" },
    { label: "Bentuk usaha", value: "CV" },
    { label: "Ukuran tim", value: "12 orang" },
    { label: "Spesialisasi", value: "Branding & kemasan UMKM" },
  ],
  /**
   * Nomor dimask sampai empat digit terakhir — halaman profil bersifat publik,
   * dan yang perlu dibaca calon mitra hanya status verifikasinya.
   */
  legality: [
    { label: "NIB", value: "•••• •••• 4127", verified: true },
    { label: "NPWP badan", value: "•••• •••• 8903", verified: true },
    { label: "Merek terdaftar (DJKI)", value: "dalam proses", verified: false },
  ],
  stats: [
    { value: "8", label: "Portfolio", tone: "ink" },
    { value: "2", label: "Sertifikasi", tone: "accent" },
    { value: "13", label: "Kolaborasi", tone: "primary" },
    { value: "4.8", label: "Rating", tone: "blue" },
  ] as const,
  certifications: ["Sertifikasi Kriya Nasional", "SNI Eco-Friendly"],
  collaborators: ["Kemenparekraf", "Dekranasda", "Lokal Brand"],
  reviews: [
    { quote: "Desainnya sangat detail dan pengerjaannya rapi sekali.", name: "Andi Pratama" },
    { quote: "Sangat profesional dan komunikatif selama proses desain.", name: "Siti Aminah" },
  ],
  portfolio: [
    "/karya/k16.jpg",
    "/karya/k11.jpg",
    "/karya/k15.jpg",
    "/karya/k02.jpg",
    "/karya/k07.jpg",
    "/karya/k06.jpg",
    "/karya/k01.jpg",
    "/karya/k17.jpg",
  ],
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const formatRupiah = (value: number) => rupiah.format(value).replace(/\s/, " ");

const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

export const formatCompact = (value: number) => compact.format(value);

/**
 * PRD 2.1.2 — Halaman Jobs: penawaran kapasitas produksi longgar (white-label /
 * maklon) dan permintaan kemitraan B2B. Kedua arah dipakai satu bentuk kartu,
 * jadi detail spesifiknya hidup di `specs` bukan di kolom terpisah.
 */
export type Partnership = {
  slug: string;
  kind: "Penawaran" | "Permintaan";
  title: string;
  company: string;
  initials: string;
  city: string;
  industry: string;
  image: string;
  summary: string;
  specs: { label: string; value: string }[];
  tags: string[];
  /** Gate kesiapan: tombol RFQ terkunci bila EP Score profil di bawah angka ini. */
  epMin: number;
};

export const partnerships: Partnership[] = [
  {
    slug: "maklon-roasting-kopi",
    kind: "Penawaran",
    title: "Kapasitas Maklon Roasting Kopi 2 Ton/Bulan",
    company: "Kopi Langit Senja",
    initials: "KS",
    city: "Yogyakarta",
    industry: "Kuliner",
    image: "/karya/k04.jpg",
    summary:
      "Lini roasting drum 15 kg dengan slot longgar tiga hari per minggu. Terbuka untuk private label kafe, hotel, maupun merek retail baru.",
    specs: [
      { label: "Kapasitas", value: "2 ton / bulan" },
      { label: "MOQ", value: "50 kg" },
      { label: "Lead time", value: "14 hari kerja" },
      { label: "Standar QC", value: "SNI 01-2907 · cupping ≥ 82" },
    ],
    tags: ["White-Label", "Maklon", "F&B"],
    epMin: 60,
  },
  {
    slug: "jahit-maklon-busana-muslim",
    kind: "Penawaran",
    title: "Jahit Maklon Busana Muslim & Seragam",
    company: "Kirana Hijab & Fashion",
    initials: "KH",
    city: "Bekasi",
    industry: "Fesyen",
    image: "/karya/k14.jpg",
    summary:
      "24 mesin jahit dan 4 overdeck siap menerima kontrak jahit CMT maupun full package termasuk pengadaan kain.",
    specs: [
      { label: "Kapasitas", value: "4.000 pcs / bulan" },
      { label: "MOQ", value: "200 pcs" },
      { label: "Lead time", value: "21 hari kerja" },
      { label: "Standar QC", value: "AQL 2.5 · uji susut kain" },
    ],
    tags: ["CMT", "Full Package", "Fesyen"],
    epMin: 55,
  },
  {
    slug: "anyaman-rotan-white-label",
    kind: "Penawaran",
    title: "Produksi Anyaman Rotan White-Label",
    company: "Kriya Nusantara Abadi",
    initials: "KN",
    city: "Cirebon",
    industry: "Furniture",
    image: "/karya/k17.jpg",
    summary:
      "Sentra anyaman dengan 38 perajin binaan. Menerima pesanan furnitur dan homeware rotan sesuai desain pembeli, siap ekspor.",
    specs: [
      { label: "Kapasitas", value: "600 unit / bulan" },
      { label: "MOQ", value: "50 unit" },
      { label: "Lead time", value: "30 hari kerja" },
      { label: "Standar QC", value: "Uji beban 120 kg · finishing water-based" },
    ],
    tags: ["White-Label", "Ekspor", "Kriya"],
    epMin: 70,
  },
  {
    slug: "kemasan-kustom-cetak-digital",
    kind: "Penawaran",
    title: "Kemasan Kustom Cetak Digital Food-Grade",
    company: "Grafika Kemas Mandiri",
    initials: "GK",
    city: "Bandung",
    industry: "Kemasan & Cetak",
    image: "/karya/k18.jpg",
    summary:
      "Cetak digital tanpa plat, cocok untuk UMKM yang butuh kemasan bermerek dalam kuantitas kecil sebelum naik ke produksi massal.",
    specs: [
      { label: "Kapasitas", value: "120.000 pcs / bulan" },
      { label: "MOQ", value: "1.000 pcs" },
      { label: "Lead time", value: "10 hari kerja" },
      { label: "Standar QC", value: "Tinta food-grade · uji migrasi" },
    ],
    tags: ["Kemasan", "Cetak", "Low MOQ"],
    epMin: 50,
  },
  {
    slug: "permintaan-bumbu-instan",
    kind: "Permintaan",
    title: "Mencari Mitra Produksi Bumbu Instan 10 Ton",
    company: "Boga Rasa Nusantara",
    initials: "BR",
    city: "Jakarta",
    industry: "Kuliner",
    image: "/karya/k05.jpg",
    summary:
      "Agregator ritel modern membuka kontrak tahunan untuk sembilan varian bumbu dasar. Pendampingan formulasi dan uji lab ditanggung pemesan.",
    specs: [
      { label: "Volume", value: "10 ton / bulan" },
      { label: "Nilai kontrak", value: "Rp 1,2 M / tahun" },
      { label: "Tenggat penawaran", value: "30 September 2026" },
      { label: "Syarat wajib", value: "Sertifikat Halal · izin BPOM MD" },
    ],
    tags: ["Kontrak Tahunan", "Ritel Modern", "F&B"],
    epMin: 75,
  },
  {
    slug: "permintaan-seragam-batik",
    kind: "Permintaan",
    title: "Pengadaan Seragam Batik Korporat 5.000 Pcs",
    company: "Koperasi Karyawan Nusantara",
    initials: "KK",
    city: "Semarang",
    industry: "Fesyen",
    image: "/karya/k01.jpg",
    summary:
      "Pengadaan seragam tahunan untuk enam kantor cabang. Diutamakan sentra batik yang bisa memasok tiga motif dan pengiriman bertahap.",
    specs: [
      { label: "Volume", value: "5.000 pcs" },
      { label: "Anggaran", value: "Rp 275.000 / pcs" },
      { label: "Tenggat penawaran", value: "15 Oktober 2026" },
      { label: "Syarat wajib", value: "Batik tulis/cap · 3 contoh motif" },
    ],
    tags: ["Pengadaan", "Batik", "Korporat"],
    epMin: 65,
  },
];

/**
 * PRD 2.1.3 — Halaman Hire: gerbang kurasi ke program yang dibuka mitra
 * Hexa-Helix. Enam helix = enam jenis penyelenggara; `epMin` adalah gate yang
 * menentukan apakah tombol daftar terbuka.
 */
export const helices = [
  "Pemerintah",
  "Universitas",
  "Investor",
  "Media",
  "Komunitas",
  "Bisnis",
] as const;

export type Helix = (typeof helices)[number];

export type Program = {
  slug: string;
  title: string;
  partner: string;
  helix: Helix;
  category: string;
  image: string;
  summary: string;
  benefits: string[];
  quota: string;
  deadline: string;
  format: string;
  epMin: number;
};

export const programs: Program[] = [
  {
    slug: "business-matching-agregator-ritel",
    title: "Business Matching Agregator Ritel Nasional",
    partner: "Konsorsium Ritel Nusantara",
    helix: "Bisnis",
    category: "Business Matching",
    image: "/karya/k11.jpg",
    summary:
      "Sesi pertemuan terjadwal dengan tim buyer dari empat jaringan ritel modern. Kurasi produk dilakukan sebelum hari-H, jadi setiap slot bertemu buyer yang memang mencari kategori Anda.",
    benefits: [
      "6 slot pertemuan buyer @30 menit",
      "Pendampingan penyusunan price list B2B",
      "Prioritas onboarding ke katalog agregator",
    ],
    quota: "40 UMKM terpilih",
    deadline: "20 September 2026",
    format: "Luring · Jakarta",
    epMin: 65,
  },
  {
    slug: "pitching-day-venture-capital",
    title: "Pitching Day ke Venture Capital",
    partner: "Nusantara Ventures & 3 VC mitra",
    helix: "Investor",
    category: "Pitching ke VC",
    image: "/karya/k09.jpg",
    summary:
      "Panggung pitching tertutup untuk usaha yang sudah punya traksi pendapatan dan tata kelola rapi. Materi due diligence awal ditarik langsung dari kredensial e.id Anda.",
    benefits: [
      "Pitch 8 menit di hadapan panel investor",
      "Klinik penyusunan data room",
      "Umpan balik tertulis dari tiap investor",
    ],
    quota: "12 UMKM terpilih",
    deadline: "5 Oktober 2026",
    format: "Luring · Jakarta",
    epMin: 80,
  },
  {
    slug: "inkubasi-kampus-batch-5",
    title: "Inkubasi Kampus Batch 5",
    partner: "Pusat Inkubator Bisnis UGM",
    helix: "Universitas",
    category: "Inkubasi Kampus",
    image: "/karya/k13.jpg",
    summary:
      "Program pendampingan 12 minggu bersama mentor kampus dan tim riset produk. Fokus pada perbaikan proses produksi dan kesiapan skala.",
    benefits: [
      "Mentor pendamping 1-on-1 tiap minggu",
      "Akses laboratorium uji produk",
      "Hibah pengembangan Rp 15 juta",
    ],
    quota: "25 UMKM terpilih",
    deadline: "12 September 2026",
    format: "Hibrida · Yogyakarta",
    epMin: 55,
  },
  {
    slug: "kurikulum-toe-lanjutan",
    title: "Kurikulum ToE Lanjutan",
    partner: "Komunitas Wirausaha Nusantara",
    helix: "Komunitas",
    category: "Pelatihan ToE",
    image: "/karya/k06.jpg",
    summary:
      "Kelanjutan Training of Entrepreneur untuk yang sudah menuntaskan modul dasar. Kelulusan menerbitkan kredensial baru yang langsung menaikkan pilar Tata Kelola di DNA Anda.",
    benefits: [
      "8 modul lanjutan tata kelola & keuangan",
      "Kredensial ToE Lanjutan terverifikasi e.id",
      "Akses seumur hidup ke rekaman kelas",
    ],
    quota: "Tanpa kuota",
    deadline: "Pendaftaran sepanjang tahun",
    format: "Daring",
    epMin: 40,
  },
  {
    slug: "fasilitasi-sertifikasi-halal-sni",
    title: "Fasilitasi Sertifikasi Halal & SNI",
    partner: "Dinas Koperasi & UKM Provinsi",
    helix: "Pemerintah",
    category: "Fasilitasi Legalitas",
    image: "/karya/k19.jpg",
    summary:
      "Pembiayaan penuh biaya audit dan pendampingan dokumen untuk UMKM yang produknya sudah siap edar tapi belum tersertifikasi.",
    benefits: [
      "Biaya audit ditanggung penuh",
      "Pendampingan dokumen 6 minggu",
      "Sertifikat terbit sebagai kredensial e.id",
    ],
    quota: "150 UMKM",
    deadline: "30 September 2026",
    format: "Hibrida · per provinsi",
    epMin: 50,
  },
  {
    slug: "liputan-brand-story",
    title: "Liputan & Produksi Brand Story",
    partner: "Kanal Media Kriya Indonesia",
    helix: "Media",
    category: "Eksposur Media",
    image: "/karya/k15.jpg",
    summary:
      "Produksi profil video dan artikel panjang tentang usaha Anda, disiarkan di kanal mitra media dengan jangkauan 2 juta pembaca per bulan.",
    benefits: [
      "Sesi foto & video produk di lokasi",
      "Artikel profil di kanal mitra",
      "Aset visual bebas pakai untuk katalog",
    ],
    quota: "18 UMKM per kuartal",
    deadline: "25 September 2026",
    format: "Luring · lokasi usaha",
    epMin: 60,
  },
];
