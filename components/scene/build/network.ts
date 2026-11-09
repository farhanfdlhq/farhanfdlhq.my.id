/** Router, node di belakang meja, kabel, paket data, dan jalur data di dalam PC. Dari docs/mockup/desk.js. */
import * as THREE from "three";
import type { Kit } from "./helpers";
import type { PcParts } from "./pc";

type Curve = THREE.Curve<THREE.Vector3>;
type Packet = { c: Curve; t: number; s: number; d: 1 | -1; g: number | null; inner: boolean };
type NodeView = { g: THREE.Group; em: THREE.LineBasicMaterial; base: THREE.Color; halo: THREE.Sprite; proj: number; spin: number; h: number };

export type Network = {
  update: (dt: number, hot: number | null, explode: number, still: boolean) => void;
};

const INNER: [keyof PcParts["parts"], keyof PcParts["parts"]][] = [["cpu", "ram"], ["cpu", "gpu"], ["cpu", "ssd"], ["gpu", "psu"]];

export function buildNetwork(k: Kit, scene: THREE.Scene, pc: PcParts, mobile: boolean): Network {
  const { V, rand, ICE, DIM, RED } = k;
  const packets: Packet[] = [];
  const addPk = (c: Curve, n: number, speed: number, g: number | null, inner = false) => {
    for (let q = 0; q < n; q++) packets.push({ c, t: rand(), s: speed * (0.8 + rand() * 0.5), d: q % 2 ? -1 : 1, g, inner });
  };
  const cable: number[] = [];
  const pushCurve = (c: Curve) => { const pts = c.getPoints(48); for (let i = 1; i < pts.length; i++) cable.push(pts[i - 1].x, pts[i - 1].y, pts[i - 1].z, pts[i].x, pts[i].y, pts[i].z); };

  const lan = new THREE.CubicBezierCurve3(V(-3.0, 0.1, -1.06), V(-2.4, 0.01, -1.35), V(0.5, 0.01, -1.45), V(1.6, 0.25, -0.95));
  pushCurve(lan);
  addPk(lan, 4, 0.18, null);

  const nodes: (NodeView & { pos: THREE.Vector3 })[] = [];
  const NN = mobile ? 6 : 8;
  for (let n = 0; n < NN; n++) {
    const pos = V(-6.5 + n * (13 / (NN - 1)) + (rand() - 0.5), 1.2 + rand() * 3.6, -6.5 - rand() * 4);
    const isProj = n % 2 === 0 && n / 2 < 4;
    const geo = isProj ? new THREE.BoxGeometry(0.5, 0.5, 0.5) : new THREE.OctahedronGeometry(0.24);
    const g = new THREE.Group();
    g.position.copy(pos);
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x0b0c0e })));
    const em = new THREE.LineBasicMaterial({ color: (isProj ? ICE : DIM).clone() });
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), em));
    const halo = k.glowSprite(k.redTex, 0);
    halo.scale.set(1.8, 1.8, 1);
    g.add(halo);
    scene.add(g);
    nodes.push({ g, em, base: (isProj ? ICE : DIM).clone(), halo, pos, proj: isProj ? n / 2 : -1, spin: 0.2 + rand() * 0.4, h: 0 });
  }
  const antenna = V(-3.28, 0.65, -1.02);
  nodes.forEach((nd, i) => {
    const mid = antenna.clone().lerp(nd.pos, 0.5);
    mid.y += 1.2;
    const c = new THREE.QuadraticBezierCurve3(antenna.clone(), mid, nd.pos.clone());
    pushCurve(c);
    addPk(c, nd.proj >= 0 ? 3 : 2, 0.14, nd.proj >= 0 ? nd.proj : null);
    if (i < NN - 1) {
      const b = nodes[i + 1].pos, m2 = nd.pos.clone().lerp(b, 0.5);
      m2.y += 0.6;
      const c2 = new THREE.QuadraticBezierCurve3(nd.pos.clone(), m2, b.clone());
      pushCurve(c2);
      addPk(c2, 1, 0.1, null);
    }
  });
  const cg = new THREE.BufferGeometry();
  cg.setAttribute("position", new THREE.Float32BufferAttribute(cable, 3));
  scene.add(new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0x3a414c, transparent: true, opacity: 0.85 })));

  // Jalur data di dalam PC, muncul saat komponen terurai
  const innerArr = new Float32Array(INNER.length * 6), innerGeo = new THREE.BufferGeometry();
  innerGeo.setAttribute("position", new THREE.BufferAttribute(innerArr, 3));
  const innerMat = new THREE.LineBasicMaterial({ color: 0xff4d3d, transparent: true, opacity: 0 });
  scene.add(new THREE.LineSegments(innerGeo, innerMat));
  const innerCurves = INNER.map(() => new THREE.LineCurve3(V(0, 0, 0), V(0, 0, 0)));
  innerCurves.forEach((c) => addPk(c, 2, 0.6, null, true));

  const pkPos = new Float32Array(packets.length * 3), pkGeo = new THREE.BufferGeometry();
  pkGeo.setAttribute("position", new THREE.BufferAttribute(pkPos, 3));
  scene.add(new THREE.Points(pkGeo, new THREE.PointsMaterial({ map: k.dotTex, size: mobile ? 0.2 : 0.16, color: 0xe6ecf4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));

  // Debu halus di kejauhan
  const DN = mobile ? 220 : 440, dust = new Float32Array(DN * 3);
  for (let d = 0; d < DN; d++) { dust[d * 3] = (rand() - 0.5) * 40; dust[d * 3 + 1] = -2 + rand() * 10; dust[d * 3 + 2] = -16 + rand() * 20; }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.03, color: 0x8b929b, transparent: true, opacity: 0.4, depthWrite: false })));

  const tmp = V(0, 0, 0), wa = V(0, 0, 0), wb = V(0, 0, 0);
  return {
    update(dt, hot, explode, still) {
      innerMat.opacity = explode * 0.7;
      INNER.forEach((pair, i) => {
        pc.parts[pair[0]].o.getWorldPosition(wa);
        pc.parts[pair[1]].o.getWorldPosition(wb);
        innerArr.set([wa.x, wa.y, wa.z, wb.x, wb.y, wb.z], i * 6);
        innerCurves[i].v1.copy(wa);
        innerCurves[i].v2.copy(wb);
      });
      innerGeo.attributes.position.needsUpdate = true;
      for (const nd of nodes) {
        const on = nd.proj >= 0 && nd.proj === hot ? 1 : 0;
        nd.h += (on - nd.h) * (still ? 1 : 0.08);
        nd.em.color.copy(nd.base).lerp(RED, nd.h);
        nd.halo.material.opacity = nd.h * 0.9;
        if (!still) { nd.g.rotation.y += dt * nd.spin; nd.g.rotation.x += dt * nd.spin * 0.5; }
      }
      packets.forEach((pk, i) => {
        const boost = pk.g != null && pk.g === hot ? 2.6 : 1;
        if (!still) pk.t = (pk.t + dt * pk.s * boost) % 1;
        if (pk.inner && explode < 0.05) { pkPos[i * 3 + 1] = -99; return; }
        pk.c.getPoint(pk.d > 0 ? pk.t : 1 - pk.t, tmp);
        pkPos[i * 3] = tmp.x; pkPos[i * 3 + 1] = tmp.y; pkPos[i * 3 + 2] = tmp.z;
      });
      pkGeo.attributes.position.needsUpdate = true;
    },
  };
}
