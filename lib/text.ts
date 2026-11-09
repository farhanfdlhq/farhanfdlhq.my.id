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
