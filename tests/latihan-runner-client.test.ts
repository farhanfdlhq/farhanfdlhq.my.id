import { describe, expect, it } from "vitest";
import { parseRunnerMessage, TIMEOUT_MS } from "@/lib/latihan/runner-client";

const result = (over: Record<string, unknown> = {}) => ({ type: "result", runId: 3, ok: false, results: [{ pass: true }, { pass: false, got: "1" }], logs: ["a"], ...over });

describe("parseRunnerMessage", () => {
  it("batas waktu 2000 ms", () => expect(TIMEOUT_MS).toBe(2000));

  it("menerima ready dan result yang sah", () => {
    expect(parseRunnerMessage({ type: "ready", workerOk: true }, 0)).toEqual({ type: "ready", workerOk: true });
    expect(parseRunnerMessage(result(), 2)).toEqual({ type: "result", runId: 3, ok: false, results: [{ pass: true }, { pass: false, got: "1" }], logs: ["a"] });
    expect(parseRunnerMessage(result({ ok: false, error: "SyntaxError: x", results: [] }), 2)).toMatchObject({ error: "SyntaxError: x", results: [] });
  });

  it("menolak bentuk lain", () => {
    for (const bad of [
      "result", null, undefined, 5, [], { type: "other" }, { type: "ready" }, { type: "ready", workerOk: "yes" },
      result({ runId: "3" }), result({ ok: "no" }), result({ results: [{ pass: "yes" }] }), result({ results: "x" }),
      result({ logs: [1] }), result({ results: [{ pass: true, got: 5 }] }), result({ error: 1 }),
    ]) expect(parseRunnerMessage(bad, 2), JSON.stringify(bad)).toBeNull();
  });

  it("menolak hasil yang lebih banyak dari jumlah test", () => {
    expect(parseRunnerMessage(result(), 1)).toBeNull();
  });

  it("memotong teks panjang dan log berlebih", () => {
    const m = parseRunnerMessage(result({ results: [{ pass: false, got: "x".repeat(5000), error: "e".repeat(3000) }], logs: Array(300).fill("y".repeat(2500)) }), 1);
    if (!m || m.type !== "result") throw new Error("harus result");
    expect(m.results[0].got!.length).toBeLessThanOrEqual(2001);
    expect(m.results[0].error!.length).toBeLessThanOrEqual(2001);
    expect(m.logs).toHaveLength(200);
    expect(m.logs[0].length).toBeLessThanOrEqual(2001);
  });

  it("hanya menyalin field yang dikenal", () => {
    const m = parseRunnerMessage(result({ extra: "<b>", results: [{ pass: true, html: "<img>" }] }), 2);
    expect(m).not.toHaveProperty("extra");
    if (m?.type === "result") expect(m.results[0]).toEqual({ pass: true });
  });
});
