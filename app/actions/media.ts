"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { UploadError } from "@/lib/uploads";
import { CV_LANGS, makePrimaryCv, removeCv, storeCv, type CvLang } from "@/lib/cv";
import { moveProjectImage, uploadProjectImageData, removeProjectImage, saveImageAlt, setHeroFromImage } from "@/lib/media";
import type { ActionState } from "@/components/admin/ActionForm";

const fileOf = (form: FormData) => {
  const f = form.get("file");
  return f instanceof File && f.size > 0 ? f : null;
};

/** Kesalahan unggahan dikembalikan sebagai pesan di bawah kolom file, bukan error 500. */
async function guard(run: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await run();
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, errors: { file: e.message } };
    throw e;
  }
}

const done = () => revalidatePath("/", "layout");

export async function uploadProjectImage(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const projectId = Number(form.get("project_id"));
  const f = fileOf(form);
  if (!projectId) return { ok: false, errors: { file: "Simpan proyeknya dulu, baru unggah gambar." } };
  if (!f) return { ok: false, errors: { file: "Pilih foto dulu." } };
  const r = await uploadProjectImageData(projectId, Buffer.from(await f.arrayBuffer()), f.name);
  if (!r.ok) return r;
  done();
  return { ok: true, message: "Gambar diunggah." };
}

export async function saveImageAltAction(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  saveImageAlt(Number(form.get("image_id")), String(form.get("alt_id") ?? ""), String(form.get("alt_en") ?? ""));
  done();
  return { ok: true, message: "Teks alt disimpan." };
}

export async function setHeroImage(form: FormData): Promise<void> {
  await requireAdmin();
  setHeroFromImage(Number(form.get("image_id")));
  done();
}

export async function deleteProjectImage(form: FormData): Promise<void> {
  await requireAdmin();
  removeProjectImage(Number(form.get("image_id")));
  done();
}

export async function reorderProjectImages(form: FormData): Promise<void> {
  await requireAdmin();
  moveProjectImage(Number(form.get("image_id")), form.get("dir") === "up" ? -1 : 1);
  done();
}

export async function uploadCv(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const label = String(form.get("label") ?? "").trim();
  const lang = String(form.get("lang")) as CvLang;
  const errors: Record<string, string> = {};
  if (!label) errors.label = "Isi nama CV, misalnya CV Farhan 2026.";
  if (!CV_LANGS.includes(lang)) errors.lang = "Pilih bahasa CV.";
  const f = fileOf(form);
  if (!f) errors.file = "Pilih file PDF dulu.";
  if (Object.keys(errors).length || !f) return { ok: false, errors };
  return guard(async () => {
    await storeCv(Buffer.from(await f.arrayBuffer()), label, lang);
    done();
    return { ok: true, message: "CV diunggah." };
  });
}

export async function setPrimaryCv(form: FormData): Promise<void> {
  await requireAdmin();
  makePrimaryCv(Number(form.get("id")));
  done();
}

export async function deleteCv(form: FormData): Promise<void> {
  await requireAdmin();
  removeCv(Number(form.get("id")));
  done();
}
