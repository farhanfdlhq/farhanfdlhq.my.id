"use client";
/** Adegan 3D di belakang halaman publik. Hanya dimuat di browser; tanpa WebGL komponen ini tidak menampilkan apa pun. */
import { useEffect } from "react";
import * as THREE from "three";
import { createKit } from "./build/helpers";
import { buildDesk, updateCode } from "./build/desk";
import { applyState, buildPc } from "./build/pc";
import { buildNetwork } from "./build/network";
import { updateRgb } from "./build/rgb";
import { STOPS, clamp01, hudLabel, isDetailPath, sceneState, scrollProgress, smooth, type CamKey, type Stop } from "./story";

type View = Record<CamKey, [THREE.Vector3, THREE.Vector3]>;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const WIDE: View = {
  desk: [v(5.4, 3.6, 9.0), v(1.25, 0.8, -0.5)], pc: [v(5.4, 2.5, 4.0), v(2.35, 1.2, -0.5)], open: [v(3.5, 1.9, 3.7), v(2.2, 0.95, -0.6)],
  explode: [v(4.3, 2.3, 5.1), v(2.2, 1.0, 0.0)], cpu: [v(3.05, 1.95, 1.45), v(2.2, 1.45, -0.3)], back: [v(6.0, 4.0, 10.2), v(1.25, 0.8, -0.5)],
  detail: [v(-0.2, 1.7, 2.9), v(-0.7, 1.45, -0.7)],
};
const NARROW: View = {
  desk: [v(5.4, 5.2, 13.5), v(0.6, 0.4, -0.5)], pc: [v(5.8, 2.9, 6.0), v(2.35, 1.2, -0.5)], open: [v(3.7, 2.2, 5.2), v(2.2, 0.95, -0.6)],
  explode: [v(4.6, 2.6, 7.0), v(2.2, 0.95, 0.0)], cpu: [v(3.0, 2.1, 2.1), v(2.2, 1.45, -0.3)], back: [v(6.0, 5.6, 14.5), v(0.6, 0.4, -0.5)],
  detail: [v(-0.3, 1.9, 4.6), v(-0.7, 1.45, -0.7)],
};

export default function DeskScene() {
  useEffect(() => {
    const wrap = document.getElementById("scene"), canvas = document.getElementById("gl") as HTMLCanvasElement | null;
    const hud = document.getElementById("hud"), site = document.getElementById("site");
    if (!wrap || !canvas || !site) return;
    // Cek dukungan WebGL lebih dulu: three.js menulis error ke console kalau konteksnya gagal dibuat
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
    THREE.ColorManagement.enabled = false; // warna sama persis dengan mockup (three r128)
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); }
    catch { return; }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x050505, 1);
    wrap.classList.add("gl-on");
    site.dataset.gl = "on";
    window.dispatchEvent(new Event("fdq:gl"));

    const lang = document.documentElement.lang === "en" ? "en" : "id";
    const mobile = (wrap.clientWidth || window.innerWidth) < 720;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.04);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 160);
    const kit = createKit();
    const desk = buildDesk(kit, scene);
    const pc = buildPc(kit, desk.desk);
    const net = buildNetwork(kit, scene, pc, mobile);

    const detail = isDetailPath(location.pathname);
    let P = WIDE, narrow = false, stops: Stop[] = [];
    const anchors = () => {
      stops = [];
      if (detail) return;
      for (const s of STOPS) {
        const el = document.querySelector(s.selector);
        if (!el) { stops = []; return; } // halaman tanpa alur bongkar (misalnya daftar proyek): tetap di meja
        const sec = el.closest("section") || el, r = sec.getBoundingClientRect();
        stops.push({ cam: s.cam, y: r.top + window.scrollY + r.height / 2 });
      }
    };
    const layout = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      narrow = camera.aspect < 0.9;
      P = narrow ? NARROW : WIDE;
      anchors();
    };
    layout();
    const ro = "ResizeObserver" in window ? new ResizeObserver(layout) : null;
    ro?.observe(wrap); ro?.observe(document.body);
    window.addEventListener("resize", layout);

    // Node proyek yang disorot: urutan kartu di halaman (empat pertama)
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".proj[data-host]")).slice(0, 4);
    let hovered: number | null = null, inView: number | null = null;
    const offs: (() => void)[] = [];
    cards.forEach((el, i) => {
      const enter = () => { hovered = i; }, leave = () => { hovered = null; };
      el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); el.addEventListener("focusin", enter);
      offs.push(() => { el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.removeEventListener("focusin", enter); });
    });
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) inView = cards.indexOf(e.target as HTMLElement);
    }, { rootMargin: "-45% 0px -45% 0px" }) : null;
    cards.forEach((el) => io?.observe(el));

    let px = 0, py = 0, tx = 0, ty = 0;
    const onPointer = (e: PointerEvent) => { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener("pointermove", onPointer);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const want = { pos: v(0, 0, 0), look: v(0, 0, 0), p: 0 }, cam = { pos: v(0, 0, 0), look: v(0, 0, 0), p: 0 };
    let snap = true, hudKey: CamKey = detail ? "detail" : "desk", lastHud = "", running = false, raf = 0;
    const t0 = performance.now();
    let lastT = t0;

    const target = () => {
      if (detail) { want.pos.copy(P.detail[0]); want.look.copy(P.detail[1]); want.p = 0; hudKey = "detail"; return; }
      if (!stops.length) { want.pos.copy(P.desk[0]); want.look.copy(P.desk[1]); want.p = 0; hudKey = "desk"; return; }
      const { p, t, a, b } = scrollProgress(stops, window.scrollY + window.innerHeight * 0.5);
      const st = smooth(t);
      want.pos.copy(P[stops[a].cam][0]).lerp(P[stops[b].cam][0], st);
      want.look.copy(P[stops[a].cam][1]).lerp(P[stops[b].cam][1], st);
      want.p = p;
      hudKey = (t < 0.5 ? stops[a] : stops[b]).cam;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000), time = (now - t0) / 1000;
      lastT = now;
      target();
      const k = reduce || snap ? 1 : 1 - Math.pow(0.002, dt);
      snap = false;
      cam.pos.lerp(want.pos, k); cam.look.lerp(want.look, k); cam.p += (want.p - cam.p) * k;
      px += (tx - px) * 0.05; py += (ty - py) * 0.05;
      const close = clamp01((cam.p - 6) / 1.2); // dekat CPU, parallax diperkecil
      camera.position.set(cam.pos.x + px * 0.4 * (1 - close * 0.85), cam.pos.y - py * 0.25 * (1 - close * 0.85), cam.pos.z);
      camera.lookAt(cam.look);
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!narrow) camera.setViewOffset(w, h, -0.2 * w, 0, w, h);
      else camera.setViewOffset(w, h, 0, 0.17 * h * (1 - clamp01(cam.p)) + 0.17 * h * clamp01(cam.p - 8), w, h);
      camera.updateProjectionMatrix();

      const s = sceneState(cam.p);
      applyState(pc, s);
      updateRgb(kit.rgb, reduce ? 0 : time * 0.12);
      if (!reduce) {
        pc.fans.forEach((f, i) => { (f.userData.blades as THREE.Object3D).rotation.z = time * (4 + i); });
        pc.gpuFans.forEach((f) => { (f.userData.blades as THREE.Object3D).rotation.z = -time * 5; });
        desk.routerLeds.forEach((l, i) => l.material.color.setHex(Math.sin(time * (3 + i * 1.7) + i) > 0.2 ? 0x6fcf97 : 0x1d3b2b));
        pc.power.material.color.setHex(Math.sin(time * 1.5) > -0.6 ? 0xff4d3d : 0x5a1a14);
      }
      updateCode(desk, reduce ? 0 : time);
      const hot = hovered ?? (detail ? 0 : hudKey === "pc" ? inView : null);
      net.update(dt, hot, s.explode, reduce);

      if (hud) {
        const key = hudKey + lang;
        if (key !== lastHud) {
          lastHud = key;
          const [i, n] = hudLabel(hudKey, lang);
          hud.querySelector(".i")!.textContent = i;
          hud.querySelector(".n")!.textContent = n;
        }
      }
      renderer.render(scene, camera);
    };
    const loop = (now: number) => { if (document.hidden) { running = false; return; } frame(now); raf = requestAnimationFrame(loop); };
    const start = () => { if (!running) { running = true; lastT = performance.now(); raf = requestAnimationFrame(loop); } };
    let pending = false;
    const draw = () => { if (!pending) { pending = true; raf = requestAnimationFrame((n) => { pending = false; frame(n); }); } };
    const onVis = () => { if (!document.hidden) start(); };
    if (reduce) { window.addEventListener("scroll", draw, { passive: true }); window.addEventListener("resize", draw); draw(); }
    else { document.addEventListener("visibilitychange", onVis); start(); }
    window.addEventListener("load", anchors);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      ro?.disconnect(); io?.disconnect(); offs.forEach((f) => f());
      window.removeEventListener("resize", layout); window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", draw); window.removeEventListener("resize", draw);
      window.removeEventListener("load", anchors); document.removeEventListener("visibilitychange", onVis);
      renderer.dispose();
      delete site.dataset.gl;
    };
  }, []);
  return null;
}
