# DESIGN.md: farhanfdlhq.my.id

Arah visual untuk website pribadi Farhan. Dipakai bersama skill anti-slop: file ini menentukan arah, dan anti-slop menyaring hasilnya.

Riwayat: versi 1 sampai 6 memakai arah "lembar spesifikasi" dengan biru tinta. Pada 9 November 2026 Farhan memilih arah **C. Server terurai** dari tiga alternatif baru (cetak biru, ruang kendali, server terurai). Bagian dari versi lama yang tetap dipakai: isi dari CV, tangkapan layar proyek (hanya bagian hero, keputusan Farhan), transisi ke halaman detail, linimasa, dan dua bahasa.

## Karakter

Seperti halaman produk perangkat keras. Satu objek menjadi pusat perhatian: meja kerja dengan PC yang dibongkar sampai ke CPU. Hitam pekat, garis putih es, huruf sangat lebar, dan sedikit kata. Nuansa IT-nya datang dari komputer itu dan dari jaringan node yang terus bertukar paket data di sekelilingnya.

- Hanya mode gelap. Tidak ada tombol tema.
- Tidak ada nama domain atau label teks di dalam animasi.
- Hero tanpa kalimat pernyataan. Nama adalah judulnya.

## Warna

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--bg` | `#050505` | Latar halaman dan adegan |
| `--panel` | Kaca gelap: `rgba(9, 10, 13, .58)`, blur 24 px, saturasi 170%, tepi `rgba(255, 255, 255, .13)`, sorotan dalam di tepi atas | Panel isi di atas adegan |
| `--surface` | `#0C0D0F` | Bingkai tangkapan layar |
| `--line` | `rgba(221, 230, 240, .14)` | Garis pemisah dan tepi panel |
| `--text` | `#DDE6F0` (putih es) | Teks utama, garis server, tombol utama |
| `--muted` | `#8B929B` | Teks pendukung dan label |
| `--red` | `#FF4D3D` | Satu-satunya aksen: CPU, nomor bagian, status Live, node proyek yang disorot, garis linimasa |

**RGB** (permintaan Farhan, 9 November 2026): lampu RGB yang berganti warna pelan dipakai di dalam adegan, yaitu headset, keyboard, mouse, kipas CPU/GPU/casing, RAM, strip di casing, dan strip LED di tepi meja. Di luar adegan, RGB hanya muncul sebagai garis tipis di tepi atas panel kaca. Merah `#FF4D3D` tetap menjadi aksen antarmuka (nomor bagian, status, jalur).

Tombol utama berwarna putih es dengan teks hitam. Link berwarna putih es dengan garis bawah tipis. Merah dipakai hemat. Semua pasangan teks dan latar dicek dengan `antislop-human/contrast-check.py`.

## Huruf

- **Archivo** (variable). Judul memakai lebar 125 dan berat 800, huruf kapital:
  - Nama di hero: `clamp(1.9rem, 6.2cqw, 4.4rem)`, tinggi baris 0,9 (diperkecil atas permintaan Farhan).
  - Judul bagian: `clamp(2rem, 7.2cqw, 3.6rem)`.
  - Alasan huruf kapital: ini konvensi halaman produk perangkat keras. Hurufnya lebar, jadi jarak antarhurufnya tetap normal dan tidak direnggangkan.
- Isi memakai Archivo lebar normal, 16 sampai 17 px.
- **IBM Plex Mono** untuk label kecil, nomor bagian (01 sampai 05), HUD lapisan, tombol, tanggal, dan stack.

## Layout

- Adegan 3D menempel di belakang seluruh halaman (`position: sticky`).
- **Hero:** nama raksasa di kiri bawah, lalu satu kalimat, tombol "Lihat proyek", serta link Unduh CV dan Email. Server berada di kanan atas.
- **Bagian lain:** Proyek, Tentang, Pengalaman, Keahlian, dan Kontak masing-masing ada di panel hitam transparan.
  - Setiap panel diberi nomor merah dan judul lebar.
  - Di desktop, panel selain Proyek dibatasi 600 px di sisi kiri supaya server terlihat di kanan.
  - Jarak antarpanel 34svh.
- **HUD:** pojok kanan bawah adegan selalu menampilkan lapisan yang sedang terbuka, misalnya "03 CPU".
- **Panel kaca ala Liquid Glass:**
  - Radius 16 px.
  - Pantulan cahaya radial yang mengikuti kursor.
  - Garis RGB 2 px yang mengalir di tepi atas.
  - Bayangan dalam di tepi atas dan bayangan luar yang lembut.
  - Warna kaca dibuat cukup gelap supaya teks tetap terbaca.
- **Radius lain:** 2 px untuk tombol, kontrol, dan pil ID/EN, supaya tetap tegas. 10 px untuk bingkai tangkapan layar.
- **Judul bagian** memakai ukuran berbasis lebar panel (`clamp(1.6rem, 9.2cqi, 3.4rem)`), jadi tidak pernah keluar dari panel.

## Adegan: meja kerja, PC, lalu CPU yang dibongkar

Revisi 9 November 2026 (ide Farhan): adegan dimulai dari meja kerja, lalu kamera masuk ke PC dan membongkar komponennya, sampai ke CPU. Dibuat dengan three.js, kode sendiri, bergaya garis putih es di atas hitam.

- **Isi meja:**
  - Monitor dengan baris kode abstrak yang bergulir (garis tanpa teks).
  - Keyboard RGB (gelombang warna per tombol), mouse RGB, dan headset RGB di atas stand.
  - Router dengan lampu hijau dan dua antena.
  - Strip LED RGB di tepi depan meja.
  - Casing PC dengan lampu power merah, ventilasi, dan dua strip RGB di depan.
- **Isi PC:** motherboard, CPU (substrat berpin, IHS, dan die merah yang bercahaya), pendingin CPU dengan kipas, 4 RAM, GPU dengan dua kipas, PSU, SSD, dan dua kipas casing. Semua kipas berputar dan cincinnya RGB. RAM punya lampu RGB di atasnya.
- **Jaringan:**
  - Router tersambung kabel LAN ke PC.
  - Dari antena router, kabel menuju 8 node di belakang meja (6 di HP). Node juga tersambung satu sama lain.
  - Paket data berjalan dua arah di semua kabel.
  - Empat node kubus mewakili proyek dan menyala merah saat kartunya dibaca.
- **Alur scroll:**

  | Urutan | Bagian halaman | Yang terjadi | HUD |
  | --- | --- | --- | --- |
  | 1 | Hero | Seluruh meja | 00 Meja |
  | 2 | Jeda, lalu Proyek | Zoom ke PC | 01 PC |
  | 3 | Jeda, lalu Tentang | Panel samping terbuka dan bergeser ke samping | 02 Panel samping |
  | 4 | Jeda, lalu Pengalaman | Komponen terurai keluar. Jalur data merah muncul antara CPU, RAM, GPU, SSD, dan PSU | 03 Komponen |
  | 5 | Jeda, lalu Keahlian | Zoom ke CPU. Pendingin terangkat, IHS terangkat, die merah terlihat | 04 CPU |
  | 6 | Kontak | Kamera mundur ke meja dan PC menyatu lagi | 05 Meja |

- **Bagian yang menyatu:**
  - Semua panel dihubungkan satu jalur vertikal tipis di tepi kiri, dengan titik merah di setiap panel.
  - Di antara panel ada jeda tipis (`.beat`, 18svh di HP dan 16svh di desktop). Di jeda itu, sinyal merah berjalan di jalur mengikuti scroll.
  - Momen bongkar terjadi di jeda tersebut.
- **Tombol mata:**
  - Ada di header, di sebelah ID/EN.
  - Saat ditekan, semua isi disembunyikan (hero, panel, footer, dan menu) supaya pengunjung bisa scroll menikmati bongkar-pasang PC dan CPU tanpa terhalang.
  - Petunjuk kecil di bawah menjelaskan cara kembali. Tombol Esc juga mengembalikan isi.
  - Label aksesibilitasnya berganti: "Sembunyikan isi untuk melihat animasi" dan "Tampilkan isi".
- **Layout desktop:** semua panel isi berada di kolom kiri, maksimal 520 px. Kartu proyek tersusun satu kolom. Bidang pandang kamera digeser (`setViewOffset`) supaya meja dan PC tampil di kanan.
- **Halaman detail proyek:** kamera menyorot monitor.
- **Kinerja:**
  - Pixel ratio maksimal 1,5 di HP, dan jumlah node lebih sedikit.
  - Animasi berhenti saat tab disembunyikan.
  - Tanpa WebGL, latar hitam polos.
- **Kurangi gerak:** kalau perangkat meminta `prefers-reduced-motion`, bongkar-pasang tetap mengikuti scroll, tetapi kipas, paket, kode, dan lampu diam, dan warna RGB berhenti di satu pola.

## Gerak lain

| Gerakan | Kapan | Tujuan |
| --- | --- | --- |
| Kata-kata nama naik dari balik garis, lalu kalimat dan tombol muncul berurutan | Sekali saat Beranda dibuka | Mengarahkan mata dari nama ke tombol |
| Tangkapan layar hero proyek sedikit membesar | Saat kartu di-hover | Menandai kartu yang bisa dibuka |
| Kartu proyek muncul pelan | Sekali saat masuk layar | Ritme saat membaca |
| Bingkai dan judul proyek berpindah mulus ke halaman detail (View Transitions) | Saat membuka atau menutup detail | Tetap tahu proyek mana yang dibuka |
| Penanda pilihan meluncur di tombol ID/EN | Saat diklik | Menunjukkan pilihan aktif |
| Garis linimasa merah tergambar mengikuti scroll | Saat menggulir Pengalaman | Menunjukkan urutan waktu |
| Garis progres baca merah di atas | Di halaman detail | Sisa studi kasus |

Semua gerakan, kecuali perubahan warna, mati kalau perangkat meminta `prefers-reduced-motion: reduce`. Kalau browser tidak mendukung animasi berbasis scroll, elemen tampil diam dalam keadaan akhirnya.

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
