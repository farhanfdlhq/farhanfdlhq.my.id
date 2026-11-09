import { Header } from "./Header";
import { SceneSlot } from "./SceneSlot";
import { Footer } from "./Footer";
import { Motion } from "./Motion";
import { profile } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

/** Bingkai semua halaman publik: adegan di belakang, kepala, isi, dan kaki. */
export function PublicShell({ lang, path, isHome, children }: { lang: Lang; path: string; isHome?: boolean; children: React.ReactNode }) {
  return (
    <div className={isHome ? "site is-home" : "site"} id="site">
      <SceneSlot lang={lang} />
      <Header lang={lang} path={path} />
      {children}
      <Footer name={profile(lang).name} />
      <Motion />
    </div>
  );
}
