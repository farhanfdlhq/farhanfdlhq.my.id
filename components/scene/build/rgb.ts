/** Putar warna semua lampu RGB yang terdaftar. hueT = 0 saat pengguna meminta kurangi gerak (warna diam di satu pola). */
import * as THREE from "three";
import type { RgbEntry } from "./helpers";

const hsl = new THREE.Color();
const wrap = (x: number) => ((x % 1) + 1) % 1;

export function updateRgb(rgb: RgbEntry[], hueT: number) {
  for (const r of rgb) {
    if ("mat" in r) {
      hsl.setHSL(wrap(hueT + r.off), 1, 0.56);
      r.mat.color.copy(hsl);
    } else {
      const attr = r.geo.attributes.color as THREE.BufferAttribute;
      const c = attr.array as Float32Array;
      for (let i = 0; i < r.xs.length; i++) {
        hsl.setHSL(wrap(hueT + r.xs[i]), 1, 0.58);
        c[i * 3] = hsl.r; c[i * 3 + 1] = hsl.g; c[i * 3 + 2] = hsl.b;
      }
      attr.needsUpdate = true;
    }
  }
}
