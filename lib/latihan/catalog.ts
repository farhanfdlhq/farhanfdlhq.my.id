/** Katalog soal latihan dari folder latihan/ di repo. Teks di sini adalah teks bawaan; admin bisa menimpanya (lib/latihan/content.ts). */
import fs from "node:fs";
import path from "node:path";
import type { Lang } from "../lang";
import type { GradeSpec } from "./types";

export type SoalText = { title: string; story: string; hint1: string; hint2: string };
export type Soal = {
  id: string; level: number; order: number; kind: "function" | "class"; entry: string; target: string;
  topic: Record<Lang, string>; text: Record<Lang, SoalText>; tests: GradeSpec["tests"]; starter: string; solution: string;
};

export const LEVELS: { n: number; name: Record<Lang, string> }[] = [
  { n: 1, name: { id: "Dasar", en: "Basics" } },
  { n: 2, name: { id: "Struktur linear", en: "Linear structures" } },
  { n: 3, name: { id: "Mencari", en: "Searching" } },
  { n: 4, name: { id: "Tree", en: "Trees" } },
  { n: 5, name: { id: "Sorting", en: "Sorting" } },
  { n: 6, name: { id: "Graf", en: "Graphs" } },
  { n: 7, name: { id: "Lanjutan", en: "Advanced" } },
];

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ENTRY_RE = /^[A-Za-z_$][\w$]*$/;
const TEXT_KEYS = ["title", "story", "hint1", "hint2"] as const;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => typeof v === "string" && v.trim() !== "";

/** Pesan error yang ditemukan pada satu soal, kosong kalau valid. */
function problems(s: unknown): string[] {
  const out: string[] = [];
  if (!isObj(s)) return ["soal.json bukan objek"];
  if (typeof s.id !== "string" || !ID_RE.test(s.id)) out.push("id harus huruf kecil, angka, dan tanda hubung");
  if (!Number.isInteger(s.level) || (s.level as number) < 1 || (s.level as number) > LEVELS.length) out.push("level harus 1 sampai 7");
  if (!Number.isInteger(s.order) || (s.order as number) < 1) out.push("order harus bilangan bulat positif");
  if (s.kind !== "function" && s.kind !== "class") out.push('kind harus "function" atau "class"');
  if (typeof s.entry !== "string" || !ENTRY_RE.test(s.entry)) out.push("entry bukan nama JavaScript yang valid");
  if (typeof s.target !== "string") out.push("target harus string");
  for (const lang of ["id", "en"] as const) {
    if (!isObj(s.topic) || !str(s.topic[lang])) out.push(`topic.${lang} kosong`);
    const t = isObj(s.text) ? s.text[lang] : undefined;
    for (const k of TEXT_KEYS) if (!isObj(t) || !str(t[k])) out.push(`text.${lang}.${k} kosong`);
  }
  if (!Array.isArray(s.tests) || s.tests.length === 0) out.push("tests kosong");
  else s.tests.forEach((t, i) => {
    if (!isObj(t)) return out.push(`tests[${i}] bukan objek`);
    if (s.kind === "class") {
      const ops = t.ops, exp = t.expected;
      if (!Array.isArray(ops) || !ops.length || !ops.every((o) => Array.isArray(o) && typeof o[0] === "string")) out.push(`tests[${i}].ops tidak valid`);
      else if (ops[0][0] !== "new") out.push(`tests[${i}].ops[0] harus ["new", ...]`);
      if (!Array.isArray(exp) || !Array.isArray(ops) || exp.length !== ops.length) out.push(`tests[${i}].expected harus sepanjang ops`);
    } else {
      if (!Array.isArray(t.args)) out.push(`tests[${i}].args harus array`);
      if (!("expected" in t) && t.throws !== true) out.push(`tests[${i}] butuh expected atau throws`);
    }
  });
  return out;
}

export function loadCatalog(dir: string = path.join(/*turbopackIgnore: true*/ process.cwd(), "latihan")): Soal[] {
  const folders = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const list: Soal[] = [];
  for (const folder of folders) {
    const at = path.join(dir, folder);
    let raw: unknown;
    try { raw = JSON.parse(fs.readFileSync(path.join(at, "soal.json"), "utf8")); }
    catch (e) { throw new Error(`latihan/${folder}: soal.json tidak terbaca (${(e as Error).message})`); }
    const errs = problems(raw);
    const read = (f: string) => { try { return fs.readFileSync(path.join(at, f), "utf8"); } catch { errs.push(`${f} tidak ada`); return ""; } };
    const starter = read("starter.js"), solution = read("solution.js");
    if (errs.length) throw new Error(`latihan/${folder}: ${errs.join("; ")}`);
    const s = raw as Omit<Soal, "starter" | "solution">;
    list.push({ id: s.id, level: s.level, order: s.order, kind: s.kind, entry: s.entry, target: s.target, topic: s.topic, text: s.text, tests: s.tests, starter, solution });
  }
  const ids = new Set<string>(), slots = new Set<number>();
  for (const s of list) {
    if (ids.has(s.id)) throw new Error(`latihan: id ganda "${s.id}"`);
    ids.add(s.id);
    const slot = s.level * 1000 + s.order;
    if (slots.has(slot)) throw new Error(`latihan: level ${s.level} order ${s.order} dipakai dua soal ("${s.id}")`);
    slots.add(slot);
  }
  return list.sort((a, b) => a.level - b.level || a.order - b.order);
}

const g = globalThis as unknown as { __fdqLatihan?: Soal[] };

/** Katalog dari folder latihan/ di repo, dibaca sekali per proses. */
export function catalog(): Soal[] {
  return (g.__fdqLatihan ??= loadCatalog());
}
