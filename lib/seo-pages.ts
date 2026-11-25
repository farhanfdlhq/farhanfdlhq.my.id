/** Metadata untuk keenam halaman publik, dipanggil dari generateMetadata tiap page. */
import type { Metadata } from "next";
import type { Lang } from "./lang";
import { pick, t } from "./i18n";
import { projectBySlug } from "./content";
import { challengePath, homePath, practicePath, projectPath, projectsPath } from "./paths";
import { soalById, soalText } from "./latihan/content";
import { pageMetadata } from "./seo";
import { getSetting } from "./settings";

export const homeMetadata = (lang: Lang): Metadata => pageMetadata({ lang, path: homePath(lang) });

export function projectsMetadata(lang: Lang): Metadata {
  const name = getSetting("name");
  return pageMetadata({
    lang, path: projectsPath(lang), title: t(lang, "projects"),
    description: getSetting("seo_projects_desc", lang) || (lang === "en" ? `${name}'s projects: case studies, stack, and live links.` : `Proyek ${name}: studi kasus, stack, dan link situsnya.`),
  });
}

export function projectMetadata(lang: Lang, slug: string): Metadata {
  const p = projectBySlug(slug);
  if (!p) return { title: lang === "en" ? "Page not found" : "Halaman tidak ditemukan", robots: { index: false } };
  return pageMetadata({ lang, path: projectPath(lang, p.slug), title: p.title, description: pick(p, "summary", lang).text, image: `/og/${encodeURIComponent(p.slug)}/${lang === "en" ? "?lang=en" : ""}` });
}

export function practiceMetadata(lang: Lang): Metadata {
  return pageMetadata({ lang, path: practicePath(lang), title: t(lang, "practice"), description: getSetting("seo_latihan_desc", lang) || t(lang, "practice_seo") });
}

export function challengeMetadata(lang: Lang, id: string): Metadata {
  const s = soalById(id);
  if (!s) return { title: lang === "en" ? "Page not found" : "Halaman tidak ditemukan", robots: { index: false } };
  const tx = soalText(s, lang);
  const lead = tx.story.split(/\r?\n/)[0].replace(/`/g, "");
  return pageMetadata({
    lang, path: challengePath(lang, s.id), title: `${tx.title} · ${t(lang, "practice")}`,
    description: lead.length > 160 ? lead.slice(0, 157).trimEnd() + "…" : lead,
    image: `/og/latihan/${encodeURIComponent(s.id)}/${lang === "en" ? "?lang=en" : ""}`,
  });
}
