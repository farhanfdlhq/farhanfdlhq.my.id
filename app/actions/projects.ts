"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteProjectById, moveProject, saveProjectData, setProjectStatus } from "@/lib/projects-admin";
import type { ActionState } from "@/components/admin/ActionForm";

export async function saveProject(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const isNew = !Number(form.get("id"));
  const r = saveProjectData(Object.fromEntries(form.entries()));
  if (!r.ok) return r;
  revalidatePath("/", "layout");
  return { ...r, message: isNew ? "Proyek dibuat." : "Proyek disimpan.", redirectTo: isNew ? `/admin/proyek/${r.id}/` : undefined };
}

export async function projectListAction(form: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const op = String(form.get("op"));
  if (!id) return;
  if (op === "up") moveProject(id, -1);
  else if (op === "down") moveProject(id, 1);
  else if (op === "delete") deleteProjectById(id);
  else if (op === "publish") setProjectStatus(id, "published");
  else if (op === "draft") setProjectStatus(id, "draft");
  revalidatePath("/", "layout");
}
