import { describe, expect, it } from "vitest";
import { markPassed, markViewed, nextUp, PROGRESS_KEY, readProgress, recommendedAfter, setDraft, writeProgress } from "@/lib/latihan/progress";

function fakeStorage(init: Record<string, string> = {}, failWrites = false): Storage {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => { if (failWrites) throw new DOMException("penuh", "QuotaExceededError"); m.set(k, v); },
    removeItem: (k: string) => { m.delete(k); },
    clear: () => m.clear(),
  };
}

describe("progres latihan", () => {
  it("kunci penyimpanan", () => expect(PROGRESS_KEY).toBe("fdq.latihan.v1"));

  it("data rusak dianggap kosong", () => {
    expect(readProgress(fakeStorage({ [PROGRESS_KEY]: "{rusak" }))).toEqual({});
    expect(readProgress(fakeStorage({ [PROGRESS_KEY]: "[]" }))).toEqual({});
    expect(readProgress(fakeStorage({ [PROGRESS_KEY]: "null" }))).toEqual({});
    expect(readProgress(fakeStorage())).toEqual({});
    expect(readProgress(null)).toEqual({});
  });

  it("entri berbentuk lain dibersihkan", () => {
    const raw = JSON.stringify({ a: { status: "x", draft: "kode" }, b: "teks", c: { status: "passed", passedAt: "kemarin", draft: 5 } });
    expect(readProgress(fakeStorage({ [PROGRESS_KEY]: raw }))).toEqual({ a: { draft: "kode" }, c: { status: "passed" } });
  });

  it("tulis lalu baca", () => {
    const s = fakeStorage();
    expect(writeProgress(s, { a: { status: "passed", passedAt: 1 } })).toBe(true);
    expect(readProgress(s)).toEqual({ a: { status: "passed", passedAt: 1 } });
  });

  it("storage penuh atau tidak ada tidak melempar", () => {
    expect(writeProgress(fakeStorage({}, true), { a: {} })).toBe(false);
    expect(writeProgress(null, { a: {} })).toBe(false);
  });

  it("dilihat tidak menurunkan lulus, lulus menaikkan dilihat", () => {
    const p = markPassed({}, "a", 10);
    expect(markViewed(p, "a").a).toEqual({ status: "passed", passedAt: 10 });
    expect(markPassed(markViewed({}, "b"), "b", 5).b.status).toBe("passed");
    expect(markViewed({}, "c").c.status).toBe("viewed");
  });

  it("fungsi mark dan draf tidak mengubah input", () => {
    const p = { a: { draft: "x" } };
    const q = setDraft(p, "a", "y");
    expect(p.a.draft).toBe("x");
    expect(q.a.draft).toBe("y");
    expect(markPassed(q, "a", 1).a).toEqual({ draft: "y", status: "passed", passedAt: 1 });
  });

  it("soal berikutnya: yang pertama belum lulus", () => {
    expect(nextUp(["a", "b"], { a: { status: "passed" } })).toBe("b");
    expect(nextUp(["a", "b"], { a: { status: "viewed" } })).toBe("a");
    expect(nextUp(["a", "b"], { a: { status: "passed" }, b: { status: "passed" } })).toBeNull();
    expect(nextUp([], {})).toBeNull();
  });

  it("level yang disarankan diselesaikan dulu", () => {
    const levels = [{ n: 1, ids: ["a", "b"] }, { n: 2, ids: ["c"] }];
    expect(recommendedAfter(levels, {})).toBe(1);
    expect(recommendedAfter(levels, { a: { status: "passed" }, b: { status: "passed" } })).toBe(2);
    expect(recommendedAfter(levels, { a: { status: "passed" }, b: { status: "passed" }, c: { status: "passed" } })).toBeNull();
  });
});
