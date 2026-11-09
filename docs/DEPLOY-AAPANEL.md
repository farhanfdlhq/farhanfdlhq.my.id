# Deploy farhanfdlhq.my.id di aaPanel

Alurnya sama dengan qiran.my.id dan bynana.my.id (`docs/SETUP-DOMAIN-BARU.md` di repo qiran-blog), diisi untuk situs ini.

| Isian | Nilai |
| --- | --- |
| Domain | `farhanfdlhq.my.id` |
| Folder kode | `/opt/farhanfdlhq` |
| Folder data | `/opt/farhanfdlhq/data` (database, gambar, CV) |
| Project aaPanel | `farhanfdlhq` |
| Port | `3300` (3100 dipakai qiran, 3200 dipakai bynana) |
| Folder backup | `/www/backup/farhanfdlhq` |

IP VPS sengaja tidak ditulis di sini karena repo ini publik. Lihat di aaPanel → Home.

Semua perintah dijalankan di **Terminal aaPanel** sebagai root.

---

## 1. Domain dan Cloudflare

Bagian ini sudah dikerjakan sebelum kode selesai. Dicatat di sini supaya urutannya lengkap.

1. Cloudflare: **Domains → Onboard a domain** → `farhanfdlhq.my.id` → paket **Free**.
2. indo.domains: **farhanfdlhq.my.id → Kelola → Nameserver**, isi dua nameserver dari Cloudflare.
3. Cloudflare → **DNS → Records**:

| Type | Name | Isi | Proxy status |
| --- | --- | --- | --- |
| `A` | `@` | IP VPS | **DNS only** (abu-abu) dulu |
| `CNAME` | `www` | `farhanfdlhq.my.id` | **DNS only** dulu |

Biarkan abu-abu sampai SSL di aaPanel terpasang (langkah 4).

Cek nameserver sudah pindah:

```bash
dig +short NS farhanfdlhq.my.id @8.8.8.8
```

## 2. Kode dan aplikasi di VPS

Pastikan port 3300 masih kosong. Kalau perintah ini tidak menampilkan apa-apa, port aman dipakai:

```bash
ss -ltnp | grep ":3300 "
```

Ambil kode. Selama versi terbaru masih di branch `dev`, ganti `main` dengan `dev`:

```bash
git clone -b main https://github.com/farhanfdlhq/farhanfdlhq.my.id.git /opt/farhanfdlhq
```

Pakai Node v24 (ulangi setiap membuka terminal baru, karena Node bawaan terminal masih v20):

```bash
export PATH=/www/server/nodejs/v24.13.0/bin:$PATH && node -v
```

Isi konfigurasi:

```bash
cd /opt/farhanfdlhq && cp -n .env.example .env.production && nano .env.production
```

Isinya:

```
SITE_URL=https://farhanfdlhq.my.id
DATA_DIR=/opt/farhanfdlhq/data
PORT=3300
```

Simpan dengan Ctrl+O, Enter, lalu keluar dengan Ctrl+X.

Pasang paket dan build. Tidak boleh ada peringatan `EBADENGINE`; kalau ada, Node yang dipakai masih v20.

```bash
cd /opt/farhanfdlhq && npm ci && npm run build
```

Folder data harus bisa ditulis user `www`:

```bash
mkdir -p /opt/farhanfdlhq/data && chown -R www:www /opt/farhanfdlhq/data /opt/farhanfdlhq/.next
```

## 3. Akun admin dan isi awal

Isi awal: profil, riwayat, dan empat proyek (Agendain, qiran, bynana, Elenmor) beserta gambar hero-nya. Aman dijalankan ulang, isi yang sudah ada tidak ditimpa.

```bash
cd /opt/farhanfdlhq && npm run seed
```

Akun admin. Password diketik tanpa tampil di layar, minimal 10 karakter:

```bash
cd /opt/farhanfdlhq && npm run user -- add --email fadilahfarhan80@gmail.com --name "Farhan"
```

Lupa password nanti:

```bash
cd /opt/farhanfdlhq && npm run user -- reset --email fadilahfarhan80@gmail.com
```

Karena kedua perintah di atas dijalankan sebagai root, rapikan lagi pemilik folder data:

```bash
chown -R www:www /opt/farhanfdlhq/data
```

## 4. Node Project, Proxy Project, dan SSL

**Node Project:** **Website → Node.js Project → Add Project**

| Kolom | Isi |
| --- | --- |
| Project directory | `/opt/farhanfdlhq` |
| Project name | `farhanfdlhq` |
| Run options / command | `npm run start` |
| Port | `3300` |
| Node version | v24 |
| Run user | `www` |

Domain tidak diisi di sini. Cek aplikasinya sudah jalan:

```bash
curl -s http://127.0.0.1:3300/ | grep -o "<title>[^<]*"
```

**Proxy Project:** **Website → Proxy Project → Add**

- Domain: `farhanfdlhq.my.id` dan `www.farhanfdlhq.my.id`
- Target: `http://127.0.0.1:3300`

**Origin Certificate:** Cloudflare → `farhanfdlhq.my.id` → **SSL/TLS → Origin Server → Create Certificate**, RSA (2048), hostnames `farhanfdlhq.my.id` dan `*.farhanfdlhq.my.id`, berlaku 15 tahun. Private Key hanya tampil sekali dan jangan dikirim ke chat atau di-screenshot tanpa di-blur.

Di aaPanel, daftar Proxy Project → kolom SSL baris `farhanfdlhq.my.id` → **Not Set** → **Current certificate / Other certificate**: Private Key ke kotak **Key**, Origin Certificate ke kotak **Certificate (PEM)**. **Save**, lalu nyalakan **Force HTTPS**.

**IP pengunjung asli dari Cloudflare.** Batas percobaan login dihitung per IP. Tanpa langkah ini, semua pengunjung terlihat memakai IP Cloudflare. Buat file daftar IP Cloudflare sekali per VPS:

```bash
{ for ip in $(curl -s https://www.cloudflare.com/ips-v4) $(curl -s https://www.cloudflare.com/ips-v6); do echo "set_real_ip_from $ip;"; done; echo "real_ip_header CF-Connecting-IP;"; } > /www/server/nginx/conf/cloudflare-real-ip.conf
```

Cek isinya (harus ada belasan baris `set_real_ip_from` dan satu `real_ip_header`):

```bash
cat /www/server/nginx/conf/cloudflare-real-ip.conf
```

**Tambahan config Nginx.** Di aaPanel 8 Main Configuration File terkunci, jadi ditulis di Proxy Project → **Modify → Config → Customized Configuration Files**:

1. Blok **server**:
   ```nginx
   client_max_body_size 20m;
   include /www/server/nginx/conf/cloudflare-real-ip.conf;
   ```
2. Blok **location /** (di blok server baris ini diabaikan):
   ```nginx
   proxy_set_header X-Forwarded-Proto $scheme;
   ```

Cek:

```bash
nginx -t && grep -rn "Forwarded-Proto\|client_max_body_size\|cloudflare-real-ip" /www/server/panel/vhost/nginx/ | grep -i farhanfdlhq
```

Hasil yang benar: `test is successful` dan tiga baris grep. Peringatan `protocol options redefined` aman diabaikan.

## 5. Nyalakan Cloudflare

Cloudflare → `farhanfdlhq.my.id`:

1. **SSL/TLS → Overview → Configure**: **Full (strict)**. Jangan Flexible.
2. **DNS → Records**: `@` dan `www` jadi **Proxied** (awan oranye). Origin Certificate hanya dipercaya Cloudflare, jadi awan oranye wajib.
3. **SSL/TLS → Edge Certificates**: nyalakan **Always Use HTTPS**.
4. **Speed → Optimization**: **Rocket Loader** mati. Rocket Loader menunda skrip dan bisa merusak adegan 3D dan panel admin.

Cek dari terminal:

```bash
curl -sI https://farhanfdlhq.my.id/ | grep -iE "^HTTP|server|cf-ray"
```

Hasil yang benar: `HTTP/2 200`, `server: cloudflare`, dan ada `cf-ray`. Lalu buka `https://farhanfdlhq.my.id/admin/` dan masuk.

Cek IP asli sudah terbaca: buka situs dari HP, lalu lihat baris terakhir log akses. Yang tampil harus IP HP, bukan IP Cloudflare (`104.x`, `172.64.x` sampai `172.71.x`, `162.158.x`, dan sejenisnya):

```bash
tail -n 3 /www/wwwlogs/farhanfdlhq.my.id.log
```

## 6. Perawatan

**Update aplikasi.** Ambil kode terbaru, build di folder terpisah sementara situs lama tetap jalan, restart, lalu kembali otomatis ke versi sebelumnya kalau situs tidak hidup:

```bash
cd /opt/farhanfdlhq && ./scripts/deploy.sh
```

**Backup harian.** Database disalin dengan SQLite backup (aman walau aplikasi jalan), ditambah folder `uploads/` dan `cv/`. Disimpan 14 hari. Daftarkan di aaPanel **Cron → Add Cron Job → Shell Script**, jadwal harian:

```bash
export PATH=/www/server/nodejs/v24.13.0/bin:$PATH && cd /opt/farhanfdlhq && BACKUP_DIR=/www/backup/farhanfdlhq ./scripts/backup.sh
```

Isi satu backup: `fdq.sqlite` dan `files.tar.gz` (berisi `uploads/` dan `cv/`).

---

## Kalau ada masalah

| Gejala | Penyebab dan solusi |
| --- | --- |
| *Too many redirects* | SSL Cloudflare masih Flexible (ganti ke Full strict), atau `X-Forwarded-Proto` belum ada di blok location. |
| Error 526 | Origin Certificate belum terpasang, atau Key dan Certificate tertukar. |
| 502 Bad Gateway | Node Project belum jalan atau port bukan 3300. Lihat log project di aaPanel. |
| Login kembali ke halaman masuk | Buka lewat `https://farhanfdlhq.my.id`, bukan IP atau http. Cookie login hanya dikirim lewat https. |
| "Terlalu banyak percobaan" padahal baru sekali salah | IP asli belum terbaca, semua orang dihitung sebagai IP Cloudflare. Ulangi bagian IP pengunjung di langkah 4. |
| Upload gambar atau CV gagal | `client_max_body_size 20m` belum ada, atau folder data belum di-`chown` ke `www`. |
| Adegan 3D tidak muncul, isi tetap terbaca | Rocket Loader masih menyala, atau browser pengunjung mematikan WebGL. Isi situs memang dibuat tetap terbaca tanpa 3D. |
| `EBADENGINE` saat `npm ci` | Node masih v20. Jalankan `export PATH=...v24...`, lalu `rm -rf node_modules && npm ci`. |
| `SQLITE_READONLY` di log | Folder data milik root. Jalankan `chown -R www:www /opt/farhanfdlhq/data`. |
