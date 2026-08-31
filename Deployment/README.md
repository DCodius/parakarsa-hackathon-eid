# Deployment ParaKarsa / EntreID

Dari VPS IDCloudHost kosong sampai callback e.id berjalan di HTTPS. Sekitar 30–45
menit, sebagian besar menunggu DNS menyebar.

Susunannya: **satu domain, dua proses.** nginx memegang TLS dan membagi lalu
lintas — `/` ke Next.js (port 3000), `/api/` ke NestJS (port 4000). Karena web dan
API berbagi origin, cookie sesi jadi same-origin dan tidak ada CORS sama sekali.

| Berkas | Isi |
|---|---|
| `nginx/parakarsa.conf` | Server block: TLS, proxy, header keamanan, cache statis |
| `systemd/parakarsa-api.service` | Layanan backend |
| `systemd/parakarsa-web.service` | Layanan frontend |
| `deploy.sh` | Rilis ulang: tarik, build, tes, restart, cek sehat |
| `api.env.example` · `web.env.example` | Contoh konfigurasi produksi |

Ganti `parakarsa.id` di seluruh langkah dengan domain .id Anda.

---

## 1. DNS lebih dulu

Arahkan domain ke IP VPS **sebelum** apa pun, karena Let's Encrypt memverifikasi
lewat DNS yang sudah menyebar.

```
A     parakarsa.id       <IP-VPS>
A     www.parakarsa.id   <IP-VPS>
```

Cek dengan `dig +short parakarsa.id`. Tunggu sampai keluar IP yang benar.

## 2. Paket dasar dan pengguna layanan

```bash
sudo apt update && sudo apt install -y nginx git curl ufw
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo useradd --system --create-home --home-dir /srv/parakarsa --shell /usr/sbin/nologin parakarsa
```

Node 22 atau lebih baru itu wajib, bukan preferensi: database memakai modul
`node:sqlite` bawaan yang belum ada di versi lama.

## 3. Firewall

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw --force enable
```

Port 3000 dan 4000 sengaja tidak dibuka — keduanya hanya mendengarkan localhost.

## 4. Ambil kode

```bash
sudo -u parakarsa git clone <url-repo> /srv/parakarsa
```

## 5. Isi konfigurasi

```bash
sudo -u parakarsa cp /srv/parakarsa/Deployment/api.env.example /srv/parakarsa/Development/api/.env
sudo -u parakarsa cp /srv/parakarsa/Deployment/web.env.example /srv/parakarsa/Development/app/.env.production
sudo -u parakarsa openssl rand -hex 32   # tempel hasilnya sebagai NIK_PEPPER
```

Lalu sunting `Development/api/.env`. Tiga hal yang paling sering bikin gagal:

- `EID_CALLBACK_URL` harus **sama persis** dengan yang terdaftar di dashboard
  e.id, termasuk `https://` dan tanpa garis miring tambahan.
- `NIK_PEPPER` jangan pernah diganti setelah ada akun — mengganti pepper membuat
  seluruh akun lama tidak dikenali lagi.
- Biarkan `EID_VERIFIER_*` kosong bila kredensial verifier belum diberikan
  support e.id. Aplikasi tetap jalan, alur QR berlabel Simulation Mode.

## 6. Sertifikat SSL

nginx harus hidup dulu supaya Certbot bisa menaruh berkas tantangan.

```bash
sudo mkdir -p /var/www/certbot
sudo cp /srv/parakarsa/Deployment/nginx/parakarsa.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/parakarsa.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Baris `ssl_certificate` menunjuk berkas yang belum ada, jadi komentari dulu blok
`server` HTTPS-nya, jalankan `sudo nginx -t && sudo systemctl reload nginx`,
terbitkan sertifikat, lalu buka kembali komentarnya:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --webroot -w /var/www/certbot -d parakarsa.id -d www.parakarsa.id
sudo nginx -t && sudo systemctl reload nginx
```

Perpanjangan otomatis sudah dipasang paket certbot; pastikan dengan
`systemctl list-timers | grep certbot`.

## 7. Pasang layanan

```bash
sudo cp /srv/parakarsa/Deployment/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now parakarsa-api parakarsa-web
```

## 8. Rilis pertama

```bash
sudo -u parakarsa /srv/parakarsa/Deployment/deploy.sh
```

Skrip menolak lanjut kalau tes backend gagal, dan tidak pernah menyentuh `.env`
maupun `Development/api/data/` yang berisi akun serta hash log verifikasi.

## 9. Periksa

```bash
curl -fsS https://parakarsa.id/api/v1/health     # {"status":"ok",...}
curl -sI https://parakarsa.id | head -1          # HTTP/2 200
```

Lalu buka `https://parakarsa.id/login`. Callback e.id sekarang punya alamat HTTPS
tetap: `https://parakarsa.id/api/v1/callback/e-id`. Daftarkan alamat itu di
dashboard e.id untuk OAuth SSO maupun Verifier.

## 10. Perawatan

```bash
sudo journalctl -u parakarsa-api -f          # log backend
sudo journalctl -u parakarsa-web -f          # log frontend
sudo -u parakarsa /srv/parakarsa/Deployment/deploy.sh   # rilis berikutnya
```

Cadangkan satu berkas saja — di situlah seluruh data berada:

```bash
sudo -u parakarsa sqlite3 /srv/parakarsa/Development/api/data/parakarsa.db \
  ".backup '/srv/parakarsa/backup-$(date +%F).db'"
```

---

## Kalau macet

| Gejala | Sebab yang paling sering |
|---|---|
| e.id menolak dengan "callback mismatch" | `EID_CALLBACK_URL` beda dari yang terdaftar, biasanya garis miring atau `www.` |
| Login berhasil tapi langsung keluar lagi | Cookie terbit tanpa `Secure`. Pastikan nginx mengirim `X-Forwarded-Proto` |
| `502 Bad Gateway` | Prosesnya mati: `systemctl status parakarsa-api` |
| Callback e.id tidak pernah sampai | Firewall menutup 443, atau DNS belum menyebar |
| Perubahan `NEXT_PUBLIC_*` tidak terasa | Nilainya ditanam saat build — jalankan `deploy.sh` lagi |
