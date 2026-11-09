import { t, type Lang } from "@/lib/i18n";

/** Tempat adegan 3D. Tanpa WebGL atau JavaScript, ini hanya latar hitam. */
export function SceneSlot({ lang }: { lang: Lang }) {
  return (
    <div className="scene" id="scene" aria-hidden="true">
      <canvas id="gl" />
      <div className="vignette" />
      <div className="peek-hint">{t(lang, "peek_hint")}</div>
      <div className="hud" id="hud"><span className="i">00</span><span className="n">{lang === "en" ? "Desk" : "Meja"}</span></div>
    </div>
  );
}
