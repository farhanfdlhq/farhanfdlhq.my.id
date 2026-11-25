import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { catalog, LEVELS, loadCatalog } from "@/lib/latihan/catalog";
import { loadHarness } from "./helpers/harness";

const text = { title: "Judul", story: "Cerita", hint1: "P1", hint2: "P2" };
const base = () => ({
  id: "contoh", level: 1, order: 1, kind: "function", entry: "f", target: "O(1)",
  topic: { id: "Array", en: "Arrays" }, text: { id: { ...text }, en: { ...text } },
  tests: [{ args: [1], expected: 1, example: true }, { args: [2], expected: 2 }, { args: [3], expected: 3, hidden: true }],
});

function tmpCatalog(entries: Record<string, unknown>[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fdq-latihan-"));
  entries.forEach((e, i) => {
    const d = path.join(dir, `s${i}`);
    fs.mkdirSync(d);
    fs.writeFileSync(path.join(d, "soal.json"), JSON.stringify(e));
    fs.writeFileSync(path.join(d, "starter.js"), "function f(x) {\n}\n");
    fs.writeFileSync(path.join(d, "solution.js"), "function f(x) { return x }\n");
  });
  return dir;
}

describe("loadCatalog: validasi", () => {
  it("menerima soal yang lengkap", () => {
    const list = loadCatalog(tmpCatalog([base()]));
    expect(list).toHaveLength(1);
    expect(list[0].starter).toContain("function f");
    expect(list[0].solution).toContain("return x");
  });

  const bad: [string, (s: ReturnType<typeof base>) => unknown][] = [
    ["tanpa text.en.title", (s) => { (s.text.en as Partial<typeof text>).title = undefined; return s; }],
    ["level di luar 1..7", (s) => ({ ...s, level: 8 })],
    ["kind lain", (s) => ({ ...s, kind: "script" })],
    ["id tidak valid", (s) => ({ ...s, id: "Bukan Slug" })],
    ["ops[0] bukan new", (s) => ({ ...s, kind: "class", tests: [{ ops: [["push", 1]], expected: [null] }] })],
    ["expected tidak sepanjang ops", (s) => ({ ...s, kind: "class", tests: [{ ops: [["new"], ["push", 1]], expected: [null] }] })],
    ["test fungsi tanpa args", (s) => ({ ...s, tests: [{ expected: 1 }] })],
  ];
  for (const [name, mutate] of bad) {
    it(`menolak: ${name}`, () => {
      expect(() => loadCatalog(tmpCatalog([mutate(base()) as Record<string, unknown>]))).toThrow(/s0/);
    });
  }

  it("menolak id duplikat", () => {
    expect(() => loadCatalog(tmpCatalog([base(), { ...base(), order: 2 }]))).toThrow(/contoh/);
  });

  it("menolak pasangan level dan order ganda", () => {
    expect(() => loadCatalog(tmpCatalog([base(), { ...base(), id: "lain" }]))).toThrow(/order/);
  });
});

describe("katalog di repo", () => {
  const list = catalog();
  const { grade } = loadHarness();

  it("punya tujuh level", () => {
    expect(LEVELS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(LEVELS[0].name).toEqual({ id: "Dasar", en: "Basics" });
  });

  it("urut level lalu order", () => {
    const keys = list.map((s) => s.level * 1000 + s.order);
    expect([...keys].sort((a, b) => a - b)).toEqual(keys);
  });

  for (const s of list) {
    describe(s.id, () => {
      const spec = { kind: s.kind, entry: s.entry, tests: s.tests };
      it("solusi acuan lulus semua test", () => {
        const r = grade(s.solution, spec);
        expect(r.error).toBeUndefined();
        expect(r.results.filter((x) => !x.pass)).toEqual([]);
        expect(r.ok).toBe(true);
      });
      it("kode awal gagal", () => {
        expect(grade(s.starter, spec).ok).toBe(false);
      });
      it("punya contoh, test terlihat, dan test tersembunyi", () => {
        expect(s.tests.filter((t) => !t.hidden).length).toBeGreaterThanOrEqual(2);
        expect(s.tests.some((t) => t.example)).toBe(true);
        expect(s.tests.some((t) => t.hidden)).toBe(true);
      });
      it("teks ID dan EN lengkap, tanpa em dash", () => {
        for (const lang of ["id", "en"] as const) {
          for (const k of ["title", "story", "hint1", "hint2"] as const) {
            expect(s.text[lang][k].trim()).not.toBe("");
            expect(s.text[lang][k]).not.toContain("—");
          }
          expect(s.topic[lang].trim()).not.toBe("");
        }
      });
    });
  }

  it("Level 1 sampai 4 berisi 12 soal", () => {
    expect(list.filter((s) => s.level <= 4).length).toBe(12);
  });

  it("Level 1 berisi tiga soal pertama", () => {
    expect(list.filter((s) => s.level === 1).map((s) => s.id)).toEqual(["balik-string", "dua-angka", "vector"]);
  });
});
