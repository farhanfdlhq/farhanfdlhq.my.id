# Desain farhanfdlhq.my.id

Tanggal: 9 November 2026
Status: draf, menunggu persetujuan
Mockup: https://claude.ai/artifact/QVgQ1ovueJ5UPccyhtcnKN (versi 6, server di atas papan sirkuit)

## Untuk apa dan untuk siapa

farhanfdlhq.my.id adalah website pribadi Farhan Achmad Fadhillah (S.Kom), Software Engineer di Bogor. Isinya proyek yang pernah dibuat, CV, dan cara menghubungi. Situs ini menjadi tujuan link "My Portfolio" di CV.

Pembacanya ada tiga:

1. **Rekruter dan HR.** Membuka dari CV atau LinkedIn, biasanya sebentar. Mereka butuh peran, pengalaman, dan CV yang bisa diunduh dalam beberapa detik.
2. **Engineer atau tech lead yang menilai.** Membaca satu atau dua studi kasus dengan teliti, membuka repo, dan melihat cara berpikir di balik keputusan teknis.
3. **Calon klien freelance.** Ingin melihat hasil yang sudah live, lalu langsung menghubungi.

Situs tersedia dalam bahasa Indonesia dan Inggris.

## Tujuan

- Dari halaman mana pun, pembaca bisa mengunduh CV dan menemukan kontak dalam satu ketukan.
- Setiap proyek punya halaman studi kasus: konteks, peran Farhan, masalah, pendekatan, hasil, stack, tangkapan layar, link live, dan link repo kalau boleh dibuka.
- Farhan bisa menambah dan mengubah proyek, pengalaman, dan CV dari panel admin, termasuk dari HP, tanpa menyentuh kode.
- Halaman publik cepat dibuka dengan data seluler.
- Situsnya sendiri jadi contoh kerja: kode rapi, ada tes, ada catatan keamanan, dan ada skrip deploy di repo publik.

## Bukan tujuan

- Blog atau tulisan panjang. Bisa ditambah nanti.
- Banyak pengguna. Admin hanya satu.
- Komentar, newsletter, atau analitik pihak ketiga.

## Isi awal dari CV

Diambil dari `CV-ATS-Farhan-Achmad-Fadhillah.pdf` dan `FarhanAchmadf-CVOkt2026.pdf` (versi Oktober 2026). File CV tidak disimpan di repo. File diunggah lewat admin setelah situs jalan.

**Pengalaman**

| Peran | Tempat | Waktu |
| --- | --- | --- |
| Full-Stack Developer (Remote) | agendain.com | Mei 2026 – sekarang |
| Software Engineer, LMS e-Learning | BPKP Pusdiklat Bogor | Juli – Agustus 2026 |
| Freelance Software Engineer | | Agustus 2023 – sekarang |
| Software Engineer Intern | PT Teknologi Cipta Aplikasi Nusantara (TECANUSA), hybrid Bogor | Februari – Juni 2025 |
| Jr. Software Engineer | BPKP Pusdiklat Bogor | Mei – Juli 2024 |
| Barista | Headbar, Bekasi/Jakarta/Bogor | 2020 – 2023 |

**Pendidikan:** S1 Sistem Informasi, Universitas Binaniaga Indonesia, lulus 2026, IPK 3,69. Skripsi tentang K-Means untuk segmentasi peserta pelatihan pemerintah. Sebelumnya SMK Nusa Widya Mandiri, jurusan TKJ, lulus 2020.

**Sertifikasi:** Cisco CCNA Introduction to Networks, BuildWithAngga UI/UX & Full-Stack Development, CodingStudio Python & Data Structure.

**Proyek awal**

Empat proyek ini diisi sejak awal dan semuanya tampil sebagai unggulan di Beranda:

| Proyek | Catatan |
| --- | --- |
| Elenmor (Andiamo): jastip cross-border | Antarmuka dan frontend e-commerce dengan React, TypeScript, Vite, dan Tailwind, untuk mengelola batch pesanan internasional. |
| Agendain: website dan panel admin travel agency | CMS dwibahasa, booking yang mencegah overbooking, invoice dan itinerary PDF bertoken, RBAC, audit keamanan 7 temuan, SEO teknis, deploy VPS + CDN. Live. |
| qiran.my.id: blog dan pembuat PDF tugas | Next.js + SQLite, PDF A4 dua kolom, Daftar Pustaka APA 7. Live, repo publik. |
| bynana.my.id: halaman link affiliate | SvelteKit + SQLite, dua tema, Shopee Affiliate API. Live, repo publik. |

Proyek lain (LMS BPKP, Billing Hub, aplikasi mobile ISP, dan seterusnya) ditambahkan sendiri oleh Farhan lewat panel admin. Karena itu form proyek di admin harus cukup lengkap untuk menulis studi kasus tanpa bantuan.

## Halaman publik

Bahasa bawaan Indonesia di `/`, bahasa Inggris di `/en/`. Setiap halaman punya pasangan bahasanya, ditautkan dengan `hreflang` dan tombol ganti bahasa yang membuka halaman yang sama dalam bahasa lain.

| Halaman | Isi |
| --- | --- |
| Beranda | Hero berisi nama, peran, tombol Lihat proyek, Unduh CV, dan Email (tanpa kalimat pernyataan). Lalu proyek unggulan, Tentang, Pengalaman, Keahlian, dan Kontak dalam panel di atas adegan. |
| Proyek | Semua proyek terbit, bisa disaring per teknologi. Kartu berisi judul, satu kalimat ringkasan, gambar, dan tahun. |
| Detail proyek | Studi kasus lengkap, galeri tangkapan layar, link live dan repo, proyek sebelumnya dan berikutnya. |
| Tentang | Pengalaman, pendidikan, sertifikasi, keahlian per kelompok, dan tombol Unduh CV. |
| Kontak | Email, LinkedIn, dan GitHub. Nomor telepon tidak ditampilkan. |

Semua halaman punya judul dan deskripsi SEO per bahasa, gambar OG otomatis per proyek, data terstruktur `Person` (JSON-LD), `sitemap.xml`, dan `robots.txt`.

## Panel admin

Ada di `/admin`. Masuk dengan email dan password.

- **Proyek:** tambah, ubah, hapus, ubah urutan, tandai unggulan, simpan sebagai draf atau terbitkan. Setiap kolom teks punya isian ID dan EN. Kalau isian EN kosong, halaman `/en/` memakai teks ID dan admin diberi tanda.
- **Foto:** unggah dari HP. Server mengecilkan dan menyimpan ulang sebagai WebP, lalu membuang data EXIF.
- **Profil:** nama, peran, ringkasan, foto, email, dan link sosial. Tidak ada kolom nomor telepon.
- **Pengalaman, pendidikan, sertifikasi, keahlian:** daftar yang bisa diurutkan, per bahasa.
- **CV:** unggah PDF. Bisa lebih dari satu versi, misalnya versi ATS dan versi desain, atau versi ID dan EN.
- **Teks dan SEO:** teks yang mungkin ingin diubah tidak ditulis langsung di kode.

## Teknis

Polanya sama dengan qiran-blog, supaya skrip deploy, backup, login, dan upload foto bisa dipakai ulang.

| Bagian | Pilihan |
| --- | --- |
| Framework | Next.js (App Router), TypeScript |
| Database | SQLite (better-sqlite3), satu file di `DATA_DIR` |
| Gaya | Tailwind CSS. Komponen dari katalog style-ui (misalnya shadcn/ui) dipakai sesuai `DESIGN.md`. |
| Login | Password di-hash, sesi di cookie `HttpOnly` `Secure` `SameSite=Lax`, batas percobaan login per IP (IP asli dari `CF-Connecting-IP`) |
| Gambar | sharp, hasil WebP |
| Tes | Vitest untuk logika, Playwright untuk e2e |
| Node | v24 dari aaPanel |

Pengaturan di `.env.production`, tidak masuk Git:

```
SITE_URL=https://farhanfdlhq.my.id
DATA_DIR=/opt/farhanfdlhq/data
PORT=3300
```

## Infrastruktur dan deploy

Memakai yang sudah ada:

- **VPS** dengan aaPanel 8: 2 core, RAM 7,75 GB, Docker tersedia, dan Node v24 di `/www/server/nodejs/v24.13.0`. Di VPS yang sama sudah jalan qiran.my.id (port 3100) dan bynana.my.id (port 3200), jadi situs ini memakai port **3300**.
- **Cloudflare** (paket Free) untuk DNS, proxy, dan Origin Certificate, dengan mode Full (strict).
- **indo.domains** sebagai registrar `farhanfdlhq.my.id`. Nameserver diarahkan ke Cloudflare.

Langkahnya mengikuti `docs/SETUP-DOMAIN-BARU.md` di repo qiran-blog: kode di `/opt/farhanfdlhq`, Node Project aaPanel `farhanfdlhq` dengan user `www`, Proxy Project ke `127.0.0.1:3300`, header Nginx `X-Forwarded-Proto` di blok `location /`, `client_max_body_size`, IP asli dari Cloudflare, backup harian, dan update lewat `./scripts/deploy.sh` yang bisa kembali ke versi lama sendiri kalau gagal. Panduan lengkapnya ditulis ulang di repo ini sebagai `docs/DEPLOY-AAPANEL.md`.

IP VPS tidak ditulis di repo publik ini. Situs berada di belakang proxy Cloudflare, jadi IP asal sebaiknya tidak tersebar. Nilainya bisa dilihat di aaPanel → Home.

## Desain visual

Dikerjakan dengan kombinasi style-ui x anti-slop:

1. **Arah visual di `DESIGN.md`**, disusun dengan bantuan generator Design.md dari katalog style-ui (Design MD Generator dari Context, Design.dev AI Generator, Design MD, dan Vibe Prompts). Isinya warna, huruf, jarak, dan nada visual.
2. **Mockup** sebagai artifact, dicek di lebar 390 px dulu baru desktop, lalu disaring dengan `antislop-ui` dan `antislop-layoutmobile` sebelum ditunjukkan.
3. **Komponen** diambil dari katalog style-ui UI Components sesuai `DESIGN.md`. Animasi tetap ringan dan menghormati `prefers-reduced-motion`.

Arah visual terbaru ada di `DESIGN.md`: hanya mode gelap, dengan rak server di atas papan sirkuit (WebGL) di belakang seluruh halaman, dan isi halaman ditaruh di panel bergaya lembar spesifikasi.

## Keputusan

- Proyek awal: Elenmor (Andiamo), Agendain, qiran.my.id, dan bynana.my.id. Proyek lain diisi lewat admin.
- Bahasa bawaan: Indonesia.
- Kontak: email saja, ditambah LinkedIn dan GitHub. Nomor WhatsApp tidak tampil di situs.

## Pertanyaan terbuka

1. **Arah visual:** `DESIGN.md` dibuat sendiri lewat generator di style-ui, atau ditulis dari referensi situs yang Farhan suka?
2. **Peran di judul:** "Software Engineer" saja, atau "UI/UX | Software Engineer" seperti di CV?
3. **CV bahasa Inggris:** perlu versi EN untuk halaman `/en/`?
4. **Foto diri:** dipakai atau tidak?
5. **Link repo:** qiran dan bynana repo-nya publik. Apakah Andiamo dan Agendain punya repo yang boleh ditautkan, atau cukup link situs live saja?
