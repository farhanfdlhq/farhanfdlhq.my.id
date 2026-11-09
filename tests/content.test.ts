import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { getDb } from "@/lib/db";
import { seed } from "@/seed/content";
import { pick, UI } from "@/lib/i18n";
import { alternatePath, homePath, projectPath, projectsPath } from "@/lib/paths";
import { allTech, neighbors, primaryCv, profile, projectBySlug, publishedProjects } from "@/lib/content";

const addCv = (label: string, lang: string, primary: number) =>
  getDb().prepare("INSERT INTO cvs (label, lang, file, is_primary, uploaded_at) VALUES (?, ?, ?, ?, ?)").run(label, lang, `${label}.pdf`, primary, Date.now());

describe("pick", () => {
  it("kembali ke teks ID kalau EN kosong atau hanya spasi", () => {
    expect(pick({ summary_id: "Halo", summary_en: "  " }, "summary", "en")).toEqual({ text: "Halo", fallback: true });
    expect(pick({ summary_id: "Halo", summary_en: "Hi" }, "summary", "en")).toEqual({ text: "Hi", fallback: false });
    expect(pick({ summary_id: "Halo", summary_en: "Hi" }, "summary", "id")).toEqual({ text: "Halo", fallback: false });
  });

  it("kamus ID dan EN punya kunci yang sama", () => {
    expect(Object.keys(UI.en).sort()).toEqual(Object.keys(UI.id).sort());
  });
});

describe("path", () => {
  it("memetakan halaman ke pasangan bahasanya", () => {
    expect(homePath("en")).toBe("/en/");
    expect(projectsPath("id")).toBe("/proyek/");
    expect(projectPath("en", "qiran")).toBe("/en/projects/qiran/");
    expect(alternatePath("id", "/proyek/agendain/")).toBe("/en/projects/agendain/");
    expect(alternatePath("en", "/en/projects/agendain/")).toBe("/proyek/agendain/");
    expect(alternatePath("en", "/en/")).toBe("/");
    expect(alternatePath("id", "/")).toBe("/en/");
    expect(alternatePath("id", "/proyek/")).toBe("/en/projects/");
  });
});

describe("konten", () => {
  beforeEach(() => { freshDataDir(); seed(); });

  it("proyek draf tidak tampil, tidak bisa dibuka, dan dilewati prev/next", () => {
    getDb().prepare("UPDATE projects SET status = 'draft' WHERE slug = 'qiran'").run();
    expect(publishedProjects().map((p) => p.slug)).toEqual(["agendain", "bynana", "elenmor"]);
    expect(projectBySlug("qiran")).toBeNull();
    expect(projectBySlug("qiran", { includeDraft: true })?.slug).toBe("qiran");
    expect(neighbors("agendain").next?.slug).toBe("bynana");
    expect(neighbors("bynana").prev?.slug).toBe("agendain");
  });

  it("menyaring proyek per teknologi", () => {
    expect(publishedProjects({ tech: "SQLite" }).map((p) => p.slug)).toEqual(["qiran", "bynana"]);
    expect(allTech()).toContain("Next.js");
    expect(allTech()).toEqual([...allTech()].sort((a, b) => a.localeCompare(b)));
  });

  it("memilih CV utama sesuai bahasa, lalu file utama mana saja", () => {
    expect(primaryCv("en")).toBeNull();
    addCv("CV ATS", "id", 1);
    expect(primaryCv("en")?.label).toBe("CV ATS");
    addCv("CV English", "en", 1);
    expect(primaryCv("en")?.label).toBe("CV English");
    expect(primaryCv("id")?.label).toBe("CV ATS");
  });

  it("profil memakai teks ID kalau EN kosong", () => {
    getDb().prepare("UPDATE settings SET value = '' WHERE key = 'about_en'").run();
    expect(profile("en").about).toContain("Saya software engineer");
    expect(profile("en").name).toBe("Farhan Achmad Fadhillah");
  });
});
