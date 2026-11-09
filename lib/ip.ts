/**
 * IP pengunjung dari header. Urutannya:
 * 1. X-Real-IP: diisi Nginx kita sendiri setelah modul real_ip membaca CF-Connecting-IP hanya dari alamat Cloudflare,
 *    jadi tidak bisa dipalsukan oleh orang yang menembak IP server langsung.
 * 2. CF-Connecting-IP: kalau Nginx belum diatur.
 * 3. X-Forwarded-For: pilihan terakhir.
 */
export function ipFromHeaders(h: { get(name: string): string | null }): string {
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "0.0.0.0";
}
