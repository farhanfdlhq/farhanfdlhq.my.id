import { getDb } from "./db";

/** Slug ASCII huruf kecil dengan tanda hubung, misalnya "Elenmor (Andiamo)" menjadi "elenmor-andiamo". */
export function slugify(title: string): string {
  const s = title.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
  return s || "proyek";
}

/** Slug yang belum dipakai proyek lain: tambahkan -2, -3, dan seterusnya. */
export function uniqueSlug(base: string, excludeId?: number): string {
  const taken = (s: string) => !!getDb().prepare("SELECT 1 FROM projects WHERE slug = ? AND id != ?").get(s, excludeId ?? -1);
  if (!taken(base)) return base;
  for (let n = 2; ; n++) if (!taken(`${base}-${n}`)) return `${base}-${n}`;
}
