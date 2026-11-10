// Uji alur utama di browser sungguhan. Dijalankan oleh e2e/run.sh (butuh BASE, ADMIN_EMAIL, ADMIN_PW).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // Playwright terpasang global di mesin pengembang

const BASE = process.env.BASE || "http://127.0.0.1:3399";
const results = [];
const check = (name, ok, extra = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); };
const browser = await chromium.launch();
// Area sentuh minimal 44x44: titik 21 px dari tengah ke empat arah harus tetap mengenai elemen itu
const hitArea = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return "tidak ada";
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const ok = [[cx, cy - 21], [cx, cy + 21], [cx - 21, cy], [cx + 21, cy]].every(([x, y]) => { const hit = document.elementFromPoint(x, y); return hit && (hit === el || el.contains(hit)); });
  return ok ? "ok" : `${Math.round(r.width)}x${Math.round(r.height)}`;
}, sel);
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
  for (const [path, lang] of [["/tidak-ada/", "id"], ["/en/tidak-ada/", "en"]]) {
    const r = await page.goto(BASE + path);
    check(`404 umum memakai halaman situs: ${path}`, r.status() === 404 && (await page.locator("html").getAttribute("lang")) === lang && (await page.locator("#h-404").count()) === 1);
  }
  for (const path of ["/proyek/%E0%A4%A/", "/en/projects/%E0%A4%A/", "/og/%25/"]) {
    const r = await fetch(BASE + path);
    check(`alamat rusak jadi 404, bukan 500: ${path}`, r.status === 404, String(r.status));
  }
  const multi = await fetch(BASE + "/en/projects/?tech=x&tech=y");
  check("parameter tech ganda tidak membuat 500", multi.status === 200, String(multi.status));
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
  await page.goto(BASE + "/");
  for (const sel of [".pill.langs a", "#kontak .chip"]) {
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), sel);
    const r = await hitArea(page, sel);
    check(`HP 390: area sentuh ${sel} minimal 44 px`, r === "ok", r);
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

  // ---------- SEO ----------
  {
    const html = await (await fetch(BASE + "/")).text();
    check("SEO: hreflang en di Beranda", /<link rel="alternate" hrefLang="en" href="http:\/\/localhost:3399\/en\/"/i.test(html));
    check("SEO: JSON-LD Person tanpa telepon", html.includes('"@type":"Person"') && !/telephone/i.test(html));
    const det = await (await fetch(BASE + "/en/projects/qiran/")).text();
    check("SEO: og:image proyek", det.includes('property="og:image" content="http://localhost:3399/og/qiran/?lang=en"'));
    const og = await fetch(BASE + "/og/qiran/");
    check("SEO: gambar OG PNG", og.status === 200 && og.headers.get("content-type") === "image/png");
    check("SEO: gambar OG draf 404", (await fetch(BASE + "/og/tidak-ada/")).status === 404);
    const sm = await (await fetch(BASE + "/sitemap.xml")).text();
    check("SEO: sitemap berisi proyek dua bahasa", sm.includes("/proyek/agendain/") && sm.includes("/en/projects/agendain/") && !sm.includes("/admin"));
    const rb = await (await fetch(BASE + "/robots.txt")).text();
    check("SEO: robots menutup admin", rb.includes("Disallow: /admin/"));
    const mf = await fetch(BASE + "/manifest.webmanifest");
    check("SEO: manifest", mf.status === 200 && (await mf.json()).icons.length === 2);
  }

  // ---------- Admin proyek ----------
  {
    const actx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const ap = await actx.newPage();
    watch(ap);
    await ap.goto(BASE + "/admin/cv/");
    check("admin tanpa login diarahkan ke halaman masuk", ap.url().includes("/admin/masuk/"));
    check("admin: halaman masuk mengingat halaman tujuan", ap.url().includes("next=%2Fadmin%2Fcv%2F"), ap.url());
    await ap.fill("#email", process.env.ADMIN_EMAIL);
    await ap.fill("#password", process.env.ADMIN_PW);
    await ap.click("button[type=submit]");
    const backToCv = await ap.waitForURL(BASE + "/admin/cv/", { timeout: 8000 }).then(() => true, () => false);
    check("admin: setelah masuk kembali ke halaman tujuan", backToCv, ap.url());
    await ap.goto(BASE + "/admin/");
    check("admin: login berhasil", (await ap.locator("h1").textContent()) === "Proyek");
    const small = await ap.locator(".row-actions .btn-small").first().boundingBox();
    check("admin: tombol kecil setinggi minimal 44 px", small && small.height >= 44, String(small?.height));
    await ap.goto(BASE + "/admin/cv/");
    const rscReq = ap.waitForRequest((r) => r.url().includes("_rsc") && new URL(r.url()).pathname === "/admin/");
    await ap.evaluate(() => window.next.router.push("/admin/"));
    const captured = await rscReq;
    const hdr = await captured.allHeaders();
    const replay = await fetch(captured.url(), { headers: Object.fromEntries(Object.entries(hdr).filter(([k]) => !/^(cookie|host|content-length)$/i.test(k))) });
    const replayBody = await replay.text();
    check("admin: navigasi RSC tanpa cookie tidak membocorkan isi admin", !replayBody.includes("Jadikan draf") && !replayBody.includes("admin-row"), `${replay.status} ${replayBody.length} byte`);
    await ap.waitForURL(BASE + "/admin/");
    await ap.click("text=Proyek baru");
    check("admin: grup status punya label yang terlihat", await ap.locator("fieldset legend", { hasText: "Status" }).isVisible().catch(() => false));
    await ap.fill("#title", "Uji Draf");
    await ap.fill("#summary_id", "Proyek uji yang hanya berisi teks bahasa Indonesia.");
    await ap.click("button[type=submit]:has-text('Buat proyek')");
    await ap.waitForURL(/\/admin\/proyek\/\d+\/$/);
    const draft = await ap.request.get(BASE + "/proyek/uji-draf/");
    check("admin: proyek draf belum tampil (404)", draft.status() === 404, String(draft.status()));
    await ap.goto(BASE + "/admin/");
    const row = ap.locator(".admin-row", { hasText: "Uji Draf" });
    check("admin: lencana Draf dan EN kosong", (await row.locator(".badge", { hasText: "Draf" }).count()) === 1 && (await row.locator(".badge", { hasText: "EN kosong" }).count()) === 1);
    await row.locator("button", { hasText: "Terbitkan" }).click();
    await ap.locator(".admin-row", { hasText: "Uji Draf" }).locator(".badge", { hasText: "Terbit" }).waitFor();
    const pub = await ap.request.get(BASE + "/proyek/uji-draf/");
    check("admin: setelah terbit halaman 200", pub.status() === 200, String(pub.status()));
    const enHtml = await ap.request.get(BASE + "/en/projects/uji-draf/").then((r) => r.text());
    check("EN: teks cadangan bahasa Indonesia ditandai lang=id", /<p class="lede" lang="id">/.test(enHtml));
    const en = await ap.request.get(BASE + "/en/projects/uji-draf/");
    check("admin: halaman EN memakai teks ID", en.status() === 200 && (await en.text()).includes("hanya berisi teks bahasa Indonesia"));
    await ap.locator(".admin-row", { hasText: "Uji Draf" }).locator("button", { hasText: "Hapus" }).click();
    await ap.locator("dialog.confirm button", { hasText: "Hapus" }).click();
    await ap.locator(".admin-row", { hasText: "Uji Draf" }).waitFor({ state: "detached" });
    const gone = await ap.request.get(BASE + "/proyek/uji-draf/");
    check("admin: proyek terhapus", gone.status() === 404);
    // Profil
    await ap.goto(BASE + "/admin/profil/");
    const oldRole = await ap.inputValue("#role");
    const oldAbout = await ap.inputValue("#about_id");
    await ap.fill("#role", "Software Engineer");
    await ap.fill("#about_id", "Paragraf satu.\nParagraf dua.");
    await ap.click("button[type=submit]:has-text('Simpan profil')");
    await ap.locator(".toast", { hasText: "Profil disimpan." }).waitFor();
    const heroRole = async (path) => { const r = await ap.request.get(BASE + path); return /<b>Software Engineer<\/b>/.test(await r.text()); };
    check("profil: peran baru tampil di hero ID dan EN", (await heroRole("/")) && (await heroRole("/en/")));
    const homeHtml = await ap.request.get(BASE + "/").then((r) => r.text());
    check("profil: Tentang dipecah per baris jadi paragraf", /<p[^>]*>Paragraf satu\.<\/p><p[^>]*>Paragraf dua\.<\/p>/.test(homeHtml));
    await ap.fill("#email", "bukan-email");
    await ap.click("button[type=submit]:has-text('Simpan profil')");
    const emailErr = await ap.locator("#email[aria-invalid=true]").count();
    check("profil: email salah ditandai di kolomnya", emailErr === 1);
    await ap.goto(BASE + "/admin/profil/");
    await ap.fill("#role", oldRole);
    await ap.fill("#about_id", oldAbout);
    await ap.click("button[type=submit]:has-text('Simpan profil')");
    await ap.locator(".toast", { hasText: "Profil disimpan." }).waitFor();
    check("profil: peran dikembalikan", (await ap.request.get(BASE + "/").then((r) => r.text())).includes(`<b>${oldRole.replace(/&/g, "&amp;")}</b>`), oldRole);
    // Riwayat
    await ap.goto(BASE + "/admin/riwayat/");
    const sec = ap.locator("#certification");
    await sec.locator(".add-box > summary").click();
    await sec.locator(".add-box input[name=name]").fill("Sertifikat Uji E2E");
    await sec.locator(".add-box button[type=submit]").click();
    await sec.locator(".list-item", { hasText: "Sertifikat Uji E2E" }).waitFor();
    check("riwayat: sertifikasi baru tampil di Beranda", (await ap.request.get(BASE + "/").then((r) => r.text())).includes("Sertifikat Uji E2E"));
    await sec.locator(".list-item", { hasText: "Sertifikat Uji E2E" }).locator("button", { hasText: "Hapus" }).click();
    await ap.locator("dialog.confirm button", { hasText: "Hapus" }).click();
    await sec.locator(".list-item", { hasText: "Sertifikat Uji E2E" }).waitFor({ state: "detached" });
    check("riwayat: sertifikasi terhapus", !(await ap.request.get(BASE + "/").then((r) => r.text())).includes("Sertifikat Uji E2E"));

    // Gambar dan CV
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWNQWpWGFTEMpAQAw+Y5YaYB/O4AAAAASUVORK5CYII=", "base64");
    await ap.goto(BASE + "/admin/");
    await ap.locator(".admin-row a.row-title", { hasText: "Agendain" }).click();
    await ap.waitForURL(/\/admin\/proyek\/\d+\/$/);
    await ap.locator(".upload-form input[type=file]").setInputFiles({ name: "jadwal.png", mimeType: "image/png", buffer: png });
    check("admin: nama file tampil setelah dipilih", (await ap.locator(".upload-form .file-name").textContent()).includes("jadwal.png"));
    await ap.locator(".upload-form button[type=submit]").click();
    await ap.locator(".gal-item").first().waitFor();
    await ap.locator(".upload-form input[type=file]").setInputFiles({ name: "palsu.jpg", mimeType: "image/jpeg", buffer: Buffer.from("bukan gambar") });
    await ap.locator(".upload-form button[type=submit]").click();
    const upErr = await ap.locator(".upload-form .field-error").textContent({ timeout: 5000 }).catch(() => "");
    const big = Buffer.alloc(14 * 1024 * 1024, 7); big[0] = 0xff; big[1] = 0xd8; big[2] = 0xff;
    await ap.locator(".upload-form input[type=file]").setInputFiles({ name: "foto-hp.jpg", mimeType: "image/jpeg", buffer: big });
    await ap.locator(".upload-form button[type=submit]").click();
    const bigErr = await ap.locator(".upload-form .field-error").textContent({ timeout: 8000 }).catch(() => "");
    check("admin: foto di atas 12 MB ditolak dengan pesan, halaman tetap utuh", bigErr.includes("12 MB") && (await ap.locator(".gal-item").count()) > 0, bigErr);
    check("admin: file palsu ditolak dengan pesan di bawah kolom", upErr.includes("bukan gambar"), upErr);
    const galSrc = await ap.locator(".gal-item img").first().getAttribute("src");
    const det = await ap.request.get(BASE + "/proyek/agendain/");
    check("admin: gambar baru tampil di galeri halaman detail", (await det.text()).includes(galSrc), galSrc);
    const img = await ap.request.get(BASE + galSrc);
    check("admin: gambar disajikan sebagai WebP", img.headers()["content-type"] === "image/webp");
    await ap.goto(BASE + "/admin/cv/");
    await ap.fill("#cv-label", "CV Uji");
    await ap.locator("input[type=file]").setInputFiles({ name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF\n") });
    await ap.locator("button[type=submit]", { hasText: "Unggah CV" }).click();
    await ap.locator(".admin-row", { hasText: "CV Uji" }).locator(".badge", { hasText: "Utama" }).waitFor();
    await ap.goto(BASE + "/");
    const cvHref = await ap.locator("a", { hasText: "Unduh CV" }).first().getAttribute("href");
    const cvRes = await ap.request.get(BASE + cvHref);
    check("Beranda: Unduh CV mengunduh PDF", cvRes.status() === 200 && cvRes.headers()["content-type"] === "application/pdf" && (cvRes.headers()["content-disposition"] || "").includes("CV Uji.pdf"), `${cvHref} ${cvRes.headers()["content-type"]}`);
    await actx.close();
  }

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
    check("tombol mata: isi yang tersembunyi tidak bisa difokus (inert)", await gpage.evaluate(() => document.querySelector("main").inert === true));
    const eyeHit = await hitArea(gpage, "#peek");
    check("tombol mata: area sentuh minimal 44 px", eyeHit === "ok", eyeHit);
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
    const rctx = await glBrowser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const rpage = await rctx.newPage();
    await rpage.goto(BASE + "/");
    await rpage.waitForTimeout(2500);
    const glOn = await rpage.evaluate(() => document.getElementById("site")?.dataset.gl === "on");
    check("kurangi gerak: tombol mata tidak tampil", glOn && (await rpage.locator("#peek").count()) === 0, `gl ${glOn}`);
    await rctx.close();
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
  // Bagian kosong: tidak tampil sebagai panel, tapi titik henti adegan 3D tetap ada
  const Database = createRequire(import.meta.url)("better-sqlite3");
  const db = new Database(process.env.DATA_DIR + "/fdq.sqlite");
  db.prepare("DELETE FROM skills").run();
  db.close();
  const emptyHtml = await (await fetch(BASE + "/")).text();
  check("Keahlian kosong: panelnya disembunyikan", !emptyHtml.includes('id="keahlian"'));
  check("Keahlian kosong: titik henti adegan 3D tetap ada", emptyHtml.includes('id="h-skill"'));
} finally {
  await browser.close();
}

// 404 dari kunjungan sengaja ke alamat yang tidak ada bukan error
const real = errors.filter((e) => !/favicon/i.test(e) && !/404 \(Not Found\) \[[^\]]*\/(tidak-ada|uji-draf|%E0%A4%A)\/\]$/.test(e));
check("tidak ada error di console", real.length === 0, real.slice(0, 3).join(" | "));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} lolos`);
process.exit(failed ? 1 : 0);
