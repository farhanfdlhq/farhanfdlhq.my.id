import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataDir, getDb } from "@/lib/db";
import { UploadError } from "@/lib/uploads";

export const MAX_CV_BYTES = 10 * 1024 * 1024;
export type CvLang = "id" | "en" | "both";
export const CV_LANGS: CvLang[] = ["id", "en", "both"];

const cvDir = () => path.join(dataDir(), "cv");

/** Simpan PDF CV dengan nama acak di DATA_DIR/cv/. CV pertama untuk suatu bahasa otomatis jadi utama. */
export async function storeCv(buf: Buffer, label: string, lang: CvLang): Promise<number> {
  if (buf.length > MAX_CV_BYTES) throw new UploadError("PDF lebih dari 10 MB. Kecilkan dulu sebelum diunggah.");
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("File ini bukan PDF. Ekspor CV ke PDF dulu.");
  if (!CV_LANGS.includes(lang)) throw new UploadError("Pilih bahasa CV.");
  const file = crypto.randomBytes(12).toString("hex") + ".pdf";
  fs.mkdirSync(cvDir(), { recursive: true });
  fs.writeFileSync(path.join(cvDir(), file), buf);
  const db = getDb();
  const hasPrimary = db.prepare("SELECT 1 FROM cvs WHERE lang = ? AND is_primary = 1").get(lang);
  const sort = (db.prepare("SELECT COALESCE(MAX(sort), 0) + 1 AS n FROM cvs").get() as { n: number }).n;
  const r = db.prepare("INSERT INTO cvs (label, lang, file, is_primary, sort, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(label.trim() || "CV", lang, file, hasPrimary ? 0 : 1, sort, Date.now());
  return Number(r.lastInsertRowid);
}

/** Jadikan CV ini utama untuk bahasanya; CV lain dengan bahasa yang sama dilepas. */
export function makePrimaryCv(id: number) {
  const db = getDb();
  const row = db.prepare("SELECT lang FROM cvs WHERE id = ?").get(id) as { lang: CvLang } | undefined;
  if (!row) return;
  db.transaction(() => {
    db.prepare("UPDATE cvs SET is_primary = 0 WHERE lang = ?").run(row.lang);
    db.prepare("UPDATE cvs SET is_primary = 1 WHERE id = ?").run(id);
  })();
}

export function removeCv(id: number) {
  const db = getDb();
  const row = db.prepare("SELECT file FROM cvs WHERE id = ?").get(id) as { file: string } | undefined;
  if (!row) return;
  db.prepare("DELETE FROM cvs WHERE id = ?").run(id);
  const file = path.resolve(/*turbopackIgnore: true*/ cvDir(), row.file);
  if (file.startsWith(cvDir() + path.sep) && fs.existsSync(file)) fs.unlinkSync(file);
}

export type CvAdminRow = { id: number; label: string; lang: CvLang; is_primary: number; uploaded_at: number };
export function allCvs(): CvAdminRow[] {
  return getDb().prepare("SELECT id, label, lang, is_primary, uploaded_at FROM cvs ORDER BY sort, id").all() as CvAdminRow[];
}
