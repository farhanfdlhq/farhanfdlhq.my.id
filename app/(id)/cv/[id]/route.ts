import fs from "node:fs";
import path from "node:path";
import { dataDir, getDb } from "@/lib/db";
import type { CvRow } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Unduh file CV. File disimpan di DATA_DIR/cv/ dengan nama acak; nama unduhan diambil dari label. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const row = Number.isInteger(id) ? (getDb().prepare("SELECT * FROM cvs WHERE id = ?").get(id) as CvRow | undefined) : undefined;
  const root = path.join(dataDir(), "cv");
  const file = row ? path.resolve(/*turbopackIgnore: true*/ root, row.file) : "";
  if (!row || !file.startsWith(root + path.sep) || !fs.existsSync(file)) return new Response("Tidak ditemukan", { status: 404 });
  const name = (row.label.replace(/[^\p{L}\p{N} ._-]+/gu, "").trim() || "CV") + ".pdf";
  return new Response(new Uint8Array(await fs.promises.readFile(file)), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
