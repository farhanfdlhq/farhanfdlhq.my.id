import { langAttr, pick, type Lang } from "@/lib/i18n";
import type { ProjectRow } from "@/lib/content";
import { projectPath } from "@/lib/paths";
import { hostOf } from "@/lib/text";
import { Spec } from "./Spec";

export function ProjectCard({ p, lang }: { p: ProjectRow; lang: Lang }) {
  const host = hostOf(p.live_url) || p.title;
  const sum = pick(p, "summary", lang);
  return (
    <article className="proj" data-host={p.slug}>
      <div className="frame" style={{ viewTransitionName: `shot-${p.slug}` }}>
        <div className="url mono"><span>{host}</span><span>{p.year ?? ""}</span></div>
        <div className="vp">
          {p.hero_image ? <img src={p.hero_image} width={960} height={600} alt={lang === "en" ? `${p.title} homepage` : `Beranda ${p.title}`} loading="lazy" decoding="async" /> : null}
        </div>
      </div>
      <h3 style={{ viewTransitionName: `title-${p.slug}` }}><a href={projectPath(lang, p.slug)}>{p.title} <span className="arr">→</span></a></h3>
      <p lang={langAttr(sum)}>{sum.text}</p>
      <Spec p={p} lang={lang} />
    </article>
  );
}
