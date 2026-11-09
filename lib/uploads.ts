import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { uploadsDir } from "@/lib/db";

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/** Kesalahan yang pesannya aman ditampilkan ke admin apa adanya. */
export class UploadError extends Error {}

type Kind = "jpeg" | "png" | "webp" | "heic" | null;

/** Jenis file dibaca dari isinya, bukan dari nama atau Content-Type kiriman browser. */
export function sniffImage(buf: Buffer): Kind {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length >= 12 && buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") return "webp";
  if (buf.length >= 12 && buf.toString("latin1", 4, 8) === "ftyp" && /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(buf.toString("latin1", 8, 12))) return "heic";
  return null;
}

/** Simpan gambar sebagai WebP: diputar sesuai EXIF, lebar maksimal 1600 px, kualitas 80, tanpa metadata (lokasi GPS ikut hilang). */
export async function storeImage(buf: Buffer, _name: string): Promise<string> {
  if (buf.length > MAX_IMAGE_BYTES) throw new UploadError("Foto lebih dari 12 MB. Kecilkan dulu atau pilih foto lain.");
  const kind = sniffImage(buf);
  if (kind === "heic") throw new UploadError("Foto HEIC belum didukung. Di iPhone, ubah Kamera > Format ke Paling Kompatibel, atau kirim sebagai JPG.");
  if (!kind) throw new UploadError("File ini bukan gambar. Pilih foto JPG, PNG, atau WebP.");
  let out: Buffer;
  try {
    out = await sharp(buf, { failOn: "error" }).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  } catch {
    throw new UploadError("Foto ini tidak bisa dibaca. Coba simpan ulang sebagai JPG lalu unggah lagi.");
  }
  const now = new Date();
  const rel = path.join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
  const name = crypto.createHash("sha256").update(out).digest("hex").slice(0, 20) + ".webp";
  const folder = path.join(uploadsDir(), rel);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, name), out);
  return `/uploads/${rel.split(path.sep).join("/")}/${name}`;
}

/** Hapus file unggahan dari disk. Alamat di luar /uploads/ atau milik seed diabaikan. */
export function removeUpload(url: string) {
  if (!url.startsWith("/uploads/") || url.startsWith("/uploads/seed/")) return;
  const root = uploadsDir();
  const file = path.resolve(/*turbopackIgnore: true*/ root, url.slice("/uploads/".length));
  if (file.startsWith(root + path.sep) && fs.existsSync(file)) fs.unlinkSync(file);
}
