import type { MetadataRoute } from "next";
import { publishedProjects } from "@/lib/content";
import { homePath, projectPath, projectsPath } from "@/lib/paths";
import { abs } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Hanya halaman publik dan proyek yang sudah terbit, masing-masing dengan pasangan bahasanya. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pair = (id: string, en: string, lastModified?: Date) => {
    const languages = { "id-ID": abs(id), en: abs(en) };
    return [{ url: abs(id), lastModified, alternates: { languages } }, { url: abs(en), lastModified, alternates: { languages } }];
  };
  return [
    ...pair(homePath("id"), homePath("en")),
    ...pair(projectsPath("id"), projectsPath("en")),
    ...publishedProjects().flatMap((p) => pair(projectPath("id", p.slug), projectPath("en", p.slug), new Date(p.updated_at))),
  ];
}
