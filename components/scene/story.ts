/** Logika murni alur scroll adegan (tanpa three.js), supaya bisa diuji. Angka dan urutan sama dengan docs/mockup/desk.js. */
import type { Lang } from "@/lib/lang";

export type CamKey = "desk" | "pc" | "open" | "explode" | "cpu" | "back" | "detail";
export type Stop = { cam: CamKey; y: number };

/** Titik kamera berurutan. selector menunjuk elemen di Beranda; posisinya diukur saat halaman dimuat. */
export const STOPS: { cam: CamKey; selector: string }[] = [
  { cam: "desk", selector: "#hero" },
  { cam: "pc", selector: "#beat-pc" },
  { cam: "pc", selector: "#proyek" },
  { cam: "open", selector: "#beat-open" },
  { cam: "open", selector: "#h-about" },
  { cam: "explode", selector: "#beat-explode" },
  { cam: "explode", selector: "#h-exp" },
  { cam: "cpu", selector: "#beat-cpu" },
  { cam: "cpu", selector: "#h-skill" },
  { cam: "back", selector: "#kontak" },
];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const smooth = (t: number) => t * t * (3 - 2 * t);

/** Posisi scroll (titik tengah layar) dipetakan ke p = indeks titik + bagian menuju titik berikutnya. */
export function scrollProgress(stops: Stop[], centerY: number): { p: number; t: number; a: number; b: number } {
  if (!stops.length) return { p: 0, t: 0, a: 0, b: 0 };
  let i = 0;
  while (i < stops.length - 1 && centerY > stops[i + 1].y) i++;
  const b = Math.min(i + 1, stops.length - 1);
  let t = i === b ? 0 : clamp01((centerY - stops[i].y) / (stops[b].y - stops[i].y));
  if (centerY < stops[0].y) t = 0;
  return { p: i + t, t, a: i, b };
}

/** Keadaan bongkar-pasang untuk nilai p. */
export function sceneState(p: number): { open: number; explode: number; deep: number; back: number } {
  const back = ease(p - 8);
  return { open: ease(p - 2) * (1 - back), explode: ease(p - 4) * (1 - back), deep: ease(p - 6) * (1 - back), back };
}

const HUD: Record<CamKey, [string, string, string]> = {
  desk: ["00", "Meja", "Desk"], pc: ["01", "PC", "PC"], open: ["02", "Panel samping", "Side panel"],
  explode: ["03", "Komponen", "Components"], cpu: ["04", "CPU", "CPU"], back: ["05", "Meja", "Desk"], detail: ["›", "Proyek", "Project"],
};

export function hudLabel(cam: CamKey, lang: Lang): [string, string] {
  const h = HUD[cam];
  return [h[0], lang === "en" ? h[2] : h[1]];
}

export function isDetailPath(pathname: string): boolean {
  return /^\/(proyek|en\/projects)\/[^/]+\/?$/.test(pathname);
}
