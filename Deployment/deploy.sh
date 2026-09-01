#!/usr/bin/env bash
# Deploy ParaKarsa ke VPS IDCloudHost. Aman dijalankan berulang kali.
#
#   sudo -u parakarsa /srv/parakarsa/Deployment/deploy.sh
#
# Yang TIDAK disentuh skrip ini: berkas .env dan Development/api/data/
# (akun, consent, hash log verifikasi). Keduanya hidup lebih lama dari rilis.
set -euo pipefail

ROOT="${PARAKARSA_ROOT:-/srv/parakarsa}"
API="$ROOT/Development/api"
WEB="$ROOT/Development/app"

step() { printf '\n\033[1;32m==>\033[0m %s\n' "$1"; }

step "Menarik kode terbaru"
git -C "$ROOT" pull --ff-only

step "Memeriksa berkas env"
for env in "$API/.env" "$WEB/.env.production"; do
  [ -f "$env" ] || { echo "Berkas $env belum ada. Salin dari contoh di Deployment/." >&2; exit 1; }
done

step "Memeriksa rahasia produksi backend"
# Gagal lebih awal daripada membiarkan API menyala tanpa pepper NIK atau kunci
# induk: keduanya dibutuhkan di produksi, dan tanpa itu data tidak aman.
for key in NIK_PEPPER PARAKARSA_MASTER_KEY; do
  value="$(grep -E "^${key}=" "$API/.env" | head -n1 | cut -d= -f2-)"
  if [ -z "$(printf '%s' "$value" | tr -d '[:space:]')" ]; then
    echo "Rahasia ${key} kosong di ${API}/.env. Isi dulu (mis. openssl rand -hex 32)." >&2
    exit 1
  fi
done

step "Membangun backend"
npm --prefix "$API" ci
npm --prefix "$API" run build

step "Menjalankan tes backend sebelum rilis"
npm --prefix "$API" run test:e2e

step "Membangun frontend"
# NEXT_PUBLIC_* ditanam saat build, jadi .env.production harus sudah benar di sini.
npm --prefix "$WEB" ci
npm --prefix "$WEB" run build

step "Menyalakan ulang layanan"
sudo systemctl restart parakarsa-api parakarsa-web

step "Memastikan layanan sehat"
sleep 3
curl -fsS http://127.0.0.1:4000/api/v1/health >/dev/null && echo "API sehat"
curl -fsS -o /dev/null http://127.0.0.1:3000/ && echo "Web sehat"

step "Selesai"
