"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { saveLatihanTextData, setLatihanHidden } from "@/lib/latihan/content";
import { setSettings } from "@/lib/settings";
import { str } from "@/lib/projects-admin";
import type { ActionState } from "@/components/admin/ActionForm";

export async function saveLatihanText(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const r = saveLatihanTextData(str(form.get("id")), Object.fromEntries(form.entries()));
  if (!r.ok) return r;
  revalidatePath("/", "layout");
  return { ...r, message: "Disimpan." };
}

export async function toggleLatihanHidden(form: FormData): Promise<void> {
  await requireAdmin();
  setLatihanHidden(str(form.get("id")), form.get("hidden") === "1");
  revalidatePath("/", "layout");
}

const LIMITS = { latihan_intro: 1200, seo_latihan_desc: 300 } as const;

export async function saveLatihanIntro(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const [key, max] of Object.entries(LIMITS)) for (const lang of ["id", "en"]) {
    const k = `${key}_${lang}`;
    values[k] = str(form.get(k));
    if (values[k].length > max) errors[k] = `Maksimal ${max} karakter.`;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  setSettings(values);
  revalidatePath("/", "layout");
  return { ok: true, message: "Disimpan." };
}
