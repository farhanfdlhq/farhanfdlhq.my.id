/** Data publik untuk halaman: proyek, profil, riwayat, keahlian, dan CV. */
import { getDb } from "./db";
import { getSetting } from "./settings";
import { langAttr, pick } from "./i18n";
import type { Lang } from "./lang";

export type ProjectRow = {
  id: number; slug: string; title: string;
  summary_id: string; summary_en: string; role_id: string; role_en: string; period_id: string; period_en: string;
  context_id: string; context_en: string; problem_id: string; problem_en: string;
  approach_id: string; approach_en: string; result_id: string; result_en: string;
  stack: string; year: number | null; live_url: string; repo_url: string; hero_image: string;
  featured: number; status: "draft" | "published"; sort: number; created_at: number; updated_at: number;
};
export type ProjectImage = { id: number; project_id: number; url: string; alt_id: string; alt_en: string; sort: number };
export type CvRow = { id: number; label: string; lang: "id" | "en" | "both"; file: string; is_primary: number; sort: number; uploaded_at: number };

export const stackList = (stack: string) => stack.split(",").map((s) => s.trim()).filter(Boolean);

export function publishedProjects(opts: { featuredOnly?: boolean; tech?: string } = {}): ProjectRow[] {
  const rows = getDb().prepare(`SELECT * FROM projects WHERE status = 'published' ${opts.featuredOnly ? "AND featured = 1" : ""} ORDER BY sort, id`).all() as ProjectRow[];
  if (!opts.tech) return rows;
  const want = opts.tech.toLowerCase();
  return rows.filter((p) => stackList(p.stack).some((s) => s.toLowerCase() === want));
}

export function projectBySlug(slug: string, opts: { includeDraft?: boolean } = {}): ProjectRow | null {
  const row = getDb().prepare("SELECT * FROM projects WHERE slug = ?").get(slug) as ProjectRow | undefined;
  if (!row || (row.status !== "published" && !opts.includeDraft)) return null;
  return row;
}

export function projectImages(projectId: number): ProjectImage[] {
  return getDb().prepare("SELECT * FROM project_images WHERE project_id = ? ORDER BY sort, id").all(projectId) as ProjectImage[];
}

export function neighbors(slug: string): { prev: ProjectRow | null; next: ProjectRow | null } {
  const list = publishedProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}

export function allTech(): string[] {
  const set = new Set<string>();
  for (const p of publishedProjects()) for (const s of stackList(p.stack)) set.add(s);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export type Profile = { name: string; role: string; city: string; email: string; github: string; linkedin: string; heroLine: string; about: string; heroLang?: "id"; aboutLang?: "id"; seoTitle: string; seoDesc: string };

export function profile(lang: Lang): Profile {
  return {
    name: getSetting("name"), role: getSetting("role"), city: getSetting("city"), email: getSetting("email"),
    github: getSetting("github_url"), linkedin: getSetting("linkedin_url"),
    heroLine: getSetting("hero_line", lang), about: getSetting("about", lang),
    heroLang: lang === "en" && !getSetting("hero_line_en").trim() ? "id" : undefined,
    aboutLang: lang === "en" && !getSetting("about_en").trim() ? "id" : undefined,
    seoTitle: getSetting("seo_title", lang), seoDesc: getSetting("seo_desc", lang),
  };
}

type Row = Record<string, unknown> & { id: number };
const all = (table: string) => getDb().prepare(`SELECT * FROM ${table} ORDER BY sort, id`).all() as Row[];

export function experiences(lang: Lang) {
  return all("experiences").map((r) => { const role = pick(r, "role", lang), period = pick(r, "period", lang); return { id: r.id, role: role.text, org: String(r.org), period: period.text, lang: langAttr(role, period) }; });
}
export function education(lang: Lang) {
  return all("education").map((r) => { const degree = pick(r, "degree", lang), detail = pick(r, "detail", lang); return { id: r.id, school: String(r.school), degree: degree.text, detail: detail.text, yearEnd: r.year_end as number | null, lang: langAttr(degree, detail) }; });
}
export function certifications() {
  return all("certifications").map((r) => ({ id: r.id, name: String(r.name), issuer: String(r.issuer) }));
}
export function skills(lang: Lang) {
  return all("skills").map((r) => { const group = pick(r, "group", lang); return { id: r.id, group: group.text, items: String(r.items), lang: langAttr(group) }; });
}

/** CV utama untuk bahasa halaman: file utama berbahasa itu (atau "both"), lalu file utama mana saja. */
/** CV yang boleh diunduh publik: hanya yang berstatus utama. CV lama tidak bisa ditebak lewat /cv/1/, /cv/2/, dan seterusnya. */
export function publicCv(id: number): CvRow | null {
  return (getDb().prepare("SELECT * FROM cvs WHERE id = ? AND is_primary = 1").get(id) as CvRow | undefined) ?? null;
}

export function primaryCv(lang: Lang): CvRow | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM cvs WHERE is_primary = 1 AND lang IN (?, 'both') ORDER BY sort, id LIMIT 1").get(lang) as CvRow | undefined)
    ?? (db.prepare("SELECT * FROM cvs WHERE is_primary = 1 ORDER BY sort, id LIMIT 1").get() as CvRow | undefined)
    ?? null;
}
