# PRODUCT REQUIREMENT DOCUMENT (PRD)

## Asta 4: EntreID — Kredensial & DNA Portofolio Digital Terverifikasi
*(Behance x LinkedIn Edition)*

| Field | Value |
|---|---|
| **Kode Produk** | OKESTA-ASTA4-EID |
| **Versi** | 1.1.0-VIBECODE |
| **Tanggal** | 30 Agustus 2026 |
| **Infrastruktur Deployment** | VPS IDCloudHost (Domain .id Live) |

---

## 1. Product Brief (What and Why)

### 1.1 Overview

Asta 4 (Portfolio & DNA Mapping) dalam ekosistem Parakarsa direkonseptualisasi untuk menghilangkan fragmentasi identitas bisnis (Trust Foundation). Melalui integrasi e.id Verifier API, Asta 4 bertransformasi menjadi EntreID, sebuah pintu gerbang Single Sign-On (SSO) terdesentralisasi bagi alumni inkubator riset dan pelaku wirausaha ultra-mikro nasional. Aplikasi ini menggabungkan portofolio visual interaktif layaknya Behance dengan keandalan kredibilitas data setara profil LinkedIn Company Page.

### 1.2 Background and Context

Berdasarkan data lapangan Parakarsa (2021–2026), 78% UMKM menghindari digitalisasi karena takut data pribadi disalahgunakan oleh platform BigTech, dan 90% wirausaha baru gagal melampaui Valley of Death karena ketiadaan rekam jejak bisnis yang diakui (verifiable track record). Dalam ajang .id Vibe Coding 2026, Parakarsa mengintegrasikan teknologi kredensial digital berbasis blockchain (IDChain) dari e.id untuk memecahkan bottleneck ini secara mutlak:

- **Verifikasi Instan tanpa Kertas**: Menggantikan proses fotokopi/legalisir dokumen fisik wirausaha yang memakan waktu berhari-hari menjadi hitungan detik.
- **Kedaulatan Data (Data Sovereignty)**: Memenuhi UU PDP No. 27/2022 karena data berada di dompet digital pemilik, dan platform hanya memverifikasi secara kriptografis.
- **Pilar Kompetisi**: Memenuhi ketentuan technical meeting untuk membangun aplikasi baru berbasis .id di VPS IDCloudHost dengan implementasi use case kredensial e.id yang mendalam.

### 1.3 Success Criteria / Impact

**Metrics to Measure Success (Kriteria Penjurian)**

- **Kedalaman Integrasi e.id (Target Bobot 25%)**: Penggunaan multi-kredensial secara simultan (Level 1, KYC Vida, dan Registry Meeting) untuk verifikasi multi-faktor.
- **Kecepatan Onboarding (Time-to-onboard)**: Rata-rata waktu pembuatan akun wirausaha dan profil DNA turun dari 5 menit menjadi <5 detik (hanya memindai QR).
- **Tingkat Keberhasilan Verifikasi Kriptografis**: Persentase pencatatan tanda tangan digital (signature audit trail) yang sukses diverifikasi on-chain melalui IDChain Explorer.

**Metrics to Monitor (Teknis & Stabilitas)**

- **Respons Latensi API Verifier**: Waktu respons dari gateway e.id ke server lokal di VPS IDCloudHost (target: <2 detik per request).
- **Uptime Aplikasi di VPS IDCloudHost**: Pemantauan operasional aplikasi web dengan target 99.9% selama masa kompetisi.
- **Commit Frequency & Code Freeze Compliance**: Menjaga riwayat Git commit aktif dari Day 1 hingga tenggat Code Freeze pukul 10.00 WIB, 1 September 2026.

**Team**

- **Product Manager & Presenter**: Irfan Fakhri Muhammad
- **UX/UI & Frontend Developer**: Tim Frontend Flutter/Web
- **Backend & Blockchain Engineer**: Kang Iyus (Technical Architect)

---

## 2. Solution Design

### 2.1 Pemetaan Antarmuka: Metafora Behance x LinkedIn

Struktur aplikasi web EntreID selama ajang Vibe Coding akan dibagi menjadi 4 Halaman Utama yang merepresentasikan integrasi fungsional dari portofolio visual dan identitas bisnis terverifikasi:

#### 2.1.1 Halaman Explore (Landing Page - Kumpulan Portofolio Project UMKM)

- **Konsep UI (Behance Explore)**: Berfungsi sebagai landing page publik berupa grid visual horizontal/vertikal yang menampilkan kartu-kartu proyek kolaborasi kreatif UMKM.
- **Fungsionalitas**: Menampilkan galeri kasus nyata (use case) hasil kokreasi (misalnya: proyek kemasan kustom, standardisasi produk serat akar wangi, atau hasil rekayasa pangan sirkular).
- Setiap kartu proyek menampilkan: Gambar sampul berkualitas tinggi, nama UMKM, tag industri (F&B, Craft, dll), jumlah apresiasi (appreciations), dan jumlah tayangan (views).
- Fitur filter cepat berdasarkan wilayah regional atau tingkat kesiapan kolaborasi B2B (Readiness Level).

#### 2.1.2 Halaman Jobs (Penawaran Jasa B2B / White-Label Capabilities)

- **Konsep UI (Behance Jobs)**: Ruang di mana pelaku UMKM bertindak sebagai penyedia jasa atau manufaktur kapasitas produksi.
- **Fungsionalitas**: Tempat UMKM mempublikasikan penawaran kapasitas produksi longgar (idle production capacity) untuk skema White-Label / Maklon / Kontrak B2B.
- Setiap listing menampilkan: Kapasitas produksi bulanan, batas minimum pemesanan (MOQ), lead time pengerjaan, dan standar kontrol kualitas (QC) yang dijamin.
- Tombol aksi interaktif: "Ajukan RFQ (Request for Quote)" yang akan memicu otomatisasi draf kontrak kerja sama.

#### 2.1.3 Halaman Hire (Hexa-Helix Program Hub)

- **Konsep UI (Behance Hire)**: Gerbang kurasi di mana UMKM dapat menemukan dan mendaftar ke berbagai program strategis yang disediakan oleh jaringan kemitraan Parakarsa.
- **Fungsionalitas**: Daftar aktif program yang dibuka oleh Mitra Hexa-Helix (Pemerintah, Universitas, Investor, Media, Komunitas, Bisnis).
- **Kategori Program**: Business Matching dengan agregator, pendaftaran sesi Pitching ke Venture Capital, pelatihan kurikulum ToE lanjutan, dan program inkubasi kampus.
- **Mekanisme Gate**: Tombol daftar hanya aktif jika skor kinerja kewirausahaan (EP Score) UMKM pada profil mereka memenuhi syarat batas minimal yang diminta oleh program.

#### 2.1.4 Halaman Profile (Manifesto Portofolio & DNA Kinerja Kewirausahaan)

- **Konsep UI (Behance Profile x LinkedIn Company Page)**: Halaman profil terdalam dari UMKM yang bertindak sebagai "Manifesto Kredibilitas" mereka.
- **Fungsionalitas & Lingkup Vibe Coding**: Menampilkan visi misi usaha, spesialisasi, ukuran tim, tahun berdiri, dan legalitas.
- **DNA Hasil LMS (Upload-First)**: Sesuai batasan hackathon, fitur LMS penuh tidak dideploy di server Vibe Coding. Sebagai gantinya, menyediakan fitur upload file mandiri bagi pelaku usaha untuk mengunggah sertifikat kelulusan LMS atau laporan profil DNA mereka (dalam format PDF/PNG) untuk kemudian divisualisasikan menjadi diagram Radar/Grafik DNA interaktif di halaman profil.
- **Visualisasi Kinerja (Entrepreneurial Performance)**: Grafik/meteran komposisi skor EP (gabungan dari pilar Talenta, Market, dan Tata Kelola) untuk menunjukkan kesiapan kolaborasi mereka secara riil di hadapan calon investor atau pembeli B2B.

### 2.2 Functional Requirements List

| ID | Fungsionalitas | Deskripsi Kebutuhan |
|---|---|---|
| FR-01 | SSO Login "Sign in with e.id" | Pengguna dapat masuk ke dashboard Asta 4 menggunakan akun kredensial e.id mereka secara terdesentralisasi. |
| FR-02 | Koleksi Kredensial | Mendukung penarikan data Membership Level 1 (Email, No WA), Data Identitas/KYC Vida (Nama, NIK), dan Kredensial Registry Meeting. |
| FR-03 | Auto-Generate DNA Portfolio | Sistem secara otomatis menerbitkan dokumen Verifiable DNA Portfolio (PDF) berdasarkan data kredensial terverifikasi untuk disimpan di Drive pengguna. |
| FR-04 | Consent Control Module (DART) | Pengguna memiliki kendali penuh (opt-in/opt-out) atas data granular apa saja yang boleh diakses oleh platform atau pihak ketiga. |

---

## 3. Implementation

### 3.1 Technical Design Document

- **Arsitektur**: Menggunakan model client-server terdistribusi.
- **Frontend**: Flutter Web / React responsif dideploy pada domain .id untuk desktop/tablet.
- **Backend**: NestJS Server dideploy di VPS IDCloudHost untuk melayani routing dan validasi tanda tangan digital.
- **Database**: PostgreSQL/SQLite untuk menyimpan metadata, database lokal Drift untuk offline-first resilience, dan hash log verifikasi.
- **Blockchain Ledger**: Besu Testnet L2 (IDChain) untuk log persetujuan consent dan pembuktian tanda tangan digital secara immutable.
- **Autentikasi**: OAuth 2.0 via e.id SSO bearer token (JWT).
- **Enkripsi**: Envelope Encryption AES-256-GCM untuk zero-trust multi-tenancy.

### 3.2 API Utama (e.id Verifier & Callback)

#### 3.2.1 Autentikasi Verifier (Fetch Access Token)

**Endpoint**: `POST https://gateway.e.id/oauth/token`

**Payload Request**:

```json
{
  "client_id": "CLIENT_ID_PESERTA",
  "client_secret": "CLIENT_SECRET_PESERTA",
  "grant_type": "client_credentials"
}
```

#### 3.2.2 Request QR Code untuk Verifikasi Kredensial

**Endpoint**: `POST https://gateway.e.id/api/v1/verifier/request-verification`

**Headers**: `Authorization: Bearer <access_token>`

**Payload Request**:

```json
{
  "schema_id": "schema-identity-kyc-vida",
  "callback_url": "https://parakarsa.id/api/v1/callback/e-id",
  "required_claims": ["name", "nik", "phone_number", "whatsapp_status"]
}
```

#### 3.2.3 Callback Webhook Handler (Dihosting di IDCH VPS)

**Endpoint**: `POST https://parakarsa.id/api/v1/callback/e-id`

**Payload Response** (dikirim oleh e.id Gateway):

```json
{
  "verification_id": "vibe-uuid-12345",
  "status": "approved",
  "claims": {
    "name": "Irfan Fakhri Muhammad",
    "nik": "3204XXXXXXXXXXXX",
    "phone_number": "6281234567890",
    "kyc_vendor": "Vida"
  },
  "signature_proof": {
    "did_key": "did:idchain:0x987654321",
    "on_chain_tx": "0xabcde12345..."
  }
}
```

### 3.3 QA and Test Plan

- **Pengujian Unit**: Menguji parser payload JSON webhook e.id dan generator PDF DNA Portofolio agar data NIK yang di-masking tampil rapi.
- **Pengujian Integrasi**: Menguji alur penuh callback dari dompet digital e.id ke server NestJS di VPS IDCloudHost, serta penanganan CORS.
- **Pengujian End-to-End (Demo Day)**: Skenario demo live di mana pengguna memindai QR Code di layar presentasi menggunakan ponsel, dan profil akun wirausaha langsung terisi secara real-time via WebSocket.

### 3.4 User Acceptance Test (UAT) Table

| Test ID | User Story | Test Case | Langkah Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-EID-01 | Registrasi Instan | Registrasi Akun via e.id SSO | 1. Buka parakarsa.id<br>2. Klik "Masuk dengan e.id"<br>3. Scan QR Code dengan Dompet e.id | Sistem memverifikasi signature, menarik data identitas terverifikasi Vida, dan membuat akun otomatis. |
| TC-EID-02 | Data Sovereignty | Manajemen Consent DART | 1. Masuk ke Settings → Privasi Data<br>2. Nonaktifkan toggle "Akses Pihak Ketiga"<br>3. Periksa audit log | Dashboard memotong akses token eksternal secara instan dan mencatat pencabutan tersebut secara aman. |
| TC-EID-03 | Orisinalitas Proyek | Verifikasi On-Chain e.id | 1. Klik tautan "Verifikasi di Blockchain" pada profil.<br>2. Alihkan ke IDChain explorer. | Menampilkan bukti transaksi verifikasi tanda tangan digital yang sah secara kriptografis. |

---

## 4. Impact

### 4.1 Perilaku Pengguna

Pengguna (pelaku UMKM) memperoleh pengalaman onboarding yang ultra-fast dan aman tanpa dipusingkan oleh pengisian formulir manual. Dengan adanya visualisasi DNA yang bersumber dari data yang terverifikasi, wirausaha merasa bangga dan lebih bersemangat meningkatkan skor kinerja kewirausahaan mereka.

### 4.2 Beban Sistem

Mekanisme polling dan webhook dari e.id Gateway memerlukan penyeimbangan beban (load balancing) yang solid di NestJS backend agar saat demo day berlangsung dengan ratusan permintaan paralel, server VPS IDCloudHost tidak mengalami downtime.

### 4.3 Potensi Risiko dan Mitigasi

- **Risiko API Down saat Demo Day**: Mengimplementasikan Fallback Mode menggunakan caching data JSON statis (mock data) berlabel "Simulation Mode / Sandbox" jika koneksi ke gateway utama mengalami latensi tinggi di lokasi SMESCO.
- **Risiko Kegagalan Deployment SSL di VPS IDCloudHost**: Menyelesaikan instalasi SSL Let's Encrypt di VPS IDCloudHost sejak jam-jam pertama pelaksanaan lomba (Day 1) untuk mengamankan callback HTTPS wajib dari e.id.
- **Risiko Churn Rate Demo Juri (Waktu Pitching Terbatas)**: Menyediakan video demo singkat berdurasi 1 menit yang memperlihatkan alur kerja integrasi fungsional penuh sebagai cadangan jika jaringan internet gedung SMESCO mengalami gangguan.

---

## 5. Notes & Future Vision

### 5.1 Jembatan Ekosistem Data Nasional (E-Government)

Sebagai kontribusi strategis Parakarsa dalam memperkuat utilitas platform e.id, kami mengusulkan rancangan Visi Integrasi Data Masa Depan (Future State Map) di hadapan juri dan pengusul:

- **Penerbitan Kredensial NIB (Nomor Induk Berusaha)**: Di masa depan, kami mendorong e.id bekerja sama dengan Kementerian Investasi/BKPM untuk menerbitkan Kredensial NIB Digital. Saat mendaftar di EntreID, pengguna tidak perlu mengetik nomor NIB secara manual; cukup verifikasi dari dompet e.id untuk membuktikan status legalitas usaha mereka dalam satu detik.
- **Penerbitan Kredensial AHU (Administrasi Hukum Umum)**: Bagi UMKM berbentuk badan hukum (CV/PT), kredensial data pengesahan Kemenkumham (AHU) dapat ditarik langsung melalui e.id untuk validasi kepemilikan saham dan direksi yang sah.
- **Dampak bagi Ekosistem e.id**: e.id tidak hanya menjadi alat verifikasi identitas personal, melainkan berevolusi menjadi Infrastruktur Saraf Identitas Bisnis Nasional (National Business Identity Ledger). Hal ini akan mendorong ribuan institusi keuangan dan korporasi mengadopsi e.id sebagai pintu gerbang kepatuhan (compliance gate) mereka.

### 5.2 Dependensi Utama

- e.id Gateway & IDChain API (Kredensial Level 1, KYC Vida, Registry Meeting).
- Let's Encrypt SSL & IDCloudHost VPS infrastructure.
