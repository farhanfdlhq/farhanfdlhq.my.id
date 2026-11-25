import { soalById } from "@/lib/latihan/content";
import { safeDecode } from "@/lib/text";

export const dynamic = "force-dynamic";

/** Test dan solusi acuan, diambil halaman soal hanya saat dibutuhkan. Hanya membaca; tidak ada yang menerima kode pengunjung. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; part: string }> }) {
  const { id, part } = await params;
  const decoded = safeDecode(id);
  const s = decoded === null ? null : soalById(decoded);
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!s || (part !== "tests" && part !== "solution")) return Response.json({ error: "Tidak ditemukan" }, { status: 404, headers });
  return Response.json(part === "tests" ? { kind: s.kind, entry: s.entry, tests: s.tests } : { solution: s.solution }, { headers });
}
