# Latihan Coding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambah halaman latihan coding JavaScript berlevel di `/latihan/` dan `/en/practice/`. Kode pengunjung dijalankan di browser mereka, di dalam iframe sandbox, dan teks soalnya bisa ditimpa dari admin.

**Architecture:**
- Soal tinggal di repo, satu folder per soal: `soal.json` berisi meta, teks bawaan ID/EN, dan test, ditambah `starter.js` dan `solution.js`. Server membacanya lewat `lib/latihan/catalog.ts`.
- Penimpaan teks dan status sembunyi disimpan di tabel SQLite `latihan_text`.
- Penilai jawaban adalah satu fungsi mandiri `fdqHarness` di `public/latihan-runner/harness.js`. Fungsi yang sama dipakai di dua tempat:
  - dalam Web Worker (blob) di iframe `sandbox="allow-scripts"`, yang memuat `/latihan-runner/runner.html` dengan CSP sendiri;
  - di Vitest, untuk membuktikan setiap solusi acuan lulus.
- Halaman soal berbicara dengan iframe lewat `postMessage` yang divalidasi.

**Tech Stack:**
- Yang sudah ada: Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3, better-sqlite3 13.0.3, Vitest 5.0.5, dan Playwright yang sudah terpasang.
- Baru, dikunci persis: `@codemirror/state@6.7.6`, `@codemirror/view@6.44.0`, `@codemirror/language@6.13.1`, `@codemirror/lang-javascript@6.2.5`, `@codemirror/commands@6.11.2`.

**Spec:** `docs/superpowers/specs/2026-11-25-latihan-coding-design.md`. Arah visual: `DESIGN.md`. Aturan kerja: `CLAUDE.md`.

## Global Constraints

**Alur kerja**
- Kerja di branch `dev`. Jangan merge ke `main`.
- Sebelum setiap commit: `npm run typecheck` dan `npm test`. Untuk task yang menyentuh halaman, juga `npm run build && npm run test:e2e`.
- Dependensi baru dipasang dengan `--save-exact` di versi yang tertulis di Tech Stack.

**Runner dan keamanan**
- Kode pengunjung tidak pernah dijalankan di server, dan tidak ada endpoint yang menerima kode atau jawaban.
- Header khusus `/latihan-runner/:path*`, persis:
  - CSP: `default-src 'none'; script-src 'self' 'unsafe-eval'; worker-src blob: 'self'; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Robots-Tag: noindex`
- Semua rute lain tetap memakai header yang ada sekarang (CSP utama, `X-Frame-Options: DENY`).
- Iframe runner: `sandbox="allow-scripts"` saja, dan disembunyikan (`hidden`, `aria-hidden="true"`, `tabIndex={-1}`).
- Pesan dari iframe hanya diproses bila `event.source === iframe.contentWindow`. Runner hanya memproses pesan bila `event.source === window.parent`.
- Batas waktu satu kali Jalankan: `2000` ms untuk semua test. Kalau lewat, iframe dihapus lalu dibuat ulang.
- Batas output: 200 baris log, dan 2000 karakter per nilai atau baris (lebih dari itu dipotong, diakhiri `…`).
- Hasil dari runner hanya dirender sebagai teks React. Tidak ada `innerHTML` atau `dangerouslySetInnerHTML` di fitur ini.
- Kode tidak pernah dibaca dari URL (query atau hash).
- Kalau browser tidak bisa membuat worker di runner, tombol Jalankan dinonaktifkan dan ada pesan. Tidak ada eksekusi cadangan di thread utama.

**Editor**
- CodeMirror tanpa autocomplete, saran, lint, atau spellcheck.
- Huruf editor minimal 16 px.

**Tampilan dan teks**
- Mobile dulu dan dicek di 390 px tanpa scroll horizontal. Area sentuh minimal 44×44 px.
- `prefers-reduced-motion` dihormati.
- Dialog konfirmasi bertema, bukan `confirm()` bawaan.
- Teks mengikuti `antislop-copywriting`: tanpa em dash, kata kosong, atau angka karangan. Teks UI dua bahasa ada di `lib/i18n.ts`.
- Teks bawaan soal ada di `soal.json`. Teks yang bisa diubah pemilik ada di DB atau settings.
- Atribusi di footer halaman latihan:
  - ID: "Urutan topik mengikuti coding-interview-university karya John Washam, CC BY-SA 4.0." dengan tautan ke `https://github.com/jwasham/coding-interview-university` dan `https://creativecommons.org/licenses/by-sa/4.0/`.
  - EN: "Topic order follows coding-interview-university by John Washam, CC BY-SA 4.0."

**Path dan penyimpanan**
- Path: `/latihan/`, `/latihan/<id>/`, `/en/practice/`, `/en/practice/<id>/`. `trailingSlash: true`. Id soal sama untuk ID dan EN.
- Kunci localStorage `fdq.latihan.v1`. Setiap akses dibungkus try/catch.

**Level** (nomor, nama ID / EN)

| No | ID | EN |
|---|---|---|
| 1 | Dasar | Basics |
| 2 | Struktur linear | Linear structures |
| 3 | Mencari | Searching |
| 4 | Tree | Trees |
| 5 | Sorting | Sorting |
| 6 | Graf | Graphs |
| 7 | Lanjutan | Advanced |

## Review Focus

1. **CSP `'self'` di iframe yang originnya kosong.**
   - Skrip `/latihan-runner/*.js` harus benar-benar termuat dan worker blob harus jadi di Chromium.
   - Kalau `'self'` tidak cocok untuk dokumen sandbox, runner diam-diam gagal dan semua orang mendapat pesan "browser tidak didukung".
   - Tes: e2e "solusi acuan lulus di browser" di Task 7.
2. **Kode pengunjung yang aneh.** Contohnya:
   - mengubah argumen test;
   - mengembalikan objek siklik, BigInt, Symbol, atau array raksasa;
   - menimpa `JSON`, `Array.prototype.map`, atau `console`;
   - mendeklarasikan nama yang sama dengan variabel harness.

   Penilai tidak boleh crash, dan hasilnya tetap berupa laporan per test. Tes ada di Task 1.
3. **Hasil basi.** Menekan Jalankan dua kali dengan cepat, atau hasil run lama yang tiba setelah timeout, tidak boleh menimpa hasil run terbaru. Tes: `parseRunnerMessage` di Task 4 dan e2e klik ganda di Task 7.
4. **localStorage yang penuh, diblokir, atau berisi data rusak.** Halaman tetap jalan, dan progres dianggap kosong. Tes ada di Task 5.
5. **Soal disembunyikan admin.** Soal itu harus 404 di halaman ID/EN dan di endpoint data. Soal itu juga tidak muncul di daftar, sitemap, "soal berikutnya", atau sebelumnya/berikutnya. Tes ada di Task 3 dan Task 8.

---

## Struktur file

```
latihan/<level>-<order>-<id>/soal.json      meta, teks bawaan ID/EN, test
latihan/<level>-<order>-<id>/starter.js     kode awal
latihan/<level>-<order>-<id>/solution.js    solusi acuan
public/latihan-runner/harness.js            fdqHarness(): penilai (worker + Vitest)
public/latihan-runner/runner.js             sisi iframe: terima pesan, buat worker blob
public/latihan-runner/runner.html           dokumen iframe, hanya <script src>
lib/latihan/types.ts                        tipe Test, GradeSpec, GradeResult, Soal
lib/latihan/catalog.ts                      baca + validasi folder soal (server)
lib/latihan/content.ts                      gabung katalog + DB: visible, byId, teks, admin
lib/latihan/progress.ts                     progres localStorage (klien, fungsi murni)
lib/latihan/runner-client.ts                parseRunnerMessage + createRunner (klien)
app/api/latihan/[id]/[part]/route.ts        GET tests | solution (JSON)
app/(id)/latihan/page.tsx, [id]/page.tsx    halaman ID
app/(en)/en/practice/page.tsx, [id]/page.tsx halaman EN
app/og/latihan/[id]/route.tsx               gambar OG soal
views/PracticeListView.tsx, views/ChallengeView.tsx
components/latihan/{ProgressMarks,Workbench,CodeEditor,ConfirmDialog,InlineCode}.tsx
app/(id)/admin/(panel)/latihan/page.tsx, [id]/page.tsx
app/actions/latihan.ts
tests/latihan-harness.test.ts, latihan-catalog.test.ts, latihan-content.test.ts,
tests/latihan-progress.test.ts, latihan-runner-client.test.ts, latihan-pages.test.ts
e2e/latihan.mjs                             dipanggil dari e2e/run.sh setelah flow.mjs
```

---

### Task 1: Penilai jawaban (`harness.js`)

**Files:**
- Create: `public/latihan-runner/harness.js`
- Create: `lib/latihan/types.ts`
- Create: `tests/helpers/harness.ts`
- Test: `tests/latihan-harness.test.ts`

**Interfaces:**
- Produces `lib/latihan/types.ts`:
  ```ts
  type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
  type FunctionTest = { args: Json[]; expected?: Json; throws?: true; unordered?: true; hidden?: true; example?: true };
  type Op = [string, ...Json[]];                    // ops[0] wajib ["new", ...argsKonstruktor]
  type ClassTest = { ops: Op[]; expected: (Json | { throws: true })[]; hidden?: true; example?: true }; // expected sepanjang ops; untuk "new" isi null
  type GradeSpec = { kind: "function" | "class"; entry: string; tests: (FunctionTest | ClassTest)[] };
  type TestResult = { pass: boolean; got?: string; error?: string };   // got = nilai hasil yang sudah diformat jadi teks
  type GradeResult = { ok: boolean; error?: string; results: TestResult[]; logs: string[] };
  ```
- Produces `harness.js`: satu deklarasi global `function fdqHarness() { ... return { grade }; }` dengan `grade(code: string, spec: GradeSpec): GradeResult`.
  - Fungsinya mandiri: tidak ada referensi ke luar fungsi, jadi `fdqHarness.toString()` bisa dijadikan isi worker blob.
  - Kalau berjalan di worker (`typeof WorkerGlobalScope !== "undefined"`), fungsi ini juga memasang `self.onmessage`. Pesan `{runId, code, spec}` dijawab dengan `postMessage({ type: "result", runId, ...grade(code, spec) })`.
- Produces `tests/helpers/harness.ts`: `loadHarness(): { grade(code, spec): GradeResult }`. Helper ini membaca `harness.js`, menjalankannya dengan `vm.runInNewContext`, lalu memanggil `fdqHarness()`.

- [ ] **Step 1: Tulis test yang gagal** di `tests/latihan-harness.test.ts`, memakai `loadHarness()`:
  - `function: semua lulus`. Kode `function add(a,b){return a+b}`, spec `{kind:"function",entry:"add",tests:[{args:[1,2],expected:3},{args:[0,0],expected:0}]}` → `ok:true`, dan kedua `pass:true`.
  - `function: satu gagal memuat got`. `return a-b` → `results[0]` bernilai `{pass:false, got:"-1"}`.
  - `function: throws diharapkan`. Test `{args:[5], throws:true}`. Kode yang melempar → pass. Kode yang tidak melempar → `pass:false`.
  - `function: exception tak terduga jadi error, bukan crash`. `throw new Error("x")` → `{pass:false, error:"Error: x"}`.
  - `entry tidak ada`. Kode kosong → `ok:false` dengan `error` memuat nama entry, `results` kosong.
  - `syntax error`. `function (` → `ok:false` dengan `error` diawali `SyntaxError`.
  - `unordered`. `[[1,2],[3]]` cocok dengan `[[3],[2,1]]` untuk array luar dan dalam. Tanpa flag, urutan berbeda → gagal.
  - `class: urutan operasi`. Stack: `ops:[["new"],["push",1],["push",2],["pop"],["size"]]`, `expected:[null,null,null,2,1]` → pass. `undefined` dari `push` dianggap `null`.
  - `class: operasi yang diharapkan melempar`. `expected` berisi `{throws:true}` di posisi `["at",9]`.
  - `argumen dikloning`. Kode yang mengubah array argumen tidak memengaruhi test berikutnya yang memakai array yang sama.
  - `nilai aneh tidak crash`. Hasil siklik, `10n`, `Symbol()`, fungsi, dan array 100000 elemen → `pass:false`, dengan `got` berupa teks ≤ 2001 karakter.
  - `console.log ditangkap`. 250 kali `console.log` → `logs.length === 200`. Baris 5000 karakter dipotong menjadi 2000 + `…`. Objek diformat sebagai JSON.
  - `kode pengunjung menimpa global`. Kode yang menjalankan `JSON.stringify = () => "x"; Array.prototype.map = null;` dan mendeklarasikan `var results = 1, grade = 2;` → penilai tetap memberi hasil yang benar untuk fungsi yang benar.
  - `entry tidak valid ditolak`. `entry:"a-b"` → `ok:false`.

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-harness.test.ts`
  Expected: FAIL (berkas `harness.js` belum ada).

- [ ] **Step 3: Tulis `harness.js` dan `types.ts`**

  Pendekatan:
  - Simpan referensi `JSON.stringify`, `Array.isArray`, `Object.keys`, `structuredClone`/kloning JSON, dan `String` di awal `fdqHarness`, sebelum kode pengunjung jalan.
  - Kode pengunjung dibungkus dengan `new Function("console", code + "\n;return typeof ENTRY !== 'undefined' ? ENTRY : undefined;")`. ENTRY sudah dicek dengan `/^[A-Za-z_$][\w$]*$/`.
  - Kesamaan dalam membandingkan nilai yang sudah dinormalisasi: `undefined` menjadi `null`, nilai non-JSON menjadi penanda yang tidak pernah sama dengan nilai yang diharapkan.
  - Pemformatan `got` aman terhadap siklus dan BigInt, lalu dipotong ke 2000 karakter.

- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npx vitest run tests/latihan-harness.test.ts`
  Expected: PASS semua.

- [ ] **Step 5: Commit**
  ```bash
  git add public/latihan-runner/harness.js lib/latihan/types.ts tests/helpers/harness.ts tests/latihan-harness.test.ts
  git commit -m "Latihan: penilai jawaban untuk worker dan Vitest"
  ```

---

### Task 2: Katalog soal, dan tiga soal Level 1

**Files:**
- Create: `lib/latihan/catalog.ts`
- Create: `latihan/1-1-balik-string/`
- Create: `latihan/1-2-dua-angka/`
- Create: `latihan/1-3-vector/` (masing-masing berisi `soal.json`, `starter.js`, `solution.js`)
- Test: `tests/latihan-catalog.test.ts`

**Interfaces:**
- Consumes: `loadHarness()` dan tipe dari Task 1.
- Produces `lib/latihan/catalog.ts`:
  ```ts
  type SoalText = { title: string; story: string; hint1: string; hint2: string };
  type Soal = { id: string; level: number; order: number; kind: "function" | "class"; entry: string; target: string;
                topic: Record<Lang, string>; text: Record<Lang, SoalText>; tests: GradeSpec["tests"]; starter: string; solution: string };
  const LEVELS: { n: number; name: Record<Lang, string> }[];   // tabel Level di Global Constraints
  function loadCatalog(dir?: string): Soal[];                    // urut level lalu order; melempar Error berisi nama folder kalau tidak valid
  function catalog(): Soal[];                                    // loadCatalog() default dir, di-cache di memori
  ```
- Bentuk `soal.json`: `{ id, level, order, kind, entry, target, topic:{id,en}, text:{id:SoalText, en:SoalText}, tests:[...] }`.
- Default dir: `path.join(/*turbopackIgnore: true*/ process.cwd(), "latihan")`, mengikuti pola `lib/db.ts`.
- `story` boleh memakai `` `kode` `` dan baris baru sebagai pemisah paragraf.

- [ ] **Step 1: Tulis test yang gagal** di `tests/latihan-catalog.test.ts`:
  - `loadCatalog` dari folder sementara:
    - melempar error untuk `soal.json` tanpa `text.en.title`;
    - melempar error untuk id duplikat;
    - melempar error untuk `level` di luar 1..7;
    - melempar error untuk `kind` lain;
    - melempar error untuk id yang tidak cocok dengan `/^[a-z0-9]+(-[a-z0-9]+)*$/`;
    - melempar error untuk test class yang `ops[0][0] !== "new"` atau yang `expected.length !== ops.length`.
  - `catalog()` dari repo, untuk setiap soal:
    - `grade(solution, spec).ok === true`;
    - `grade(starter, spec).ok === false`;
    - punya minimal 2 test tanpa `hidden`, minimal 1 test `example`, dan minimal 1 test `hidden`;
    - judul, story, hint1, dan hint2 ID/EN tidak kosong;
    - tidak ada em dash (`—`) di teks.
  - `catalog()` urut berdasarkan `(level, order)`, dan pasangan `(level, order)` unik.

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-catalog.test.ts`
  Expected: FAIL (modul belum ada).

- [ ] **Step 3: Tulis `catalog.ts` dan tiga soal Level 1**
  - `balik-string`: function `reverseString(s)`, target `O(n)`, dilarang memakai `.reverse()` (disebut di story saja, tidak diuji).
  - `dua-angka`: function `twoSum(nums, target)`. Mengembalikan pasangan indeks `[i, j]` dengan `i < j` dan `i` terkecil lebih dulu, lalu `j` terkecil. Kalau tidak ada, mengembalikan `null`. Target `O(n)`.
  - `vector`: class `Vector` dengan `size()`, `capacity()`, `isEmpty()`, `at(i)` (melempar di luar batas), `push`, `insert(i, x)`, `prepend`, `pop`, `delete(i)`, `remove(x)`, `find(x)`. Kapasitas awal 16, berlipat dua saat penuh, dan menjadi setengah saat `size` turun ke 1/4 kapasitas (minimal 16). Ini mengikuti checklist repo sumber.

- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npx vitest run tests/latihan-catalog.test.ts`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add lib/latihan/catalog.ts latihan tests/latihan-catalog.test.ts
  git commit -m "Latihan: katalog soal dari repo dan tiga soal Level 1"
  ```

---

### Task 3: Penimpaan teks dari admin, status sembunyi, dan settings

**Files:**
- Modify: `lib/db.ts` (migrasi baru di akhir `MIGRATIONS`)
- Modify: `lib/settings.ts`
- Create: `lib/latihan/content.ts`
- Test: `tests/latihan-content.test.ts`

**Interfaces:**
- Consumes: `catalog()`, `Soal`, `SoalText` dari Task 2. `freshDataDir()` dari `tests/helpers/tmpdata.ts`.
- Migrasi:
  ```sql
  CREATE TABLE latihan_text (id TEXT PRIMARY KEY, ${bi("title")}, ${bi("story")}, ${bi("hint1")}, ${bi("hint2")}, hidden INTEGER NOT NULL DEFAULT 0);
  ```
- `SETTING_KEYS` ditambah `latihan_intro_id`, `latihan_intro_en`, `seo_latihan_desc_id`, dan `seo_latihan_desc_en`. `BilingualKey` ditambah `"latihan_intro" | "seo_latihan_desc"`.
- Produces `lib/latihan/content.ts`:
  ```ts
  function visibleSoal(): Soal[];                                  // katalog tanpa yang hidden, urutan katalog
  function soalById(id: string): Soal | null;                      // null bila tidak ada atau hidden
  function soalText(s: Soal, lang: Lang): SoalText;                // per kolom: penimpaan <lang> yang tidak kosong, kalau kosong teks bawaan <lang>
  function soalNeighbors(id: string): { prev: Soal | null; next: Soal | null };   // dalam visibleSoal()
  function adminSoalList(): { soal: Soal; hidden: boolean; overridden: boolean }[];
  function adminSoalOverride(id: string): Record<`${keyof SoalText}_${Lang}`, string> & { hidden: boolean };
  function saveLatihanTextData(id: string, input: Record<string, unknown>): ActionState;  // ActionState dari components/admin/ActionForm
  function setLatihanHidden(id: string, hidden: boolean): void;
  ```
- Batas panjang di `saveLatihanTextData`: title 120, story 4000, hint 1000. Error per kolom dalam bahasa Indonesia.
- Id yang tidak ada di katalog menghasilkan `{ok:false}` dengan pesan "Soal tidak dikenal."

- [ ] **Step 1: Tulis test yang gagal** di `tests/latihan-content.test.ts`. Setiap test memakai `freshDataDir()`.
  - Tanpa penimpaan, `soalText(s,"en").title` sama dengan teks bawaan EN.
  - Penimpaan `title_en` membuat teks EN berubah. ID tetap memakai bawaan. Penimpaan berisi spasi saja dianggap kosong.
  - `setLatihanHidden(id, true)` berakibat:
    - `soalById(id) === null`;
    - id hilang dari `visibleSoal()`;
    - `soalNeighbors` melompatinya.
  - `saveLatihanTextData` menolak title sepanjang 121 karakter dengan `errors.title_id`, dan menolak id yang tidak dikenal.
  - Migrasi berjalan di DB yang sudah ada isinya, dengan `user_version` naik satu.
  - `getSetting("latihan_intro","en")` kembali ke `_id` kalau EN kosong.

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-content.test.ts`
  Expected: FAIL.

- [ ] **Step 3: Implementasi migrasi, settings, dan `content.ts`**

- [ ] **Step 4: Jalankan sampai lulus, ditambah seluruh suite**

  Run: `npx vitest run tests/latihan-content.test.ts && npm test`
  Expected: PASS, termasuk `tests/db.test.ts` yang sudah ada.

- [ ] **Step 5: Commit**
  ```bash
  git add lib/db.ts lib/settings.ts lib/latihan/content.ts tests/latihan-content.test.ts
  git commit -m "Latihan: penimpaan teks dan status sembunyi di SQLite"
  ```

---

### Task 4: Rute runner, header, dan klien runner

**Files:**
- Create: `public/latihan-runner/runner.html`
- Create: `public/latihan-runner/runner.js`
- Modify: `next.config.ts` (aturan header kedua untuk `/latihan-runner/:path*`, diletakkan setelah aturan umum supaya nilainya menang)
- Create: `lib/latihan/runner-client.ts`
- Create: `e2e/latihan.mjs`
- Modify: `e2e/run.sh` (jalankan `node e2e/latihan.mjs` setelah `flow.mjs`)
- Test: `tests/latihan-runner-client.test.ts`

**Interfaces:**
- Consumes: `fdqHarness` (global dari `harness.js`), tipe `GradeSpec` dan `GradeResult`.
- `runner.html`: dokumen minimal tanpa skrip inline, berisi `<script src="/latihan-runner/harness.js">` dan `<script src="/latihan-runner/runner.js">`.
- `runner.js`:
  - Saat dimuat, membuat worker blob uji (`postMessage("pong")`, batas 1000 ms), lalu mengirim `{type:"ready", workerOk}` ke `parent`.
  - Menerima `{type:"run", runId, code, spec}` hanya dari `window.parent`, dengan bentuk yang dicek.
  - Membuat worker baru dari `new Blob(["(" + fdqHarness.toString() + ")()"])` untuk setiap run. Worker run sebelumnya di-terminate.
  - Meneruskan hasil `{type:"result", runId, ...}` dengan `parent.postMessage(msg, location.origin)`.
- Produces `lib/latihan/runner-client.ts`:
  ```ts
  const TIMEOUT_MS = 2000;
  type RunnerMsg = { type: "ready"; workerOk: boolean } | ({ type: "result"; runId: number } & GradeResult);
  function parseRunnerMessage(data: unknown, testCount: number): RunnerMsg | null;
  type RunOutcome = { status: "done"; result: GradeResult } | { status: "timeout" } | { status: "unsupported" };
  function createRunner(host: HTMLElement): { ready: Promise<boolean>; run(code: string, spec: GradeSpec): Promise<RunOutcome>; destroy(): void };
  ```
- `parseRunnerMessage` hanya menerima bentuk yang persis:
  - `results.length <= testCount`;
  - setiap `pass` bertipe boolean;
  - `got` dan `error` berupa string, dipotong ke 2000 karakter;
  - `logs` berupa array string, dipotong ke 200 baris × 2000 karakter;
  - selain itu, hasilnya `null`.
- `createRunner`:
  - Memasang iframe sesuai Global Constraints dan menyaring pesan dengan `event.source === iframe.contentWindow`.
  - Setiap run mendapat `runId` yang naik. Hasil dengan `runId` lain dibuang.
  - Kalau lewat `TIMEOUT_MS`, iframe dihapus dan dibuat ulang, lalu hasilnya `{status:"timeout"}`.
  - Kalau `ready` bernilai `workerOk:false` atau tidak datang dalam 3000 ms, hasilnya `{status:"unsupported"}`.

- [ ] **Step 1: Tulis test yang gagal**
  - Di `tests/latihan-runner-client.test.ts`, untuk `parseRunnerMessage`:
    - menerima ready dan result yang sah;
    - `null` untuk string, `null`, type lain, `pass:"yes"`, dan `results` lebih panjang dari `testCount`;
    - memotong `got` 5000 karakter menjadi ≤ 2001 karakter, dan `logs` 300 baris menjadi 200.
  - Di `e2e/latihan.mjs` (pola `check()` sama dengan `flow.mjs`), lewat `fetch`:
    - `/latihan-runner/runner.html` menjawab 200;
    - header CSP-nya persis nilai Global Constraints;
    - `X-Frame-Options` bernilai `SAMEORIGIN`;
    - `/` tetap `DENY` dan CSP utama tidak memuat `unsafe-eval`.

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-runner-client.test.ts`
  Expected: FAIL.

  Run: `npm run build && npm run test:e2e`
  Expected: FAIL pada cek runner.

- [ ] **Step 3: Implementasi `runner.html`, `runner.js`, header, dan `runner-client.ts`**

  Kalau Next mengalihkan `runner.html` ke versi dengan garis miring (efek `trailingSlash`), pakai path yang tidak dialihkan. Catat sebagai ruling.

- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npx vitest run tests/latihan-runner-client.test.ts && npm test && npm run typecheck`
  Expected: PASS.

  Run: `npm run build && npm run test:e2e`
  Expected: PASS semua cek, termasuk `flow.mjs` yang lama.

- [ ] **Step 5: Commit**
  ```bash
  git add public/latihan-runner next.config.ts lib/latihan/runner-client.ts tests/latihan-runner-client.test.ts e2e/latihan.mjs e2e/run.sh
  git commit -m "Latihan: runner di iframe sandbox dengan CSP sendiri"
  ```

---

### Task 5: Progres di browser

**Files:**
- Create: `lib/latihan/progress.ts`
- Test: `tests/latihan-progress.test.ts`

**Interfaces:**
- Produces:
  ```ts
  const PROGRESS_KEY = "fdq.latihan.v1";
  type Entry = { status?: "passed" | "viewed"; passedAt?: number; draft?: string };
  type Progress = Record<string, Entry>;
  function safeStorage(): Storage | null;                          // null kalau tidak ada atau setItem melempar
  function readProgress(store: Storage | null): Progress;          // data rusak, bukan objek, atau entri berbentuk lain → diabaikan
  function writeProgress(store: Storage | null, p: Progress): boolean; // false kalau gagal (kuota penuh), tanpa melempar
  function markPassed(p: Progress, id: string, now: number): Progress;
  function markViewed(p: Progress, id: string): Progress;          // tidak menurunkan "passed"
  function setDraft(p: Progress, id: string, code: string): Progress;
  function nextUp(ids: string[], p: Progress): string | null;      // id pertama yang belum "passed"
  function recommendedAfter(levels: { n: number; ids: string[] }[], p: Progress): number | null; // nomor level pertama yang belum semua "passed"
  ```
- Semua fungsi `mark*` dan `setDraft` mengembalikan objek baru, tidak mengubah input.

- [ ] **Step 1: Tulis test yang gagal**, dengan `Storage` palsu berbasis `Map`:
  - JSON rusak dan nilai `"[]"` → `{}`.
  - Entri dengan `status:"x"` → status dibuang, draf tetap.
  - Storage yang `setItem`-nya melempar `QuotaExceededError` → `writeProgress` mengembalikan `false`.
  - `readProgress(null)` → `{}`.
  - `markViewed` setelah `markPassed` → tetap `"passed"`.
  - `markPassed` setelah `markViewed` → `"passed"`.
  - `nextUp(["a","b"], {a:{status:"passed"}}) === "b"`, dan `null` kalau semua lulus.
  - `nextUp` memperlakukan `"viewed"` sebagai belum lulus.
  - `recommendedAfter`: level 1 belum selesai → `1`. Semua selesai → `null`.

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-progress.test.ts`
  Expected: FAIL.

- [ ] **Step 3: Implementasi**

- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npx vitest run tests/latihan-progress.test.ts`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add lib/latihan/progress.ts tests/latihan-progress.test.ts
  git commit -m "Latihan: progres dan draf di localStorage"
  ```

---

### Task 6: Halaman publik (tanpa editor), endpoint data, path, sitemap, menu, dan OG

**Files:**
- Modify: `lib/paths.ts`
- Modify: `lib/i18n.ts`
- Modify: `lib/seo-pages.ts`
- Modify: `app/sitemap.ts`
- Modify: `proxy.ts` (tambah matcher `/latihan/:path*`, `/en/practice/:path*`, `/api/latihan/:path*`)
- Modify: `components/site/Header.tsx` (tautan "Latihan"/"Practice")
- Modify: `components/site/Footer.tsx` (prop opsional `note?: React.ReactNode` untuk atribusi)
- Create: `app/(id)/latihan/page.tsx`, `app/(id)/latihan/[id]/page.tsx`
- Create: `app/(en)/en/practice/page.tsx`, `app/(en)/en/practice/[id]/page.tsx`
- Create: `views/PracticeListView.tsx`, `views/ChallengeView.tsx`
- Create: `components/latihan/InlineCode.tsx`, `components/latihan/ProgressMarks.tsx`
- Create: `app/api/latihan/[id]/[part]/route.ts`
- Create: `app/og/latihan/[id]/route.tsx`
- Modify: `components/site/PublicShell.tsx` (teruskan `footNote`)
- Test: `tests/latihan-pages.test.ts`, `e2e/latihan.mjs`

**Interfaces:**
- Consumes: `visibleSoal`, `soalById`, `soalText`, `soalNeighbors`, `LEVELS`, `getSetting("latihan_intro"|"seo_latihan_desc", lang)`, dan `readProgress`/`safeStorage`/`nextUp`/`recommendedAfter`.
- Produces `lib/paths.ts`:
  - `practicePath(lang)` → `"/latihan/"` atau `"/en/practice/"`.
  - `challengePath(lang, id)` → `practicePath(lang) + encodeURIComponent(id) + "/"`.
  - `alternatePath` memetakan kedua pola itu ke bahasa lain.
- Produces `lib/seo-pages.ts`:
  - `practiceMetadata(lang)`. Deskripsi diambil dari `seo_latihan_desc`, dengan kalimat bawaan kalau kosong.
  - `challengeMetadata(lang, id)`. Soal yang tidak ada atau disembunyikan → `robots:{index:false}`. Gambar OG: `/og/latihan/<id>/` + `?lang=en` di EN.
- Produces `lib/text.ts`: `codeSpans(text: string): (string | { code: string })[]`, yang memecah teks di backtick. Backtick tanpa pasangan dibiarkan sebagai teks.
- Produces `app/api/latihan/[id]/[part]/route.ts`:
  - `GET` dengan `part` `tests` → `{ kind, entry, tests }`.
  - `part` `solution` → `{ solution }`.
  - Soal tidak ada atau hidden, atau `part` lain → 404.
  - Header `Cache-Control: no-store`.
- `ChallengeView` merender di server:
  - level dan topik, judul (h1), story (paragraf dengan `InlineCode`), contoh dari test `example` (input dan output yang diharapkan), dan target;
  - `starter` di dalam `<pre><code>` sebagai pengganti editor tanpa JS;
  - `<noscript>`: "Menjalankan kode butuh JavaScript.";
  - petunjuk 1 dan 2 sebagai `<details>`;
  - tautan sebelumnya/berikutnya.

  Task 7 mengganti blok `<pre>` dengan Workbench di klien.
- `PracticeListView`: pengantar dari settings (dengan teks bawaan kalau kosong), lalu 7 kelompok level berisi soal yang terlihat. Level tanpa soal terlihat tidak ditampilkan.
  - `ProgressMarks` (klien) menambah tanda status per soal, bilah progres per level, label "disarankan setelah Level N", dan tombol "Lanjut: <judul>".
  - Tanpa JS, semua itu tidak tampil dan daftar tetap utuh.
- Teks UI baru masuk `lib/i18n.ts` untuk ID dan EN, termasuk `nav_practice`, label status, tombol, pesan runner, dan atribusi.

- [ ] **Step 1: Tulis test yang gagal**
  - `tests/latihan-pages.test.ts`:
    - `practicePath`, `challengePath`, dan `alternatePath("id","/latihan/vector/") === "/en/practice/vector/"`, serta kebalikannya;
    - `codeSpans("pakai `push` lalu `pop`")`;
    - `codeSpans` dengan backtick tunggal;
    - `sitemap()` memuat `/latihan/` dan `/en/practice/vector/`, dan tidak memuat soal yang di-hidden. Test ini memakai `freshDataDir` dan `setLatihanHidden`.
  - `e2e/latihan.mjs`, ditambah:
    - `/latihan/` menampilkan 3 soal Level 1 dan atribusi berisi tautan ke repo sumber;
    - `/en/practice/vector/` berbahasa Inggris dan pengalih bahasa menuju `/latihan/vector/`;
    - `/latihan/tidak-ada/` menjawab 404, begitu juga `/api/latihan/tidak-ada/tests/` dan `/latihan/%E0%A4%A/`;
    - `/api/latihan/vector/tests/` menjawab 200 JSON;
    - konteks dengan `javaScriptEnabled:false`: `/latihan/balik-string/` memuat judul, story, contoh, dan `<pre>` kode awal;
    - lebar 390 px: `document.documentElement.scrollWidth <= 390`;
    - tautan "Latihan" ada di header.

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-pages.test.ts`
  Expected: FAIL.

  Run: `npm run build && npm run test:e2e`
  Expected: FAIL pada cek halaman.

- [ ] **Step 3: Implementasi**

  Gaya mengikuti `DESIGN.md` dan pola halaman proyek: panel kaca, huruf mono untuk kode, dan aksen merah dipakai hemat. Muat `antislop`, `antislop-ui`, `antislop-layoutmobile`, dan `antislop-copywriting` sebelum menulis tampilan dan teks.

- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npm run typecheck && npm test && npm run build && npm run test:e2e`
  Expected: PASS semua.

- [ ] **Step 5: Commit**
  ```bash
  git add -A lib app views components proxy.ts tests e2e
  git commit -m "Latihan: halaman daftar dan soal, endpoint data, sitemap, dan menu"
  ```

---

### Task 7: Workbench: editor, Jalankan, hasil, petunjuk, dan solusi

**Files:**
- Modify: `package.json`, `package-lock.json` (CodeMirror, versi di Tech Stack)
- Create: `components/latihan/CodeEditor.tsx`
- Create: `components/latihan/Workbench.tsx`
- Create: `components/latihan/ConfirmDialog.tsx`
- Modify: `views/ChallengeView.tsx`
- Modify: `app/globals.css` (atau berkas CSS latihan yang diimpor dari sana)
- Test: `e2e/latihan.mjs`

**Interfaces:**
- Consumes: `createRunner`, `RunOutcome` (Task 4), `safeStorage`/`readProgress`/`writeProgress`/`markPassed`/`markViewed`/`setDraft` (Task 5), dan endpoint `/api/latihan/<id>/tests|solution/` (Task 6).
- `CodeEditor`:
  - Props `{ initial: string; onChange(code: string): void; label: string }`. Dimuat dengan `next/dynamic` (`ssr:false`).
  - Ekstensi: `lineNumbers`, `history`, `indentOnInput`, `bracketMatching`, `closeBrackets`, `javascript()`, keymap default plus `indentWithTab`, dan tema dari token `DESIGN.md`.
  - Tidak memakai `basicSetup`, karena paket itu membawa autocomplete. Atribut `spellcheck=false`, `autocorrect=off`, dan `autocapitalize=off` dipasang di contenteditable.
  - Teks bantuan di bawah editor: "Tab menambah indentasi. Tekan Esc lalu Tab untuk keluar dari editor."
- `Workbench`: props `{ id: string; lang: Lang; starter: string; kind; entry }`.
  - Draf disimpan dengan debounce 500 ms. Kalau ada draf, editor dimulai dari draf itu.
  - **Jalankan**:
    - Tombol nonaktif selama run.
    - Test diambil sekali lalu disimpan di memori.
    - Hasil ditampilkan per test. Test tersembunyi hanya menampilkan lulus atau gagal.
    - Ringkasan "N dari M test lulus" ditaruh di region `aria-live="polite"`.
    - Kalau semua lulus, `markPassed` dipanggil dan solusi ditampilkan.
  - Waktu habis → pesan bahwa mungkin ada loop tak berujung. Runner tidak didukung → tombol nonaktif dengan pesan.
  - Panel Output untuk `logs`.
  - **Reset** dan **Menyerah, lihat solusi** memakai `ConfirmDialog` (`<dialog>` bertema). Menyerah memanggil `markViewed` lalu mengambil solusi.

- [ ] **Step 1: Tulis cek e2e yang gagal** di `e2e/latihan.mjs`:
  - `/latihan/vector/`: menempel solusi acuan (diambil dari `/api/latihan/vector/solution/`) ke editor, lalu Jalankan → ringkasan "semua lulus", dan setelah reload daftar menandai soal itu lulus;
  - kode `function reverseString(s){ while(true){} }` → pesan waktu habis muncul dalam ≤ 4 detik, lalu run berikutnya dengan solusi yang benar tetap lulus (iframe sudah dibuat ulang);
  - kode yang mencoba `fetch("/")` dan `document.cookie` lalu mengembalikan hasilnya → test gagal dengan error, dan log server tidak menerima request dari runner (hitung request ke `/` lewat `page.on("request")` selama run);
  - kode yang memanggil `localStorage.getItem` → error, bukan nilai;
  - kode dengan `console.log("<img src=x onerror=alert(1)>")` → tampil sebagai teks, dan `page.on("dialog")` tidak pernah terpicu;
  - klik Jalankan dua kali dengan cepat → hanya satu ringkasan, dan ringkasan itu dari run terakhir;
  - di editor, ketik `arr.` lalu tunggu 1 detik → tidak ada `.cm-tooltip-autocomplete`;
  - Menyerah → dialog bertema, lalu konfirmasi → solusi tampil dan daftar menandai "dilihat";
  - Reset → dialog, lalu konfirmasi → editor kembali ke kode awal;
  - hitArea 44 px untuk Jalankan, Reset, dan Menyerah;
  - 390 px tanpa scroll horizontal;
  - tidak ada error console (pola `errors` di `flow.mjs`).

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npm run build && npm run test:e2e`
  Expected: FAIL pada cek Workbench.

- [ ] **Step 3: Pasang CodeMirror dan implementasi**
  ```bash
  npm install --save-exact @codemirror/state@6.7.6 @codemirror/view@6.44.0 @codemirror/language@6.13.1 @codemirror/lang-javascript@6.2.5 @codemirror/commands@6.11.2
  ```

- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npm run typecheck && npm test && npm run build && npm run test:e2e`
  Expected: PASS semua.

- [ ] **Step 5: Commit**
  ```bash
  git add package.json package-lock.json components views app/globals.css e2e
  git commit -m "Latihan: editor, Jalankan, hasil test, petunjuk, dan solusi"
  ```

---

### Task 8: Admin Latihan

**Files:**
- Create: `app/(id)/admin/(panel)/latihan/page.tsx`
- Create: `app/(id)/admin/(panel)/latihan/[id]/page.tsx`
- Create: `app/actions/latihan.ts`
- Modify: `components/admin/AdminNav.tsx` (tambah `["/admin/latihan/", "Latihan"]`)
- Test: `tests/latihan-content.test.ts` (tambahan), `e2e/latihan.mjs`

**Interfaces:**
- Consumes: `adminSoalList`, `adminSoalOverride`, `saveLatihanTextData`, `setLatihanHidden`, `setSettings`, `getSetting`, `requireAdmin`, `ActionForm`, `LangFields`, dan `ConfirmButton`.
- Produces `app/actions/latihan.ts`:
  - `saveLatihanText(prev, form)`, `toggleLatihanHidden(form)`, dan `saveLatihanIntro(prev, form)`.
  - Masing-masing diawali `await requireAdmin()` dan diakhiri `revalidatePath("/", "layout")`.
- Halaman daftar:
  - Kelompok per level.
  - Status per soal: "Tampil" atau "Disembunyikan", dan "Teks diubah" kalau ada penimpaan.
  - Tombol sembunyikan atau tampilkan, memakai `ConfirmButton`.
  - Form pengantar (`latihan_intro`) dan deskripsi SEO (`seo_latihan_desc`) dalam ID/EN.
- Halaman edit: `LangFields` untuk title, story, hint1, dan hint2. Teks bawaan menjadi placeholder, dan petunjuk menjelaskan "Kosong berarti memakai teks bawaan".
- Setiap `page.tsx` memanggil `await requireAdmin("/admin/latihan/...")` sendiri.

- [ ] **Step 1: Tulis test yang gagal**
  - Di `tests/latihan-content.test.ts`: `saveLatihanTextData` dengan semua kolom kosong menghapus penimpaan (`overridden:false`), tanpa mengubah `hidden`.
  - Di `e2e/latihan.mjs`:
    - `/admin/latihan/` tanpa login → dialihkan ke `/admin/masuk/?next=...`;
    - setelah login, mengubah judul EN `vector` lalu menyimpan → `/en/practice/vector/` menampilkan judul baru;
    - menyembunyikan `dua-angka` berakibat:
      - `/latihan/dua-angka/` 404;
      - `/api/latihan/dua-angka/solution/` 404;
      - soal itu tidak ada di `/latihan/`;
      - soal itu bukan tautan "berikutnya" dari `balik-string`;
    - menampilkannya lagi mengembalikan semuanya;
    - 390 px tanpa scroll horizontal di kedua halaman admin.

- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-content.test.ts && npm run build && npm run test:e2e`
  Expected: FAIL pada cek baru.

- [ ] **Step 3: Implementasi**

- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npm run typecheck && npm test && npm run build && npm run test:e2e`
  Expected: PASS semua.

- [ ] **Step 5: Commit**
  ```bash
  git add app components tests e2e
  git commit -m "Latihan: panel admin untuk teks, pengantar, dan sembunyikan soal"
  ```

---

### Task 9: Soal Level 2 sampai 4 (9 soal)

**Files:**
- Create: 9 folder di `latihan/`.
- Test: `tests/latihan-catalog.test.ts` (sudah memeriksa setiap soal), ditambah satu assertion jumlah.

Soal dan aturan supaya jawabannya tunggal:

| Folder | Kind / entry | Aturan |
|---|---|---|
| `2-1-kurung-seimbang` | function `isBalanced(s)` | `()[]{}`, karakter lain diabaikan |
| `2-2-queue-dua-stack` | class `Queue` | `enqueue`, `dequeue` (melempar kalau kosong), `peek`, `size`. Story meminta dua array yang hanya memakai push/pop. Aturan ini tidak diuji. |
| `2-3-linked-list` | class `LinkedList` | `size`, `isEmpty`, `valueAt(i)`, `pushFront`, `popFront`, `pushBack`, `popBack`, `insert(i,v)`, `erase(i)`, `reverse`, `toArray`. Indeks di luar batas melempar. |
| `3-1-binary-search` | function `binarySearch(arr, x)` | Indeks atau `-1`. Kalau ada nilai ganda, ambil indeks terkecil. |
| `3-2-posisi-sisip` | function `searchInsert(arr, x)` | Indeks pertama dengan `arr[i] >= x` |
| `3-3-hitung-bit` | function `countBits(n)` | `n` bilangan bulat 0..2^31−1 |
| `4-1-bst` | class `BST` | `insert`, `contains`, `min`, `max` (`null` kalau kosong), `height` (pohon kosong 0), `inorder()` → array. Nilai ganda diabaikan. |
| `4-2-traversal` | function `traverse(tree, order)` | `tree` berupa `{v, l, r}` atau `null`. `order` salah satu dari `pre`, `in`, `post`, atau `level`. |
| `4-3-min-heap` | class `MinHeap` | `insert`, `peek`, `extractMin` (`null` kalau kosong), `size` |

- [ ] **Step 1: Tambah assertion yang gagal** `catalog().filter(s => s.level <= 4).length === 12`.
- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-catalog.test.ts`
  Expected: FAIL (jumlahnya 3).

- [ ] **Step 3: Tulis 9 soal.** Ikuti aturan teks di Global Constraints. Klaim di story harus faktual.
- [ ] **Step 4: Jalankan sampai lulus**

  Run: `npx vitest run tests/latihan-catalog.test.ts && npm test`
  Expected: PASS. Setiap solusi lulus, dan setiap starter gagal.

- [ ] **Step 5: Commit**
  ```bash
  git add latihan tests/latihan-catalog.test.ts
  git commit -m "Latihan: soal Level 2 sampai 4"
  ```

---

### Task 10: Soal Level 5 sampai 7 (9 soal), dokumentasi, dan cek akhir

**Files:**
- Create: 9 folder di `latihan/`.
- Modify: `README.md` (bagian Latihan: cara menambah soal)
- Modify: `docs/AUDIT-KEAMANAN.md` (bagian runner: sandbox, CSP, postMessage, batas)
- Test: `tests/latihan-catalog.test.ts`

| Folder | Kind / entry | Aturan |
|---|---|---|
| `5-1-insertion-sort` | function `insertionSort(arr)` | Mengembalikan array baru yang terurut naik. Story melarang `.sort()`. Aturan ini tidak diuji. |
| `5-2-merge-sort` | function `mergeSort(arr)` | Sama |
| `5-3-quick-sort` | function `quickSort(arr)` | Sama |
| `6-1-jarak-terpendek` | function `shortestPath(n, edges, from, to)` | Graf tak berarah tanpa bobot, simpul `0..n-1`. Mengembalikan panjang lintasan, atau `-1`. |
| `6-2-ada-siklus` | function `hasCycle(n, edges)` | Graf berarah |
| `6-3-urutan-topologis` | function `topoSort(n, edges)` | Kalau ada beberapa pilihan, ambil simpul bernomor terkecil dulu. Graf yang punya siklus → `null`. |
| `7-1-permutasi` | function `permutations(s)` | Semua permutasi unik, urut leksikografis |
| `7-2-jalan-grid` | function `gridPaths(grid)` | `grid` berisi 0 (jalan) dan 1 (tembok). Gerak hanya ke kanan atau ke bawah. Mengembalikan jumlah jalan dari kiri atas ke kanan bawah. |
| `7-3-trie` | class `Trie` | `insert(w)`, `has(w)`, `startsWith(p)` → `boolean`, `wordsWith(p)` → array urut leksikografis |

- [ ] **Step 1: Tambah assertion yang gagal**: `catalog().length === 21`, dan setiap level 1..7 punya tepat 3 soal.
- [ ] **Step 2: Jalankan dan pastikan gagal**

  Run: `npx vitest run tests/latihan-catalog.test.ts`
  Expected: FAIL (jumlahnya 12).

- [ ] **Step 3: Tulis 9 soal**, lalu perbarui README dan `docs/AUDIT-KEAMANAN.md`.
- [ ] **Step 4: Jalankan semua**

  Run: `npm run typecheck && npm test && npm run build && npm run test:e2e`
  Expected: PASS semua.

- [ ] **Step 5: Commit**
  ```bash
  git add latihan tests README.md docs/AUDIT-KEAMANAN.md
  git commit -m "Latihan: soal Level 5 sampai 7 dan dokumentasi"
  ```
