/** Bentuk soal dan hasil penilaian yang dipakai bersama oleh katalog, runner, dan halaman. */
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export type FunctionTest = { args: Json[]; expected?: Json; throws?: true; unordered?: true; hidden?: true; example?: true };
/** ops[0] selalu ["new", ...argumen konstruktor]. */
export type Op = [string, ...Json[]];
/** expected sepanjang ops. Untuk "new" isinya null. {any: true} berarti nilai kembaliannya tidak dinilai (metode pengubah). */
export type ClassTest = { ops: Op[]; expected: (Json | { throws: true } | { any: true })[]; hidden?: true; example?: true };
export type Test = FunctionTest | ClassTest;

export type GradeSpec = { kind: "function" | "class"; entry: string; tests: Test[] };
/** got adalah nilai hasil yang sudah diformat menjadi teks. */
export type TestResult = { pass: boolean; got?: string; error?: string };
export type GradeResult = { ok: boolean; error?: string; results: TestResult[]; logs: string[] };
