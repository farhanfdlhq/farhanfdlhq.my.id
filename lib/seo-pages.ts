/** Metadata untuk keenam halaman publik, dipanggil dari generateMetadata tiap page. */
import type { Metadata } from "next";
import type { Lang } from "./lang";
import { pick, t } from "./i18n";
import { projectBySlug } from "./content";
import { homePath, projectPath, projectsPath } from "./paths";
import { pageMetadata } from "./seo";
import { getSetting } from "./settings";

export const homeMetadata = (lang: Lang): Metadata => pageMetadata({ lang, path: homePath(lang) });

export function projectsMetadata(lang: Lang): Metadata {
  const name = getSetting("name");
  return pageMetadata({
    lang, path: projectsPath(lang), title: t(lang, "projects"),
    description: lang === "en" ? `${name}'s projects: case studies, stack, and live links.` : `Proyek ${name}: studi kasus, stack, dan link situsnya.`,
  });
}

export function projectMetadata(lang: Lang, slug: string): Metadata {
  const p = projectBySlug(slug);
  if (!p) return { title: lang === "en" ? "Page not found" : "Halaman tidak ditemukan", robots: { index: false } };
  return pageMetadata({ lang, path: projectPath(lang, p.slug), title: p.title, description: pick(p, "summary", lang).text, image: `/og/${encodeURIComponent(p.slug)}/` });
}
