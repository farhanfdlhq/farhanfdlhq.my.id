/** Pemecah teks isian admin menjadi paragraf atau butir. Baris kosong memisahkan paragraf. */
export function lines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

/** Butir "Judul singkat. Isi..." dipecah supaya judulnya bisa ditebalkan. */
export function leadSentence(line: string): { lead: string; rest: string } {
  const m = line.match(/^([^.!?]{2,48}[.!?])\s+(.+)$/);
  return m ? { lead: m[1], rest: m[2] } : { lead: "", rest: line };
}

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

/** decodeURIComponent tanpa melempar error: alamat dengan persen rusak menghasilkan null (jadi 404, bukan 500). */
export function safeDecode(s: string): string | null {
  try { return decodeURIComponent(s); } catch { return null; }
}

/** Teks dengan `kode` di antara backtick, dipecah supaya kodenya bisa dirender sebagai <code>. Backtick tanpa pasangan dibiarkan. */
export function codeSpans(text: string): (string | { code: string })[] {
  const out: (string | { code: string })[] = [];
  let rest = text;
  for (;;) {
    const a = rest.indexOf("`");
    const b = a < 0 ? -1 : rest.indexOf("`", a + 1);
    if (b < 0) break;
    if (a > 0) out.push(rest.slice(0, a));
    out.push({ code: rest.slice(a + 1, b) });
    rest = rest.slice(b + 1);
  }
  if (rest) out.push(rest);
  return out;
}
