/** Casing PC dan isinya, headset di stand di atas casing, dan nama domain timbul di panel samping. Dari docs/mockup/desk.js. */
import * as THREE from "three";
import type { Kit } from "./helpers";

export type Part = { o: THREE.Object3D; home: THREE.Vector3; out: THREE.Vector3 };
export type PcParts = {
  tower: THREE.Group;
  side: THREE.Group;
  parts: Record<"mb" | "cpu" | "cooler" | "ram" | "gpu" | "psu" | "ssd", Part>;
  ihs: THREE.Group; sub: THREE.Group; die: THREE.Group; dieGlow: THREE.Sprite; pcGlow: THREE.Sprite;
  fans: THREE.Group[]; gpuFans: THREE.Group[];
  power: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
};

function headset(k: Kit, parent: THREE.Object3D) {
  const { V, box, ICE, rgbMat, rgbGlow } = k;
  const hs = new THREE.Group();
  const TOP = 0.97, HOOK = 1.87; // permukaan atas casing dan sandaran stand
  const baseGeo = new THREE.CylinderGeometry(0.17, 0.19, 0.04, 32);
  const sb = new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({ color: 0x0b0c0e }));
  sb.position.y = TOP + 0.02;
  hs.add(sb);
  const sbe = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeo, 20), new THREE.LineBasicMaterial({ color: 0xdde6f0 }));
  sbe.position.y = TOP + 0.02;
  hs.add(sbe);
  box(0.04, HOOK - TOP - 0.04, 0.04, ICE, null, hs).position.y = (TOP + 0.04 + HOOK) / 2; // tiang
  box(0.045, 0.03, 0.24, ICE, null, hs).position.set(0, HOOK + 0.015, 0); // sandaran atas
  const R = 0.27, HB = HOOK - R; // headband bertumpu di sandaran
  const bandGeo = new THREE.TorusGeometry(R, 0.028, 8, 48, Math.PI);
  const band = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ color: 0x0b0c0e }));
  band.position.y = HB;
  hs.add(band);
  const bandEdge = new THREE.LineSegments(new THREE.EdgesGeometry(bandGeo, 25), new THREE.LineBasicMaterial({ color: 0xdde6f0 }));
  bandEdge.position.y = HB;
  hs.add(bandEdge);
  const pad = new THREE.Mesh(new THREE.TorusGeometry(R - 0.035, 0.02, 6, 32, Math.PI * 0.5), new THREE.MeshBasicMaterial({ color: 0x2a2f37 }));
  pad.position.y = HB;
  pad.rotation.z = Math.PI * 0.25;
  hs.add(pad);
  [-1, 1].forEach((sd, i) => {
    const cup = new THREE.Group();
    cup.position.set(sd * (R + 0.02), HB - 0.12, 0);
    hs.add(cup);
    box(0.03, 0.12, 0.05, ICE, null, cup).position.set(0, 0.1, 0);
    const shellGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 32);
    shellGeo.rotateZ(Math.PI / 2);
    const shellM = new THREE.Mesh(shellGeo, new THREE.MeshBasicMaterial({ color: 0x0b0c0e }));
    shellM.position.y = -0.04;
    cup.add(shellM);
    const shellE = new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo, 25), new THREE.LineBasicMaterial({ color: 0xdde6f0 }));
    shellE.position.y = -0.04;
    cup.add(shellE);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.03, 8, 32), new THREE.MeshBasicMaterial({ color: 0x1b1f26 }));
    cushion.rotation.y = Math.PI / 2;
    cushion.position.set(-sd * 0.05, -0.04, 0);
    cup.add(cushion);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.11, 36), rgbMat(0.5 + i * 0.2));
    ring.rotation.y = (sd * Math.PI) / 2;
    ring.position.set(sd * 0.042, -0.04, 0);
    cup.add(ring);
    rgbGlow(cup, V(sd * 0.09, -0.04, 0), 0.55, 0.55, 0.5 + i * 0.2);
  });
  hs.position.set(-0.3, 0, -0.02);
  hs.rotation.y = 0.12;
  parent.add(hs);
}

/** Nama domain timbul samar di panel samping: bayangan, sorot tipis, lalu permukaan huruf. */
function domainPlate(side: THREE.Object3D) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 160;
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const draw = () => {
    const x = canvas.getContext("2d")!, txt = "farhanfdlhq.my.id";
    x.clearRect(0, 0, 1024, 160);
    x.font = "700 92px 'Archivo Variable', Archivo, 'Helvetica Neue', Arial, sans-serif";
    x.textBaseline = "middle";
    x.textAlign = "center";
    x.fillStyle = "rgba(0,0,0,.9)"; x.fillText(txt, 514, 84);
    x.fillStyle = "rgba(221,230,240,.22)"; x.fillText(txt, 510, 78);
    x.fillStyle = "#1a1e24"; x.fillText(txt, 512, 81);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.234), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  plate.position.set(0, 0, 0.0115);
  side.add(plate);
}

export function buildPc(k: Kit, desk: THREE.Object3D): PcParts {
  const { V, box, lines, fan, rgbMat, rgbLine, ICE, DIM, RED } = k;
  const tower = new THREE.Group();
  tower.position.set(2.35, 0.97, -0.5);
  desk.add(tower);
  headset(k, tower);

  const shell = new THREE.Group();
  tower.add(shell);
  box(1.8, 0.03, 0.85, ICE, null, shell).position.set(0, 0.955, 0);
  box(1.8, 0.03, 0.85, ICE, null, shell).position.set(0, -0.955, 0);
  box(1.8, 1.94, 0.02, ICE, null, shell).position.set(0, 0, -0.415);
  box(0.03, 1.94, 0.85, ICE, null, shell).position.set(0.9, 0, 0);
  const vents: number[] = [];
  for (let v = 0; v < 12; v++) { const y = -0.7 + v * 0.1; vents.push(0.92, y, -0.3, 0.92, y, 0.3); }
  lines(vents, 0x4a5260, shell);
  const power = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), new THREE.MeshBasicMaterial({ color: 0xff4d3d }));
  power.rotation.y = Math.PI / 2;
  power.position.set(0.92, 0.82, 0.25);
  shell.add(power);
  const side = box(1.8, 1.94, 0.02, ICE, 0x0b0c0e, tower);
  side.position.set(0, 0, 0.425);
  domainPlate(side);

  const parts = {} as PcParts["parts"];
  const comp = (name: keyof PcParts["parts"], o: THREE.Object3D, home: THREE.Vector3, out: THREE.Vector3) => {
    o.position.copy(home);
    tower.add(o);
    parts[name] = { o, home: home.clone(), out };
    return o;
  };
  const mb = comp("mb", box(1.45, 1.55, 0.02, ICE, 0x0d1013), V(-0.1, 0.12, -0.38), V(0, 0, 0.35));
  const traces: number[] = [];
  for (let i = 0; i < 22; i++) { const y = -0.6 + i * 0.055; traces.push(-0.65, y, 0.012, -0.2 + Math.sin(i * 1.7) * 0.25, y, 0.012); }
  for (let j = 0; j < 10; j++) { const x = 0.1 + j * 0.05; traces.push(x, -0.7, 0.012, x, -0.35, 0.012); }
  lines(traces, 0x3a414c, mb);

  // CPU: substrat dengan pin, IHS, dan die merah
  const cpu = new THREE.Group();
  comp("cpu", cpu, V(-0.12, 0.42, -0.355), V(0, 0, 0.55));
  const sub = box(0.34, 0.34, 0.025, ICE, 0x101318, cpu);
  const pins: number[] = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) pins.push(-0.15 + i * 0.0273, -0.15 + j * 0.0273, -0.014);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.Float32BufferAttribute(pins, 3));
  sub.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xdde6f0, size: 0.012 })));
  const die = box(0.15, 0.15, 0.012, RED, 0x2a0b08, cpu);
  die.position.z = 0.02;
  const dieGlow = k.glowSprite(k.redTex, 0.5);
  dieGlow.scale.set(0.5, 0.5, 1);
  die.add(dieGlow);
  const ihs = box(0.29, 0.29, 0.035, ICE, 0x15181d, cpu);
  ihs.position.z = 0.045;

  // Pendingin CPU
  const cooler = new THREE.Group();
  comp("cooler", cooler, V(-0.12, 0.42, -0.13), V(-0.7, 0.25, 0.85));
  box(0.5, 0.55, 0.36, DIM, 0x0b0c0e, cooler);
  const fins: number[] = [];
  for (let f = 0; f < 14; f++) { const x = -0.23 + f * 0.035; fins.push(x, -0.27, 0.181, x, 0.27, 0.181); }
  lines(fins, 0x8b929b, cooler);
  const cfan = fan(0.24, cooler);
  cfan.position.set(0, 0, 0.19);

  // RAM dengan lampu RGB di atasnya
  const ram = new THREE.Group();
  comp("ram", ram, V(0.36, 0.42, -0.31), V(0.55, 0.1, 0.8));
  for (let m = 0; m < 4; m++) {
    box(0.03, 0.6, 0.13, ICE, null, ram).position.set(m * 0.06, 0, 0.065);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.04, 0.12), rgbMat(m * 0.08));
    bar.position.set(m * 0.06, 0.3, 0.065);
    ram.add(bar);
  }

  // GPU dengan dua kipas
  const gpu = new THREE.Group();
  comp("gpu", gpu, V(-0.12, -0.24, -0.15), V(0, -0.15, 0.85));
  box(1.15, 0.13, 0.42, ICE, 0x0b0c0e, gpu);
  const gpuFans = [-0.27, 0.27].map((x) => { const gf = fan(0.15, gpu); gf.rotation.x = -Math.PI / 2; gf.position.set(x, -0.066, 0); return gf; });
  box(0.9, 0.01, 0.36, RED, 0x0b0c0e, gpu).position.set(0, 0.07, 0);

  comp("psu", box(0.62, 0.36, 0.72, DIM), V(-0.55, -0.74, -0.03), V(-0.2, -0.2, 0.55));
  comp("ssd", box(0.28, 0.1, 0.03, ICE), V(0.25, -0.02, -0.355), V(0.35, 0, 0.75));
  rgbLine([0.925, -0.9, 0.36, 0.925, 0.9, 0.36, 0.925, -0.9, -0.36, 0.925, 0.9, -0.36], tower, 0.6, 0);
  const caseFans = [0.35, -0.15].map((y, fi) => { const f = fan(0.2, tower, fi * 0.15); f.rotation.y = Math.PI / 2; f.position.set(0.86, y, 0); return f; });
  const pcGlow = k.glowSprite(k.redTex, 0);
  pcGlow.scale.set(1.4, 1.4, 1);
  tower.add(pcGlow);
  void mb;
  return { tower, side, parts, ihs, sub, die, dieGlow, pcGlow, fans: [cfan, ...caseFans], gpuFans, power };
}

/** Terapkan keadaan bongkar-pasang ke casing dan komponen. */
export function applyState(pc: PcParts, s: { open: number; explode: number; deep: number }) {
  const { open, explode, deep } = s;
  pc.side.position.set(open * 2.6, -open * 0.5, 0.425 + open * 0.45);
  pc.side.rotation.y = -open * 1.0;
  (pc.side.userData.em as THREE.LineBasicMaterial).opacity = 1 - open * 0.6;
  for (const p of Object.values(pc.parts)) p.o.position.copy(p.home).addScaledVector(p.out, explode);
  pc.parts.cooler.o.position.y += deep * 1.5;
  pc.parts.cooler.o.position.x -= deep * 0.4;
  pc.ihs.position.set(-deep * 0.12, deep * 0.36, 0.045 + deep * 0.22);
  pc.sub.position.z = -deep * 0.1;
  pc.die.position.z = 0.02 + deep * 0.08;
  pc.dieGlow.material.opacity = 0.3 + deep * 0.35;
  pc.pcGlow.position.copy(pc.parts.cpu.o.position);
  pc.pcGlow.material.opacity = open * 0.35;
}
