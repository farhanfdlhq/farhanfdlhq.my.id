# DESIGN.md: farhanfdlhq.my.id

Arah visual untuk website pribadi Farhan. Dipakai bersama skill anti-slop: file ini menentukan arah, dan anti-slop menyaring hasilnya.

## Karakter

**Teknis dan presisi.** Kesannya mirip lembar spesifikasi yang rapi, bukan kostum "hacker". Rasa teknisnya datang dari isi yang nyata: tanggal, peran, stack, angka dari CV, dan tangkapan layar asli dengan domainnya. Efek visual tidak dipakai untuk membangun kesan itu.

Pilihan Farhan (9 November 2026): kesan teknis dan presisi, hanya mode gelap, aksen biru tinta, nama ditampilkan sebelum proyek, huruf IBM Plex, gerak sedang dan terkoreografi (direvisi dari minimal), tanpa foto diri, dan judul peran "UI/UX | Software Engineer".

## Latar sinematik: jaringan server

Revisi 9 November 2026. Farhan meminta kesan yang "IT banget" (server dengan jaringan yang berjalan) di seluruh halaman, dan hanya mode gelap.

- **Adegan:** ruang server 3D (WebGL, three.js, dibuat sendiri) di belakang seluruh halaman, menempel di layar (`position: sticky`). Ada lantai raised floor, deretan rak dengan lampu status yang berkedip, kabel jaringan, dan paket data yang berjalan di antara rak.
- **Topologi:**
  - Empat rak proyek berlabel `agendain.com`, `qiran.my.id`, `bynana.my.id`, dan `andiamo`, terhubung ke `core-switch`.
  - Dari `core-switch` ada kabel ke rak data (`mysql-01`, `sqlite-02`, `backup`) dan ke `cdn-edge`, yang lalu naik ke internet.
  - Proyek Farhan menjadi host di jaringan ini.
- **Kamera mengikuti scroll:**

  | Bagian | Yang terlihat |
  | --- | --- |
  | Hero | Seluruh jaringan |
  | Proyek | Rak-rak proyek |
  | Pengalaman | `core-switch` |
  | Keahlian | Rak data |
  | Kontak | `cdn-edge` dan sinar ke internet |
  | Detail proyek | Rak proyek itu sendiri |

  Kamera juga bergeser sedikit mengikuti kursor.
- **Sorotan:** rak proyek menyala dan paketnya mengalir lebih cepat saat kartu proyeknya di-hover atau sedang dibaca.
- **Isi halaman:** setiap bagian berada di panel gelap transparan (`rgba(8, 11, 18, .82)` dengan blur), dengan jarak antarpanel 34svh supaya adegan terlihat di sela-selanya. Hero tidak memakai panel. Teksnya berada di kiri bawah dengan lapisan gelap transparan di bawahnya.
- **Judul hero:** "Dari database sampai production." (EN: "From database to production."), IBM Plex Sans 700.
- **Kinerja:**
  - HP: 9 rak latar per baris dan pixel ratio maksimal 1,5. Desktop: 13 rak latar per baris.
  - Animasi berhenti saat tab disembunyikan.
  - Tanpa WebGL, latar memakai gradien CSS diam.
- **Kurangi gerak:** kalau perangkat meminta `prefers-reduced-motion`, lampu dan paket diam, dan adegan hanya digambar ulang saat scroll dengan kamera langsung melompat.
- Glow, cahaya aditif, panel transparan, dan blur hanya dipakai untuk adegan ini dan panel isinya.

## Yang tidak dipakai

- Terminal palsu, efek ketik, kursor berkedip, matrix, atau glow neon.
- Judul besar dengan huruf monospace, atau label huruf kapital dengan jarak huruf lebar (misalnya "PROJECTS", "ABOUT ME").
- Grid hiasan, noise, blob, dan gradien di luar adegan jaringan. Lantai raised floor di adegan adalah bagian dari ruang server, bukan hiasan.
- Angka karangan ("10.000+ baris kode", "99% kepuasan"), bar persentase keahlian, atau bintang rating skill.
- Emoji di antarmuka, ikon dekoratif di setiap judul, dan tombol berbentuk pill di semua tempat.

## Warna

**Hanya mode gelap.** Tidak ada mode terang dan tidak ada tombol tema (keputusan Farhan, 9 November 2026).

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--bg` | `#05070C` | Latar halaman dan warna dasar adegan |
| `--panel` | `rgba(8, 11, 18, .82)` + blur 14 px | Panel isi di atas adegan |
| `--surface` | `#0E131C` | Bingkai tangkapan layar |
| `--line` | `rgba(142, 169, 242, .17)` | Garis pemisah dan tepi panel |
| `--text` | `#E7E9EC` | Teks utama |
| `--muted` | `#9AA3AF` | Teks pendukung dan label |
| `--accent` | `#8EA9F2` | Link, fokus, dan detail kecil |
| `--accent-fill` | `#2F4FA8` | Latar tombol utama, dengan teks putih di atasnya |
| `--live` | `#6FCF97` | Status Live dan sebagian lampu rak |

Biru tinta pekat (`#2F4FA8`) dipakai untuk tombol dan tepi rak. Versi terangnya (`#8EA9F2`) dipakai untuk teks dan link supaya terbaca di latar gelap. Hanya ada satu warna aksen. Hijau hanya dipakai sebagai warna status. Semua pasangan teks dan latar sudah dicek dengan `antislop-human/contrast-check.py` dan memenuhi WCAG AA, termasuk teks redup di atas panel.

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
| 0 | Ruang server: lampu status berkedip, paket data berjalan, dan kamera berpindah antar bagian jaringan mengikuti scroll | Selama halaman terbuka, berhenti saat tab disembunyikan | Identitas situs. Proyek tampil sebagai host di jaringan yang hidup |
| 1 | Kata-kata judul hero naik dari balik garis, lalu peran, ringkasan, dan tombol muncul berurutan (sekitar 900 ms) | Sekali saat Beranda dibuka | Mengarahkan mata dari judul ke nama, lalu ke tombol Lihat proyek |
| 2 | Tangkapan layar halaman penuh bergulir di dalam bingkai mengikuti scroll halaman | Saat kartu proyek dilewati | Pengunjung melihat seluruh situs proyek tanpa membukanya |
| 3 | Kartu proyek muncul pelan dan naik 16 px | Sekali saat pertama masuk layar | Memberi ritme saat membaca daftar proyek |
| 4 | Titik hijau "Live" berdenyut dua kali, lalu diam | Saat kartunya muncul | Menandai bahwa situsnya benar-benar online |
| 5 | Bingkai dan judul proyek berpindah mulus dari kartu ke halaman detail (View Transitions) | Saat membuka atau menutup detail proyek | Pembaca tetap tahu sedang membuka proyek yang mana |
| 6 | Penanda pilihan meluncur di tombol ID/EN (pola "pill glide") | Saat diklik | Menunjukkan pilihan yang aktif |
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
