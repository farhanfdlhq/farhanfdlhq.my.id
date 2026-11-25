// Uji fitur latihan coding di browser sungguhan. Dijalankan oleh e2e/run.sh setelah flow.mjs (butuh BASE, ADMIN_EMAIL, ADMIN_PW, DATA_DIR).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.BASE || "http://127.0.0.1:3399";
const results = [];
const check = (name, ok, extra = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); };
const RUNNER_CSP = "default-src 'none'; script-src 'self' 'unsafe-eval'; worker-src blob: 'self'; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'";

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
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\nlatihan: ${results.length - failed}/${results.length} lolos`);
process.exit(failed ? 1 : 0);
