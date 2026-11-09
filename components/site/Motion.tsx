"use client";
import { useEffect } from "react";

/** Interaksi kecil yang butuh JavaScript: pantulan cahaya di panel kaca dan titik Live yang berdenyut saat kartunya terlihat. */
export function Motion() {
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>("main > section, .detail-head"));
    const onMove = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    panels.forEach((el) => el.addEventListener("pointermove", onMove));

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        for (const en of entries) if (en.isIntersecting) { en.target.classList.add("seen"); io?.unobserve(en.target); }
      }, { threshold: 0.4 });
      document.querySelectorAll(".proj, .detail-head").forEach((el) => io?.observe(el));
    }
    return () => { panels.forEach((el) => el.removeEventListener("pointermove", onMove)); io?.disconnect(); };
  }, []);
  return null;
}
