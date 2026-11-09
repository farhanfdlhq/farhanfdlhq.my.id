"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteListItem, isListKind, moveListItem, saveListData, saveProfileData } from "@/lib/profile-admin";
import type { ActionState } from "@/components/admin/ActionForm";

export async function saveProfile(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const r = saveProfileData(Object.fromEntries(form.entries()));
  if (!r.ok) return r;
  revalidatePath("/", "layout");
  return { ...r, message: "Profil disimpan." };
}

export async function saveListItem(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const kind = form.get("kind");
  if (!isListKind(kind)) return { ok: false, errors: {}, message: "Jenis daftar tidak dikenal." };
  const isNew = !Number(form.get("id"));
  const r = saveListData(kind, Object.fromEntries(form.entries()));
  if (!r.ok) return r;
  revalidatePath("/", "layout");
  return { ...r, message: isNew ? "Ditambahkan." : "Disimpan." };
}

export async function listItemOp(form: FormData): Promise<void> {
  await requireAdmin();
  const kind = form.get("kind"), id = Number(form.get("id")), op = form.get("op");
  if (!isListKind(kind) || !id) return;
  if (op === "up") moveListItem(kind, id, -1);
  else if (op === "down") moveListItem(kind, id, 1);
  else if (op === "delete") deleteListItem(kind, id);
  revalidatePath("/", "layout");
}
