# Draf email ke support e.id

**Kepada:** support@corp.e.id
**Perihal:** Akses Sandbox & Onboarding Verifier — ParaKarsa/EntreID (.id Vibe Coding 2026)

> Isi bagian dalam kurung siku sebelum dikirim. **Jangan pernah menyertakan
> `client_secret`** di email — cukup `client_id`, karena itu memang pengenal publik.

---

Yth. Tim Support e.id,

Perkenalkan, saya [nama lengkap] dari tim **ParaKarsa / EntreID**, peserta **.id Vibe Coding 2026** yang diselenggarakan PANDI. Kami membangun gerbang SSO terdesentralisasi bagi pelaku UMKM di atas kredensial e.id, dan saat ini terhenti pada tiga hal yang hanya bisa dibuka dari sisi e.id.

## 1. Host sandbox menolak seluruh permintaan kami (HTTP 403)

Sejak [tanggal mulai], setiap permintaan ke `https://api-dev.e.id` dari server kami dijawab **403 Forbidden** oleh nginx/Cloudflare — termasuk halaman akarnya, bukan hanya endpoint OAuth. Karena akar host pun ditolak, kami menduga permintaan kami dihentikan di lapisan edge sebelum aplikasi e.id sempat membaca `client_id`, sehingga ini bukan persoalan kredensial atau salah endpoint di sisi kami.

Yang sudah kami periksa:

| Permintaan | Hasil |
|---|---|
| `GET https://api-dev.e.id/` | 403 (halaman nginx) |
| `GET https://api-dev.e.id/api/v1.1/oauth/client/{client_id}/{callback_url}` | 403 |
| `GET https://api-dev.e.id/api/v1.1/oauth/verify?client_id=…&callback_url=…` | 403 |
| `GET https://api-wallet.e.id/` | 404 — host produksi terjangkau |

Permintaan dengan maupun tanpa header `User-Agent` browser memberi hasil sama.

**Mohon bantuannya:** apakah akun kami sudah aktif di lingkungan sandbox, dan apakah `api-dev.e.id` membatasi akses berdasarkan alamat IP? Bila ya, mohon informasinya agar kami dapat mendaftarkan IP server kami.

## 2. Onboarding Verifier API (login QR)

Sesuai dokumentasi Verifier API, akses diberikan melalui tim support setelah proses onboarding. Implementasi kami sudah lengkap — permintaan token `client_credentials`, pembuatan sesi verifikasi, penanganan callback `claims` + `signature_proof`, dan pencatatan hash verifikasi — namun belum dapat dijalankan tanpa kredensial verifier.

**Yang kami butuhkan:**

- `client_id` dan `client_secret` untuk Verifier API
- Akses ke document schema identitas KYC Vida (kami merujuknya sebagai `schema-identity-kyc-vida`), atau nama schema yang benar bila berbeda
- Konfirmasi klaim yang tersedia untuk kami minta: `name`, `nik`, `phone_number`, `whatsapp_status`

Rencana penggunaan: verifikasi identitas pelaku UMKM satu kali saat pendaftaran. NIK tidak kami simpan utuh — hanya sidik jari kriptografisnya untuk mengenali akun yang sama, ditambah versi tersamar untuk ditampilkan.

## 3. Pendaftaran callback URL

Saat ini terdaftar: `[callback yang sekarang terdaftar, mis. http://localhost:4000/api/v1/callback/e-id]`

Setelah aplikasi kami tayang di VPS IDCloudHost dengan domain .id, callback akan berpindah ke:

```
https://[domain-anda].id/api/v1/callback/e-id
```

**Mohon bantuannya:** apakah pembaruan callback URL dapat kami lakukan sendiri lewat dashboard, atau perlu diajukan ke tim support? Bila boleh, kami ingin kedua URL terdaftar bersamaan selama masa pengembangan.

## Data teknis

| Item | Nilai |
|---|---|
| Nama aplikasi | ParaKarsa / EntreID |
| `client_id` OAuth SSO | `eid-3ywEHniLG5ddyy8Lw2kdwqK4v7ht` |
| Callback saat ini | `[isi]` |
| Domain produksi | `[isi]` |
| Waktu pengujian 403 | [tanggal], sekitar pukul [jam] WIB |
| Kontak teknis | [nama] · [email] · [WhatsApp] |

Karena kegiatan ini berlangsung dalam tenggat lomba, kami sangat berterima kasih atas respons secepat yang memungkinkan. Bila ada informasi tambahan yang dibutuhkan — log mentah, alamat IP server, atau demo singkat implementasi kami — dengan senang hati kami kirimkan.

Hormat kami,

[nama lengkap]
[peran] — Tim ParaKarsa / EntreID
[email] · [WhatsApp]
