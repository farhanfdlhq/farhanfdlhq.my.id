import { getDb } from "@/lib/db";
import { removeUpload, storeImage, UploadError } from "@/lib/uploads";
import type { FormResult } from "@/lib/projects-admin";
import type { ProjectImage } from "@/lib/content";

/** Tambah gambar ke galeri proyek. Kalau proyek belum punya gambar utama, gambar ini dipakai. */
export function addProjectImage(projectId: number, url: string): number {
  const db = getDb();
  return db.transaction(() => {
    const sort = (db.prepare("SELECT COALESCE(MAX(sort), 0) + 1 AS n FROM project_images WHERE project_id = ?").get(projectId) as { n: number }).n;
    const id = Number(db.prepare("INSERT INTO project_images (project_id, url, sort) VALUES (?, ?, ?)").run(projectId, url, sort).lastInsertRowid);
    db.prepare("UPDATE projects SET hero_image = ? WHERE id = ? AND hero_image = ''").run(url, projectId);
    return id;
  })();
}

const imageById = (id: number) => getDb().prepare("SELECT * FROM project_images WHERE id = ?").get(id) as ProjectImage | undefined;

export function setHeroFromImage(imageId: number) {
  const im = imageById(imageId);
  if (im) getDb().prepare("UPDATE projects SET hero_image = ?, updated_at = ? WHERE id = ?").run(im.url, Date.now(), im.project_id);
}

export function saveImageAlt(imageId: number, altId: string, altEn: string) {
  getDb().prepare("UPDATE project_images SET alt_id = ?, alt_en = ? WHERE id = ?").run(altId.trim(), altEn.trim(), imageId);
}

/** Tukar posisi dengan gambar di atas (dir -1) atau di bawahnya (dir 1). */
export function moveProjectImage(imageId: number, dir: -1 | 1) {
  const db = getDb();
  const im = imageById(imageId);
  if (!im) return;
  const list = db.prepare("SELECT id FROM project_images WHERE project_id = ? ORDER BY sort, id").all(im.project_id) as { id: number }[];
  const i = list.findIndex((r) => r.id === imageId), j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  const upd = db.prepare("UPDATE project_images SET sort = ? WHERE id = ?");
  db.transaction(() => list.forEach((r, k) => upd.run(k + 1, r.id)))();
}

/** Hapus gambar dari galeri dan dari disk. Kalau itu gambar utama, gambar utama dikosongkan. */
export function removeProjectImage(imageId: number) {
  const db = getDb();
  const im = imageById(imageId);
  if (!im) return;
  db.transaction(() => {
    db.prepare("DELETE FROM project_images WHERE id = ?").run(imageId);
    db.prepare("UPDATE projects SET hero_image = '' WHERE id = ? AND hero_image = ?").run(im.project_id, im.url);
  })();
  if (!db.prepare("SELECT 1 FROM project_images WHERE url = ?").get(im.url)) removeUpload(im.url);
}

/** File gambar milik proyek, untuk dihapus dari disk saat proyeknya dihapus. */
export function projectFiles(projectId: number): string[] {
  const db = getDb();
  const urls = (db.prepare("SELECT url FROM project_images WHERE project_id = ?").all(projectId) as { url: string }[]).map((r) => r.url);
  const hero = (db.prepare("SELECT hero_image FROM projects WHERE id = ?").get(projectId) as { hero_image: string } | undefined)?.hero_image;
  return [...new Set([...urls, ...(hero ? [hero] : [])])];
}

/** Simpan gambar untuk proyek. Proyek dicek dulu supaya unggahan dari tab lama tidak meninggalkan file tanpa pemilik. */
export async function uploadProjectImageData(projectId: number, buf: Buffer, name: string): Promise<FormResult> {
  if (!getDb().prepare("SELECT 1 FROM projects WHERE id = ?").get(projectId)) return { ok: false, errors: { file: "Proyek ini sudah dihapus. Buka lagi daftar proyek." } };
  try {
    addProjectImage(projectId, await storeImage(buf, name));
    return { ok: true };
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, errors: { file: e.message } };
    throw e;
  }
}
