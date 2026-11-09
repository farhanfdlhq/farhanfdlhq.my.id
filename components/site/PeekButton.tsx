"use client";
import { useEffect, useState } from "react";

/** Tombol mata: menyembunyikan semua isi supaya animasi bisa dinikmati. Hanya tampil kalau adegan 3D berhasil dimuat. */
export function PeekButton({ labelOn, labelOff }: { labelOn: string; labelOff: string }) {
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    // Saat pengguna minta kurangi gerak, adegan diam, jadi tidak ada yang perlu ditonton
    const check = () => setReady(document.getElementById("site")?.dataset.gl === "on" && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    check();
    window.addEventListener("fdq:gl", check);
    return () => window.removeEventListener("fdq:gl", check);
  }, []);
  useEffect(() => {
    document.getElementById("site")?.classList.toggle("peek", on);
    if (!on) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOn(false); document.getElementById("peek")?.focus(); } };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [on]);
  if (!ready) return null;
  const label = on ? labelOff : labelOn;
  return (
    <button className="eye" id="peek" type="button" aria-pressed={on} aria-label={label} title={label} onClick={() => setOn((x) => !x)}>
      <svg className="eye-open" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
      <svg className="eye-shut" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    </button>
  );
}
