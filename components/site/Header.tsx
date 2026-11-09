import { LogoMark } from "./LogoMark";
import { homePath, alternatePath } from "@/lib/paths";
import { t, type Lang } from "@/lib/i18n";

/** Kepala situs: logo, menu, dan pilihan bahasa (tautan biasa, jadi jalan tanpa JavaScript). */
export function Header({ lang, path, tools }: { lang: Lang; path: string; tools?: React.ReactNode }) {
  const home = homePath(lang);
  const other = alternatePath(lang, path);
  return (
    <header className="head">
      <a className="mark" href={home} aria-label={`farhanfdlhq, ${t(lang, "home")}`}>
        <LogoMark /><span className="wm">farhanfdlhq<span>.</span></span>
      </a>
      <nav className="nav" aria-label={lang === "en" ? "Main" : "Utama"}>
        <span className="navlinks">
          <a href={`${home}#proyek`}>{t(lang, "nav_projects")}</a>
          <a href={`${home}#tentang`}>{t(lang, "nav_about")}</a>
          <a href={`${home}#kontak`}>{t(lang, "nav_contact")}</a>
        </span>
        <span className="tools">
          {tools}
          <span className="pill langs" id="lang" role="group" aria-label={t(lang, "lang_group")} style={{ "--at": lang === "en" ? 1 : 0 } as React.CSSProperties}>
            <span className="ind" />
            <a href={lang === "id" ? path : other} hrefLang="id" lang="id" aria-current={lang === "id" ? "true" : undefined}>ID</a>
            <a href={lang === "en" ? path : other} hrefLang="en" lang="en" aria-current={lang === "en" ? "true" : undefined}>EN</a>
          </span>
        </span>
      </nav>
    </header>
  );
}
