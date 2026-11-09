"use client";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "./Feedback";
import { showServerErrors, validateForm } from "@/lib/validate";
import type { FormResult } from "@/lib/projects-admin";

export type ActionState = FormResult & { message?: string; redirectTo?: string };

/** Form untuk Server Action: validasi bergaya situs, error dari server di bawah kolomnya, dan notifikasi hasil. */
export function ActionForm({ action, children, className = "form", okMessage, resetOnOk }: {
  action: (prev: ActionState | null, form: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  okMessage?: string;
  /** Kosongkan form setelah berhasil, untuk form tambah item baru. */
  resetOnOk?: boolean;
}) {
  const [state, run, pending] = useActionState<ActionState | null, FormData>(action, null);
  const { toast } = useFeedback();
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast(state.message ?? okMessage ?? "Tersimpan.");
      if (resetOnOk) ref.current?.reset();
      if (state.redirectTo) router.push(state.redirectTo);
      else router.refresh();
    } else {
      if (ref.current) showServerErrors(ref.current, state.errors);
      toast(state.message ?? "Ada isian yang perlu diperbaiki.", "err");
    }
  }, [state, toast, okMessage, router, resetOnOk]);
  return (
    <form ref={ref} className={className} action={run} noValidate onSubmit={(e) => { if (!validateForm(e.currentTarget)) e.preventDefault(); }}>
      <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, display: "contents" }}>{children}</fieldset>
    </form>
  );
}
