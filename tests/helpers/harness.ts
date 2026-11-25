import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import type { GradeResult, GradeSpec } from "@/lib/latihan/types";

/** Jalankan public/latihan-runner/harness.js di konteks terpisah, sama seperti di worker, lalu ambil grade-nya. */
export function loadHarness(): { grade(code: string, spec: GradeSpec): GradeResult } {
  const src = fs.readFileSync(path.join(process.cwd(), "public/latihan-runner/harness.js"), "utf8");
  const ctx = vm.createContext({});
  vm.runInContext(src, ctx);
  return vm.runInContext("fdqHarness()", ctx);
}
