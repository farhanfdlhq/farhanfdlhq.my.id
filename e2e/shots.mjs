// Tangkapan layar untuk dibandingkan dengan mockup: node e2e/shots.mjs <BASE> <folder keluaran>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [BASE, OUT] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [name, w, h] of [["d", 1440, 900], ["p", 390, 844]]) {
  const page = await b.newPage({ viewport: { width: w, height: h } });
  for (const [k, path, sel] of [["home", "/", null], ["proj", "/", "#proyek"], ["exp", "/", "#h-exp"], ["list", "/proyek/", null], ["detail", "/proyek/agendain/", null], ["en", "/en/", "#kontak"], ["cpu", "/", "#beat-cpu"], ["open", "/", "#beat-open"]]) {
    await page.goto(BASE + path);
    if (sel) await page.evaluate((s) => document.querySelector(s).scrollIntoView(), sel);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/${name}-${k}.png` });
  }
  await page.close();
}
await b.close();
