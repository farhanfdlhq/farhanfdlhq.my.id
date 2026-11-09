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

## Dokumen

- [Deploy di aaPanel](docs/DEPLOY-AAPANEL.md): dari domain sampai situs online, plus update dan backup.
- [Audit keamanan](docs/AUDIT-KEAMANAN.md): risiko, penanganan, dan file kodenya.
- [DESIGN.md](DESIGN.md): arah desain.
- [Spesifikasi](docs/superpowers/specs/2026-11-09-farhanfdlhq-design.md) dan [rencana kerja](docs/superpowers/plans/2026-11-09-farhanfdlhq.md).
