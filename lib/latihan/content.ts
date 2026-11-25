/** Soal latihan seperti yang dilihat publik dan admin: katalog repo digabung dengan penimpaan teks dan status sembunyi dari SQLite. */
import { getDb } from "../db";
import type { Lang } from "../lang";
import { str, type FormResult } from "../projects-admin";
import { catalog, type Soal, type SoalText } from "./catalog";

const FIELDS = ["title", "story", "hint1", "hint2"] as const;
const LIMITS: Record<(typeof FIELDS)[number], number> = { title: 120, story: 4000, hint1: 1000, hint2: 1000 };
const LABELS: Record<(typeof FIELDS)[number], string> = { title: "Judul", story: "Cerita soal", hint1: "Petunjuk 1", hint2: "Petunjuk 2" };
const COLS = FIELDS.flatMap((f) => [`${f}_id`, `${f}_en`] as const);
type Col = (typeof COLS)[number];
type Row = Record<Col, string> & { id: string; hidden: number };

function rows(): Map<string, Row> {
  const all = getDb().prepare("SELECT * FROM latihan_text").all() as Row[];
  return new Map(all.map((r) => [r.id, r]));
}
const row = (id: string) => getDb().prepare("SELECT * FROM latihan_text WHERE id = ?").get(id) as Row | undefined;

export function visibleSoal(): Soal[] {
  const r = rows();
  return catalog().filter((s) => !r.get(s.id)?.hidden);
}

export function soalById(id: string): Soal | null {
  const s = catalog().find((x) => x.id === id);
  if (!s || row(id)?.hidden) return null;
  return s;
}

/** Per kolom: penimpaan bahasa itu kalau tidak kosong, kalau kosong teks bawaan bahasa itu. */
export function soalText(s: Soal, lang: Lang): SoalText {
  const r = row(s.id);
  const out = { ...s.text[lang] };
  if (r) for (const f of FIELDS) { const v = r[`${f}_${lang}`]; if (v.trim()) out[f] = v; }
  return out;
}

export function soalNeighbors(id: string): { prev: Soal | null; next: Soal | null } {
  const list = visibleSoal();
  const i = list.findIndex((s) => s.id === id);
  if (i < 0) return { prev: null, next: null };
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}

const hasText = (r: Row | undefined) => !!r && COLS.some((c) => r[c].trim() !== "");

export function adminSoalList(): { soal: Soal; hidden: boolean; overridden: boolean }[] {
  const r = rows();
  return catalog().map((soal) => ({ soal, hidden: !!r.get(soal.id)?.hidden, overridden: hasText(r.get(soal.id)) }));
}

export function adminSoalOverride(id: string): Record<Col, string> & { hidden: boolean } {
  const r = row(id);
  const out = Object.fromEntries(COLS.map((c) => [c, r?.[c] ?? ""])) as Record<Col, string>;
  return { ...out, hidden: !!r?.hidden };
}

export function saveLatihanTextData(id: string, input: Record<string, unknown>): FormResult & { message?: string } {
  if (!catalog().some((s) => s.id === id)) return { ok: false, errors: {}, message: "Soal tidak dikenal." };
  const v = Object.fromEntries(COLS.map((c) => [c, str(input[c])])) as Record<Col, string>;
  const errors: Record<string, string> = {};
  for (const f of FIELDS) for (const lang of ["id", "en"] as const) {
    if (v[`${f}_${lang}`].length > LIMITS[f]) errors[`${f}_${lang}`] = `${LABELS[f]} maksimal ${LIMITS[f]} karakter.`;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const sets = COLS.map((c) => `${c} = excluded.${c}`).join(", ");
  getDb().prepare(`INSERT INTO latihan_text (id, ${COLS.join(", ")}) VALUES (?, ${COLS.map(() => "?").join(", ")}) ON CONFLICT(id) DO UPDATE SET ${sets}`)
    .run(id, ...COLS.map((c) => v[c]));
  return { ok: true };
}

export function setLatihanHidden(id: string, hidden: boolean): void {
  if (!catalog().some((s) => s.id === id)) return;
  getDb().prepare("INSERT INTO latihan_text (id, hidden) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET hidden = excluded.hidden").run(id, hidden ? 1 : 0);
}
