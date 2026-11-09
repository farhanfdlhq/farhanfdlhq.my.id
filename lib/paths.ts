/** Alamat halaman publik. ID tanpa awalan, EN di bawah /en/. Semua diakhiri garis miring (trailingSlash). */
import type { Lang } from "./lang";

export const homePath = (lang: Lang) => (lang === "en" ? "/en/" : "/");
export const projectsPath = (lang: Lang) => (lang === "en" ? "/en/projects/" : "/proyek/");
export const projectPath = (lang: Lang, slug: string) => `${projectsPath(lang)}${encodeURIComponent(slug)}/`;

/** Pasangan bahasa lain untuk alamat yang sedang dibuka. */
export function alternatePath(lang: Lang, path: string): string {
  const other: Lang = lang === "en" ? "id" : "en";
  const p = path.endsWith("/") ? path : path + "/";
  const m = lang === "en" ? p.match(/^\/en\/projects\/(?:([^/]+)\/)?$/) : p.match(/^\/proyek\/(?:([^/]+)\/)?$/);
  if (m) return m[1] ? projectPath(other, decodeURIComponent(m[1])) : projectsPath(other);
  return homePath(other);
}
