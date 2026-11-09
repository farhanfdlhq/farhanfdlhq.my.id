# DESIGN.md: farhanfdlhq.my.id

Arah visual untuk website pribadi Farhan. Dipakai bersama skill anti-slop: file ini menentukan arah, dan anti-slop menyaring hasilnya.

## Karakter

**Teknis dan presisi.** Kesannya mirip lembar spesifikasi yang rapi, bukan kostum "hacker". Rasa teknisnya datang dari isi yang nyata: tanggal, peran, stack, angka dari CV, dan tangkapan layar asli dengan domainnya. Efek visual tidak dipakai untuk membangun kesan itu.

Pilihan Farhan (9 November 2026): kesan teknis dan presisi, hanya mode gelap, aksen biru tinta, nama ditampilkan sebelum proyek, huruf IBM Plex, gerak sedang dan terkoreografi (direvisi dari minimal), tanpa foto diri, dan judul peran "UI/UX | Software Engineer".

## Latar sinematik: server di atas papan sirkuit

Revisi 9 November 2026. Gabungan adegan ruang server dan papan sirkuit (pilihan Farhan dari tiga alternatif), dengan hanya mode gelap. Tidak ada nama domain atau label teks di dalam animasi.

- **Adegan:** WebGL (three.js) di belakang seluruh halaman, menempel di layar (`position: sticky`).
  - Lantai berupa papan sirkuit gelap dengan titik grid.
  - Di atasnya berdiri rak-rak server dengan lampu status yang berkedip.
  - Rak terhubung lewat jalur tembaga di lantai yang berbelok 45 derajat dan tidak saling silang. Sinyal cahaya berjalan di sepanjang jalur itu.
  - Di tengah papan ada CPU yang menggantikan core switch.
- **Topologi:**
  - Empat rak proyek (Agendain, qiran, bynana, Andiamo) di kiri, masing-masing dengan bus 4 jalur ke sisi kiri CPU.
  - Tiga rak data di kanan, terhubung ke sisi kanan CPU.
  - Satu rak edge di belakang, terhubung ke CPU dengan bus 6 jalur dan sinar vertikal ke internet.
  - Konektor di tepi depan papan, serta jalur dan via hiasan di antara rak latar.
- **Kamera mengikuti scroll:**

  | Bagian | Yang terlihat |
  | --- | --- |
  | Hero | Ruangan dari depan |
  | Proyek | Rak proyek |
  | Tentang | CPU |
  | Pengalaman | Jalur di depan CPU |
  | Keahlian | Rak data |
  | Kontak | Rak edge dan sinar ke internet |
  | Detail proyek | Rak proyek itu sendiri |

- **Sorotan:** rak proyek dan jalurnya menyala, dan sinyalnya mengalir lebih cepat, saat kartu proyeknya di-hover atau sedang dibaca.
- **Hero:** tidak ada kalimat pernyataan (keputusan Farhan). Isinya nama sebagai `h1` (IBM Plex Sans 600, `clamp(2rem, 8cqw, 3.5rem)`), peran dan kota, tombol "Lihat proyek", serta link Unduh CV dan Email. Adegannya yang menjadi pusat perhatian.
- **Isi halaman:** setiap bagian berada di panel gelap transparan dengan blur. Jarak antarpanel 34svh supaya adegan terlihat di sela-selanya.
- **Kinerja:**
  - Rak latar 9 per baris di HP dan 13 di desktop. Pixel ratio maksimal 1,5 di HP.
  - Animasi berhenti saat tab disembunyikan.
  - Tanpa WebGL, latar memakai gradien CSS diam.
- **Kurangi gerak:** kalau perangkat meminta `prefers-reduced-motion`, lampu dan sinyal diam, dan adegan hanya digambar ulang saat scroll dengan kamera langsung melompat.
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
| 0 | Server di atas papan sirkuit: lampu status berkedip, sinyal berjalan di jalur tembaga, dan kamera berpindah antar bagian mengikuti scroll | Selama halaman terbuka, berhenti saat tab disembunyikan | Identitas situs. Proyek tampil sebagai host di jaringan yang hidup |
| 1 | Kata-kata nama di hero naik dari balik garis, lalu peran, ringkasan, dan tombol muncul berurutan (sekitar 900 ms) | Sekali saat Beranda dibuka | Mengarahkan mata dari nama ke tombol Lihat proyek |
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

Ditulis dengan sudut pandang orang pertama ("Saya membangun...") dalam bahasa yang lugas. Setiap kalimat menyebut pelakunya dan menyebut hal yang nyata.

Yang dihindari (dicek dengan `antislop-copywriting`):
- Rentang kosong seperti "dari database sampai production". Judul hero versi 3 sampai 5 dihapus karena memakai pola ini.
- Kalimat pasif tanpa pelaku ("dikerjakan dengan...", "dibangun dari...").
- Kata promosi, slogan, dan angka atau klaim yang tidak ada di CV.

Contoh panel Tentang, diambil dari CV:

> Saya software engineer di Bogor, lulusan Sistem Informasi tahun 2026. Sejak 2023 saya mengerjakan proyek freelance: sistem billing ISP, e-commerce jastip lintas negara, LMS untuk BPKP, dan website travel agency Agendain. Sehari-hari saya memakai Laravel dan React/Next.js, dan saya juga merancang tampilannya di Figma sebelum menulis kode.

Teks bahasa Inggris ditulis ulang dengan wajar, tidak diterjemahkan kata per kata.

## Logo

Dibuat dengan skill `logo-generator` setelah mockup disetujui. Logo memakai warna dan huruf dari file ini, harus terbaca sebagai favicon 16 px, dan tidak memakai gradien.
