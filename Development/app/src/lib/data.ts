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

export type Karya = {
  slug: string;
  title: string;
  maker: string;
  category: Category;
  image: string;
  likes: number;
  views: number;
};

export const karya: Karya[] = [
  { slug: "kopi-arabica-gayo", title: "Kopi Arabica Gayo Premium", maker: "Koperasi Tani Takengon", category: "Agrikultur", image: "/karya/k16.jpg", likes: 4200, views: 12000 },
  { slug: "anyaman-rotan-modern", title: "Anyaman Rotan Modern Set", maker: "Kriya Nusantara Abadi", category: "Furniture", image: "/karya/k17.jpg", likes: 3800, views: 21000 },
  { slug: "kain-batik-tulis", title: "Kain Batik Tulis Kontemporer", maker: "Batik Warga Solo", category: "Batik Tradisional", image: "/karya/k01.jpg", likes: 5100, views: 18000 },
  { slug: "skincare-organik-bali", title: "Skincare Organik Bali", maker: "Natura Bali", category: "Kesehatan", image: "/karya/k07.jpg", likes: 2100, views: 7200 },
  { slug: "kopi-luwak-java", title: "Kopi Luwak Java", maker: "Java Heritage Coffee", category: "Agrikultur", image: "/karya/k04.jpg", likes: 1500, views: 5200 },
  { slug: "tenun-ikat-ntt", title: "Tenun Ikat NTT", maker: "Tenun Sumba Collective", category: "Karya Seni", image: "/karya/k10.jpg", likes: 2700, views: 8400 },
  { slug: "set-keramik-glasir", title: "Set Keramik Glasir Estetik", maker: "Studio Tanah Liat Kasongan", category: "Karya Seni", image: "/karya/k06.jpg", likes: 3200, views: 10000 },
  { slug: "ukiran-kayu-jati", title: "Ukiran Kayu Jati Jepara", maker: "Karya Seni Utama", category: "Furniture", image: "/karya/k08.jpg", likes: 4600, views: 19000 },
  { slug: "cokelat-artisan", title: "Cokelat Artisan Nusantara", maker: "Kakao Bali Maju", category: "Kuliner Kemasan", image: "/karya/k05.jpg", likes: 1800, views: 6800 },
  { slug: "perhiasan-perak-celuk", title: "Perhiasan Perak Celuk", maker: "Silver Smith Bali", category: "Karya Seni", image: "/karya/k12.jpg", likes: 3800, views: 7900 },
  { slug: "pakaian-katun-ramah", title: "Pakaian Katun Ramah Lingkungan", maker: "Bumi & Kain", category: "Fashion", image: "/karya/k14.jpg", likes: 4100, views: 7000 },
  { slug: "minyak-atsiri-nusantara", title: "Minyak Atsiri Murni Nusantara", maker: "Aroma Jaya Nusantara", category: "Kesehatan", image: "/karya/k20.jpg", likes: 2500, views: 5800 },
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
