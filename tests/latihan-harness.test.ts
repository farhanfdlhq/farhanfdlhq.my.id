import { describe, expect, it } from "vitest";
import { loadHarness } from "./helpers/harness";
import type { GradeSpec } from "@/lib/latihan/types";

const { grade } = loadHarness();
const addSpec: GradeSpec = { kind: "function", entry: "add", tests: [{ args: [1, 2], expected: 3 }, { args: [0, 0], expected: 0 }] };

describe("harness: soal fungsi", () => {
  it("semua lulus", () => {
    const r = grade("function add(a,b){return a+b}", addSpec);
    expect(r.ok).toBe(true);
    expect(r.results.map((x) => x.pass)).toEqual([true, true]);
  });

  it("satu gagal memuat got", () => {
    const r = grade("function add(a,b){return a-b}", addSpec);
    expect(r.ok).toBe(false);
    expect(r.results[0]).toEqual({ pass: false, got: "-1" });
    expect(r.results[1].pass).toBe(true);
  });

  it("throws diharapkan", () => {
    const spec: GradeSpec = { kind: "function", entry: "f", tests: [{ args: [5], throws: true }] };
    expect(grade("function f(){ throw new RangeError('x') }", spec).results[0].pass).toBe(true);
    expect(grade("function f(){ return 1 }", spec).results[0]).toEqual({ pass: false, got: "1" });
  });

  it("exception tak terduga jadi error, bukan crash", () => {
    const r = grade("function add(){ throw new Error('x') }", addSpec);
    expect(r.ok).toBe(false);
    expect(r.results[0]).toEqual({ pass: false, error: "Error: x" });
  });

  it("entry tidak ada", () => {
    const r = grade("", addSpec);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("add");
    expect(r.results).toEqual([]);
  });

  it("syntax error", () => {
    const r = grade("function (", addSpec);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/^SyntaxError/);
  });

  it("unordered cocok untuk array luar dan dalam", () => {
    const tests = [{ args: [], expected: [[1, 2], [3]], unordered: true as const }];
    expect(grade("function f(){ return [[3],[2,1]] }", { kind: "function", entry: "f", tests }).ok).toBe(true);
    expect(grade("function f(){ return [[3],[2,1]] }", { kind: "function", entry: "f", tests: [{ args: [], expected: [[1, 2], [3]] }] }).ok).toBe(false);
  });

  it("argumen dikloning per test", () => {
    const shared = [1, 2, 3];
    const spec: GradeSpec = { kind: "function", entry: "f", tests: [{ args: [shared], expected: 3 }, { args: [shared], expected: 3 }] };
    const r = grade("function f(a){ const n = a.length; a.length = 0; return n }", spec);
    expect(r.results.map((x) => x.pass)).toEqual([true, true]);
    expect(shared).toEqual([1, 2, 3]);
  });

  it("nilai aneh tidak crash", () => {
    const spec: GradeSpec = { kind: "function", entry: "f", tests: [0, 1, 2, 3, 4].map((i) => ({ args: [i], expected: 1 })) };
    const code = "function f(i){ if(i===0){const o={};o.o=o;return o} if(i===1) return 10n; if(i===2) return Symbol('s'); if(i===3) return ()=>1; return new Array(100000).fill(7) }";
    const r = grade(code, spec);
    expect(r.results).toHaveLength(5);
    for (const x of r.results) {
      expect(x.pass).toBe(false);
      expect(typeof (x.got ?? x.error)).toBe("string");
      expect((x.got ?? x.error ?? "").length).toBeLessThanOrEqual(2001);
    }
  });

  it("console.log ditangkap dan dibatasi", () => {
    const code = "function add(a,b){ for(let i=0;i<250;i++) console.log(i===0 ? 'x'.repeat(5000) : i===1 ? {a:[1]} : i); return a+b }";
    const r = grade(code, { kind: "function", entry: "add", tests: [{ args: [1, 2], expected: 3 }] });
    expect(r.ok).toBe(true);
    expect(r.logs).toHaveLength(200);
    expect(r.logs[0]).toBe("x".repeat(2000) + "…");
    expect(r.logs[1]).toBe('{"a":[1]}');
  });

  it("kode pengunjung menimpa global atau memakai nama harness", () => {
    const code = "JSON.stringify = () => 'x'; JSON.parse = () => 0; Array.prototype.map = null; Object.keys = null; var results = 1, grade = 2, deepEqual = 3; function add(a,b){return a+b}";
    const r = grade(code, addSpec);
    expect(r.ok).toBe(true);
    expect(r.results).toEqual([{ pass: true }, { pass: true }]);
  });

  it("entry tidak valid ditolak", () => {
    const r = grade("function add(){}", { ...addSpec, entry: "a-b" });
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });
});

describe("harness: soal kelas", () => {
  const stack = "class Stack { constructor(){ this.a = [] } push(x){ this.a.push(x) } pop(){ return this.a.pop() } size(){ return this.a.length } at(i){ if(i>=this.a.length) throw new RangeError('luar'); return this.a[i] } }";

  it("urutan operasi, undefined dianggap null", () => {
    const spec: GradeSpec = { kind: "class", entry: "Stack", tests: [{ ops: [["new"], ["push", 1], ["push", 2], ["pop"], ["size"]], expected: [null, null, null, 2, 1] }] };
    expect(grade(stack, spec).ok).toBe(true);
  });

  it("operasi yang diharapkan melempar", () => {
    const spec: GradeSpec = { kind: "class", entry: "Stack", tests: [{ ops: [["new"], ["push", 1], ["at", 9]], expected: [null, null, { throws: true }] }] };
    expect(grade(stack, spec).ok).toBe(true);
    const lax = stack.replace("throw new RangeError('luar');", "");
    expect(grade(lax, spec).ok).toBe(false);
  });

  it("operasi gagal menyebut operasinya", () => {
    const spec: GradeSpec = { kind: "class", entry: "Stack", tests: [{ ops: [["new"], ["push", 1], ["pop"]], expected: [null, null, 5] }] };
    const r = grade(stack, spec);
    expect(r.results[0].pass).toBe(false);
    expect(r.results[0].got).toContain("pop");
  });

  it("metode tidak ada jadi error", () => {
    const spec: GradeSpec = { kind: "class", entry: "Stack", tests: [{ ops: [["new"], ["peek"]], expected: [null, 1] }] };
    const r = grade(stack, spec);
    expect(r.results[0].pass).toBe(false);
    expect(r.results[0].error).toContain("peek");
  });
});
