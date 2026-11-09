import { notFound } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { Spec } from "@/components/site/Spec";
import { neighbors, projectBySlug, projectImages } from "@/lib/content";
import { projectPath, projectsPath } from "@/lib/paths";
import { pick, t, type Lang } from "@/lib/i18n";
import { hostOf, leadSentence, lines } from "@/lib/text";

function Prose({ title, text, list }: { title: string; text: string; list?: boolean }) {
  const ls = lines(text);
  if (!ls.length) return null;
  return (
    <section className="prose">
      <h2>{title}</h2>
      {list ? <ul>{ls.map((l, i) => { const { lead, rest } = leadSentence(l); return <li key={i}>{lead ? <strong>{lead} </strong> : null}{rest}</li>; })}</ul>
        : ls.map((l, i) => <p key={i}>{l}</p>)}
    </section>
  );
}

export function ProjectView({ lang, slug }: { lang: Lang; slug: string }) {
  const p = projectBySlug(slug);
  if (!p) notFound();
  const { prev, next } = neighbors(slug);
  const images = projectImages(p.id).filter((im) => im.url !== p.hero_image);
  const host = hostOf(p.live_url) || p.title;
  return (
    <PublicShell lang={lang} path={projectPath(lang, slug)}>
      <div className="progress" id="progress" />
      <main id="detail">
        <a className="back" href={projectsPath(lang)}>{t(lang, "back")}</a>
        <div className="detail-head">
          <h1 style={{ viewTransitionName: `title-${p.slug}`, width: "fit-content" }}>{p.title}</h1>
          {pick(p, "context", lang).text || pick(p, "summary", lang).text ? <p className="lede">{pick(p, "context", lang).text || pick(p, "summary", lang).text}</p> : null}
          <Spec p={p} lang={lang} withPeriod full />
        </div>
        {p.hero_image ? (
          <div className="frame" style={{ viewTransitionName: `shot-${p.slug}` }}>
            <div className="url mono"><span>{host}</span><span>{t(lang, "home")}</span></div>
            <div className="vp"><img src={p.hero_image} width={960} height={600} alt={lang === "en" ? `${p.title} homepage` : `Beranda ${p.title}`} /></div>
          </div>
        ) : null}
        <Prose title={t(lang, "problem")} text={pick(p, "problem", lang).text} />
        <Prose title={t(lang, "approach")} text={pick(p, "approach", lang).text} list />
        <Prose title={t(lang, "result")} text={pick(p, "result", lang).text} />
        {images.length ? (
          <section className="gallery-sec" aria-label={t(lang, "gallery")}>
            <h2>{t(lang, "gallery")}</h2>
            <div className="gallery">
              {images.map((im, i) => <figure key={im.id} className="frame"><img src={im.url} alt={pick(im, "alt", lang).text || `${p.title}, ${t(lang, "gallery").toLowerCase()} ${i + 1}`} loading="lazy" decoding="async" /></figure>)}
            </div>
          </section>
        ) : null}
        {prev || next ? (
          <nav className="pager" aria-label={lang === "en" ? "Other projects" : "Proyek lain"}>
            {prev ? <a href={projectPath(lang, prev.slug)} rel="prev">← {prev.title}</a> : <span />}
            {next ? <a href={projectPath(lang, next.slug)} rel="next">{next.title} →</a> : <span />}
          </nav>
        ) : null}
      </main>
    </PublicShell>
  );
}
