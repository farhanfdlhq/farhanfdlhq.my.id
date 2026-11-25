import type { MetadataRoute } from "next";
import { publishedProjects } from "@/lib/content";
import { challengePath, homePath, practicePath, projectPath, projectsPath } from "@/lib/paths";
import { visibleSoal } from "@/lib/latihan/content";
import { abs } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Hanya halaman publik, proyek yang sudah terbit, dan soal latihan yang tidak disembunyikan, masing-masing dengan pasangan bahasanya. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pair = (id: string, en: string, lastModified?: Date) => {
    const languages = { "id-ID": abs(id), en: abs(en) };
    return [{ url: abs(id), lastModified, alternates: { languages } }, { url: abs(en), lastModified, alternates: { languages } }];
  };
  return [
    ...pair(homePath("id"), homePath("en")),
    ...pair(projectsPath("id"), projectsPath("en")),
    ...publishedProjects().flatMap((p) => pair(projectPath("id", p.slug), projectPath("en", p.slug), new Date(p.updated_at))),
    ...pair(practicePath("id"), practicePath("en")),
    ...visibleSoal().flatMap((s) => pair(challengePath("id", s.id), challengePath("en", s.id))),
  ];
}
