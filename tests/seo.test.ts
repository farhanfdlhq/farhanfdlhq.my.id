import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { seed } from "@/seed/content";
import { pageMetadata, personJsonLd } from "@/lib/seo";
import sitemap from "@/app/sitemap";
import { getDb } from "@/lib/db";

beforeEach(() => { delete process.env.SITE_URL; freshDataDir(); seed(); });

describe("seo", () => {
  it("halaman proyek punya pasangan bahasa dan canonical", () => {
    const m = pageMetadata({ lang: "id", path: "/proyek/agendain/", title: "Agendain" });
    expect(m.alternates?.canonical).toBe("https://farhanfdlhq.my.id/proyek/agendain/");
    expect(m.alternates?.languages).toEqual({
      "id-ID": "https://farhanfdlhq.my.id/proyek/agendain/",
      en: "https://farhanfdlhq.my.id/en/projects/agendain/",
      "x-default": "https://farhanfdlhq.my.id/proyek/agendain/",
    });
    expect(m.openGraph).toMatchObject({ locale: "id_ID", url: "https://farhanfdlhq.my.id/proyek/agendain/" });
  });

  it("JSON-LD Person tanpa nomor telepon", () => {
    const p = personJsonLd("en") as Record<string, unknown>;
    expect(p["@type"]).toBe("Person");
    expect(p.jobTitle).toBe("UI/UX | Software Engineer");
    expect(p.sameAs).toContain("https://github.com/farhanfdlhq");
    expect(JSON.stringify(p)).not.toMatch(/telephone/i);
  });

  it("sitemap berisi proyek terbit dua bahasa, tanpa draf", () => {
    getDb().prepare("UPDATE projects SET status = 'draft' WHERE slug = 'bynana'").run();
    const urls = sitemap().map((e) => e.url);
    for (const s of ["agendain", "qiran", "elenmor"]) {
      expect(urls).toContain(`https://farhanfdlhq.my.id/proyek/${s}/`);
      expect(urls).toContain(`https://farhanfdlhq.my.id/en/projects/${s}/`);
    }
    expect(urls.some((u) => u.includes("bynana"))).toBe(false);
    expect(urls).toContain("https://farhanfdlhq.my.id/");
    expect(urls).toContain("https://farhanfdlhq.my.id/en/");
  });
});
