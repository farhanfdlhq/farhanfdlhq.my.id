/** Pengaturan situs yang bisa diubah admin: profil, teks, dan SEO. */
import { getDb } from "./db";
import type { Lang } from "./lang";

export const SETTING_KEYS = [
  "name", "role", "city", "email", "github_url", "linkedin_url",
  "hero_line_id", "hero_line_en", "about_id", "about_en",
  "seo_title_id", "seo_title_en", "seo_desc_id", "seo_desc_en",
  "seo_projects_desc_id", "seo_projects_desc_en",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
/** Kunci tanpa akhiran bahasa, misalnya "about" untuk about_id dan about_en. */
export type BilingualKey = "hero_line" | "about" | "seo_title" | "seo_desc" | "seo_projects_desc";

function raw(key: string): string {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? "";
}

/** Dengan lang: ambil key_<lang>, kalau kosong kembali ke key_id. Tanpa lang: ambil key apa adanya. */
export function getSetting(key: SettingKey | BilingualKey, lang?: Lang): string {
  if (!lang) return raw(key);
  const own = raw(`${key}_${lang}`);
  return own.trim() ? own : raw(`${key}_id`);
}

export function setSettings(values: Partial<Record<SettingKey, string>>): void {
  const db = getDb();
  const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  db.transaction(() => {
    for (const [k, v] of Object.entries(values)) if ((SETTING_KEYS as readonly string[]).includes(k)) stmt.run(k, v ?? "");
  })();
}
