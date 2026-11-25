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
} finally {
  await browser.close();
}

const real = errors.filter((e) => !/favicon/i.test(e) && !/404 \(Not Found\) \[[^\]]*\/(tidak-ada|%E0%A4%A)\/\]$/.test(e));
check("latihan: tidak ada error di console", real.length === 0, real.slice(0, 3).join(" | "));
const failed = results.filter((r) => !r.ok).length;
console.log(`\nlatihan: ${results.length - failed}/${results.length} lolos`);
process.exit(failed ? 1 : 0);
