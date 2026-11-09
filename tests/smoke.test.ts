import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("kerangka", () => {
  const css = () => fs.readFileSync("app/globals.css", "utf8");

  it("memakai token warna dari DESIGN.md", () => {
    expect(css()).toContain("--red: #FF4D3D");
    expect(css()).toContain("--bg: #050505");
  });

  it("tidak memuat huruf dari Google Fonts atau CDN", () => {
    expect(css()).not.toMatch(/fonts\.googleapis\.com|cdnjs|jsdelivr|unpkg/);
  });

  it("tidak membawa kontrol mockup", () => {
    expect(css()).not.toMatch(/\.stage|\.device|\.seg\b|\.bar\b/);
  });
});
