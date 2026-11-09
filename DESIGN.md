# DESIGN.md: farhanfdlhq.my.id

Arah visual untuk website pribadi Farhan. Dipakai bersama skill anti-slop: file ini menentukan arah, dan anti-slop menyaring hasilnya.

Riwayat: versi 1 sampai 6 memakai arah "lembar spesifikasi" dengan biru tinta. Pada 9 November 2026 Farhan memilih arah **C. Server terurai** dari tiga alternatif baru (cetak biru, ruang kendali, server terurai). Bagian dari versi lama yang tetap dipakai: isi dari CV, tangkapan layar proyek yang bergulir di dalam bingkai, transisi ke halaman detail, linimasa, dan dua bahasa.

## Karakter

Seperti halaman produk perangkat keras. Satu objek, yaitu server blade, menjadi pusat perhatian. Hitam pekat, garis putih es, huruf sangat lebar, dan sedikit kata. Nuansa IT-nya datang dari server itu dan dari jaringan node yang terus bertukar paket data di sekelilingnya.

- Hanya mode gelap. Tidak ada tombol tema.
- Tidak ada nama domain atau label teks di dalam animasi.
- Hero tanpa kalimat pernyataan. Nama adalah judulnya.

## Warna

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--bg` | `#050505` | Latar halaman dan adegan |
| `--panel` | `rgba(6, 6, 7, .86)` + blur 14 px | Panel isi di atas adegan |
| `--surface` | `#0C0D0F` | Bingkai tangkapan layar |
| `--line` | `rgba(221, 230, 240, .14)` | Garis pemisah dan tepi panel |
| `--text` | `#DDE6F0` (putih es) | Teks utama, garis server, tombol utama |
| `--muted` | `#8B929B` | Teks pendukung dan label |
| `--red` | `#FF4D3D` | Satu-satunya aksen: CPU, nomor bagian, status Live, node proyek yang disorot, garis linimasa |

Tombol utama berwarna putih es dengan teks hitam. Link berwarna putih es dengan garis bawah tipis. Merah dipakai hemat. Semua pasangan teks dan latar dicek dengan `antislop-human/contrast-check.py`.

## Huruf

- **Archivo** (variable). Judul memakai lebar 125 dan berat 800, huruf kapital:
  - Nama di hero: `clamp(2.3rem, 10.4cqw, 7.4rem)`, tinggi baris 0,86.
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
- Radius 2 px di semua elemen, supaya kesannya tegas seperti perangkat keras.

## Adegan: server terurai di tengah jaringan

- **Server blade** (three.js, kode sendiri):
  - Baki dengan 4 kipas yang berputar dan 6 port jaringan.
  - Motherboard dengan jalur.
  - CPU merah dengan heatsink yang bercahaya.
  - 8 keping RAM, 4 disk, dan tutup berventilasi.
- **Terurai mengikuti scroll:**

  | Bagian halaman | Lapisan yang terbuka |
  | --- | --- |
  | Hero | 00 Utuh |
  | Proyek | 01 Tutup terangkat |
  | Tentang | 02 RAM |
  | Pengalaman | 03 CPU |
  | Keahlian | 04 Motherboard |
  | Kontak | 05 Disk dan baki turun |

  Saat server terbuka, jalur data merah muncul di antara CPU, RAM, motherboard, dan disk, dan paket data berjalan di sana.
- **Jaringan:**
  - 12 node di desktop (9 di HP) mengelilingi server. Empat di antaranya kubus yang mewakili proyek Farhan.
  - Setiap node tersambung kabel ke port server, dan sebagian node tersambung satu sama lain.
  - Paket data berjalan dua arah di semua kabel, dan node berputar pelan.
- **Sorotan:** saat kartu proyek dibaca atau di-hover, kubus proyeknya berubah merah dengan cahaya, dan paketnya mengalir 2,6 kali lebih cepat. Di halaman detail proyek, kamera pindah ke node proyek itu.
- **Kamera:** berpindah halus antar titik per bagian, dan bergeser sedikit mengikuti kursor.
- **Kinerja:**
  - Pixel ratio maksimal 1,5 di HP, dan jumlah node lebih sedikit.
  - Animasi berhenti saat tab disembunyikan.
  - Tanpa WebGL, latar hitam polos.
- **Kurangi gerak:** kalau perangkat meminta `prefers-reduced-motion`, server tetap terurai mengikuti scroll, tetapi tidak ada putaran, paket, atau kipas yang bergerak. Adegan hanya digambar ulang saat scroll.

## Gerak lain

| Gerakan | Kapan | Tujuan |
| --- | --- | --- |
| Kata-kata nama naik dari balik garis, lalu kalimat dan tombol muncul berurutan | Sekali saat Beranda dibuka | Mengarahkan mata dari nama ke tombol |
| Tangkapan layar halaman penuh bergulir di dalam bingkai mengikuti scroll | Saat kartu proyek dilewati | Melihat seluruh situs proyek tanpa membukanya |
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
