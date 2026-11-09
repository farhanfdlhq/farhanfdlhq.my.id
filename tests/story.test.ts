import { describe, expect, it } from "vitest";
import { STOPS, hudLabel, isDetailPath, sceneState, scrollProgress } from "@/components/scene/story";

const stops = STOPS.map((s, i) => ({ cam: s.cam, y: 1000 + i * 500 }));

describe("alur scroll", () => {
  it("punya 10 titik sesuai urutan di mockup", () => {
    expect(STOPS.map((s) => s.cam)).toEqual(["desk", "pc", "pc", "open", "open", "explode", "explode", "cpu", "cpu", "back"]);
    expect(STOPS[1].selector).toBe("#beat-pc");
  });

  it("menghitung posisi di antara titik", () => {
    expect(scrollProgress(stops, 0).p).toBe(0);
    expect(scrollProgress(stops, 2000).p).toBe(2);
    expect(scrollProgress(stops, 2250).p).toBeCloseTo(2.5);
    expect(scrollProgress(stops, 99999).p).toBe(9);
  });

  it("keadaan bongkar-pasang mengikuti rumus mockup", () => {
    expect(sceneState(0)).toEqual({ open: 0, explode: 0, deep: 0, back: 0 });
    const s5 = sceneState(4.5);
    expect(s5.explode).toBeGreaterThan(0);
    expect(s5.explode).toBeLessThan(1);
    expect(sceneState(7).deep).toBe(1);
    expect(sceneState(7).open).toBe(1);
    expect(sceneState(9)).toEqual({ open: 0, explode: 0, deep: 0, back: 1 });
  });

  it("label HUD per bahasa", () => {
    expect(hudLabel("cpu", "en")).toEqual(["04", "CPU"]);
    expect(hudLabel("open", "id")).toEqual(["02", "Panel samping"]);
    expect(hudLabel("detail", "en")).toEqual(["›", "Project"]);
  });

  it("mengenali halaman detail proyek", () => {
    expect(isDetailPath("/en/projects/qiran/")).toBe(true);
    expect(isDetailPath("/proyek/agendain/")).toBe(true);
    expect(isDetailPath("/proyek/")).toBe(false);
    expect(isDetailPath("/")).toBe(false);
  });
});
