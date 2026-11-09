/** Mengisi data awal dari CV. Jalankan: npm run seed (aman diulang). */
try { process.loadEnvFile(".env.production"); } catch {}
import fs from "node:fs";
import path from "node:path";
import { uploadsDir } from "@/lib/db";
import { seed } from "@/seed/content";

const src = path.join(process.cwd(), "seed", "images");
const dest = path.join(uploadsDir(), "seed");
fs.mkdirSync(dest, { recursive: true });
for (const f of fs.readdirSync(src)) if (f.endsWith(".webp") && !fs.existsSync(path.join(dest, f))) fs.copyFileSync(path.join(src, f), path.join(dest, f));
seed();
console.log("Data awal sudah diisi. Gambar proyek ada di " + dest);
