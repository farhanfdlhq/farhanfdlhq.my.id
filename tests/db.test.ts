import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { getDb, resetDbForTests } from "@/lib/db";
import { getSetting, setSettings } from "@/lib/settings";
import { seed } from "@/seed/content";

const TABLES = ["users", "sessions", "login_attempts", "settings", "projects", "project_images", "experiences", "education", "certifications", "skills", "cvs"];
const count = (t: string) => (getDb().prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;

describe("database", () => {
  beforeEach(() => { freshDataDir(); });

  it("migrasi membuat semua tabel", () => {
    const names = (getDb().prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((r) => r.name);
    for (const t of TABLES) expect(names).toContain(t);
  });

  it("migrasi aman dijalankan dua kali", () => {
    getDb();
    resetDbForTests();
    expect(() => getDb()).not.toThrow();
  });

  it("seed dua kali tidak menggandakan data", () => {
    seed();
    seed();
    expect(count("projects")).toBe(4);
    expect(count("experiences")).toBe(6);
    expect(count("education")).toBe(2);
    expect(count("certifications")).toBe(3);
  });

  it("pengaturan per bahasa kembali ke ID kalau EN kosong", () => {
    setSettings({ about_id: "Halo", about_en: "" });
    expect(getSetting("about", "en")).toBe("Halo");
    setSettings({ about_en: "Hi" });
    expect(getSetting("about", "en")).toBe("Hi");
  });
});
