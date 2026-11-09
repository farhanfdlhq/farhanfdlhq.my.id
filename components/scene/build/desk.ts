/** Meja, lantai, monitor dengan baris kode, keyboard, mouse, strip LED, dan router. Dari docs/mockup/desk.js. */
import * as THREE from "three";
import type { Kit } from "./helpers";

export type DeskParts = {
  desk: THREE.Group;
  code: { ind: number; len: number }[];
  codeArr: Float32Array;
  codeGeo: THREE.BufferGeometry;
  routerLeds: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[];
};

export function buildDesk(k: Kit, scene: THREE.Scene): DeskParts {
  const { V, box, lines, rgbLine, rgbGlow, rand, ICE, DIM, RED } = k;
  const desk = new THREE.Group();
  scene.add(desk);
  box(7.2, 0.12, 3.2, DIM, 0x0a0b0d, desk).position.set(0, -0.06, 0);
  [[-3.4, -1.4], [3.4, -1.4], [-3.4, 1.4], [3.4, 1.4]].forEach((q) => box(0.1, 2.6, 0.1, DIM, 0x0a0b0d, desk).position.set(q[0], -1.42, q[1]));
  const floor: number[] = [];
  for (let x = -12; x <= 12; x += 0.6) for (let z = -10; z <= 6; z += 0.6) floor.push(x, -2.72, z);
  const fg = new THREE.BufferGeometry();
  fg.setAttribute("position", new THREE.Float32BufferAttribute(floor, 3));
  scene.add(new THREE.Points(fg, new THREE.PointsMaterial({ color: 0x1c2027, size: 0.03 })));

  // Monitor dengan baris kode yang bergulir
  const mon = new THREE.Group();
  mon.position.set(-0.7, 0, -0.75);
  desk.add(mon);
  box(0.9, 0.04, 0.5, ICE, null, mon).position.set(0, 0.02, 0.05);
  box(0.12, 0.8, 0.08, ICE, null, mon).position.set(0, 0.42, -0.05);
  box(3.0, 1.75, 0.08, ICE, 0x07080a, mon).position.set(0, 1.5, 0);
  const CODE_N = 22, codeArr = new Float32Array(CODE_N * 6), codeGeo = new THREE.BufferGeometry();
  const code: { ind: number; len: number; red: boolean }[] = [];
  for (let c = 0; c < CODE_N; c++) code.push({ ind: Math.floor(rand() * 4) * 0.14, len: 0.3 + rand() * 1.5, red: rand() < 0.12 });
  codeGeo.setAttribute("position", new THREE.BufferAttribute(codeArr, 3));
  const codeCol = new Float32Array(CODE_N * 6);
  code.forEach((l, i) => { const col = l.red ? RED : i % 3 ? DIM : ICE; for (let j = 0; j < 2; j++) codeCol.set([col.r, col.g, col.b], i * 6 + j * 3); });
  codeGeo.setAttribute("color", new THREE.BufferAttribute(codeCol, 3));
  const codeLines = new THREE.LineSegments(codeGeo, new THREE.LineBasicMaterial({ vertexColors: true }));
  codeLines.position.set(-1.35, 1.5, 0.045);
  mon.add(codeLines);
  const monGlow = k.glowSprite(k.dotTex, 0.12);
  monGlow.scale.set(4.4, 2.8, 1);
  monGlow.position.set(0, 1.5, 0.3);
  mon.add(monGlow);

  // Keyboard dan mouse RGB
  const kb = box(1.9, 0.06, 0.6, ICE, null, desk);
  kb.position.set(-0.7, 0.03, 0.6);
  const keys: number[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) {
    const x0 = -0.88 + c * 0.118, z0 = -0.24 + r * 0.11, w = 0.09;
    keys.push(x0, 0.035, z0, x0 + w, 0.035, z0, x0 + w, 0.035, z0, x0 + w, 0.035, z0 + 0.08, x0 + w, 0.035, z0 + 0.08, x0, 0.035, z0 + 0.08, x0, 0.035, z0 + 0.08, x0, 0.035, z0);
  }
  rgbLine(keys, kb, 0.35, 0);
  rgbGlow(kb, V(0, 0.02, 0), 2.4, 0.8, 0.1);
  const mouse = box(0.2, 0.06, 0.32, ICE, null, desk);
  mouse.position.set(0.75, 0.03, 0.65);
  rgbLine([-0.1, -0.025, -0.16, 0.1, -0.025, -0.16, 0.1, -0.025, -0.16, 0.1, -0.025, 0.16, 0.1, -0.025, 0.16, -0.1, -0.025, 0.16, -0.1, -0.025, 0.16, -0.1, -0.025, -0.16, 0, 0.032, -0.15, 0, 0.032, -0.02], mouse, 2.5, 0.3);
  rgbGlow(mouse, V(0, -0.02, 0), 0.6, 0.6, 0.3);

  // Strip LED di tepi depan meja
  const strip: number[] = [];
  for (let i = 0; i < 48; i++) { const x0 = -3.55 + i * 0.148; strip.push(x0, -0.05, 1.605, x0 + 0.148, -0.05, 1.605); }
  rgbLine(strip, desk, 0.12, 0);

  // Router dengan antena dan lampu
  const router = box(0.6, 0.1, 0.32, ICE, null, desk);
  router.position.set(-3.0, 0.05, -0.9);
  lines([-0.22, 0.05, -0.1, -0.28, 0.6, -0.12, 0.22, 0.05, -0.1, 0.28, 0.6, -0.12], 0xdde6f0, router);
  const routerLeds: DeskParts["routerLeds"] = [];
  for (let i = 0; i < 4; i++) {
    const led = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.02), new THREE.MeshBasicMaterial({ color: 0x6fcf97 }));
    led.position.set(-0.18 + i * 0.08, 0, 0.161);
    router.add(led);
    routerLeds.push(led);
  }
  return { desk, code, codeArr, codeGeo, routerLeds };
}

/** Baris kode di monitor bergulir ke atas. */
export function updateCode(d: DeskParts, time: number) {
  const sp = 0.085, top = 0.78, n = d.code.length;
  d.code.forEach((l, i) => {
    const y = top - ((i * sp + time * 0.12) % (n * sp));
    const vis = y > -0.78 ? 1 : 0;
    d.codeArr.set([l.ind, y, 0, l.ind + Math.min(l.len, 2.6 - l.ind) * vis, y, 0], i * 6);
  });
  d.codeGeo.attributes.position.needsUpdate = true;
}
