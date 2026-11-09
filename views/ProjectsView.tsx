import { PublicShell } from "@/components/site/PublicShell";
import { ProjectCard } from "@/components/site/ProjectCard";
import { allTech, publishedProjects } from "@/lib/content";
import { projectsPath } from "@/lib/paths";
import { t, type Lang } from "@/lib/i18n";

export function ProjectsView({ lang, tech: raw }: { lang: Lang; tech?: string | string[] }) {
  // ?tech=a&tech=b menghasilkan array; yang dipakai yang pertama
  const tech = Array.isArray(raw) ? raw[0] : raw;
  const techs = allTech();
  const active = tech && techs.some((x) => x.toLowerCase() === tech.toLowerCase()) ? tech : undefined;
  const list = publishedProjects({ tech: active });
  const base = projectsPath(lang);
  return (
    <PublicShell lang={lang} path={base}>
      <main id="list">
        <section aria-labelledby="h-list">
          <h1 className="list-title" id="h-list">{t(lang, "projects")}</h1>
          <nav className="filters" aria-label={t(lang, "filter_label")}>
            <a href={base} aria-current={!active ? "true" : undefined}>{t(lang, "filter_all")}</a>
            {techs.map((x) => (
              <a key={x} href={`${base}?tech=${encodeURIComponent(x)}`} aria-current={active?.toLowerCase() === x.toLowerCase() ? "true" : undefined}>{x}</a>
            ))}
          </nav>
          {list.length ? <div className="projects">{list.map((p) => <ProjectCard key={p.id} p={p} lang={lang} />)}</div>
            : <p className="muted">{t(lang, "no_projects")}</p>}
        </section>
      </main>
    </PublicShell>
  );
}
