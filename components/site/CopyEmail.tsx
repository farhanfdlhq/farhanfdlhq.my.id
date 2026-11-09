"use client";
import { useState } from "react";

/** Alamat email selalu tampil sebagai teks yang bisa diseleksi. Tombol hanya mempercepat menyalin. */
export function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  const select = () => {
    const el = document.getElementById("addr");
    if (!el) return;
    const r = document.createRange(); r.selectNodeContents(el);
    const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r);
  };
  return (
    <div className="copyrow">
      <a className="addr" id="addr" href={`mailto:${email}`}>{email}</a>
      <button className="chip" type="button" onClick={() => {
        navigator.clipboard?.writeText(email).then(() => { setDone(true); setTimeout(() => setDone(false), 1600); }, select) ?? select();
      }}>{done ? copied : copy}</button>
    </div>
  );
}
