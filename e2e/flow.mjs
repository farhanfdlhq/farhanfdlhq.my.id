// Uji alur utama di browser sungguhan. Dijalankan oleh e2e/run.sh (butuh BASE, ADMIN_EMAIL, ADMIN_PW).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // Playwright terpasang global di mesin pengembang

const BASE = process.env.BASE || "http://127.0.0.1:3399";
const results = [];
const check = (name, ok, extra = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); };
const browser = await chromium.launch();
const errors = [];
const watch = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${m.text()} [${m.location()?.url || page.url()}]`); });
};

try {
  // ---------- Halaman publik ----------
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let page = await ctx.newPage();
  watch(page);
  await page.goto(BASE + "/");
  check("beranda: nama sebagai h1", (await page.locator("h1").first().textContent())?.includes("Farhan"));
  const titles = await page.locator(".proj h3").allTextContents();
  check("beranda: empat proyek dari seed", titles.length === 4 && titles[0].includes("Agendain") && titles[3].includes("Elenmor"), titles.join(" | "));
  check("beranda: alamat email tampil sebagai teks", (await page.locator("#kontak").textContent()).includes("fadilahfarhan80@gmail.com"));
  check("beranda: tidak ada nomor telepon", !/\+?62[\d\s-]{8,}|08\d{8,}/.test(await page.locator("body").textContent()));
  check("beranda: semua bagian ada", (await page.locator("#proyek, #h-about, #h-exp, #h-skill, #kontak").count()) === 5);

  await page.goto(BASE + "/proyek/agendain/");
  await page.locator(".langs a[hreflang=en]").click();
  await page.waitForURL(/\/en\/projects\/agendain\/$/);
  check("ganti bahasa: detail ID ke EN", true);
  check("detail EN memakai teks bahasa Inggris", (await page.locator("main").textContent()).includes("I built this website"));
  await page.locator(".langs a[hreflang=id]").click();
  await page.waitForURL(/\/proyek\/agendain\/$/);
  check("ganti bahasa: detail EN ke ID", true);

  await page.goto(BASE + "/proyek/?tech=SQLite");
  check("daftar proyek: saring SQLite berisi 2 kartu", (await page.locator(".proj").count()) === 2);

  const res404 = await page.goto(BASE + "/proyek/tidak-ada/");
  check("proyek yang tidak ada: 404", res404.status() === 404);
  await ctx.close();

  ctx = await browser.newContext({ javaScriptEnabled: false });
  page = await ctx.newPage();
  await page.goto(BASE + "/");
  check("tanpa JavaScript: isi tetap terbaca", (await page.locator(".proj").count()) === 4 && (await page.locator("#kontak").isVisible()));
  await ctx.close();

  ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await ctx.newPage();
  watch(page);
  for (const p of ["/", "/en/", "/proyek/", "/proyek/agendain/"]) {
    await page.goto(BASE + p);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    check(`HP 390: tidak ada scroll samping di ${p}`, w <= 390, `lebar ${w}`);
  }
  await ctx.close();

  // ---------- Gerak ----------
  ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
  page = await ctx.newPage();
  await page.goto(BASE + "/");
  check("kurangi gerak: nama tidak dianimasikan", (await page.evaluate(() => getComputedStyle(document.querySelector("h1 .w > span")).animationName)) === "none");
  await ctx.close();

  ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page = await ctx.newPage();
  watch(page);
  await page.goto(BASE + "/");
  check("gerak: nama dianimasikan", (await page.evaluate(() => getComputedStyle(document.querySelector("h1 .w > span")).animationName)) === "rise");
  await page.goto(BASE + "/proyek/agendain/");
  const before = await page.evaluate(() => getComputedStyle(document.querySelector(".progress")).transform);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => getComputedStyle(document.querySelector(".progress")).transform);
  check("detail: garis progres baca bertambah saat scroll", before !== after, `${before} -> ${after}`);
  await page.goto(BASE + "/");
  await page.locator(".proj").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  check("titik Live berdenyut saat kartu terlihat", (await page.locator(".proj.seen").count()) >= 1);
  check("transisi antarhalaman diaktifkan lewat CSS", await page.evaluate(() => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.cssText.includes("@view-transition")); } catch { return false; } })));
  await ctx.close();

  // ---------- Adegan 3D ----------
  const glBrowser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  try {
    const gctx = await glBrowser.newContext({ viewport: { width: 1280, height: 900 } });
    const gpage = await gctx.newPage();
    watch(gpage);
    await gpage.goto(BASE + "/");
    await gpage.waitForSelector("#site[data-gl=on]", { timeout: 15000 }).catch(() => {});
    check("adegan: WebGL menyala", (await gpage.locator("#site[data-gl=on]").count()) === 1);
    await gpage.click("#peek");
    const hidden = await gpage.waitForFunction(() => getComputedStyle(document.querySelector("main")).opacity === "0", null, { timeout: 4000 }).then(() => true, () => false);
    check("tombol mata: isi disembunyikan", hidden);
    await gpage.keyboard.press("Escape");
    const back = await gpage.waitForFunction(() => getComputedStyle(document.querySelector("main")).opacity === "1", null, { timeout: 4000 }).then(() => true, () => false);
    check("Esc: isi kembali", back, await gpage.evaluate(() => `opacity ${getComputedStyle(document.querySelector("main")).opacity}, peek ${document.getElementById("site").classList.contains("peek")}`));
    await gpage.evaluate(() => { const e = document.querySelector("#beat-cpu"); const r = e.getBoundingClientRect(); window.scrollTo(0, r.top + scrollY + r.height / 2 - innerHeight / 2); });
    await gpage.waitForTimeout(800);
    check("HUD menunjukkan 04 saat di CPU", (await gpage.locator("#hud .i").textContent()) === "04", await gpage.locator("#hud").textContent());
    await gpage.goto(BASE + "/en/projects/qiran/");
    await gpage.waitForTimeout(800);
    check("HUD di halaman detail", (await gpage.locator("#hud .n").textContent()) === "Project");
    await gctx.close();
  } finally {
    await glBrowser.close();
  }
  const noGl = await chromium.launch({ args: ["--disable-gpu", "--disable-webgl", "--disable-3d-apis"] });
  try {
    const nctx = await noGl.newContext({ viewport: { width: 1280, height: 900 } });
    const npage = await nctx.newPage();
    const nerr = [];
    npage.on("pageerror", (e) => nerr.push(e.message));
    npage.on("console", (m) => { if (m.type() === "error") nerr.push(m.text()); });
    await npage.goto(BASE + "/");
    await npage.waitForTimeout(1500);
    check("tanpa WebGL: isi lengkap", (await npage.locator(".proj").count()) === 4 && (await npage.locator("#kontak").isVisible()));
    check("tanpa WebGL: tombol mata tidak ada", (await npage.locator("#peek").count()) === 0);
    check("tanpa WebGL: tidak ada error", nerr.length === 0, nerr.slice(0, 2).join(" | "));
    await nctx.close();
  } finally {
    await noGl.close();
  }
} finally {
  await browser.close();
}

// 404 dari kunjungan sengaja ke alamat yang tidak ada bukan error
const real = errors.filter((e) => !/favicon/i.test(e) && !/404 \(Not Found\) \[[^\]]*\/(proyek|projects)\/(tidak-ada|uji-draf)\/\]$/.test(e));
check("tidak ada error di console", real.length === 0, real.slice(0, 3).join(" | "));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} lolos`);
process.exit(failed ? 1 : 0);
