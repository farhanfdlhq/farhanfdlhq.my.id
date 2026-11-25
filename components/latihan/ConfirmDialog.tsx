"use client";
import { useEffect, useRef } from "react";

/** Dialog konfirmasi bertema (pengganti confirm() bawaan). Esc atau Batal berarti tidak. */
export function ConfirmDialog({ open, title, body, okLabel, cancelLabel, onResult }: {
  open: boolean; title: string; body: string; okLabel: string; cancelLabel: string; onResult(ok: boolean): void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-body"
      onCancel={(e) => { e.preventDefault(); onResult(false); }}>
      <h2 id="confirm-title">{title}</h2>
      <p id="confirm-body">{body}</p>
      <div className="confirm-actions">
        <button type="button" className="btn confirm-cancel" autoFocus onClick={() => onResult(false)}>{cancelLabel}</button>
        <button type="button" className="btn primary confirm-ok" onClick={() => onResult(true)}>{okLabel}</button>
      </div>
    </dialog>
  );
}
