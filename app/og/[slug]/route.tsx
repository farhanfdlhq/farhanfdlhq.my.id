import { projectBySlug, stackList } from "@/lib/content";
import { ogImage } from "@/lib/og";
import { safeDecode } from "@/lib/text";

export const dynamic = "force-dynamic";

/** Gambar OG per proyek. Proyek draf atau yang tidak ada mendapat 404. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = safeDecode((await params).slug);
  const p = slug === null ? null : projectBySlug(slug);
  if (!p) return new Response("Tidak ditemukan", { status: 404 });
  return ogImage({ title: p.title, kicker: p.year ? `Proyek · ${p.year}` : "Proyek", foot: stackList(p.stack).slice(0, 4).join(" · ") });
}
