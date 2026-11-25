import { soalById, soalText } from "@/lib/latihan/content";
import { LEVELS } from "@/lib/latihan/catalog";
import { ogImage } from "@/lib/og";
import { safeDecode } from "@/lib/text";

export const dynamic = "force-dynamic";

/** Gambar OG per soal latihan. Soal tersembunyi atau yang tidak ada mendapat 404. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = safeDecode((await params).id);
  const s = id === null ? null : soalById(id);
  if (!s) return new Response("Tidak ditemukan", { status: 404 });
  const lang = new URL(req.url).searchParams.get("lang") === "en" ? "en" : "id";
  const level = LEVELS.find((l) => l.n === s.level)!;
  return ogImage({ title: soalText(s, lang).title, kicker: `${lang === "en" ? "Practice" : "Latihan"} · Level ${s.level}`, foot: `${level.name[lang]} · ${s.topic[lang]}` });
}
