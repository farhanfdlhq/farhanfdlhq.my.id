// Uji fitur latihan coding di browser sungguhan. Dijalankan oleh e2e/run.sh setelah flow.mjs (butuh BASE, ADMIN_EMAIL, ADMIN_PW, DATA_DIR).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.BASE || "http://127.0.0.1:3399";
const results = [];
const check = (name, ok, extra = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); };
const RUNNER_CSP = "default-src 'none'; script-src 'self' 'unsafe-eval'; worker-src blob: 'self'; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'";

const errors = [];
const watch = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${m.text()} [${m.location()?.url || page.url()}]`); });
};
const browser = await chromium.launch();
try {
  // ---------- Header runner ----------
  for (const f of ["runner.html", "runner.js", "harness.js"]) {
    const r = await fetch(`${BASE}/latihan-runner/${f}`, { redirect: "manual" });
    check(`runner: ${f} 200`, r.status === 200, String(r.status));
    check(`runner: ${f} CSP khusus`, r.headers.get("content-security-policy") === RUNNER_CSP, r.headers.get("content-security-policy") ?? "");
    check(`runner: ${f} X-Frame-Options SAMEORIGIN`, r.headers.get("x-frame-options") === "SAMEORIGIN", r.headers.get("x-frame-options") ?? "");
    check(`runner: ${f} noindex`, (r.headers.get("x-robots-tag") ?? "").includes("noindex"));
  }
  const home = await fetch(BASE + "/");
  check("beranda tetap X-Frame-Options DENY", home.headers.get("x-frame-options") === "DENY");
  check("CSP utama tanpa unsafe-eval", !(home.headers.get("content-security-policy") ?? "").includes("unsafe-eval"));
  check("runner.html tanpa skrip inline", !/<script>(?!<\/script>)|<script(?![^>]*\bsrc=)[^>]*>/.test(await (await fetch(`${BASE}/latihan-runner/runner.html`)).text()));

  // ---------- Halaman publik ----------
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(BASE + "/latihan/");
  const titles = await page.locator(".soal-list a.soal-link").allTextContents();
  check("daftar: tiga soal Level 1 tampil", titles.length >= 3 && titles.slice(0, 3).join("|").includes("Balik string"), titles.join(" | "));
  check("daftar: atribusi ke repo sumber", (await page.locator('.foot a[href="https://github.com/jwasham/coding-interview-university"]').count()) === 1);
  check("header: tautan Latihan", (await page.locator('.navlinks a[href="/latihan/"]').count()) === 1);
  await page.goto(BASE + "/en/practice/vector/");
  check("soal EN berbahasa Inggris", (await page.locator("h1").textContent())?.includes("Build your own vector"));
  await page.locator(".langs a[hreflang=id]").click();
  await page.waitForURL(/\/latihan\/vector\/$/);
  check("ganti bahasa: soal EN ke ID", (await page.locator("h1").textContent())?.includes("Vector buatanmu sendiri"));
  for (const path of ["/latihan/tidak-ada/", "/en/practice/tidak-ada/", "/api/latihan/tidak-ada/tests/", "/api/latihan/vector/lain/", "/latihan/%E0%A4%A/"]) {
    const r = await fetch(BASE + path);
    check(`404: ${path}`, r.status === 404, String(r.status));
  }
  const data = await fetch(BASE + "/api/latihan/vector/tests/");
  const json = await data.json().catch(() => null);
  check("data test: JSON dengan kind, entry, tests", data.status === 200 && json?.entry === "Vector" && Array.isArray(json?.tests));
  check("data test: no-store", (data.headers.get("cache-control") ?? "").includes("no-store"));
  const sol = await (await fetch(BASE + "/api/latihan/vector/solution/")).json().catch(() => null);
  check("data solusi: ada", typeof sol?.solution === "string" && sol.solution.includes("class Vector"));
  const html = await (await fetch(BASE + "/latihan/balik-string/")).text();
  check("HTML soal tidak memuat solusi", !html.includes("out += s[i]"));
  await ctx.close();

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const np = await nojs.newPage();
  await np.goto(BASE + "/latihan/balik-string/");
  const main = await np.locator("main").textContent();
  check("tanpa JS: judul, cerita, contoh, dan kode awal", main.includes("Balik string") && main.includes("reverseString") && (await np.locator(".examples").count()) === 1 && (await np.locator("pre.starter").count()) === 1);
  check("tanpa JS: petunjuk sebagai details", (await np.locator("details.hint").count()) === 2);
  await np.goto(BASE + "/latihan/");
  check("tanpa JS: daftar lengkap", (await np.locator(".soal-list a.soal-link").count()) >= 3);
  await nojs.close();

  const m = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await m.newPage();
  watch(mp);
  for (const path of ["/latihan/", "/latihan/vector/", "/en/practice/dua-angka/"]) {
    await mp.goto(BASE + path);
    await mp.waitForTimeout(300);
    const sw = await mp.evaluate(() => document.documentElement.scrollWidth);
    check(`390 px tanpa scroll horizontal: ${path}`, sw <= 390, String(sw));
  }
  await m.close();

  // ---------- Workbench: editor dan runner ----------
  const hitArea = (pg, sel) => pg.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return "tidak ada";
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const ok = [[cx, cy - 21], [cx, cy + 21], [cx - 21, cy], [cx + 21, cy]].every(([x, y]) => { const hit = document.elementFromPoint(x, y); return hit && (hit === el || el.contains(hit)); });
    return ok ? "ok" : `${Math.round(r.width)}x${Math.round(r.height)}`;
  }, sel);
  const wctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const wp = await wctx.newPage();
  watch(wp);
  let dialogs = 0;
  wp.on("dialog", (d) => { dialogs++; d.dismiss(); });
  const leaks = [];
  wp.on("request", (r) => { if (r.url().includes("leak")) leaks.push(r.url()); });
  const setCode = async (code) => { await wp.locator(".cm-content").fill(code); await wp.waitForTimeout(100); };
  const runAndWait = async () => {
    await wp.locator("#run").click();
    await wp.waitForFunction(() => { const b = document.querySelector("#run"); return b && !b.disabled; }, null, { timeout: 8000 });
  };
  const summary = async () => (await wp.locator(".run-summary").textContent()) ?? "";

  await wp.goto(BASE + "/latihan/vector/");
  await wp.locator(".cm-content").waitFor();
  const vecSol = (await (await fetch(BASE + "/api/latihan/vector/solution/")).json()).solution;
  await setCode(vecSol);
  await runAndWait();
  check("vector: solusi acuan lulus di browser", (await summary()).includes("Semua test lulus"), await summary());
  check("vector: solusi tampil setelah lulus", await wp.locator(".solution pre").isVisible());
  check("test tersembunyi tanpa input", (await wp.locator(".test-results li.hidden-test").count()) > 0 && !(await wp.locator(".test-results li.hidden-test").first().textContent()).includes("Vector("));
  await wp.goto(BASE + "/latihan/");
  await wp.locator(".state-passed").first().waitFor({ timeout: 3000 }).catch(() => {});
  check("daftar: vector ditandai lulus", (await wp.locator('li:has(a[href="/latihan/vector/"]) .state-passed').count()) === 1);
  check("daftar: tombol Lanjut ke soal belum lulus", (await wp.locator(".practice-next a").getAttribute("href")) === "/latihan/balik-string/");

  await wp.goto(BASE + "/latihan/balik-string/");
  await wp.locator(".cm-content").waitFor();
  await setCode("function reverseString(s) { while (true) {} }");
  const t0 = Date.now();
  await runAndWait();
  check("loop tak berujung berhenti dengan pesan waktu habis", (await wp.locator(".run-error").textContent() ?? "").includes("2 detik") && Date.now() - t0 < 4500, String(Date.now() - t0) + " ms");
  await setCode("function reverseString(s) { let o = ''; for (let i = s.length - 1; i >= 0; i--) o += s[i]; return o }");
  await runAndWait();
  check("setelah waktu habis, run berikutnya tetap jalan", (await summary()).includes("Semua test lulus"), await summary());

  await setCode("function reverseString(s) { fetch('/?leak=1').catch(() => {}); try { new XMLHttpRequest().open('GET', '/?leak=2'); } catch (e) {} return document.cookie }");
  await runAndWait();
  await wp.waitForTimeout(500);
  check("kode pengunjung: tidak bisa fetch atau XHR", leaks.length === 0, leaks.join(" "));
  check("kode pengunjung: document.cookie tidak ada", (await wp.locator(".test-results li.fail").count()) > 0 && ((await wp.locator(".test-results").textContent()) ?? "").includes("document"));
  await setCode("function reverseString(s) { return localStorage.getItem('fdq.latihan.v1') }");
  await runAndWait();
  check("kode pengunjung: localStorage tidak bisa dibaca", ((await wp.locator(".test-results").textContent()) ?? "").includes("localStorage") && !(await summary()).includes("Semua"));

  await setCode("function reverseString(s) { console.log('<img src=x onerror=alert(1)>'); return s }");
  await runAndWait();
  check("output HTML tampil sebagai teks", ((await wp.locator(".output").textContent()) ?? "").includes("<img src=x onerror=alert(1)>") && (await wp.locator(".output img").count()) === 0);

  await setCode("function reverseString(s) { let o = ''; for (let i = s.length - 1; i >= 0; i--) o += s[i]; return o }");
  await wp.locator("#run").dblclick();
  await wp.waitForFunction(() => { const b = document.querySelector("#run"); return b && !b.disabled; }, null, { timeout: 8000 });
  await wp.waitForTimeout(300);
  check("klik ganda: satu ringkasan dari run terakhir", (await wp.locator(".run-summary").count()) === 1 && (await summary()).includes("Semua test lulus"));

  await setCode("const arr = [];\n");
  await wp.locator(".cm-content").press("End");
  await wp.keyboard.type("arr.");
  await wp.waitForTimeout(1000);
  check("editor tanpa autocomplete", (await wp.locator(".cm-tooltip-autocomplete, .cm-tooltip").count()) === 0);
  check("editor tanpa spellcheck", (await wp.locator(".cm-content").getAttribute("spellcheck")) === "false");

  for (const sel of ["#run", "#reset", "#giveup"]) check(`area sentuh 44 px: ${sel}`, (await hitArea(wp, sel)) === "ok", await hitArea(wp, sel));

  await wp.locator("#reset").click();
  check("reset: dialog bertema", await wp.locator("dialog.confirm[open]").isVisible());
  await wp.locator("dialog.confirm .confirm-ok").click();
  await wp.waitForTimeout(200);
  check("reset: kembali ke kode awal", ((await wp.locator(".cm-content").textContent()) ?? "").replace(/\s/g, "") === "functionreverseString(s){}");

  await wp.goto(BASE + "/latihan/dua-angka/");
  await wp.locator(".cm-content").waitFor();
  await wp.locator("#giveup").click();
  await wp.locator("dialog.confirm .confirm-cancel").click();
  check("menyerah dibatalkan: solusi tetap tertutup", (await wp.locator(".solution").count()) === 0);
  await wp.locator("#giveup").click();
  await wp.locator("dialog.confirm .confirm-ok").click();
  await wp.locator(".solution pre").waitFor({ timeout: 3000 }).catch(() => {});
  check("menyerah: solusi tampil", ((await wp.locator(".solution pre").textContent()) ?? "").includes("twoSum"));
  await wp.goto(BASE + "/latihan/");
  await wp.locator(".state-viewed").first().waitFor({ timeout: 3000 }).catch(() => {});
  check("daftar: dua-angka ditandai dilihat", (await wp.locator('li:has(a[href="/latihan/dua-angka/"]) .state-viewed').count()) === 1);
  check("tidak ada dialog bawaan browser", dialogs === 0);
  await wctx.close();

  const mw = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mwp = await mw.newPage();
  watch(mwp);
  await mwp.goto(BASE + "/latihan/vector/");
  await mwp.locator(".cm-content").waitFor();
  await mwp.waitForTimeout(300);
  const msw = await mwp.evaluate(() => document.documentElement.scrollWidth);
  check("390 px dengan editor tanpa scroll horizontal", msw <= 390, String(msw));
  await mw.close();

  // ---------- Admin latihan ----------
  const actx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ap = await actx.newPage();
  watch(ap);
  await ap.goto(BASE + "/admin/latihan/");
  check("admin latihan tanpa login diarahkan ke masuk", ap.url().includes("/admin/masuk/") && ap.url().includes("next=%2Fadmin%2Flatihan%2F"), ap.url());
  await ap.fill("#email", process.env.ADMIN_EMAIL);
  await ap.fill("#password", process.env.ADMIN_PW);
  await ap.click("button[type=submit]");
  await ap.waitForURL(BASE + "/admin/latihan/", { timeout: 8000 }).catch(() => {});
  check("admin latihan: daftar soal per level", (await ap.locator("h1").textContent()) === "Latihan" && (await ap.locator(".admin-row").count()) >= 3);
  check("admin nav: menu Latihan", (await ap.locator('.admin-nav a[href="/admin/latihan/"][aria-current="page"]').count()) === 1);

  await ap.goto(BASE + "/admin/latihan/vector/");
  check("admin edit: teks bawaan jadi placeholder", ((await ap.locator("#title_en").getAttribute("placeholder")) ?? "").includes("Build your own vector"));
  await ap.fill("#title_en", "Vector, made by hand");
  await ap.click("main form button[type=submit]");
  await ap.locator(".toast", { hasText: "Disimpan." }).waitFor({ timeout: 5000 }).catch(() => {});
  await ap.goto(BASE + "/en/practice/vector/");
  check("judul EN dari admin tampil di situs", (await ap.locator("h1").textContent())?.includes("Vector, made by hand"));
  await ap.goto(BASE + "/admin/latihan/vector/");
  await ap.fill("#title_en", "");
  await ap.click("main form button[type=submit]");
  await ap.locator(".toast", { hasText: "Disimpan." }).waitFor({ timeout: 5000 }).catch(() => {});

  await ap.goto(BASE + "/admin/latihan/");
  await ap.locator('.admin-row:has(a[href="/admin/latihan/dua-angka/"]) button', { hasText: "Sembunyikan" }).click();
  await ap.locator("dialog[open] button", { hasText: "Sembunyikan" }).click();
  await ap.waitForTimeout(800);
  for (const path of ["/latihan/dua-angka/", "/en/practice/dua-angka/", "/api/latihan/dua-angka/solution/"]) {
    const r = await fetch(BASE + path);
    check(`soal tersembunyi 404: ${path}`, r.status === 404, String(r.status));
  }
  const listHtml = await (await fetch(BASE + "/latihan/")).text();
  check("soal tersembunyi hilang dari daftar", !listHtml.includes("/latihan/dua-angka/"));
  const nextHtml = await (await fetch(BASE + "/latihan/balik-string/")).text();
  check("soal tersembunyi bukan tautan berikutnya", !nextHtml.includes("/latihan/dua-angka/") && nextHtml.includes("/latihan/vector/"));
  check("soal tersembunyi hilang dari sitemap", !(await (await fetch(BASE + "/sitemap.xml")).text()).includes("dua-angka"));
  await ap.goto(BASE + "/admin/latihan/");
  await ap.locator('.admin-row:has(a[href="/admin/latihan/dua-angka/"]) button', { hasText: "Tampilkan" }).click();
  await ap.waitForTimeout(800);
  check("soal ditampilkan lagi", (await fetch(BASE + "/latihan/dua-angka/")).status === 200);

  await ap.goto(BASE + "/admin/latihan/");
  await ap.fill("#latihan_intro_id", "Pengantar dari admin.");
  await ap.locator("form.intro-form button[type=submit]").click();
  await ap.locator(".toast", { hasText: "Disimpan." }).waitFor({ timeout: 5000 }).catch(() => {});
  check("pengantar dari admin tampil", (await (await fetch(BASE + "/latihan/")).text()).includes("Pengantar dari admin."));

  await ap.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/admin/latihan/", "/admin/latihan/vector/"]) {
    await ap.goto(BASE + path);
    const sw = await ap.evaluate(() => document.documentElement.scrollWidth);
    check(`admin 390 px tanpa scroll horizontal: ${path}`, sw <= 390, String(sw));
  }
  await actx.close();
} catch (e) {
  check("latihan: tidak ada exception", false, String(e?.message ?? e).split("\n")[0]);
} finally {
  await browser.close();
}

const real = errors.filter((e) => !/favicon/i.test(e) && !/404 \(Not Found\) \[[^\]]*\/(tidak-ada|%E0%A4%A)\/\]$/.test(e));
check("latihan: tidak ada error di console", real.length === 0, real.slice(0, 3).join(" | "));
const failed = results.filter((r) => !r.ok).length;
console.log(`\nlatihan: ${results.length - failed}/${results.length} lolos`);
process.exit(failed ? 1 : 0);
