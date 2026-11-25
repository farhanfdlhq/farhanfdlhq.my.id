import { beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import path from "node:path";
import { freshDataDir } from "./helpers/tmpdata";
import { getDb, resetDbForTests } from "@/lib/db";
import { getSetting, setSettings } from "@/lib/settings";
import { catalog } from "@/lib/latihan/catalog";
import {
  adminSoalList, adminSoalOverride, saveLatihanTextData, setLatihanHidden, soalById, soalNeighbors, soalText, visibleSoal,
} from "@/lib/latihan/content";

const first = () => catalog()[0];
const second = () => catalog()[1];

describe("latihan: penimpaan teks dan sembunyi", () => {
  beforeEach(() => { freshDataDir(); });

  it("tanpa penimpaan memakai teks bawaan", () => {
    const s = first();
    expect(soalText(s, "en")).toEqual(s.text.en);
    expect(soalText(s, "id")).toEqual(s.text.id);
  });

  it("penimpaan EN hanya mengubah EN, dan spasi saja dianggap kosong", () => {
    const s = first();
    expect(saveLatihanTextData(s.id, { title_en: "New title", story_en: "   " }).ok).toBe(true);
    expect(soalText(s, "en").title).toBe("New title");
    expect(soalText(s, "en").story).toBe(s.text.en.story);
    expect(soalText(s, "id").title).toBe(s.text.id.title);
    expect(adminSoalList().find((x) => x.soal.id === s.id)?.overridden).toBe(true);
    expect(adminSoalOverride(s.id).title_en).toBe("New title");
  });

  it("semua kolom kosong menghapus penimpaan tanpa mengubah hidden", () => {
    const s = first();
    saveLatihanTextData(s.id, { title_id: "Baru" });
    setLatihanHidden(s.id, true);
    expect(saveLatihanTextData(s.id, {}).ok).toBe(true);
    const row = adminSoalList().find((x) => x.soal.id === s.id)!;
    expect(row.overridden).toBe(false);
    expect(row.hidden).toBe(true);
  });

  it("soal tersembunyi hilang dari publik dan dilompati tetangganya", () => {
    const [a, b, c] = catalog();
    setLatihanHidden(b.id, true);
    expect(soalById(b.id)).toBeNull();
    expect(visibleSoal().map((s) => s.id)).not.toContain(b.id);
    expect(soalNeighbors(a.id).next?.id).toBe(c.id);
    expect(soalNeighbors(c.id).prev?.id).toBe(a.id);
    setLatihanHidden(b.id, false);
    expect(soalById(b.id)?.id).toBe(b.id);
  });

  it("tetangga di ujung bernilai null, id tak dikenal null", () => {
    const list = visibleSoal();
    expect(soalNeighbors(list[0].id).prev).toBeNull();
    expect(soalNeighbors(list[list.length - 1].id).next).toBeNull();
    expect(soalById("tidak-ada")).toBeNull();
  });

  it("menolak judul terlalu panjang dan id tak dikenal", () => {
    const r = saveLatihanTextData(second().id, { title_id: "x".repeat(121) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.title_id).toBeTruthy();
    const u = saveLatihanTextData("tidak-ada", { title_id: "x" });
    expect(u.ok).toBe(false);
    expect(u.message).toBe("Soal tidak dikenal.");
  });

  it("setting latihan_intro EN kembali ke ID kalau kosong", () => {
    setSettings({ latihan_intro_id: "Halo", latihan_intro_en: "" });
    expect(getSetting("latihan_intro", "en")).toBe("Halo");
    setSettings({ seo_latihan_desc_en: "Desc" });
    expect(getSetting("seo_latihan_desc", "en")).toBe("Desc");
  });
});

describe("latihan: migrasi", () => {
  it("berjalan di DB yang sudah berisi dan menaikkan user_version satu", () => {
    const dir = freshDataDir();
    const before = getDb().pragma("user_version", { simple: true }) as number;
    getDb().prepare("INSERT INTO settings (key, value) VALUES ('name', 'Farhan')").run();
    // Kembalikan ke versi sebelumnya untuk mensimulasikan DB lama
    getDb().exec("DROP TABLE latihan_text");
    getDb().pragma(`user_version = ${before - 1}`);
    resetDbForTests();
    const raw = new Database(path.join(dir, "fdq.sqlite"));
    expect(raw.pragma("user_version", { simple: true })).toBe(before - 1);
    raw.close();
    expect(getDb().pragma("user_version", { simple: true })).toBe(before);
    expect(getSetting("name")).toBe("Farhan");
    expect(getDb().prepare("SELECT COUNT(*) AS n FROM latihan_text").get()).toEqual({ n: 0 });
  });
});
