/** Logika admin proyek tanpa ketergantungan Next.js, supaya bisa diuji langsung. Server Action memanggil fungsi ini. */
import { getDb } from "./db";
import { slugify, uniqueSlug } from "./slug";
import type { ProjectRow } from "./content";

export type FormResult = { ok: true; id?: number } | { ok: false; errors: Record<string, string> };

export const BI_FIELDS = ["summary", "role", "period", "context", "problem", "approach", "result"] as const;
const TEXT_LIMIT = 8000;

const str = (v: unknown) => String(v ?? "").trim();
const validUrl = (u: string) => !u || /^https?:\/\/[^\s]+$/i.test(u);

/** Kolom yang isian EN-nya kosong padahal ID-nya terisi. */
export function missingEn(row: Partial<ProjectRow>): string[] {
  const r = row as Record<string, unknown>;
  return BI_FIELDS.filter((f) => str(r[`${f}_id`]) && !str(r[`${f}_en`]));
}

export function saveProjectData(input: Record<string, unknown>): FormResult {
  const errors: Record<string, string> = {};
  const title = str(input.title);
  if (!title) errors.title = "Isi judul proyek dulu.";
  else if (title.length > 120) errors.title = "Judul maksimal 120 karakter.";
  const live = str(input.live_url), repo = str(input.repo_url);
  if (!validUrl(live)) errors.live_url = "Isi alamat yang diawali https://.";
  if (!validUrl(repo)) errors.repo_url = "Isi alamat yang diawali https://.";
  const yearText = str(input.year);
  const year = yearText ? Number(yearText) : null;
  if (yearText && (!Number.isInteger(year) || year! < 1990 || year! > 2100)) errors.year = "Isi tahun empat angka, misalnya 2026.";
  for (const f of BI_FIELDS) for (const l of ["id", "en"]) if (str(input[`${f}_${l}`]).length > TEXT_LIMIT) errors[`${f}_${l}`] = `Maksimal ${TEXT_LIMIT} karakter.`;
  if (Object.keys(errors).length) return { ok: false, errors };

  const db = getDb();
  const id = Number(input.id) || 0;
  const status = input.status === "published" ? "published" : "draft";
  const values: Record<string, unknown> = {
    title, stack: str(input.stack).split(",").map((s) => s.trim()).filter(Boolean).join(", "), year,
    live_url: live, repo_url: repo, featured: input.featured === "1" || input.featured === "on" ? 1 : 0, status, updated_at: Date.now(),
  };
  for (const f of BI_FIELDS) for (const l of ["id", "en"]) values[`${f}_${l}`] = str(input[`${f}_${l}`]);
  if (input.hero_image !== undefined) values.hero_image = str(input.hero_image);

  if (id) {
    if (!db.prepare("SELECT 1 FROM projects WHERE id = ?").get(id)) return { ok: false, errors: { title: "Proyek ini sudah dihapus." } };
    const cols = Object.keys(values);
    db.prepare(`UPDATE projects SET ${cols.map((c) => `${c} = @${c}`).join(", ")} WHERE id = @id`).run({ ...values, id });
    return { ok: true, id };
  }
  const sort = (db.prepare("SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM projects").get() as { n: number }).n;
  const row = { ...values, slug: uniqueSlug(slugify(str(input.slug) || title)), sort, created_at: Date.now() };
  const cols = Object.keys(row);
  const info = db.prepare(`INSERT INTO projects (${cols.join(", ")}) VALUES (${cols.map((c) => "@" + c).join(", ")})`).run(row);
  return { ok: true, id: Number(info.lastInsertRowid) };
}

/** Pindahkan proyek satu langkah ke atas (-1) atau ke bawah (+1) di urutan semua proyek. */
export function moveProject(id: number, dir: -1 | 1): void {
  const db = getDb();
  const ids = (db.prepare("SELECT id FROM projects ORDER BY sort, id").all() as { id: number }[]).map((r) => r.id);
  const i = ids.indexOf(id), j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const upd = db.prepare("UPDATE projects SET sort = ? WHERE id = ?");
  db.transaction(() => ids.forEach((pid, n) => upd.run(n, pid)))();
}

export function deleteProjectById(id: number): void {
  getDb().prepare("DELETE FROM projects WHERE id = ?").run(id);
}

export function setProjectStatus(id: number, status: "draft" | "published"): void {
  getDb().prepare("UPDATE projects SET status = ?, updated_at = ? WHERE id = ?").run(status, Date.now(), id);
}

export function allProjectsForAdmin(): ProjectRow[] {
  return getDb().prepare("SELECT * FROM projects ORDER BY sort, id").all() as ProjectRow[];
}

export function projectById(id: number): ProjectRow | null {
  return (getDb().prepare("SELECT * FROM projects WHERE id = ?").get(id) as ProjectRow | undefined) ?? null;
}
