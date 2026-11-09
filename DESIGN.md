# DESIGN.md: farhanfdlhq.my.id

Arah visual untuk website pribadi Farhan. Dipakai bersama skill anti-slop: file ini menentukan arah, dan anti-slop menyaring hasilnya.

## Karakter

**Teknis dan presisi.** Kesannya mirip lembar spesifikasi yang rapi, bukan kostum "hacker". Rasa teknisnya datang dari isi yang nyata: tanggal, peran, stack, angka dari CV, dan tangkapan layar asli dengan domainnya. Efek visual tidak dipakai untuk membangun kesan itu.

Pilihan Farhan (9 November 2026): kesan teknis dan presisi, mode gelap sebagai bawaan, aksen biru tinta, nama ditampilkan sebelum proyek, huruf IBM Plex, gerak sedang dan terkoreografi (direvisi dari minimal), tanpa foto diri, dan judul peran "UI/UX | Software Engineer".

## Hero sinematik

Revisi 9 November 2026 setelah Farhan menunjukkan referensi style.ai.id: layar pertama dibuat sinematik, sedangkan bagian lainnya tetap tenang bergaya lembar spesifikasi.

- **Adegan:** jalur cahaya yang terhubung. Serat-serat biru tinta mengalir dari tepi layar, berputar, lalu bertemu di satu simpul terang. Adegan ini menggambarkan serat optik (proyek ISP), rute perjalanan (Agendain), dan data yang sampai ke production. Dibuat dengan WebGL (three.js) dalam kode sendiri, tanpa video atau gambar.
- **Judul:** kalimat pernyataan besar "Dari database sampai production." (EN: "From database to production."), IBM Plex Sans 700, `clamp(2.75rem, 12.5cqw, 6.25rem)`. Di bawahnya ada nama, peran, satu kalimat ringkasan, tombol "Lihat proyek", serta link Unduh CV dan Email.
- **Tata letak:** teks di kiri bawah. Simpul cahaya berada di kanan pada layar lebar dan di kanan atas pada HP. Lapisan gelap transparan di bawah teks menjaga kontras.
- **Warna hero:** tetap malam (`#05070C`) di mode gelap maupun terang. Glow, cahaya aditif, dan gradien transparan hanya boleh dipakai di hero.
- **Interaksi:** kamera bergeser sedikit mengikuti kursor dan scroll.
- **Kinerja:** jumlah serat 90 di HP dan 150 di desktop. Pixel ratio dibatasi 1,5 di HP. Animasi berhenti saat hero tidak terlihat atau tab disembunyikan. Kalau WebGL tidak tersedia, tampil gambar CSS diam dengan komposisi yang sama.
- **Kurangi gerak:** kalau perangkat meminta `prefers-reduced-motion`, adegan dirender satu bingkai diam saja.

## Yang tidak dipakai

- Terminal palsu, efek ketik, kursor berkedip, matrix, atau glow neon.
- Judul besar dengan huruf monospace, atau label huruf kapital dengan jarak huruf lebar (misalnya "PROJECTS", "ABOUT ME").
- Grid latar, noise, blob, gradien, dan glassmorphism di luar hero.
- Angka karangan ("10.000+ baris kode", "99% kepuasan"), bar persentase keahlian, atau bintang rating skill.
- Emoji di antarmuka, ikon dekoratif di setiap judul, dan tombol berbentuk pill di semua tempat.

## Warna

Mode gelap adalah bawaan. Mode terang tersedia lewat tombol, dan pilihan pengunjung diingat.

| Token | Gelap (bawaan) | Terang | Dipakai untuk |
| --- | --- | --- | --- |
| `--bg` | `#0F1115` | `#F6F6F3` | Latar halaman |
| `--surface` | `#161A20` | `#FFFFFF` | Kartu, bingkai tangkapan layar |
| `--line` | `#272D36` | `#D9DCE1` | Garis pemisah, tepi |
| `--text` | `#E7E9EC` | `#15181D` | Teks utama |
| `--muted` | `#9AA3AF` | `#58606C` | Teks pendukung, label |
| `--accent` | `#8EA9F2` | `#23408E` | Link, fokus, detail kecil |
| `--accent-fill` | `#2F4FA8` | `#23408E` | Latar tombol utama, teks putih di atasnya |

Biru tinta di mode terang adalah `#23408E`. Di latar gelap, warna itu terlalu gelap untuk dibaca, jadi dipakai versi yang lebih terang (`#8EA9F2`) untuk teks dan link. Tombol utama tetap memakai biru tinta pekat dengan teks putih di kedua mode.

Hanya ada satu warna aksen. Warna lain di halaman berasal dari tangkapan layar proyek. Semua pasangan teks dan latar dicek dengan `antislop-human/contrast-check.py` dan minimal memenuhi WCAG AA.

## Huruf

- **IBM Plex Sans** untuk semua teks dan judul (400, 500, 600). Alasannya: keluarga huruf ini dirancang untuk identitas perusahaan teknik, terbaca jelas di layar kecil, dan punya pasangan mono dari keluarga yang sama.
- **IBM Plex Mono** hanya untuk data kecil: tanggal, nama teknologi, domain di bingkai tangkapan layar, dan label kolom spesifikasi. Ukurannya selalu sama atau lebih kecil dari teks isi, dan tidak pernah dipakai untuk judul.
- Teks isi 16 px di HP dan 17 px di desktop, dengan tinggi baris 1,6. Judul nama: `clamp(2rem, 7vw, 3.25rem)`, berat 600, jarak huruf normal.
- Font di-host sendiri dalam format WOFF2, hanya subset Latin, dengan `font-display: swap`.

## Jarak dan grid

- Skala jarak 4 px: 4, 8, 12, 16, 24, 32, 48, 72.
- Di HP: margin samping 20 px dan satu kolom.
- Di desktop: lebar konten maksimal 1080 px dengan 12 kolom. Teks panjang dibatasi sekitar 68 karakter per baris.
- Radius 6 px untuk kartu dan bingkai, 4 px untuk tombol. Tidak ada elemen yang membulat penuh, kecuali indikator status.

## Komponen khas

**Lembar spesifikasi proyek.** Setiap proyek punya blok berisi pasangan label dan isi, misalnya:

```
Peran    Full-Stack Developer (remote)
Waktu    Mei 2026 – sekarang
Stack    Next.js · TypeScript · Prisma · MySQL
Status   ● Live  agendain.com ↗
```

Label memakai Plex Mono berwarna `--muted`, isinya memakai Plex Sans. Blok ini muncul di kartu proyek (versi ringkas) dan di halaman detail (versi lengkap).

**Bingkai tangkapan layar.** Bingkainya tipis memakai `--surface` dan `--line`, dengan satu baris atas berisi domain asli dalam Plex Mono (misalnya `qiran.my.id`). Tidak ada tiga titik warna ala macOS. Gambar selalu punya `width`, `height`, dan `alt` yang menjelaskan isinya.

**Tombol.** Tombol utama ("Unduh CV") memakai `--accent-fill` dengan teks putih. Tombol kedua ("Email") memakai garis `--line` dengan teks `--text`. Tinggi minimal 44 px.

**Link.** Memakai `--accent`, dengan garis bawah tipis yang menebal saat hover. Link ke luar situs diberi tanda ↗.

## Gerak

Sedang dan terkoreografi. Farhan meminta animasi yang bagus (9 November 2026, revisi dari "minimal"). Setiap gerakan punya tujuan yang ditulis di bawah ini. Tidak ada yang berputar terus, dan tidak semua elemen bergerak bersamaan. Referensinya dari katalog style-ui: Motion Primitives, Kinetics, dan Transitions.dev.

| # | Gerakan | Kapan | Tujuan |
| --- | --- | --- | --- |
| 0 | Serat cahaya mengalir ke simpul di hero (WebGL) | Terus-menerus selama hero terlihat, berhenti saat tidak terlihat | Satu momen utama yang menjadi identitas situs, sesuai permintaan Farhan |
| 1 | Kata-kata judul hero naik dari balik garis, lalu peran, ringkasan, dan tombol muncul berurutan (sekitar 900 ms) | Sekali saat Beranda dibuka | Mengarahkan mata dari judul ke nama, lalu ke tombol Lihat proyek |
| 2 | Tangkapan layar halaman penuh bergulir di dalam bingkai mengikuti scroll halaman | Saat kartu proyek dilewati | Pengunjung melihat seluruh situs proyek tanpa membukanya |
| 3 | Kartu proyek muncul pelan dan naik 16 px | Sekali saat pertama masuk layar | Memberi ritme saat membaca daftar proyek |
| 4 | Titik hijau "Live" berdenyut dua kali, lalu diam | Saat kartunya muncul | Menandai bahwa situsnya benar-benar online |
| 5 | Bingkai dan judul proyek berpindah mulus dari kartu ke halaman detail (View Transitions) | Saat membuka atau menutup detail proyek | Pembaca tetap tahu sedang membuka proyek yang mana |
| 6 | Penanda pilihan meluncur di tombol ID/EN dan Gelap/Terang (pola "pill glide") | Saat diklik | Menunjukkan pilihan yang aktif |
| 7 | Garis linimasa pengalaman tergambar mengikuti scroll, dan tiap baris menyala saat dilewati | Saat menggulir Pengalaman | Menunjukkan urutan waktu |
| 8 | Garis progres baca tipis berwarna biru tinta di atas halaman | Di halaman detail proyek | Menunjukkan sisa studi kasus yang belum dibaca |
| 9 | Panah ↗ bergeser 2 px dan tepi kartu berubah ke warna aksen | Hover dan fokus | Menandai elemen yang bisa diklik |

Aturan teknis:

- Utamakan CSS: `animation-timeline: view()` untuk gerakan 2, 3, dan 7, dan View Transitions API untuk gerakan 5. Library Motion (`motion/react`) hanya dipakai kalau CSS tidak cukup.
- Kalau browser tidak mendukung animasi berbasis scroll, semua elemen tampil diam dalam keadaan akhirnya. Halaman harus lengkap tanpa animasi.
- Yang dianimasikan hanya `transform`, `opacity`, `clip-path`, dan `object-position`. Tidak ada animasi yang menggeser layout.
- Semua gerakan, kecuali perubahan warna, mati kalau perangkat meminta `prefers-reduced-motion: reduce`.

## Nada teks

Ditulis dengan sudut pandang orang pertama ("Saya membangun...") dalam bahasa yang lugas. Kalimat menyebut hal nyata, tanpa kata sifat promosi. Contoh ringkasan Beranda, diambil dari CV:

> Saya membangun aplikasi web dari rancangan database sampai rilis di server: billing ISP, e-commerce lintas negara, LMS untuk instansi pemerintah, dan website travel agency. Sehari-hari memakai Laravel dan React/Next.js.

Teks bahasa Inggris ditulis ulang dengan wajar, tidak diterjemahkan kata per kata.

## Logo

Dibuat dengan skill `logo-generator` setelah mockup disetujui. Logo memakai warna dan huruf dari file ini, harus terbaca sebagai favicon 16 px, dan tidak memakai gradien.
