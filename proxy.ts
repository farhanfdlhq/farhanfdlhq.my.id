import { NextResponse, type NextRequest } from "next/server";

/** Alamat proyek dengan kode persen rusak (misalnya %E0%A4%A) membuat Next gagal sebelum halaman jalan dan menjawab 500. Dijawab 404 di sini. */
export function proxy(req: NextRequest) {
  try {
    decodeURIComponent(req.nextUrl.pathname);
    return NextResponse.next();
  } catch {
    return new NextResponse("Tidak ditemukan", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

export const config = { matcher: ["/proyek/:path*", "/en/projects/:path*"] };
