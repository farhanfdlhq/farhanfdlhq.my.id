import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { alternatePath, challengePath, practicePath } from "@/lib/paths";
import { codeSpans } from "@/lib/text";
import { setLatihanHidden } from "@/lib/latihan/content";
import sitemap from "@/app/sitemap";

describe("path latihan", () => {
  it("daftar dan soal", () => {
    expect(practicePath("id")).toBe("/latihan/");
    expect(practicePath("en")).toBe("/en/practice/");
    expect(challengePath("id", "vector")).toBe("/latihan/vector/");
    expect(challengePath("en", "dua-angka")).toBe("/en/practice/dua-angka/");
  });
  it("pasangan bahasa", () => {
    expect(alternatePath("id", "/latihan/vector/")).toBe("/en/practice/vector/");
    expect(alternatePath("en", "/en/practice/vector/")).toBe("/latihan/vector/");
    expect(alternatePath("id", "/latihan/")).toBe("/en/practice/");
    expect(alternatePath("en", "/en/practice/")).toBe("/latihan/");
    expect(alternatePath("id", "/proyek/agendain/")).toBe("/en/projects/agendain/");
  });
});

describe("codeSpans", () => {
  it("memecah teks di backtick", () => {
    expect(codeSpans("pakai `push` lalu `pop`.")).toEqual(["pakai ", { code: "push" }, " lalu ", { code: "pop" }, "."]);
  });
  it("backtick tanpa pasangan tetap teks", () => {
    expect(codeSpans("a ` b")).toEqual(["a ` b"]);
    expect(codeSpans("`x` dan ` sisa")).toEqual([{ code: "x" }, " dan ` sisa"]);
  });
  it("teks tanpa kode", () => expect(codeSpans("biasa")).toEqual(["biasa"]));
});

describe("sitemap latihan", () => {
  beforeEach(() => { freshDataDir(); });
  it("memuat daftar dan soal, tanpa soal tersembunyi", () => {
    setLatihanHidden("dua-angka", true);
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/latihan/"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/en/practice/"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/en/practice/vector/"))).toBe(true);
    expect(urls.some((u) => u.includes("dua-angka"))).toBe(false);
  });
});
