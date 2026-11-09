/** Logika admin profil dan daftar riwayat, tanpa ketergantungan Next.js supaya bisa diuji langsung. */
import { getDb } from "./db";
import { setSettings, SETTING_KEYS, type SettingKey } from "./settings";
import { str, validUrl, type FormResult } from "./projects-admin";

type Input = Record<string, unknown>;

/** Hanya kunci di SETTING_KEYS yang disimpan; kolom lain (misalnya telepon) diabaikan. */
export function saveProfileData(input: Input): FormResult {
  const v = Object.fromEntries(SETTING_KEYS.map((k) => [k, str(input[k])])) as Record<SettingKey, string>;
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = "Isi nama dulu.";
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "Format email belum benar.";
  for (const k of ["github_url", "linkedin_url"] as const) if (!validUrl(v[k])) errors[k] = "Isi alamat yang diawali https://.";
  if (Object.keys(errors).length) return { ok: false, errors };
  setSettings(v);
  return { ok: true };
}

export type ListKind = "experience" | "education" | "certification" | "skill";
type Field = { name: string; bi?: boolean; required?: string; year?: boolean };

export const LIST_KINDS: Record<ListKind, { table: string; fields: Field[] }> = {
  experience: { table: "experiences", fields: [{ name: "role", bi: true, required: "Isi peran dulu." }, { name: "org" }, { name: "period", bi: true }] },
  education: { table: "education", fields: [{ name: "school", required: "Isi nama sekolah atau kampus dulu." }, { name: "degree", bi: true }, { name: "detail", bi: true }, { name: "year_end", year: true }] },
  certification: { table: "certifications", fields: [{ name: "name", required: "Isi nama sertifikasi dulu." }, { name: "issuer" }] },
  skill: { table: "skills", fields: [{ name: "group", bi: true, required: "Isi nama kelompok dulu." }, { name: "items" }] },
};

const columns = (f: Field) => (f.bi ? [`${f.name}_id`, `${f.name}_en`] : [f.name]);

export function listRows(kind: ListKind): Record<string, unknown>[] {
  return getDb().prepare(`SELECT * FROM ${LIST_KINDS[kind].table} ORDER BY sort, id`).all() as Record<string, unknown>[];
}

export function saveListData(kind: ListKind, input: Input): FormResult {
  const { table, fields } = LIST_KINDS[kind];
  const values: Record<string, string | number | null> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    for (const c of columns(f)) values[c] = str(input[c]);
    const main = f.bi ? `${f.name}_id` : f.name;
    if (f.required && !values[main]) errors[main] = f.required;
    if (f.year) {
      const y = String(values[f.name]);
      if (y && !/^\d{4}$/.test(y)) errors[f.name] = "Isi tahun empat angka, misalnya 2026.";
      values[f.name] = y ? Number(y) : null;
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const db = getDb();
  const cols = Object.keys(values);
  const id = Number(input.id) || 0;
  if (id) {
    db.prepare(`UPDATE ${table} SET ${cols.map((c) => `${c} = @${c}`).join(", ")} WHERE id = @id`).run({ ...values, id });
    return { ok: true, id };
  }
  const sort = (db.prepare(`SELECT COALESCE(MAX(sort), 0) + 1 AS n FROM ${table}`).get() as { n: number }).n;
  const r = db.prepare(`INSERT INTO ${table} (${cols.join(", ")}, sort) VALUES (${cols.map((c) => `@${c}`).join(", ")}, @sort)`).run({ ...values, sort });
  return { ok: true, id: Number(r.lastInsertRowid) };
}

export function deleteListItem(kind: ListKind, id: number): void {
  getDb().prepare(`DELETE FROM ${LIST_KINDS[kind].table} WHERE id = ?`).run(id);
}

/** Simpan urutan baru. Id yang tidak ada di tabel diabaikan. */
export function reorderList(kind: ListKind, ids: number[]): void {
  const db = getDb();
  const upd = db.prepare(`UPDATE ${LIST_KINDS[kind].table} SET sort = ? WHERE id = ?`);
  db.transaction(() => ids.forEach((id, i) => upd.run(i + 1, id)))();
}

/** Naik atau turun satu langkah, dipakai tombol panah di admin. */
export function moveListItem(kind: ListKind, id: number, dir: -1 | 1): void {
  const ids = listRows(kind).map((r) => Number(r.id));
  const i = ids.indexOf(id), j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  reorderList(kind, ids);
}

export const isListKind = (k: unknown): k is ListKind => typeof k === "string" && k in LIST_KINDS;
