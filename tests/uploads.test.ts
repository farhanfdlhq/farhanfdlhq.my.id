import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { MAX_IMAGE_BYTES, storeImage } from "@/lib/uploads";
import { MAX_CV_BYTES, makePrimaryCv, removeCv, storeCv } from "@/lib/cv";
import { dataDir, getDb, uploadsDir } from "@/lib/db";

let dir = "";
beforeEach(() => { dir = freshDataDir(); });

const jpegWithGps = () =>
  sharp({ create: { width: 3000, height: 2000, channels: 3, background: { r: 200, g: 40, b: 30 } } })
    .withExifMerge({ IFD3: { GPSLatitudeRef: "S", GPSLatitude: "6/1 35/1 0/1" } })
    .jpeg()
    .toBuffer();

describe("storeImage", () => {
  it("mengubah JPEG besar ber-EXIF jadi WebP 1600 px tanpa EXIF", async () => {
    const src = await jpegWithGps();
    expect((await sharp(src).metadata()).exif).toBeDefined();
    const url = await storeImage(src, "foto.jpg");
    expect(url).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[0-9a-f]{16,}\.webp$/);
    const out = fs.readFileSync(path.join(uploadsDir(), url.replace("/uploads/", "")));
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1600);
    expect(meta.exif).toBeUndefined();
  });

  it("menolak file yang bukan gambar walau namanya .jpg", async () => {
    await expect(storeImage(Buffer.from("halo ini teks biasa"), "palsu.jpg")).rejects.toThrow("File ini bukan gambar. Pilih foto JPG, PNG, atau WebP.");
  });

  it("menolak file di atas 12 MB", async () => {
    await expect(storeImage(Buffer.alloc(MAX_IMAGE_BYTES + 1), "besar.jpg")).rejects.toThrow("Foto lebih dari 12 MB. Kecilkan dulu atau pilih foto lain.");
  });

  it("menolak HEIC dengan petunjuk untuk iPhone", async () => {
    const heic = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from("ftypheic"), Buffer.alloc(64)]);
    await expect(storeImage(heic, "IMG_0001.HEIC")).rejects.toThrow("Foto HEIC belum didukung. Di iPhone, ubah Kamera > Format ke Paling Kompatibel, atau kirim sebagai JPG.");
  });
});

describe("storeCv", () => {
  const pdf = () => Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

  it("menolak file yang bukan PDF", async () => {
    await expect(storeCv(Buffer.from("hello world"), "CV", "id")).rejects.toThrow("File ini bukan PDF. Ekspor CV ke PDF dulu.");
  });

  it("menolak PDF di atas 10 MB", async () => {
    const big = Buffer.concat([Buffer.from("%PDF-"), Buffer.alloc(MAX_CV_BYTES)]);
    await expect(storeCv(big, "CV", "id")).rejects.toThrow("PDF lebih dari 10 MB. Kecilkan dulu sebelum diunggah.");
  });

  it("menyimpan PDF dan hanya satu CV utama per bahasa", async () => {
    const a = await storeCv(pdf(), "CV Indonesia", "id");
    const b = await storeCv(pdf(), "CV Indonesia baru", "id");
    const rows = () => getDb().prepare("SELECT id, is_primary, file FROM cvs ORDER BY id").all() as { id: number; is_primary: number; file: string }[];
    expect(rows().map((r) => r.is_primary)).toEqual([1, 0]);
    makePrimaryCv(b);
    expect(rows().map((r) => r.is_primary)).toEqual([0, 1]);
    const file = path.join(dataDir(), "cv", rows()[0].file);
    expect(fs.existsSync(file)).toBe(true);
    removeCv(a);
    expect(fs.existsSync(file)).toBe(false);
    expect(dir).toBe(dataDir());
  });
});

describe("gambar proyek", async () => {
  const { seed } = await import("@/seed/content");
  const media = await import("@/lib/media");
  const { deleteProjectById } = await import("@/lib/projects-admin");
  const { projectBySlug, projectImages } = await import("@/lib/content");
  const png = () => sharp({ create: { width: 40, height: 30, channels: 3, background: "#123456" } }).png().toBuffer();
  const onDisk = (url: string) => fs.existsSync(path.join(uploadsDir(), url.replace("/uploads/", "")));

  it("gambar pertama jadi hero kalau proyek belum punya hero", async () => {
    seed();
    const id = getDb().prepare("INSERT INTO projects (slug, title, created_at, updated_at) VALUES ('baru', 'Baru', 0, 0)").run().lastInsertRowid as number;
    const url = await storeImage(await png(), "a.png");
    media.addProjectImage(id, url);
    expect(projectBySlug("baru", { includeDraft: true })!.hero_image).toBe(url);
    const agendain = projectBySlug("agendain")!;
    media.addProjectImage(agendain.id, url);
    expect(projectBySlug("agendain")!.hero_image).toBe(agendain.hero_image);
  });

  it("urutan, hero, teks alt, dan hapus", async () => {
    seed();
    const p = projectBySlug("agendain")!;
    const a = await storeImage(await png(), "a.png");
    const b = await storeImage(await sharp({ create: { width: 50, height: 30, channels: 3, background: "#654321" } }).png().toBuffer(), "b.png");
    media.addProjectImage(p.id, a);
    media.addProjectImage(p.id, b);
    const [ia, ib] = projectImages(p.id);
    media.moveProjectImage(ib.id, -1);
    expect(projectImages(p.id).map((i) => i.url)).toEqual([b, a]);
    media.saveImageAlt(ia.id, "Halaman masuk", "Sign-in page");
    expect(projectImages(p.id).find((i) => i.id === ia.id)).toMatchObject({ alt_id: "Halaman masuk", alt_en: "Sign-in page" });
    media.setHeroFromImage(ib.id);
    expect(projectBySlug("agendain")!.hero_image).toBe(b);
    media.removeProjectImage(ib.id);
    expect(onDisk(b)).toBe(false);
    expect(projectBySlug("agendain")!.hero_image).toBe("");
    deleteProjectById(p.id);
    expect(onDisk(a)).toBe(false);
  });
});
