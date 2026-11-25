# Desain: Latihan coding berlevel

Tanggal: 2026-11-25. Status: draf untuk disetujui Farhan.

## Kenapa

Farhan ingin tetap terbiasa menulis kode dengan tangan di era AI. Fitur ini terutama untuk dirinya sendiri, tapi siapa pun boleh mencoba tanpa login. Urutan belajarnya mengikuti rencana belajar [coding-interview-university](https://github.com/jwasham/coding-interview-university) (John Washam, CC BY-SA 4.0).

Fakta tentang repo sumber: isinya rencana belajar (daftar topik, tautan video, checklist "implement X"), bukan bank soal. Soal, test, dan solusi ditulis sendiri untuk fitur ini. Dari repo itu yang dipakai hanya urutan topik dan ide checklist implementasinya.

## Tujuan

- Pengunjung membaca soal, menulis fungsi JavaScript di editor, menekan **Jalankan**, dan melihat hasil per test.
- Soal dikelompokkan dalam 7 level yang mengikuti urutan topik repo sumber.
- Progres dan draf kode tersimpan di browser pengunjung.
- Halaman ID di `/latihan/`, EN di `/en/practice/`.

## Bukan tujuan (tahap ini)

- Python. Ini tahap kedua, dengan Pyodide di runner yang sama. Desain runner tidak boleh menutup jalan ke sana, tapi tidak ada kode Python di tahap ini.
- Akun, login pengunjung, papan skor, statistik, dan menyimpan jawaban di server.
- Berbagi kode lewat tautan.
- Mengubah test atau solusi dari panel admin.

## Anti-tujuan (gagal walau "jalan")

- Kode pengunjung bisa menyentuh cookie, localStorage, sesi admin, atau API situs.
- Kode pengunjung dijalankan di server.
- CSP seluruh situs dilonggarkan demi fitur ini.
- Ada soal terbit yang test-nya salah, sehingga solusi yang benar dinyatakan gagal.
- Editor membantu menulis kode (autocomplete, saran). Tujuannya latihan manual.
- Pengunjung terhalang karena level terkunci.

## Batasan proyek yang berlaku

Dari `CLAUDE.md` dan `DESIGN.md`, antara lain:

- Mobile dulu (cek di 390 px).
- Isi publik dirender di server dan terbaca tanpa JavaScript.
- Komponen bertema di admin (tanpa alert, confirm, atau checkbox bawaan).
- Teks yang mungkin diubah diisi dari admin.
- Anti-slop untuk UI dan teks.
- `prefers-reduced-motion` dihormati.
- Area sentuh minimal 44 px.
- Tes: typecheck, Vitest, dan e2e sebelum commit.
- Kerja di `dev`.

## Pendekatan yang dipertimbangkan

| | Cara | Untung | Rugi |
|---|---|---|---|
| A | Web Worker di halaman soal, CSP `unsafe-eval` hanya untuk `/latihan/*` | Paling sederhana | Worker satu origin dengan situs. Kode yang ditempel bisa `fetch` ke API situs memakai cookie pengunjung, termasuk sesi admin Farhan. |
| **B (dipilih)** | Iframe `sandbox="allow-scripts"` (origin kosong) di rute runner kecil, worker di dalamnya | Kode tidak bisa membaca cookie, localStorage, atau API situs. CSP longgar hanya untuk satu rute. | Ada lapisan `postMessage` tambahan |
| C | Eksekusi di server (Docker) | Bisa bahasa apa saja | VPS dipakai bersama qiran.my.id dan bynana.my.id. Pengunjung tanpa login membuat risikonya tidak sebanding. Dicoret. |

Farhan memilih B karena paling aman dan minim risiko.

Pilihan lain yang sudah diputuskan bersama Farhan:

- Bahasa: JS dulu, Python tahap kedua.
- Level: **campuran**. Semua soal terbuka, ada saran "soal berikutnya", dan level berikutnya diberi label "disarankan setelah Level N".
- Penyimpanan soal: **campuran**.
  - Kode awal, test, dan solusi acuan ada di repo dan diuji otomatis.
  - Teks soal punya versi bawaan di repo, dan admin bisa menimpanya.

## Level dan soal

Sebanyak 7 level, 3 soal per level, total 21 soal pada peluncuran. Claude menulis drafnya, lalu Farhan memeriksa sebelum terbit.

| Level | Topik | Contoh soal (draf, bisa diganti) |
|---|---|---|
| 1. Dasar | array, string | balik string, dua angka berjumlah target, Vector buatan sendiri (`push`, `pop`, `at`, `insert`, `delete`, `find`, `resize` dari checklist repo) |
| 2. Struktur linear | linked list, stack, queue, hash table | kurung seimbang, Queue dari dua stack, LinkedList (`pushFront`, `popBack`, `reverse`, dan lain-lain) |
| 3. Mencari | binary search, bit | binary search, posisi sisip, hitung bit 1 |
| 4. Tree | BST, heap, traversal | BST insert/contains/min, traversal inorder, MinHeap |
| 5. Sorting | | insertion sort, merge sort, quick sort |
| 6. Graf | BFS, DFS | jarak terpendek tanpa bobot, deteksi siklus, topological sort |
| 7. Lanjutan | rekursi, DP, trie | permutasi, jalan di grid, Trie |

Big-O tidak menjadi soal tersendiri. Tiap soal punya baris "target" (misalnya `O(log n)`) sebagai informasi saja, tidak diukur.

## Bentuk satu soal di repo

Satu folder per soal, misalnya `latihan/2-kurung-seimbang/`. Isinya:

- `meta`: id stabil, level, urutan di level, topik, nama fungsi atau kelas, dan target kompleksitas.
- Teks bawaan ID dan EN: judul, cerita soal, 1 sampai 3 contoh, dan 2 petunjuk bertahap.
- `starter.js`: kode awal yang ditampilkan di editor.
- `solution.js`: solusi acuan, ditampilkan setelah lulus atau menyerah.
- Test, dalam dua bentuk:
  - **Fungsi**: daftar `{ args, expected }`.
  - **Struktur data**: daftar skenario, tiap skenario berupa urutan operasi `[metode, ...argumen]` dan hasil yang diharapkan dari tiap operasi. Contoh: `new Stack(); push 1; push 2; pop → 2; size → 1`.
- Perbandingan hasil memakai kesamaan dalam (deep equal) untuk nilai JSON. Urutan array dianggap penting, kecuali soal menandai `unordered`.
- **Satu jawaban benar per test (keputusan Claude).** Soal yang wajarnya punya banyak jawaban diberi aturan di teks soal supaya jawabannya tunggal. Contoh: topological sort "kalau ada beberapa pilihan, ambil simpul dengan nama terkecil dulu", dua angka berjumlah target "pasangan pertama dari kiri", dan jarak terpendek mengembalikan panjangnya, bukan jalurnya. Tidak ada checker JS per soal, supaya format test tetap JSON netral bahasa untuk tahap Python.
- Test boleh mengharapkan error dilempar (`throws: true`), misalnya `at()` di luar batas pada Vector.
- Sebagian test ditandai **tersembunyi**. Hasilnya hanya "lulus" atau "gagal", tanpa menampilkan input, supaya solusi tidak bisa ditulis dengan mencocokkan contoh. Untuk peluncuran, test yang tidak tersembunyi ada 2 sampai 4 per soal.

**Wajib di `npm test`:**

- Setiap `solution.js` lulus semua test soalnya, dijalankan dengan harness penilai yang sama dengan yang dipakai runner.
- Setiap `starter.js` gagal minimal satu test.
- Setiap id soal unik.
- Setiap soal punya teks ID dan EN yang tidak kosong.

Soal yang gagal pemeriksaan ini membuat build gagal.

Folder soal dibaca server saat build atau saat render. Test dan solusi tidak dikirim ke browser sebelum diperlukan:

- Test dikirim saat **Jalankan** ditekan.
- Solusi dikirim saat sudah lulus atau saat pengunjung memilih menyerah.

Ini hanya supaya tidak tergoda mengintip. Bukan pengamanan, karena tidak ada yang rahasia.

## Halaman publik

**Daftar** (`/latihan/`, `/en/practice/`):

- Pengantar singkat (teks dari admin).
- Tombol "Lanjut: [soal berikutnya]". Soal berikutnya adalah soal pertama yang belum lulus menurut urutan level, lalu urutan dalam level.
- 7 kelompok level. Tiap kelompok menampilkan judul topik, bilah progres (lulus dari total), dan daftar soal dengan status: belum, lulus, atau dilihat.
- Level setelah level pertama yang belum selesai diberi label "disarankan setelah Level N". Label ini tidak mengunci apa pun.
- Status dan progres dihitung di browser dari localStorage. Tanpa JavaScript, daftar tetap tampil lengkap tanpa status.

**Soal** (`/latihan/<slug>/`, `/en/practice/<slug>/`):

```
Level 2 · Stack                    ✓ lulus
Kurung seimbang
[cerita soal, contoh input/output, target O(n)]
┌ editor ───────────────────────┐
│ function isBalanced(s) {      │
└───────────────────────────────┘
[Jalankan]  [Reset]
✓ "()"        → true
✗ "(]"        → harap false, dapat true
✓ 6 test tersembunyi lulus
▸ Petunjuk 1   ▸ Petunjuk 2   ▸ Lihat solusi
← Sebelumnya      Berikutnya →
```

- Teks soal dirender di server.
- Tanpa JavaScript, editor diganti tampilan kode awal biasa, ditambah keterangan bahwa menjalankan kode butuh JavaScript.
- Slug soal sama untuk ID dan EN, supaya pengalih bahasa cukup mengganti awalan path.
- Pengalih bahasa ID/EN di header bekerja seperti halaman lain.
- **Reset** mengembalikan kode awal, dengan konfirmasi bertema.
- **Petunjuk** berupa `<details>` yang bisa dibuka kapan saja.
- **Solusi** terbuka otomatis setelah lulus. Sebelum lulus, tombol "Menyerah, lihat solusi" meminta konfirmasi bertema, lalu menandai soal sebagai **dilihat**. Status dilihat bisa naik menjadi lulus kalau kemudian lulus.
- Hasil test diumumkan ke pembaca layar lewat `aria-live="polite"`, berupa ringkasan seperti "5 dari 8 test lulus".
- `console.log` dari kode pengunjung ditampilkan di panel "Output". Panel ini dipotong per baris dan per total.
- Di 390 px semuanya bertumpuk satu kolom: soal, editor, tombol, hasil, petunjuk.
- SEO memakai `pageMetadata` dan hreflang seperti halaman lain. Daftar dan soal masuk sitemap. Gambar OG memakai pola `/og/` yang sudah ada.
- Menu "Latihan" / "Practice" ditambahkan di header.
- Footer halaman latihan memuat atribusi: "Urutan topik mengikuti coding-interview-university karya John Washam, CC BY-SA 4.0", dengan tautan ke repo dan lisensinya.

## Editor

- CodeMirror 6 dengan bahasa JavaScript.
- Yang aktif: penyorotan sintaks, nomor baris, indentasi otomatis, pasangan kurung, undo/redo, tema dari token `DESIGN.md`, dan ukuran huruf minimal 16 px.
- **Mati**: autocomplete, saran, lint, dan pengecekan ejaan di editor.
- Tab menambah indentasi. Escape lalu Tab keluar dari editor, mengikuti perilaku CodeMirror. Petunjuk ini ditulis di bawah editor.
- Dimuat hanya di halaman soal, secara lazy.
- Draf disimpan ke localStorage per soal, dengan debounce, dan dipulihkan saat soal dibuka lagi.

## Runner (keamanan)

Aturan ini diturunkan dari keputusan B dan dari pola celah di Claude-BugHunter (`hunt-dom`, `hunt-xss`, `hunt-clickjacking`).

**Rute runner** (misalnya `/latihan/runner/`):

- Halaman statis kecil dengan skrip runner dari situs sendiri.
- Header khusus rute ini:
  - `Content-Security-Policy: default-src 'none'; script-src 'self' 'unsafe-eval'; worker-src blob: 'self'; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'`
  - `X-Frame-Options` diganti `SAMEORIGIN` hanya untuk rute ini.
- Semua rute lain tetap memakai CSP dan `X-Frame-Options: DENY` yang sekarang.
- Rute ini tidak masuk sitemap dan diberi `noindex`.

**Iframe di halaman soal**:

- `sandbox="allow-scripts"` saja. Tanpa `allow-same-origin`, `allow-popups`, `allow-forms`, `allow-modals`, atau `allow-top-navigation`.
- Iframe disembunyikan dari tampilan dan pembaca layar.
- Origin-nya kosong (`"null"`), sehingga kode pengunjung:
  - tidak bisa membaca cookie atau localStorage situs;
  - tidak bisa mendaftarkan service worker;
  - tidak bisa mengakses DOM induk.
- Karena `connect-src 'none'`, kode pengunjung tidak bisa `fetch`, memakai XHR atau WebSocket, atau `importScripts` dari luar.

**Kode pengunjung dijalankan di Web Worker di dalam iframe**:

- Worker dibuat dari skrip runner.
- Kode digabung dengan harness penilai.
- Harness memanggil fungsi atau kelas sesuai test, menangkap hasil, exception, dan `console.log`, lalu mengirim ringkasan kembali.

**postMessage**:

- Halaman soal hanya memproses pesan jika `event.source === iframe.contentWindow`. Cek `origin` saja tidak cukup karena semua iframe sandbox ber-origin `"null"`.
- Runner hanya memproses pesan jika `event.source === window.parent`.
- Setiap pesan punya `type` dan nomor `runId`. Bentuknya divalidasi field per field. Pesan yang tidak cocok atau `runId` lama dibuang.
- Pesan dari halaman ke runner hanya berisi kode pengunjung dan test. Tidak pernah ada token, cookie, atau data sesi.

**Batas**:

- Batas waktu 2 detik per kali Jalankan, untuk semua test sekaligus. Kalau lewat, halaman soal menghapus iframe dan membuat yang baru. Hasilnya "waktu habis, mungkin ada loop tak berujung".
- Hasil dan output dari runner dianggap data tidak tepercaya:
  - Hanya dirender sebagai teks lewat React, tanpa `innerHTML` atau `dangerouslySetInnerHTML`.
  - Ukuran dibatasi, misalnya 200 baris log dan 2.000 karakter per nilai, dengan nilai yang lebih panjang dipotong.
- Kode tidak pernah dimuat dari URL (query atau hash).

**Browser yang tidak bisa (keputusan Claude)**: saat halaman soal dibuka, runner mencoba membuat worker blob kecil. Kalau gagal, tombol **Jalankan** dinonaktifkan dan muncul pesan bahwa browser ini belum bisa menjalankan kode dengan aman. Kode tidak pernah dijalankan di thread utama iframe sebagai cadangan, karena loop tak berujung di sana bisa membekukan seluruh tab. e2e berjalan di Chromium. Safari iOS dicek manual oleh Farhan di HP saat peninjauan.

**Rute runner disajikan sebagai berkas statis** (HTML + JS milik sendiri), bukan halaman Next, karena skrip inline Next akan diblokir CSP runner.

**Server**: tidak ada endpoint baru yang menerima kode atau jawaban pengunjung.

## Admin

- Menu baru "Latihan" di `AdminNav`, berisi daftar soal per level.
- Halaman edit per soal untuk menimpa judul, cerita, petunjuk 1, dan petunjuk 2 dalam ID dan EN, plus opsi **sembunyikan soal**.
  - Kolom kosong berarti teks bawaan dari repo yang dipakai.
  - Teks bawaan ditampilkan sebagai placeholder atau pratinjau supaya jelas apa yang ditimpa.
- Teks pengantar halaman daftar (ID dan EN) dan deskripsi SEO-nya diatur lewat `settings`, mengikuti pola `seo_projects_desc`.
- Penyimpanan baru di SQLite: tabel kecil untuk penimpaan teks per id soal, berisi kolom dwibahasa dan `hidden`, sebagai migrasi berikutnya di `lib/db.ts`.
- Semua halaman admin memanggil `requireAdmin(...)` sendiri, sama seperti halaman admin lain.
- Teks dari admin selalu dirender sebagai teks yang di-escape. Format yang diizinkan sama dengan teks proyek yang sudah ada (paragraf, dan kode `inline` kalau Prose sudah mendukungnya).
- Soal yang disembunyikan tidak tampil di daftar, sitemap, atau "soal berikutnya". URL-nya mengembalikan 404.

## Penyimpanan di browser

- Kunci localStorage diberi awalan, misalnya `fdq.latihan.v1`.
- Isinya per id soal: status (`lulus`/`dilihat`), waktu lulus, dan draf kode.
- Semua baca/tulis dibungkus try/catch. Kalau storage tidak tersedia (mode privat atau diblokir), fitur tetap jalan tanpa menyimpan.
- Data rusak atau versi lain dianggap kosong.
- Tidak ada yang dikirim ke server.

## Tahap kedua (catatan saja)

- Python lewat Pyodide di runner yang sama. CSP runner nanti perlu `wasm-unsafe-eval`, dan berkas Pyodide di-host sendiri.
- Format test sengaja netral bahasa (JSON) supaya bisa dipakai ulang.

## Yang diserahkan ke pembangun

- Nama berkas dan format persis meta/teks soal (TS, JSON, atau Markdown dengan frontmatter).
- Struktur komponen.
- Cara memuat CodeMirror.
- Detail tampilan dalam batas `DESIGN.md` dan mockup.
- Isi 21 soal, dengan Farhan memeriksa sebelum terbit.
