#!/usr/bin/env bash
# Backup database SQLite, gambar, dan file CV. Disimpan 14 hari.
#   BACKUP_DIR=/www/backup/farhanfdlhq ./scripts/backup.sh
set -euo pipefail
cd "$(dirname "$0")/.."
# Ambil DATA_DIR dari .env.production kalau belum diisi
if [ -z "${DATA_DIR:-}" ] && [ -f .env.production ]; then
  DATA_DIR="$(sed -n 's/^DATA_DIR=//p' .env.production | tail -n 1)"
fi
DATA_DIR="${DATA_DIR:?Isi DATA_DIR, contoh: DATA_DIR=/opt/farhanfdlhq/data}"
BACKUP_DIR="${BACKUP_DIR:-/www/backup/farhanfdlhq}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="$BACKUP_DIR/farhanfdlhq-$STAMP"
umask 077
mkdir -p "$TARGET"
# Salinan database yang konsisten walau aplikasi sedang berjalan (SQLite online backup, bukan salin file mentah)
node -e "const D=require('better-sqlite3');const db=new D(process.argv[1],{readonly:true,fileMustExist:true});db.backup(process.argv[2]).then(()=>db.close())" "$DATA_DIR/fdq.sqlite" "$TARGET/fdq.sqlite"
# Folder yang belum ada (misalnya belum pernah upload CV) tetap ikut sebagai folder kosong
mkdir -p "$DATA_DIR/uploads" "$DATA_DIR/cv"
tar -czf "$TARGET/files.tar.gz" -C "$DATA_DIR" uploads cv
find "$BACKUP_DIR" -maxdepth 1 -type d -name 'farhanfdlhq-*' -mtime +"$KEEP_DAYS" -exec rm -rf {} +
du -sh "$TARGET"
echo "Backup tersimpan di $TARGET"
