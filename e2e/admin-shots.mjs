// Tangkapan layar panel admin untuk dicek manual: SHOTS_DIR=<folder> npm run test:e2e
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE, OUT = process.argv[2];
const b = await chromium.launch();
for (const [name, w, h] of [["p", 390, 844], ["d", 1280, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/admin/masuk/");
  await page.screenshot({ path: `${OUT}/admin-${name}-masuk.png` });
  await page.fill("#email", process.env.ADMIN_EMAIL);
  await page.fill("#password", process.env.ADMIN_PW);
  await page.click("button[type=submit]");
  await page.waitForURL(BASE + "/admin/");
  await page.locator(".admin-row a.row-title").first().getAttribute("href").then(async (href) => {
    for (const [k, path] of [["list", "/admin/"], ["edit", href], ["baru", "/admin/proyek/baru/"], ["profil", "/admin/profil/"], ["riwayat", "/admin/riwayat/"], ["cv", "/admin/cv/"]]) {
      await page.goto(BASE + path);
      if (k === "riwayat") await page.locator(".list-item summary").first().click();
      await page.screenshot({ path: `${OUT}/admin-${name}-${k}.png`, fullPage: true });
      const over = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (over) console.log(`GESER HORIZONTAL: ${name} ${k}`);
    }
  });
  await ctx.close();
}
await b.close();
