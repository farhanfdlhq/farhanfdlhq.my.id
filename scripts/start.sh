#!/bin/sh
# Menjalankan aplikasi. Port diambil dari variabel PORT, lalu dari .env.production, lalu 3300.
# Next tidak membaca PORT dari file .env, dan skrip Node Project aaPanel tidak mengirim PORT.
# Hanya mendengar di 127.0.0.1: pengunjung harus lewat Nginx, jadi header IP tidak bisa dipalsukan langsung ke port aplikasi.
cd "$(dirname "$0")/.." || exit 1
if [ -z "$PORT" ] && [ -f .env.production ]; then
  PORT=$(sed -n 's/^PORT=\([0-9][0-9]*\).*/\1/p' .env.production | tail -n 1)
fi
exec node --max-old-space-size=192 node_modules/next/dist/bin/next start -H "${HOST:-127.0.0.1}" -p "${PORT:-3300}"
