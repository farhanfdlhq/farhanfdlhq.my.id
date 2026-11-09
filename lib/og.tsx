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

export function ogImage({ title, kicker, foot }: { title: string; kicker: string; foot: string }) {
  const size = title.length > 26 ? 64 : title.length > 16 ? 80 : 96;
  const words = title.trim().split(/\s+/);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#050505", color: "#DDE6F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "Plex", fontSize: 26, color: "#8B929B" }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontFamily: "Archivo", fontSize: 44, color: "#DDE6F0", lineHeight: 1 }}>
            f<span style={{ color: "#FF4D3D" }}>.</span>
          </div>
          <span>{kicker}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: size * 0.32, fontFamily: "Archivo", fontSize: size, lineHeight: 1.02, textTransform: "uppercase", letterSpacing: -1, maxWidth: 1050 }}>
          {/* Satori hanya mengenal flex, jadi titik merah ditempel ke kata terakhir supaya tidak turun baris sendirian */}
          {words.map((w, i) => (
            <div key={i} style={{ display: "flex" }}>
              {w}
              {i === words.length - 1 ? <span style={{ color: "#FF4D3D" }}>.</span> : null}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Plex", fontSize: 24, color: "#8B929B", borderTop: "1px solid #24282E", paddingTop: 24 }}>
          <span>{foot}</span>
          <span>farhanfdlhq.my.id</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: loadFonts(), headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
