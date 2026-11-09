/** Alat bersama untuk membangun adegan: bentuk bergaris, kipas, cahaya, dan registri lampu RGB. Dari docs/mockup/desk.js. */
import * as THREE from "three";

export type RgbEntry = { mat: THREE.Material & { color: THREE.Color }; off: number } | { geo: THREE.BufferGeometry; xs: Float32Array };

export type Kit = {
  V: (x: number, y: number, z: number) => THREE.Vector3;
  rand: () => number;
  ICE: THREE.Color; DIM: THREE.Color; RED: THREE.Color;
  dotTex: THREE.Texture; redTex: THREE.Texture;
  rgb: RgbEntry[];
  box: (w: number, h: number, d: number, color: THREE.Color, fill?: number | null, parent?: THREE.Object3D) => THREE.Group;
  lines: (arr: number[], color: number, parent: THREE.Object3D, opacity?: number) => THREE.LineSegments;
  fan: (r: number, parent: THREE.Object3D, off?: number) => THREE.Group;
  rgbMat: (off: number) => THREE.MeshBasicMaterial;
  rgbLine: (arr: number[], parent: THREE.Object3D, spread: number, off?: number) => THREE.LineSegments;
  rgbGlow: (parent: THREE.Object3D, pos: THREE.Vector3, sx: number, sy: number, off: number) => THREE.Sprite;
  glowSprite: (tex: THREE.Texture, opacity: number) => THREE.Sprite;
};

function softDot(size: number, stops: [number, string][]): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach((s) => g.addColorStop(s[0], s[1]));
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function createKit(seed = 31337): Kit {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rgb: RgbEntry[] = [];
  const dotTex = softDot(64, [[0, "rgba(255,255,255,1)"], [0.3, "rgba(230,236,244,.75)"], [1, "rgba(200,210,225,0)"]]);
  const redTex = softDot(128, [[0, "rgba(255,130,110,.95)"], [0.25, "rgba(255,77,61,.45)"], [1, "rgba(255,77,61,0)"]]);

  const box: Kit["box"] = (w, h, d, color, fill, parent) => {
    const g = new THREE.Group(), geo = new THREE.BoxGeometry(w, h, d);
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: fill ?? 0x0b0c0e })));
    const em = new THREE.LineBasicMaterial({ color: color.clone(), transparent: true });
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), em));
    g.userData.em = em;
    parent?.add(g);
    return g;
  };
  const lines: Kit["lines"] = (arr, color, parent, opacity = 1) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    parent.add(l);
    return l;
  };
  const rgbMat: Kit["rgbMat"] = (off) => {
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true });
    rgb.push({ mat: m, off });
    return m;
  };
  const rgbLine: Kit["rgbLine"] = (arr, parent, spread, off = 0) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    const n = arr.length / 3, xs = new Float32Array(n);
    for (let i = 0; i < n; i++) xs[i] = (arr[i * 3] + arr[i * 3 + 2] * 0.5) * spread + off;
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true }));
    parent.add(l);
    rgb.push({ geo: g, xs });
    return l;
  };
  const glowSprite: Kit["glowSprite"] = (tex, opacity) =>
    new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, fog: false }));
  const rgbGlow: Kit["rgbGlow"] = (parent, pos, sx, sy, off) => {
    const sp = glowSprite(dotTex, 0.35);
    sp.position.copy(pos);
    sp.scale.set(sx, sy, 1);
    parent.add(sp);
    rgb.push({ mat: sp.material, off });
    return sp;
  };
  const fan: Kit["fan"] = (r, parent, off = 0) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.RingGeometry(r * 0.86, r, 40), rgbMat(off)));
    const inner = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 32), new THREE.MeshBasicMaterial({ color: 0x0b0c0e, side: THREE.DoubleSide }));
    inner.position.z = -0.002;
    g.add(inner);
    const bl: number[] = [];
    for (let b = 0; b < 7; b++) { const a = (b / 7) * Math.PI * 2, a2 = a + 0.5; bl.push(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15, 0, Math.cos(a2) * r * 0.86, Math.sin(a2) * r * 0.86, 0); }
    g.userData.blades = lines(bl, 0x8b929b, g);
    parent.add(g);
    return g;
  };

  return {
    V, rand, rgb, dotTex, redTex, box, lines, fan, rgbMat, rgbLine, rgbGlow, glowSprite,
    ICE: new THREE.Color("#DDE6F0"), DIM: new THREE.Color("#4A5260"), RED: new THREE.Color("#FF4D3D"),
  };
}
