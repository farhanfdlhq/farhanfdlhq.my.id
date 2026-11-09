import { PublicShell } from "./PublicShell";
import { homePath, projectsPath } from "@/lib/paths";
import { t, type Lang } from "@/lib/i18n";

export function NotFoundView({ lang }: { lang: Lang }) {
  return (
    <PublicShell lang={lang} path={homePath(lang)}>
      <main id="list">
        <section aria-labelledby="h-404">
          <h1 className="list-title" id="h-404">{t(lang, "not_found_title")}</h1>
          <p>{t(lang, "not_found_text")}</p>
          <p><a href={projectsPath(lang)}>{t(lang, "all_projects")} <span className="arr">→</span></a></p>
        </section>
      </main>
    </PublicShell>
  );
}
