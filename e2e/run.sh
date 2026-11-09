#!/usr/bin/env bash
# Menjalankan uji e2e pada production build: folder data sementara, data seed, akun admin acak, server di port 3399.
# Jalankan setelah `npm run build`:  npm run test:e2e
set -euo pipefail
cd "$(dirname "$0")/.."
export DATA_DIR="$(mktemp -d)"
export ADMIN_EMAIL="e2e-$(openssl rand -hex 4)@contoh.id"
export ADMIN_PW="$(openssl rand -hex 12)"
npx tsx scripts/seed.ts >/dev/null
echo "$ADMIN_PW" | npx tsx scripts/user.ts add --email "$ADMIN_EMAIL" --name "Uji" >/dev/null
PORT=3399 SITE_URL=http://localhost:3399 node node_modules/next/dist/bin/next start -p 3399 > "$DATA_DIR/server.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null; rm -rf "$DATA_DIR"' EXIT
for _ in $(seq 1 60); do curl -sf -o /dev/null http://127.0.0.1:3399/ && break; sleep 0.5; done
BASE=http://127.0.0.1:3399 node e2e/flow.mjs
# Tangkapan layar panel admin di 390 px dan 1280 px, hanya kalau SHOTS_DIR diisi
if [ -n "${SHOTS_DIR:-}" ]; then BASE=http://127.0.0.1:3399 node e2e/admin-shots.mjs "$SHOTS_DIR"; fi
