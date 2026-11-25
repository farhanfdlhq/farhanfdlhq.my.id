# farhanfdlhq.my.id

Situs pribadi Farhan Achmad Fadhillah sebagai Software Engineer: proyek, riwayat, CV, dan kontak. Bahasa Indonesia di `/`, bahasa Inggris di `/en/`. Di belakang halaman ada adegan meja kerja 3D (three.js) yang bergerak mengikuti scroll; isinya tetap terbaca tanpa JavaScript atau WebGL.

Isi situs (profil, proyek, gambar, riwayat, CV, teks SEO) diubah dari panel admin di `/admin/`.

Stack: Next.js (App Router), TypeScript, SQLite (better-sqlite3), CSS biasa, three.js, sharp. Butuh Node 22 atau lebih baru.

## Menjalankan di komputer sendiri

```bash
cp .env.example .env.local
```

Di `.env.local`, ganti `SITE_URL` dengan `http://localhost:3300` dan hapus baris `DATA_DIR` supaya data disimpan di `./data`.

```bash
npm ci
```

```bash
npm run seed
```

```bash
npm run user -- add --email nama@contoh.id --name "Nama"
```

```bash
npm run dev
```

Buka http://localhost:3300 untuk situs dan http://localhost:3300/admin/ untuk panel admin.

## Pemeriksaan

```bash
npm run typecheck && npm test && npm run build && npm run test:e2e
```

`test:e2e` memakai production build, folder data sementara, dan akun admin acak. Tambahkan `SHOTS_DIR=<folder>` untuk menyimpan tangkapan layar panel admin di lebar 390 dan 1280 px.

## Latihan coding

Soal latihan ada di `latihan/<level>-<urutan>-<id>/`, satu folder per soal:

- `soal.json`: id, level (1 sampai 7), urutan, `kind` (`function` atau `class`), nama fungsi atau kelas (`entry`), target kompleksitas, topik, teks ID dan EN (judul, cerita, dua petunjuk), dan test.
- `starter.js`: kode awal di editor.
- `solution.js`: solusi acuan.

Test fungsi berbentuk `{ "args": [...], "expected": ... }`. Test kelas berbentuk `{ "ops": [["new"], ["push", 1], ["pop"]], "expected": [null, null, 1] }`. Tandai `"example": true` untuk contoh di halaman soal dan `"hidden": true` untuk test tersembunyi. `"throws": true` berarti harus melempar error. Di test kelas, `{"throws": true}` di `expected` berarti operasi itu harus melempar error, dan `{"any": true}` berarti nilai kembaliannya tidak dinilai (dipakai untuk metode pengubah seperti `push` atau `insert`). Soal dengan beberapa jawaban benar perlu aturan di ceritanya supaya jawabannya tunggal.

`npm test` menolak soal yang solusinya tidak lulus semua test, kode awalnya justru lulus, atau teksnya belum lengkap. Teks soal bisa ditimpa, dan soal bisa disembunyikan, dari menu **Latihan** di admin. Urutan topik mengikuti [coding-interview-university](https://github.com/jwasham/coding-interview-university) (CC BY-SA 4.0).

## Dokumen

- [Deploy di aaPanel](docs/DEPLOY-AAPANEL.md): dari domain sampai situs online, plus update dan backup.
- [Audit keamanan](docs/AUDIT-KEAMANAN.md): risiko, penanganan, dan file kodenya.
- [DESIGN.md](DESIGN.md): arah desain.
- [Spesifikasi](docs/superpowers/specs/2026-11-09-farhanfdlhq-design.md) dan [rencana kerja](docs/superpowers/plans/2026-11-09-farhanfdlhq.md).
- Latihan coding: [spesifikasi](docs/superpowers/specs/2026-11-25-latihan-coding-design.md) dan [rencana kerja](docs/superpowers/plans/2026-11-25-latihan-coding.md).
