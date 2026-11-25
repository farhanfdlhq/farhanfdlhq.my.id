import { codeSpans } from "@/lib/text";

/** Teks biasa dengan `kode` yang dirender sebagai <code>. Semua isi lewat React, jadi tetap di-escape. */
export function InlineCode({ text }: { text: string }) {
  return <>{codeSpans(text).map((p, i) => (typeof p === "string" ? p : <code key={i}>{p.code}</code>))}</>;
}

/** Paragraf per baris. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const ls = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return <div className={className}>{ls.map((l, i) => <p key={i}><InlineCode text={l} /></p>)}</div>;
}
