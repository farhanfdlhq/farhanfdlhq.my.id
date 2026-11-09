# Audit keamanan

Daftar risiko yang sudah dipikirkan untuk farhanfdlhq.my.id, cara menanganinya, dan di file mana. Diperbarui setiap ada fitur yang menyentuh login, upload, atau data publik.

| Risiko | Penanganan | File |
| --- | --- | --- |
| Password bocor dari database | Password disimpan sebagai hash scrypt dengan salt acak per akun, minimal 10 karakter. | `lib/passwords.ts`, `lib/users.ts` |
| Cookie sesi dicuri lewat JavaScript atau dikirim lewat http | Cookie `fdq_session` memakai `HttpOnly`, `SameSite=Lax`, dan `Secure` di production. Berlaku 30 hari. | `lib/auth.ts` |
| Database sesi bocor | Yang disimpan hanya hash SHA-256 dari token sesi, jadi isi tabel `sessions` tidak bisa dipakai untuk masuk. Keluar menghapus barisnya. Ganti password (`npm run user -- reset`) mengeluarkan semua sesi. | `lib/sessions.ts`, `lib/users.ts` |
| Tebak password (brute force) | Dalam 15 menit: 5 kegagalan per IP, atau 20 per akun, membuat login ditolak. Batas per akun lebih longgar supaya orang lain tidak bisa mengunci pemilik akun hanya dengan mengetik email-nya. Percobaan dicatat sebelum password dicek, jadi permintaan serentak tidak lolos bersamaan. Ganti password membuka kunci akun. Pesan salah tidak membedakan email yang tidak terdaftar dengan password yang salah. | `app/actions/auth.ts`, `lib/users.ts` |
| IP pengunjung dipalsukan untuk lolos batas login | IP dibaca dari `X-Real-IP` yang diisi Nginx setelah `real_ip_header CF-Connecting-IP` (hanya dipercaya dari alamat Cloudflare). Aplikasi hanya mendengar di `127.0.0.1`, jadi header tidak bisa dikirim langsung ke port 3300. | `lib/ip.ts`, `scripts/start.sh`, `docs/DEPLOY-AAPANEL.md` langkah 4 |
| CSRF pada aksi admin | Semua perubahan lewat Server Actions (POST). Next menolak Server Action yang header `Origin`-nya tidak sama dengan host. Cookie `SameSite=Lax` tidak ikut pada POST dari situs lain. | `app/actions/*.ts` |
| Halaman atau aksi admin dibuka tanpa login | Setiap halaman admin memanggil `requireAdmin` sendiri. Pemeriksaan di layout saja tidak cukup, karena navigasi RSC bisa merender halaman tanpa layout-nya (ditemukan saat review, ada cek e2e-nya). Setiap Server Action juga memanggilnya. | `app/(id)/admin/(panel)/**/page.tsx`, `app/actions/*.ts`, `e2e/flow.mjs` |
| File berbahaya diunggah dengan nama `.jpg` | Jenis file dibaca dari isinya (magic bytes), bukan dari nama atau `Content-Type`. Hanya JPG, PNG, dan WebP yang diterima. Gambar selalu didekode ulang oleh sharp dan disimpan sebagai WebP baru, jadi isi aslinya tidak pernah disajikan. HEIC ditolak dengan petunjuk. Batas 12 MB. | `lib/uploads.ts` |
| CV palsu atau CV lama | File harus diawali `%PDF-`, batas 10 MB, disimpan dengan nama acak di luar folder publik dan hanya bisa diunduh lewat `/cv/<id>/` dengan `Content-Disposition: attachment`. Publik hanya bisa mengunduh CV utama; CV lain hanya untuk admin yang login. | `lib/cv.ts`, `app/(id)/cv/[id]/route.ts` |
| Lokasi rumah bocor dari foto | Metadata EXIF (termasuk GPS) dibuang saat konversi ke WebP. Gambar diputar dulu sesuai EXIF supaya tidak miring setelah metadatanya hilang. Ada tesnya. | `lib/uploads.ts`, `tests/uploads.test.ts` |
| Path traversal di `/uploads` dan `/cv` | Path di-`resolve` lalu harus tetap di dalam folder uploads atau cv. Hanya ekstensi gambar yang dikenal yang disajikan, dengan `X-Content-Type-Options: nosniff`. | `app/(id)/uploads/[...path]/route.ts`, `app/(id)/cv/[id]/route.ts` |
| XSS dari teks yang diisi lewat admin | Semua teks dirender React (otomatis di-escape). JSON-LD di-escape tanda `<` supaya teks profil tidak bisa menutup tag `<script>`. | `lib/seo.ts` |
| Skrip atau frame dari luar | CSP `default-src 'self'`, `frame-ancestors 'none'`, `form-action 'self'`, `object-src 'none'`. Font dan three.js dipasang lokal, tidak ada CDN. Catatan: `script-src` masih `'unsafe-inline'` karena Next menyisipkan skrip inline; menggantinya dengan nonce membuat semua halaman dinamis tanpa cache. | `next.config.ts` |
| Proyek draf terbuka publik | Halaman detail, gambar OG, sitemap, dan daftar proyek hanya membaca proyek berstatus `published`. Draf mendapat 404. Ada tes unit dan e2e. Halaman admin yang menampilkan draf juga diperiksa login di setiap halaman. | `lib/content.ts`, `app/og/[slug]/route.tsx`, `app/sitemap.ts` |
| Panel admin terindeks mesin pencari | `robots.txt` menutup `/admin/` dan `/cv/`, dan halaman admin memakai `noindex`. | `app/robots.ts`, `app/(id)/admin/(panel)/layout.tsx` |
| Secret masuk repo publik | `.env.production` dan folder `data/` ada di `.gitignore`. Password akun e2e dibuat acak setiap tes jalan. IP VPS, Private Key Cloudflare, dan API key tidak ditulis di repo. | `.gitignore`, `e2e/run.sh` |
| Nomor telepon tersebar | Tidak ada kolom telepon di database, admin, maupun JSON-LD. e2e memeriksa Beranda tidak memuat pola nomor telepon. | `lib/settings.ts`, `lib/seo.ts`, `e2e/flow.mjs` |
| Data hilang | Backup harian: database lewat SQLite online backup, plus `uploads/` dan `cv/`, disimpan 14 hari. Deploy membangun di folder terpisah dan kembali ke versi lama kalau situs tidak hidup. | `scripts/backup.sh`, `scripts/deploy.sh` |

## Yang belum ditangani

- Belum ada autentikasi dua langkah. Untuk satu admin dengan password panjang dan batas percobaan, risikonya dianggap kecil.
- Backup disimpan di VPS yang sama. Kalau VPS hilang, backup ikut hilang. Salin berkala ke tempat lain (misalnya unduh dari aaPanel **Files**).
