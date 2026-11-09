import { getSetting } from "@/lib/settings";
import { ogImage } from "@/lib/og";

export const dynamic = "force-dynamic";

/** Gambar OG untuk Beranda dan halaman daftar proyek. */
export async function GET() {
  return ogImage({ title: getSetting("name"), kicker: getSetting("city"), foot: getSetting("role") });
}
