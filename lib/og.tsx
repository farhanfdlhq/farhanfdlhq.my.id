/** Gambar Open Graph 1200×630: latar hitam, judul Archivo lebar, titik merah, baris mono di bawah. */
import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

const font = (f: string) => fs.readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "assets/og", f));
let fonts: { name: string; data: Buffer; weight: 800 | 500; style: "normal" }[] | null = null;
const loadFonts = () => (fonts ??= [
  { name: "Archivo", data: font("archivo-expanded-800.ttf"), weight: 800, style: "normal" },
  { name: "Plex", data: font("ibm-plex-mono-latin-500-normal.woff"), weight: 500, style: "normal" },
]);

/**
 * WhatsApp dan beberapa aplikasi chat memotong gambar 1200×630 menjadi kotak di tengah.
 * Karena itu semua isi penting diletakkan di kolom tengah selebar SAFE px; sisi kiri dan kanan hanya garis hias.
 */
const SAFE = 630;

/** Ukuran huruf judul: kata terpanjang harus muat di kolom tengah (Archivo lebar ±0,9 em per huruf kapital). */
function titleSize(words: string[]): number {
  const longest = Math.max(...words.map((w) => w.length), 1) + 1;
  return Math.max(36, Math.min(76, Math.floor((SAFE - 90) / (longest * 0.9))));
}

export function ogImage({ title, kicker, foot }: { title: string; kicker: string; foot: string }) {
  const words = title.trim().split(/\s+/);
  const size = titleSize(words);
  const edge = (SAFE / 2) | 0;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "#050505", color: "#DDE6F0" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 600 - edge, width: 1, background: "#1A1D22" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 600 + edge, width: 1, background: "#1A1D22" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 315, height: 1, background: "#111317" }} />
        <div style={{ width: SAFE - 60, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22, background: "#050505", padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontFamily: "Archivo", fontSize: 64, lineHeight: 1 }}>
            f<span style={{ color: "#FF4D3D" }}>.</span>
          </div>
          {kicker ? <div style={{ display: "flex", fontFamily: "Plex", fontSize: 24, color: "#8B929B" }}>{kicker}</div> : null}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.32, fontFamily: "Archivo", fontSize: size, lineHeight: 1.04, textTransform: "uppercase", letterSpacing: -1 }}>
            {/* Satori hanya mengenal flex, jadi titik merah ditempel ke kata terakhir supaya tidak turun baris sendirian */}
            {words.map((w, i) => (
              <div key={i} style={{ display: "flex" }}>
                {w}
                {i === words.length - 1 ? <span style={{ color: "#FF4D3D" }}>.</span> : null}
              </div>
            ))}
          </div>
          {foot ? <div style={{ display: "flex", fontFamily: "Plex", fontSize: 22, color: "#8B929B" }}>{foot}</div> : null}
          <div style={{ display: "flex", fontFamily: "Plex", fontSize: 20, color: "#5D646E" }}>farhanfdlhq.my.id</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: loadFonts(), headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
