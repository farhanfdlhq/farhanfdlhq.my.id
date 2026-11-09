/** Metadata halaman publik: canonical, pasangan bahasa, Open Graph, dan JSON-LD. */
import type { Metadata } from "next";
import type { Lang } from "./lang";
import { alternatePath } from "./paths";
import { getSetting } from "./settings";

export const siteUrl = () => (process.env.SITE_URL || "https://farhanfdlhq.my.id").replace(/\/+$/, "");
export const abs = (path: string) => siteUrl() + path;

export function pageMetadata({ lang, path, title, description, image }: { lang: Lang; path: string; title?: string; description?: string; image?: string }): Metadata {
  const name = getSetting("name");
  const fullTitle = title ? `${title} · ${name}` : getSetting("seo_title", lang) || name;
  const desc = description || getSetting("seo_desc", lang);
  const other = alternatePath(lang, path);
  const [idPath, enPath] = lang === "id" ? [path, other] : [other, path];
  const img = abs(image || "/og/");
  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: abs(path), languages: { "id-ID": abs(idPath), en: abs(enPath), "x-default": abs(idPath) } },
    openGraph: {
      type: "website", url: abs(path), siteName: name, title: fullTitle, description: desc,
      locale: lang === "en" ? "en_US" : "id_ID", alternateLocale: lang === "en" ? "id_ID" : "en_US",
      images: [{ url: img, width: 1200, height: 630, alt: title || name }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc, images: [img] },
  };
}

/** Data Person untuk mesin pencari. Telepon sengaja tidak ada. */
export function personJsonLd(lang: Lang): object {
  const sameAs = [getSetting("github_url"), getSetting("linkedin_url")].filter(Boolean);
  const city = getSetting("city");
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: getSetting("name"),
    jobTitle: getSetting("role"),
    url: abs(lang === "en" ? "/en/" : "/"),
    email: getSetting("email") ? `mailto:${getSetting("email")}` : undefined,
    ...(city ? { address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "ID" } } : {}),
    sameAs,
    description: getSetting("seo_desc", lang) || undefined,
  };
}

/** JSON aman untuk disisipkan di <script>: tanda < di-escape supaya teks admin tidak bisa menutup tag. */
export const jsonLdString = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
