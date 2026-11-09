# farhanfdlhq.my.id Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun website pribadi Farhan (portofolio dua bahasa dengan adegan 3D meja kerja dan PC yang dibongkar mengikuti scroll) beserta panel admin, lalu menyiapkannya untuk deploy di VPS aaPanel.

**Architecture:** Satu aplikasi Next.js (App Router). Halaman publik dirender di server dari SQLite. Adegan 3D adalah satu komponen klien yang dimuat setelah halaman tampil, jadi isi tetap terbaca tanpa JavaScript atau WebGL. Admin memakai Server Actions dan sesi cookie. Pola login, upload, deploy, dan backup diambil dari repo `farhanfdlhq/qiran-blog` (folder `web/`), yang sudah berjalan di VPS yang sama.

**Tech Stack:** Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3, better-sqlite3 13.0.3, sharp 0.35.5, three (rilis stabil terbaru saat dipasang, versinya dikunci), @fontsource-variable/archivo, @fontsource/ibm-plex-mono, Vitest 5.0.5, Playwright (sudah terpasang di mesin), tsx 4.23.15, Node 24.

**Spec:** `docs/superpowers/specs/2026-11-09-farhanfdlhq-design.md`. Arah visual ada di `DESIGN.md`. Acuan visual dan perilaku ada di `docs/mockup/` (versi 9.4). Aturan kerja ada di `CLAUDE.md`.

## Global Constraints

- Semua pekerjaan di branch `dev`. Jangan merge ke `main`.
- Node `>=22.12` di `engines`. Server memakai Node v24 di `/www/server/nodejs/v24.13.0/bin`.
- Port 3300. `SITE_URL=https://farhanfdlhq.my.id`, `DATA_DIR=/opt/farhanfdlhq/data` di `.env.production` (tidak masuk Git).
- Hanya mode gelap. Token warna, huruf, radius, dan ukuran mengikuti `DESIGN.md` persis: `--bg #050505`, `--text #DDE6F0`, `--muted #8B929B`, `--red #FF4D3D`, `--line rgba(221,230,240,.14)`, dan panel kaca `rgba(9,10,13,.58)` dengan blur 24 px dan saturasi 170%.
- Huruf di-host sendiri. Tidak ada request ke Google Fonts atau CDN. CSP `default-src 'self'`.
- Bahasa: ID di `/`, EN di `/en/`. Path proyek `/proyek/<slug>/` dan `/en/projects/<slug>/`. `trailingSlash: true`.
- Teks UI dalam dua bahasa ada di satu kamus (`lib/i18n.ts`). Teks yang bisa diubah pemilik (nama, peran, ringkasan, SEO, isi Tentang) diambil dari database, tidak ditulis di kode.
- Teks mengikuti aturan `antislop-copywriting`: tidak ada em dash, rentang kosong ("dari X sampai Y"), kalimat pasif tanpa pelaku, atau angka yang tidak ada di CV.
- Nomor telepon tidak pernah tampil. Kontak hanya email, LinkedIn, dan GitHub.
- Tidak ada secret di repo, termasuk password tes. Password tes dibuat acak saat tes berjalan (`crypto.randomBytes`).
- Isi halaman publik harus terbaca tanpa JavaScript. Adegan 3D adalah tambahan.
- Semua gerak mati dengan `prefers-reduced-motion: reduce`, kecuali bongkar-pasang yang mengikuti scroll (tetap jalan tanpa animasi waktu).
- Kontrol admin tidak memakai tampilan bawaan browser (alert, confirm, file input, checkbox, dan select polos). Label selalu terlihat, error tampil di bawah kolomnya dengan `aria-describedby`, dan ukuran huruf kolom minimal 16 px.
- Sebelum setiap commit: `npm run typecheck` dan `npm test` lolos. `npm run test:e2e` wajib lolos di akhir task yang menyentuh halaman.

## Review Focus

1. **Proyek yang isian EN-nya kosong.** Halaman `/en/` harus memakai teks ID, bukan menampilkan kotak kosong atau `undefined`, dan daftar proyek di admin harus menandainya "EN kosong". Tes ada di Task 4 dan Task 8.
2. **Upload dari HP yang bermasalah.** Foto JPEG 12 MB, foto HEIC, file bukan gambar, dan PDF palsu (nama `.pdf` tetapi isinya bukan PDF) harus ditolak dengan pesan bahasa Indonesia yang menyebut apa yang harus dilakukan, tanpa membuat server error 500. Foto yang lolos harus kehilangan data EXIF (lokasi). Tes ada di Task 9.
3. **Proyek draf.** Alamat proyek draf yang dibuka publik harus 404, tidak muncul di sitemap, dan tidak terhitung di prev/next. Tes ada di Task 4 dan Task 11.
4. **Perangkat tanpa WebGL atau dengan pengaturan kurangi gerak.** Halaman tetap lengkap dan terbaca, tombol mata tidak tampil (karena tidak ada yang bisa ditonton), dan tidak ada error di console. Tes ada di Task 7.
5. **Percobaan login berulang dengan IP palsu.** Di belakang Cloudflare, batas percobaan login harus memakai `CF-Connecting-IP`. Mengganti header `X-Forwarded-For` tidak boleh mereset hitungan. Tes ada di Task 3.

---

## Struktur file

```
app/
  layout.tsx                      html lang, huruf, metadata dasar, favicon
  globals.css                     token dan semua gaya publik (dari docs/mockup/index.template.html)
  (site)/page.tsx                 Beranda ID            -> views/HomeView
  (site)/proyek/page.tsx          Daftar proyek ID      -> views/ProjectsView
  (site)/proyek/[slug]/page.tsx   Detail proyek ID      -> views/ProjectView
  en/page.tsx, en/projects/page.tsx, en/projects/[slug]/page.tsx   pasangan EN
  admin/masuk/page.tsx            login
  admin/(panel)/layout.tsx        cek sesi dan navigasi admin
  admin/(panel)/page.tsx          daftar proyek
  admin/(panel)/proyek/[id]/page.tsx   form proyek (id "baru" untuk proyek baru)
  admin/(panel)/profil/page.tsx   profil, teks, SEO, link sosial
  admin/(panel)/riwayat/page.tsx  pengalaman, pendidikan, sertifikasi, keahlian
  admin/(panel)/cv/page.tsx       file CV
  actions/                        Server Actions admin, satu file per area
  uploads/[...path]/route.ts      menyajikan gambar dari DATA_DIR
  cv/[id]/route.ts                unduh CV
  og/[slug]/route.ts              gambar OG per proyek
  sitemap.ts, robots.ts, manifest.ts
components/
  site/                           Header, Hero, ProjectCard, Timeline, Skills, Contact, Footer, LangSwitch, PeekButton
  scene/                          DeskScene.tsx (klien) dan builder three.js
  admin/                          kontrol bertema (dari qiran) dan editor
lib/                              db, auth, sessions, passwords, uploads, i18n, paths, content, seo
scripts/                          start.sh, deploy.sh, backup.sh, user.ts, seed.ts
seed/                             data awal dari CV (seed/content.ts) dan gambar hero proyek (seed/images/)
tests/                            Vitest
e2e/flow.mjs                      Playwright
docs/                             DEPLOY-AAPANEL.md, AUDIT-KEAMANAN.md
```

Kode dari qiran-blog disalin, lalu disesuaikan: nama cookie, port, nama aplikasi, dan tabel. Saat menyalin, baca dulu file aslinya di https://github.com/farhanfdlhq/qiran-blog/tree/nextjs-blog/web.

---

### Task 1: Kerangka aplikasi, huruf, token, dan halaman kosong

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.mts`, `.env.example`, `.gitignore`, `app/layout.tsx`, `app/globals.css`, `app/(site)/page.tsx`, `scripts/start.sh`, `tests/smoke.test.ts`
- Copy: `brand/favicon.svg` ke `app/icon.svg`, `brand/png/apple-touch-icon-180.png` ke `app/apple-icon.png`

**Interfaces:**
- Produces: skrip npm `dev` (port 3300), `build`, `start` (`sh scripts/start.sh`), `test` (`vitest run`), `typecheck` (`tsc --noEmit`), `test:e2e` (`node e2e/flow.mjs`), `seed`, `user`. Token CSS di `:root` dengan nama yang sama seperti di mockup.

- [ ] **Step 1:** Buat `package.json` dengan versi persis di Tech Stack dan `engines.node ">=22.12"`. Jalankan `npm install three @fontsource-variable/archivo @fontsource/ibm-plex-mono`, lalu kunci versinya (tanpa `^`).
- [ ] **Step 2:** Salin `next.config.ts` dari qiran: `distDir` dari `NEXT_DIST_DIR`, `trailingSlash`, `serverExternalPackages ["better-sqlite3","sharp"]`, dan header keamanan. Ubah CSP menjadi `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'`. Hapus redirect milik qiran.
- [ ] **Step 3:** Salin `scripts/start.sh` dari qiran, dengan port bawaan diubah ke 3300.
- [ ] **Step 4:** Pindahkan blok `<style>` dari `docs/mockup/index.template.html` ke `app/globals.css`, tanpa aturan `.bar`, `.seg`, `.stage`, dan `.device` (kontrol mockup). Ganti `@container` milik `.device` dengan container query di `body`. Impor huruf dari `@fontsource` di `app/layout.tsx`.
- [ ] **Step 5:** Tulis `tests/smoke.test.ts`: `expect(fs.readFileSync("app/globals.css","utf8")).toContain("--red: #FF4D3D")` dan memastikan CSS tidak mengandung `fonts.googleapis.com`.
- [ ] **Step 6:** Jalankan `npm run typecheck && npm test && npm run build`. Hasil yang diharapkan: semuanya lolos, dan build tidak berisi peringatan.
- [ ] **Step 7:** Commit dengan pesan `Kerangka Next.js, huruf lokal, token warna, dan favicon`.

### Task 2: Database, skema, dan data awal dari CV

**Files:**
- Create: `lib/db.ts`, `lib/settings.ts`, `seed/content.ts`, `scripts/seed.ts`, `tests/db.test.ts`

**Interfaces:**
- Produces: `getDb(): Database` (file `DATA_DIR/fdq.sqlite`), `dataDir(): string`, `uploadsDir(): string` (`DATA_DIR/uploads`), `resetDbForTests(): void` (sama dengan qiran). `getSetting(key: SettingKey, lang?: Lang): string`, `setSettings(values: Partial<Record<SettingKey, string>>): void`.
- Tabel (semua kolom teks per bahasa memakai akhiran `_id` dan `_en`):
  - `users(id, email UNIQUE, name, password_hash, created_at)`
  - `sessions(token_hash PRIMARY KEY, user_id, expires_at)`
  - `login_attempts(key, at)`
  - `settings(key PRIMARY KEY, value)`
  - `projects(id, slug UNIQUE, title, summary_id/_en, role_id/_en, period_id/_en, context_id/_en, problem_id/_en, approach_id/_en, result_id/_en, stack TEXT /* dipisah koma */, year INTEGER NULL, live_url, repo_url, hero_image, featured INTEGER, status TEXT CHECK(status IN ('draft','published')), sort INTEGER, created_at, updated_at)`
  - `project_images(id, project_id REFERENCES projects ON DELETE CASCADE, url, alt_id/_en, sort)`
  - `experiences(id, role_id/_en, org, period_id/_en, sort)`
  - `education(id, school, degree_id/_en, detail_id/_en, year_end, sort)`
  - `certifications(id, name, issuer, sort)`
  - `skills(id, group_id/_en, items, sort)`
  - `cvs(id, label, lang TEXT CHECK(lang IN ('id','en','both')), file, is_primary INTEGER, sort, uploaded_at)`
- `SettingKey` = `name | role | city | email | github_url | linkedin_url | hero_line_id | hero_line_en | about_id | about_en | seo_title_id | seo_title_en | seo_desc_id | seo_desc_en`.

- [ ] **Step 1:** Tulis `tests/db.test.ts` dengan tiga tes:
  - migrasi membuat semua tabel di atas;
  - menjalankan migrasi dua kali tidak error;
  - `seed()` dua kali menghasilkan tepat 4 proyek, 6 pengalaman, 2 pendidikan, dan 3 sertifikasi (seed tidak menggandakan data).
- [ ] **Step 2:** Jalankan `npm test -- db`. Hasilnya FAIL karena modul belum ada.
- [ ] **Step 3:** Salin `lib/db.ts` dari qiran: WAL, `foreign_keys = ON`, dan migrasi bernomor lewat `PRAGMA user_version`. Tulis skema di atas sebagai migrasi 1. Pindahkan `lib/settings.ts` dari qiran, dengan `getSetting(key, lang)` yang mengambil `key_<lang>` dulu lalu kembali ke `key_id`.
- [ ] **Step 4:** Tulis `seed/content.ts`, berisi data persis dari bagian "Isi awal dari CV" di spec:
  - empat proyek terbit dan unggulan dengan urutan dan slug: Agendain (`agendain`), qiran.my.id (`qiran`), bynana.my.id (`bynana`), dan Elenmor (Andiamo) (`elenmor`). Ringkasan dan peran di setiap kartu sama dengan `docs/mockup/index.template.html`. `repo_url` hanya diisi untuk qiran (`https://github.com/farhanfdlhq/qiran-blog`) dan bynana (`https://github.com/farhanfdlhq/bynana`). `live_url` Elenmor adalah `https://elenmor.id`;
  - pengaturan: `name` "Farhan Achmad Fadhillah", `role` "UI/UX | Software Engineer", `city` "Bogor", `email` "fadilahfarhan80@gmail.com", `github_url` "https://github.com/farhanfdlhq", serta `about_id` dan `about_en` dari mockup.

  `scripts/seed.ts` menyalin `seed/images/*.webp` ke `uploadsDir()/seed/` lalu menjalankan `seed()`. Seed melewati baris yang sudah ada berdasarkan `slug` dan teks unik.
- [ ] **Step 5:** Jalankan `npm test -- db`. Hasilnya PASS.
- [ ] **Step 6:** Commit dengan pesan `Skema SQLite dan data awal dari CV`.

### Task 3: Login admin, sesi, dan batas percobaan

**Files:**
- Create: `lib/passwords.ts`, `lib/sessions.ts`, `lib/auth.ts`, `scripts/user.ts`, `app/admin/masuk/page.tsx`, `app/actions/auth.ts`, `components/admin/LoginForm.tsx`, `components/admin/PasswordInput.tsx`, `tests/auth.test.ts`

**Interfaces:**
- Produces:
  - `hashPassword(pw): Promise<string>` dan `verifyPassword(pw, stored): Promise<boolean>` (scrypt, dari qiran);
  - `createSession(userId): string`, `getSessionUser(token): User | null`, dan `deleteSession(token)`;
  - `tooManyAttempts(key): boolean`, `recordFailure(key)`, dan `clearFailures(key)`;
  - `requireAdmin(): Promise<User>` (mengalihkan ke `/admin/masuk/`), `clientIp(): Promise<string>`, dan `SESSION_COOKIE = "fdq_session"`;
  - perintah `npm run user -- add --email <e> --name <n>`, yang menanyakan password lewat prompt tersembunyi dan menolak password di bawah 10 karakter.

- [ ] **Step 1:** Tulis `tests/auth.test.ts`:
  - `verifyPassword` benar untuk password yang sama dan salah untuk yang lain;
  - `tooManyAttempts` bernilai `false` setelah 4 kegagalan dan `true` setelah 5 kegagalan dalam 15 menit;
  - kegagalan berumur lebih dari 15 menit tidak dihitung (manipulasi kolom `at`);
  - sesi yang lewat `expires_at` mengembalikan `null`;
  - `clientIp` dengan header `{"cf-connecting-ip":"1.1.1.1","x-forwarded-for":"9.9.9.9"}` mengembalikan `"1.1.1.1"` (Review Focus 5).

  Semua password tes dibuat dengan `randomBytes(12).toString("hex")`.
- [ ] **Step 2:** Jalankan tesnya. Hasilnya FAIL.
- [ ] **Step 3:** Salin `passwords.ts`, `sessions.ts`, `auth.ts`, dan `scripts/user.ts` dari qiran. Sesi berlaku 30 hari, cookie `HttpOnly`, `Secure` di production, `SameSite=Lax`, dan path `/`. Kunci batas percobaan adalah `login:<ip>`. Hanya ada satu peran (admin), jadi buang `requireUser` dan logika penulis milik qiran.
- [ ] **Step 4:** Buat halaman `/admin/masuk/` dengan `LoginForm` dan `PasswordInput` (ikon mata) dari qiran, diberi gaya `DESIGN.md`. Pesan "Email atau password salah." dipakai untuk semua kegagalan. Pesan "Terlalu banyak percobaan. Coba lagi dalam 15 menit." dipakai saat terkunci.
- [ ] **Step 5:** Jalankan `npm test -- auth`. Hasilnya PASS.
- [ ] **Step 6:** Commit dengan pesan `Login admin, sesi cookie, dan batas percobaan per IP Cloudflare`.

### Task 4: Lapisan data publik dan dua bahasa

**Files:**
- Create: `lib/i18n.ts`, `lib/paths.ts`, `lib/content.ts`, `tests/content.test.ts`

**Interfaces:**
- Produces:
  - `type Lang = "id" | "en"`, `UI: Record<Lang, Record<UiKey, string>>` (semua teks tetap dari `docs/mockup/motion.js` dan HTML mockup), dan `t(lang, key): string`;
  - `pick<T>(row: T, field: string, lang: Lang): { text: string; fallback: boolean }`, yang mengambil `field_en`, lalu kembali ke `field_id` kalau EN kosong atau berisi spasi saja;
  - `homePath(lang)`, `projectsPath(lang)`, `projectPath(lang, slug)`, dan `alternatePath(lang, path): string`, yang memetakan `/proyek/x/` dan `/en/projects/x/` ke pasangannya;
  - `publishedProjects(opts?: { featuredOnly?: boolean; tech?: string }): ProjectRow[]` diurutkan `sort`, `projectBySlug(slug, { includeDraft?: boolean }): ProjectRow | null`, dan `neighbors(slug): { prev: ProjectRow | null; next: ProjectRow | null }` (hanya proyek terbit);
  - `allTech(): string[]` (unik dan diurutkan, dari kolom `stack`);
  - `profile(lang): Profile`, `experiences(lang)`, `education(lang)`, `certifications()`, `skills(lang)`, dan `primaryCv(lang): CvRow | null` (aturannya ada di Keputusan spec).

- [ ] **Step 1:** Tulis `tests/content.test.ts`:
  - `pick({summary_id:"Halo",summary_en:"  "},"summary","en")` menghasilkan `{text:"Halo",fallback:true}` (Review Focus 1);
  - `alternatePath("id","/proyek/agendain/")` menghasilkan `"/en/projects/agendain/"`, dan `alternatePath("en","/en/")` menghasilkan `"/"`;
  - proyek draf tidak ada di `publishedProjects()`, `projectBySlug` mengembalikan `null` untuknya, dan `neighbors` melompatinya (Review Focus 3);
  - `publishedProjects({tech:"SQLite"})` hanya berisi qiran dan bynana (data seed);
  - `primaryCv("en")` mengembalikan file `en` atau `both` yang utama, lalu kembali ke file utama mana saja, atau `null` kalau tidak ada file;
  - kamus `UI.id` dan `UI.en` punya kunci yang sama persis.
- [ ] **Step 2:** Jalankan tesnya. Hasilnya FAIL.
- [ ] **Step 3:** Implementasikan semua fungsi di Interfaces dengan query SQLite yang sudah disiapkan (prepared statement).
- [ ] **Step 4:** Jalankan `npm test -- content`. Hasilnya PASS.
- [ ] **Step 5:** Commit dengan pesan `Lapisan data publik, kamus dua bahasa, dan path`.

### Task 5: Halaman publik tanpa adegan 3D

**Files:**
- Create: `views/HomeView.tsx`, `views/ProjectsView.tsx`, `views/ProjectView.tsx`, `components/site/*` (Header, Hero, ProjectCard, ProjectFilter, Timeline, Skills, Contact, CopyEmail, Footer, LangSwitch), dan enam file `page.tsx` publik, `app/uploads/[...path]/route.ts`, `app/cv/[id]/route.ts`, `app/not-found.tsx`, `e2e/flow.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: semua fungsi Task 4.
- Produces:
  - `HomeView({ lang })`, `ProjectsView({ lang, tech? })`, dan `ProjectView({ lang, slug })`. `page.tsx` hanya memanggil view, `generateStaticParams` untuk slug, dan `notFound()` kalau proyek tidak ada;
  - id elemen tetap untuk adegan dan e2e: `#hero`, `#proyek`, `#h-about`, `#h-exp`, `#h-skill`, `#kontak`, `#beat-pc`, `#beat-open`, `#beat-explode`, `#beat-cpu`, `.proj[data-host]`, `#site`, `#peek`, `#hud`, dan `#scene`. Nilai `data-host` adalah slug proyek.

- [ ] **Step 1:** Tulis `e2e/flow.mjs` (pola qiran: `BASE`, fungsi `check`, dan mengumpulkan error console). Tes awal halaman publik:
  - `/` berisi h1 "Farhan Achmad Fadhillah", 4 `.proj` dengan judul sesuai seed, dan alamat email yang bisa diseleksi;
  - halaman tidak berisi pola nomor telepon (`/\+?62[\d\s-]{8,}/`);
  - tombol ID/EN di `/proyek/agendain/` membuka `/en/projects/agendain/`, dan sebaliknya;
  - `/proyek/?tech=SQLite` berisi 2 kartu;
  - dengan JavaScript dimatikan, `/` tetap menampilkan semua bagian;
  - pada lebar 390 px, `document.documentElement.scrollWidth <= 390`;
  - `/proyek/tidak-ada/` mengembalikan 404.
- [ ] **Step 2:** Jalankan `npm run build && npm run start`, lalu `BASE=http://localhost:3300 npm run test:e2e`. Hasilnya FAIL.
- [ ] **Step 3:** Pindahkan markup `docs/mockup/index.template.html` ke komponen. Ganti teks statis dengan `t()`, data dengan `lib/content.ts`, dan `data-i` dengan render sisi server per bahasa. Tombol ID/EN berupa `<a>` biasa ke `alternatePath`, dengan penanda yang meluncur lewat CSS. `CopyEmail` adalah komponen klien yang tetap memperlihatkan alamat sebagai teks. Bagian Pengalaman di Beranda menampilkan pengalaman, lalu pendidikan dan sertifikasi di bawahnya dengan gaya linimasa yang sama.
- [ ] **Step 4:** Salin `app/uploads/[...path]/route.ts` dari qiran (menolak `..`, dan hanya mengizinkan ekstensi webp, png, jpg, dan svg). `app/cv/[id]/route.ts` menyajikan file dari `DATA_DIR/cv/` dengan `Content-Type: application/pdf` dan `Content-Disposition: attachment; filename="<label>.pdf"`. Tombol Unduh CV mengarah ke `/cv/<id>/` dari `primaryCv(lang)`, dan disembunyikan kalau tidak ada file.
- [ ] **Step 5:** Jalankan e2e. Semua tes halaman publik PASS, dan tidak ada error console.
- [ ] **Step 6:** Commit dengan pesan `Halaman publik dua bahasa dari mockup v9.4`.

### Task 6: Gerak CSS dan interaksi kecil

**Files:**
- Create: `components/site/Motion.tsx` (klien)
- Modify: `app/globals.css`, komponen Task 5

**Interfaces:**
- Consumes: id elemen dari Task 5.
- Produces: `<Motion />` dipasang sekali di layout publik. Isinya pantulan panel kaca (`--mx`, `--my`), titik Live yang berdenyut dua kali saat muncul, dan View Transitions antara kartu Agendain dan halaman detail (`view-transition-name: shot-<slug>` dan `title-<slug>`).

- [ ] **Step 1:** Tambahkan e2e:
  - dengan `reducedMotion: "reduce"`, `getComputedStyle(h1 .w span).animationName` bernilai `"none"`;
  - di `/proyek/agendain/`, `.progress` ada dan lebarnya bertambah setelah scroll (cek `transform`) kalau browser mendukung `animation-timeline`.
- [ ] **Step 2:** Jalankan e2e. Hasilnya FAIL.
- [ ] **Step 3:** Pindahkan semua aturan gerak dari mockup (`rise`, `fadeUp`, `cardIn`, `draw`, `grow`, `travel`, `rgbflow`, `oping`) beserta pembungkus `prefers-reduced-motion` dan `@supports (animation-timeline: view())`-nya. View Transitions memakai `document.startViewTransition` hanya kalau tersedia dan pengguna tidak meminta kurangi gerak.
- [ ] **Step 4:** Jalankan e2e. Hasilnya PASS.
- [ ] **Step 5:** Commit dengan pesan `Gerak: nama, kartu, linimasa, jalur, panel kaca, dan View Transitions`.

### Task 7: Adegan 3D meja kerja, PC, dan CPU

**Files:**
- Create:
  - `components/scene/DeskScene.tsx` (klien), dimuat dengan `next/dynamic` dan `ssr: false`;
  - `components/scene/story.ts` (logika murni, tanpa three.js);
  - builder: `components/scene/build/helpers.ts`, `desk.ts`, `pc.ts`, `network.ts`, dan `rgb.ts`;
  - `components/site/PeekButton.tsx` dan `tests/story.test.ts`.

**Interfaces:**
- Consumes: id elemen dari Task 5, dan `docs/mockup/desk.js` sebagai sumber kode.
- Produces:
  - `type Stop = { cam: CamKey; y: number }`, `type CamKey = "desk" | "pc" | "open" | "explode" | "cpu" | "back" | "detail"`;
  - `STOPS: { cam: CamKey; selector: string }[]`, berisi 10 entri sesuai urutan di `desk.js`;
  - `scrollProgress(stops: Stop[], centerY: number): { p: number; t: number; a: number; b: number }`;
  - `sceneState(p: number): { open: number; explode: number; deep: number; back: number }`, dengan rumus persis `desk.js`: `back = ease(p-8)`, `open = ease(p-2)*(1-back)`, `explode = ease(p-4)*(1-back)`, dan `deep = ease(p-6)*(1-back)`;
  - `hudLabel(cam: CamKey, lang: Lang): [string, string]`, sesuai tabel HUD di `DESIGN.md`;
  - `isDetailPath(pathname: string): boolean`, yang bernilai benar untuk `/proyek/<slug>/` dan `/en/projects/<slug>/`. Ini menggantikan cek `#agendain` di mockup, jadi kamera `detail` dipakai untuk semua proyek;
  - node proyek yang disorot ditentukan dari urutan `.proj[data-host]` di halaman (empat pertama, indeks 0 sampai 3), bukan dari nama proyek yang ditulis di kode.

- [ ] **Step 1:** Tulis `tests/story.test.ts`:
  - `scrollProgress` di tengah stop ke-3 bernilai `p = 2`, dan di atas stop pertama bernilai `p = 0`;
  - `sceneState(0)` semuanya `0`;
  - `sceneState(5).explode` antara 0 dan 1;
  - `sceneState(7).deep` bernilai `1`, dan `sceneState(9)` semuanya kembali `0`;
  - `hudLabel("cpu","en")` menghasilkan `["04","CPU"]`;
  - `isDetailPath("/en/projects/qiran/")` bernilai `true`, dan `isDetailPath("/proyek/")` bernilai `false`.
- [ ] **Step 2:** Jalankan `npm test -- story`. Hasilnya FAIL.
- [ ] **Step 3:** Implementasikan `story.ts`.
- [ ] **Step 4:** Pecah `desk.js` ke builder (meja, monitor, keyboard, mouse, dan router di `desk.ts`; casing, komponen, headset dengan stand, dan pelat nama domain di `pc.ts`; node, kabel, dan paket di `network.ts`; registri lampu di `rgb.ts`), lalu ubah dari global `THREE` ke `import * as THREE from "three"`. Nonaktifkan manajemen warna supaya warnanya sama dengan mockup r128: `THREE.ColorManagement.enabled = false` dan `renderer.outputColorSpace = THREE.LinearSRGBColorSpace`.
- [ ] **Step 5:** `DeskScene` membuat renderer di `#scene canvas` dan menjalankan loop seperti mockup (berhenti saat tab disembunyikan). Kalau WebGL gagal dibuat, komponen tidak menampilkan apa pun dan tidak menyalakan tombol mata. `PeekButton` hanya dirender setelah adegan memberi tanda siap (`data-gl="on"` di `#site`), mengubah kelas `peek`, dan menanggapi Esc. Label aksesibilitasnya diambil dari `t()`.
- [ ] **Step 6:** Tambahkan e2e:
  - dengan WebGL tersedia, `#site[data-gl=on]` ada, klik `#peek` membuat `main` beropasitas 0, dan Esc mengembalikannya;
  - dengan Chromium `--disable-gpu --disable-webgl`, halaman lengkap, `#peek` tidak ada, dan tidak ada error console (Review Focus 4);
  - setelah scroll ke `#beat-cpu`, `#hud` berisi "04".
- [ ] **Step 7:** Jalankan `npm test` dan e2e. Hasilnya PASS. Bandingkan screenshot desktop dan HP 390 di setiap stop dengan mockup v9.4.
- [ ] **Step 8:** Commit dengan pesan `Adegan 3D meja, PC, dan CPU dengan three.js`.

### Task 8: Panel admin dan proyek

**Files:**
- Create:
  - `app/admin/(panel)/layout.tsx`, `app/admin/(panel)/page.tsx`, `app/admin/(panel)/proyek/[id]/page.tsx`, dan `app/actions/projects.ts`;
  - komponen bertema dari qiran di `components/admin/`: `ConfirmButton`, `Dialog`, `Select`, `Feedback` (toast), dan `ActionForm`;
  - `components/admin/LangFields.tsx` dan `components/admin/SortList.tsx`;
  - `lib/slug.ts`, `tests/projects-admin.test.ts`.

**Interfaces:**
- Consumes: `requireAdmin()` (Task 3), `pick` (Task 4).
- Produces:
  - `slugify(title: string): string`, yang menghasilkan ASCII kecil dengan tanda hubung, misalnya "Elenmor (Andiamo)" menjadi `elenmor-andiamo`;
  - `uniqueSlug(base: string, excludeId?: number): string`, yang menambahkan `-2`, `-3`, dan seterusnya;
  - aksi `saveProject(formData): Promise<FormResult>`, `deleteProject(id)`, `reorderProjects(ids: number[])`, dan `setProjectStatus(id, status)`;
  - `type FormResult = { ok: true } | { ok: false; errors: Record<string, string> }`;
  - `missingEn(row): string[]`, berisi nama kolom yang EN-nya kosong padahal ID-nya terisi.

- [ ] **Step 1:** Tulis `tests/projects-admin.test.ts`:
  - `slugify("Elenmor (Andiamo)")` menghasilkan `"elenmor-andiamo"`;
  - `uniqueSlug("agendain")` saat slug itu sudah ada menghasilkan `"agendain-2"`;
  - `saveProject` tanpa judul menghasilkan error `title: "Isi judul proyek dulu."`;
  - `live_url` yang bukan http/https ditolak dengan pesan `"Isi alamat yang diawali https://."`;
  - `missingEn` untuk proyek dengan `summary_en` kosong berisi `"summary"` (Review Focus 1).
- [ ] **Step 2:** Jalankan tesnya. Hasilnya FAIL.
- [ ] **Step 3:** Implementasikan aksi dengan validasi di server, lalu panggil `revalidatePath` untuk halaman publik ID dan EN.
- [ ] **Step 4:** Bangun halaman admin:
  - **Daftar proyek:** urutan bisa diubah dengan tombol naik dan turun, ada lencana Draf, Unggulan, dan "EN kosong", serta tombol hapus dengan dialog konfirmasi;
  - **Form proyek:** `LangFields` menampilkan isian ID dan EN berdampingan di desktop dan bertumpuk di HP. Ada kolom stack (teks dipisah koma), tahun, link live, link repo (opsional), unggulan, dan status.

  Form memakai `novalidate`, pesan error tampil di bawah kolomnya, dan semua kolom memakai `inputmode`, `autocomplete`, dan `enterkeyhint` yang sesuai.
- [ ] **Step 5:** Tambahkan e2e:
  - login dengan akun acak yang dibuat oleh `scripts/user.ts` di awal e2e;
  - buat proyek "Uji Draf" sebagai draf, lalu pastikan `/proyek/uji-draf/` 404;
  - terbitkan proyek itu, lalu pastikan halamannya 200 dan `/en/projects/uji-draf/` memakai teks ID;
  - pastikan daftar admin menampilkan "EN kosong", lalu hapus proyeknya.
- [ ] **Step 6:** Jalankan `npm test` dan e2e. Hasilnya PASS.
- [ ] **Step 7:** Commit dengan pesan `Admin proyek dua bahasa dengan draf, urutan, dan penanda EN kosong`.

### Task 9: Upload gambar proyek dan file CV

**Files:**
- Create: `lib/uploads.ts`, `lib/cv.ts`, `app/actions/media.ts`, `components/admin/FileInput.tsx`, `components/admin/Gallery.tsx`, `app/admin/(panel)/cv/page.tsx`, `tests/uploads.test.ts`, `tests/fixtures/` (dibuat oleh tes saat berjalan)

**Interfaces:**
- Produces:
  - `MAX_IMAGE_BYTES = 12 * 1024 * 1024`;
  - `storeImage(buf: Buffer, name: string): Promise<string>`, yang mengembalikan `/uploads/<yyyy>/<mm>/<hash>.webp`. Lebar maksimal 1600 px, WebP kualitas 80, metadata dibuang, dan hasilnya diputar mengikuti EXIF lebih dulu;
  - `MAX_CV_BYTES = 10 * 1024 * 1024` dan `type CvLang = "id" | "en" | "both"`;
  - `storeCv(buf: Buffer, label: string, lang: CvLang): Promise<number>`, yang memeriksa 5 byte pertama `%PDF-`;
  - aksi `uploadProjectImage`, `setHeroImage`, `deleteProjectImage`, `reorderProjectImages`, `uploadCv`, `setPrimaryCv`, dan `deleteCv`.

- [ ] **Step 1:** Tulis `tests/uploads.test.ts`. Gambar tes dibuat dengan sharp di dalam tes.
  - JPEG 3000×2000 dengan EXIF GPS menjadi WebP selebar 1600 tanpa EXIF (`(await sharp(out).metadata()).exif === undefined`);
  - buffer teks biasa ditolak dengan `"File ini bukan gambar. Pilih foto JPG, PNG, atau WebP."`;
  - buffer di atas 12 MB ditolak dengan `"Foto lebih dari 12 MB. Kecilkan dulu atau pilih foto lain."`;
  - buffer HEIC (header `ftypheic`) ditolak dengan `"Foto HEIC belum didukung. Di iPhone, ubah Kamera > Format ke Paling Kompatibel, atau kirim sebagai JPG."` (Review Focus 2);
  - `storeCv` untuk buffer berawalan `"hello"` ditolak dengan `"File ini bukan PDF. Ekspor CV ke PDF dulu."`.
- [ ] **Step 2:** Jalankan tesnya. Hasilnya FAIL.
- [ ] **Step 3:** Implementasikan dengan dasar `lib/uploads.ts` milik qiran, lalu tambahkan pemeriksaan jenis file dari isinya (bukan dari nama file). Semua kesalahan dikembalikan sebagai `FormResult`, tidak dilempar sebagai error 500.
- [ ] **Step 4:** Bangun `FileInput` (tombol bertema dengan nama file dan pratinjau), `Gallery` (pilih hero, ubah urutan, hapus, dan isi teks alt ID/EN), serta halaman CV (label, bahasa, utama, dan hapus).
- [ ] **Step 5:** Tambahkan e2e: unggah gambar ke proyek Agendain lalu pastikan gambar tampil di halaman detail, dan unggah PDF kecil sebagai CV utama lalu pastikan tombol Unduh CV di Beranda mengunduh file dengan `Content-Type: application/pdf`.
- [ ] **Step 6:** Jalankan `npm test` dan e2e. Hasilnya PASS.
- [ ] **Step 7:** Commit dengan pesan `Upload gambar WebP tanpa EXIF dan file CV dengan pemeriksaan isi`.

### Task 10: Admin profil, riwayat, dan keahlian

**Files:**
- Create: `app/admin/(panel)/profil/page.tsx`, `app/admin/(panel)/riwayat/page.tsx`, `app/actions/profile.ts`, `components/admin/ListEditor.tsx`, `tests/profile-admin.test.ts`

**Interfaces:**
- Consumes: `setSettings` (Task 2), `SortList` dan `LangFields` (Task 8).
- Produces:
  - `saveProfile(formData): Promise<FormResult>`. Isinya pengaturan di `SettingKey`, tetapi tidak ada kolom telepon;
  - `saveListItem(kind: "experience" | "education" | "certification" | "skill", formData)`, `deleteListItem(kind, id)`, dan `reorderList(kind, ids)`.

- [ ] **Step 1:** Tulis tes dengan dua kasus:
  - `saveProfile` dengan email tidak valid menghasilkan `email: "Format email belum benar."`, dan URL LinkedIn tanpa https ditolak;
  - setelah `reorderList("experience", [id3, id1, id2])`, `experiences("id")` mengikuti urutan itu.
- [ ] **Step 2:** Jalankan tesnya. Hasilnya FAIL.
- [ ] **Step 3:** Implementasikan aksi dan `revalidatePath`.
- [ ] **Step 4:** Bangun halaman profil (nama, peran, kota, email, GitHub, LinkedIn, Tentang ID/EN, dan SEO ID/EN) dan halaman riwayat (empat daftar dengan `ListEditor`).
- [ ] **Step 5:** Tambahkan e2e: ubah peran menjadi "Software Engineer", pastikan hero di `/` dan `/en/` ikut berubah, lalu kembalikan nilainya.
- [ ] **Step 6:** Jalankan `npm test` dan e2e. Hasilnya PASS.
- [ ] **Step 7:** Commit dengan pesan `Admin profil, pengalaman, pendidikan, sertifikasi, dan keahlian`.

### Task 11: SEO, gambar OG, sitemap, dan manifest

**Files:**
- Create: `lib/seo.ts`, `lib/og.tsx`, `app/og/[slug]/route.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `tests/seo.test.ts`

**Interfaces:**
- Consumes: `lib/content.ts`, `lib/paths.ts`, dan `getSetting`.
- Produces:
  - `pageMetadata({ lang, path, title?, description?, image? }): Metadata`, yang mengisi `alternates.canonical` dan `alternates.languages` `{ "id-ID", "en", "x-default" }`, serta openGraph dan twitter;
  - `personJsonLd(lang): object`, berisi `@type: "Person"`, nama, `jobTitle` dari `role`, `url`, `sameAs` (GitHub dan LinkedIn kalau diisi), dan tanpa telepon;
  - gambar OG 1200×630 per proyek, bergaya hitam dengan judul Archivo dan titik merah.

- [ ] **Step 1:** Tulis `tests/seo.test.ts`:
  - `pageMetadata` untuk `/proyek/agendain/` punya alternatif `en` ke `https://farhanfdlhq.my.id/en/projects/agendain/`;
  - `personJsonLd` tidak punya kunci `telephone`;
  - `sitemap()` berisi URL ID dan EN untuk 4 proyek terbit dan tidak berisi proyek draf (Review Focus 3).
- [ ] **Step 2:** Jalankan tesnya. Hasilnya FAIL.
- [ ] **Step 3:** Implementasikan. Pakai `pageMetadata` di keenam halaman publik. Pasang JSON-LD di Beranda ID dan EN. Manifest memakai ikon dari `brand/png/`.
- [ ] **Step 4:** Jalankan `npm test` dan e2e (tambahkan cek: `<link rel="alternate" hreflang="en">` ada di `/`). Hasilnya PASS.
- [ ] **Step 5:** Commit dengan pesan `SEO dua bahasa, JSON-LD Person, gambar OG, sitemap, dan manifest`.

### Task 12: Deploy, backup, dokumentasi, dan audit keamanan

**Files:**
- Create: `scripts/deploy.sh`, `scripts/backup.sh`, `docs/DEPLOY-AAPANEL.md`, `docs/AUDIT-KEAMANAN.md`, `README.md`

**Interfaces:**
- Consumes: `scripts/start.sh` (Task 1), `npm run user` (Task 3), dan `npm run seed` (Task 2).

- [ ] **Step 1:** Salin `deploy.sh` dan `backup.sh` dari `qiran-blog/web/scripts/`, lalu ubah nilai bawaannya: `APP_NAME=farhanfdlhq`, `PORT=3300`, folder backup `/www/backup/farhanfdlhq`, dan masa simpan 14 hari. Backup berisi `fdq.sqlite` (memakai `.backup` SQLite, bukan salin file mentah), `uploads/`, dan `cv/`.
- [ ] **Step 2:** Jalankan `bash -n scripts/deploy.sh scripts/backup.sh` (dan `shellcheck` kalau ada). Hasilnya tanpa error. Jalankan `DATA_DIR=$(mktemp -d) BACKUP_DIR=$(mktemp -d) bash scripts/backup.sh` pada database seed, lalu pastikan arsip berisi tiga bagian itu.
- [ ] **Step 3:** Tulis `docs/DEPLOY-AAPANEL.md` dengan alur `docs/SETUP-DOMAIN-BARU.md` milik qiran, diisi untuk situs ini:
  - **Domain dan Cloudflare:** domain `farhanfdlhq.my.id` di indo.domains diarahkan ke Cloudflare. Record DNS awalnya abu-abu. Origin Certificate dipakai dengan mode Full (strict), dan Rocket Loader dimatikan.
  - **Aplikasi di VPS:**
    - kode di `/opt/farhanfdlhq` dan data di `/opt/farhanfdlhq/data`;
    - Node Project `farhanfdlhq` dengan perintah `npm run start`, port 3300, dan user `www`;
    - Proxy Project ke `http://127.0.0.1:3300`;
    - di Customized Configuration Files: `client_max_body_size 20m;` di blok server, dan `proxy_set_header X-Forwarded-Proto $scheme;` di blok `location /`;
    - file IP Cloudflare untuk `real_ip_header CF-Connecting-IP`.
  - **Akun dan isi awal:** `npm run user -- add` dan `npm run seed`.
  - **Perawatan:** backup harian lewat Cron aaPanel, update dengan `./scripts/deploy.sh`, dan tabel masalah yang mungkin muncul.

  Setiap perintah ditulis di blok kode sendiri. IP VPS tidak ditulis di dokumen ini.
- [ ] **Step 4:** Tulis `docs/AUDIT-KEAMANAN.md`. Isinya tabel setiap risiko, cara menanganinya, dan file kodenya: sesi cookie, batas login per `CF-Connecting-IP`, CSRF lewat Server Actions dan cek origin bawaan Next, upload yang diperiksa dari isinya, EXIF dibuang, path traversal di `/uploads`, CSP, tidak ada secret di repo, dan proyek draf tidak bisa dibuka publik.
- [ ] **Step 5:** Tulis `README.md`. Isinya penjelasan singkat situs ini, cara menjalankan di komputer sendiri (`cp .env.example .env.local`, `npm ci`, `npm run seed`, `npm run user -- add`, dan `npm run dev`), serta tautan ke kedua dokumen di atas.
- [ ] **Step 6:** Jalankan semua pemeriksaan: `npm run typecheck && npm test && npm run build`, lalu e2e penuh di production build. Semuanya PASS.
- [ ] **Step 7:** Commit dengan pesan `Skrip deploy dan backup, panduan aaPanel, dan audit keamanan`, lalu push `dev`.

---

## Setelah semua task

Jalankan `superpowers:verification-before-completion`, lalu `superpowers:requesting-code-review` untuk seluruh branch. Setelah itu Farhan menjalankan langkah di `docs/DEPLOY-AAPANEL.md` di VPS-nya, dan Claude membantu memeriksa hasilnya.
