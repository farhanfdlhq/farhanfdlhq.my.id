# Aturan kerja untuk farhanfdlhq.my.id

Website pribadi Farhan sebagai Software Engineer: proyek, CV, dan kontak, dalam bahasa Indonesia (`/`) dan Inggris (`/en/`). Desain lengkap ada di `docs/superpowers/specs/2026-11-09-farhanfdlhq-design.md`.

## Infrastruktur milik Farhan

Pakai yang sudah ada. Jangan menyarankan hosting atau layanan lain.

- **VPS + aaPanel 8**: 2 core, RAM 7,75 GB, Docker, dan Node v24 di `/www/server/nodejs/v24.13.0/bin`. Node bawaan terminal masih v20. Port yang sudah terpakai: 3100 (qiran.my.id) dan 3200 (bynana.my.id). Situs ini memakai 3300.
- **Cloudflare** (Free): DNS, proxy awan oranye, Origin Certificate, Full (strict), dan Rocket Loader mati.
- **indo.domains**: registrar. Nameserver diarahkan ke Cloudflare.
- Pola deploy mengikuti `docs/SETUP-DOMAIN-BARU.md` di repo `farhanfdlhq/qiran-blog`: Node Project + Proxy Project di aaPanel, lalu `scripts/deploy.sh` dengan rollback dan `scripts/backup.sh`.
- IP VPS tidak ditulis di repo ini karena repo ini publik.

## Alur kerja: superpowers

Skill di `.claude/skills/` (dari obra/superpowers, MIT). Muat `using-superpowers` di awal sesi.

- Desain: `brainstorming`, hasilnya di `docs/superpowers/specs/`
- Rencana: `writing-plans`, hasilnya di `docs/superpowers/plans/`
- Kerja: `executing-plans` atau `subagent-driven-development`, dengan `test-driven-development`
- Masalah: `systematic-debugging`
- Sebelum bilang selesai: `verification-before-completion`, lalu `requesting-code-review`

## Skill: style-ui x anti-slop

Kombinasi utama untuk semua UI dan teks.

- **anti-slop** (`.claude/skills/antislop*`) adalah filternya. Mode: **selama pengerjaan**, bukan setelah selesai. Selalu muat `antislop`, lalu skill yang sesuai tugasnya:
  - `antislop-ui` untuk tampilan
  - `antislop-layoutmobile` untuk layout HP dan responsif
  - `antislop-copywriting` untuk teks situs, ID dan EN
  - `antislop-human` untuk foto diri, testimoni, dan aksesibilitas
  - `antislop-code` untuk komentar kode
- **style-ui** ([style.ai.id](https://style.ai.id)) adalah sumber arah desain. anti-slop hanya membuang slop dan tidak menentukan arah, jadi arahnya ditulis di `DESIGN.md`, disusun dengan bantuan generator Design.md dari katalog style-ui.
- Gaya dan komponen mengikuti mockup di `docs/mockup/` dan `DESIGN.md`, lalu tetap disaring anti-slop. Animasi ringan dan menghormati `prefers-reduced-motion`.
- Kalau `DESIGN.md` meminta sesuatu yang dianggap slop oleh anti-slop, sebutkan elemen dan aturannya, lalu tanyakan ke Farhan. Jangan diam-diam mengikuti salah satunya.
- **codegraph** dipasang setelah ada kode, untuk menelusuri kode.
- **logo-generator** (`.claude/skills/logo-generator`, dari op7418/logo-generator-skill, MIT) untuk logo dan favicon. Dikerjakan setelah `DESIGN.md` ada, supaya logo mengikuti warna dan huruf situs, dan hasilnya tetap disaring anti-slop. Bagian SVG dan PNG jalan tanpa API key. Gambar showcase lewat Gemini (Nano Banana) butuh `GEMINI_API_KEY` dan sifatnya opsional. Key itu jangan pernah masuk repo atau chat.

## Desain

- Mobile dulu. Setiap layar dicek di lebar 390 px sebelum lebar lain.
- Isi halaman publik dirender di server dan tetap terbaca tanpa JavaScript.
- Jangan pakai tampilan bawaan browser untuk alert, confirm, upload file, checkbox, dan dropdown di panel admin. Pakai komponen bertema.
- Teks yang mungkin ingin diubah (ringkasan, peran, teks SEO) diisi dari admin, tidak ditulis langsung di kode.

## Kolom isian

- Label selalu terlihat. Placeholder hanya contoh.
- Pesan error tampil di bawah kolom yang salah, dengan `aria-describedby`.
- Atur `inputmode`, `autocomplete`, dan `enterkeyhint`. Ukuran huruf minimal 16 px.
- Validasi di server, dengan pesan dalam bahasa halaman.

## Teks

- Bahasa Indonesia sehari-hari dan bahasa Inggris yang wajar. Teks EN tidak diterjemahkan kata per kata.
- Tidak ada angka karangan. Klaim hasil proyek harus berasal dari Farhan.
- Hindari kata kosong (*solusi terbaik*, *seamless*, *passionate*) dan kalimat pasif tanpa pelaku.

## Teknis

- Next.js (App Router) + TypeScript + SQLite (better-sqlite3) + CSS biasa dengan token, three.js untuk adegan 3D, Node v24. Konfigurasi dari `.env.production`, dengan port 3300.
- Sebelum commit: `npm run typecheck`, `npm test` (Vitest), dan `npm run test:e2e` (Playwright).
- Kerja di branch `dev`. Jangan merge ke `main` tanpa diminta.
- Jangan menulis secret di repo, termasuk password tes. Buat acak saat tes jalan.
