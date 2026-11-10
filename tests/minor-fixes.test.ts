import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { seed } from "@/seed/content";
import { projectMetadata, projectsMetadata } from "@/lib/seo-pages";
import { setSettings } from "@/lib/settings";
import { uploadProjectImageData } from "@/lib/media";
import { uploadsDir } from "@/lib/db";

beforeEach(() => { freshDataDir(); seed(); });

describe("teks SEO dari admin", () => {
  it("deskripsi halaman Proyek diambil dari pengaturan, dengan bawaan kalau kosong", () => {
    expect(projectsMetadata("id").description).toContain("Proyek");
    setSettings({ seo_projects_desc_id: "Studi kasus web dan aplikasi.", seo_projects_desc_en: "Web and app case studies." });
    expect(projectsMetadata("id").description).toBe("Studi kasus web dan aplikasi.");
    expect(projectsMetadata("en").description).toBe("Web and app case studies.");
  });

  it("gambar OG halaman EN memakai label bahasa Inggris", () => {
    const img = (m: ReturnType<typeof projectMetadata>) => JSON.stringify(m.openGraph?.images);
    expect(img(projectMetadata("en", "qiran"))).toContain("/og/qiran/?lang=en");
    expect(img(projectMetadata("id", "qiran"))).not.toContain("lang=en");
  });
});

describe("upload ke proyek yang sudah dihapus", () => {
  it("ditolak dengan pesan dan tidak meninggalkan file", async () => {
    const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#123" } }).png().toBuffer();
    const r = await uploadProjectImageData(99999, png, "a.png");
    expect(r).toEqual({ ok: false, errors: { file: "Proyek ini sudah dihapus. Buka lagi daftar proyek." } });
    const files = fs.readdirSync(uploadsDir(), { recursive: true }).filter((f) => String(f).endsWith(".webp") && !String(f).startsWith("seed"));
    expect(files).toEqual([]);
    expect(fs.existsSync(path.join(uploadsDir()))).toBe(true);
  });
});
