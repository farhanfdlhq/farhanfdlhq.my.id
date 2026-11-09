import { Header } from "./Header";
import { SceneSlot } from "./SceneSlot";
import { Footer } from "./Footer";
import { Motion } from "./Motion";
import { PeekButton } from "./PeekButton";
import { SceneLoader } from "@/components/scene/SceneLoader";
import { t } from "@/lib/i18n";
import { profile } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

/** Bingkai semua halaman publik: adegan di belakang, kepala, isi, dan kaki. */
export function PublicShell({ lang, path, isHome, children }: { lang: Lang; path: string; isHome?: boolean; children: React.ReactNode }) {
  return (
    <div className={isHome ? "site is-home" : "site"} id="site">
      <SceneSlot lang={lang} />
      <Header lang={lang} path={path} tools={<PeekButton labelOn={t(lang, "peek_on")} labelOff={t(lang, "peek_off")} />} />
      {children}
      <Footer name={profile(lang).name} />
      <Motion />
      <SceneLoader />
    </div>
  );
}
