/** Teks contoh dan label test, dipakai di halaman soal (server) dan Workbench (klien). */
import type { ClassTest, FunctionTest, Json, Test } from "./types";

const show = (v: Json) => JSON.stringify(v);
const args = (a: Json[]) => a.map(show).join(", ");

export type TestLine = { call: string; expected: string };

/** Satu test sebagai baris kode. Untuk soal kelas, satu baris per operasi. */
export function testLines(kind: "function" | "class", entry: string, test: Test): TestLine[] {
  if (kind === "function") {
    const t = test as FunctionTest;
    return [{ call: `${entry}(${args(t.args)})`, expected: t.throws ? "error" : show(t.expected ?? null) }];
  }
  const t = test as ClassTest;
  const v = entry.charAt(0).toLowerCase() + entry.slice(1);
  const name = v === entry ? `${v}0` : v;
  return t.ops.map(([op, ...a], i) => {
    const want = t.expected[i];
    const throws = typeof want === "object" && want !== null && !Array.isArray(want) && (want as { throws?: unknown }).throws === true;
    if (i === 0) return { call: `const ${name} = new ${entry}(${args(a)})`, expected: "" };
    return { call: `${name}.${op}(${args(a)})`, expected: throws ? "error" : want === null ? "" : show(want as Json) };
  });
}
