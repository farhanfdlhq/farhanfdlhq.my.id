import { lines } from "@/lib/text";
import { PublicShell } from "@/components/site/PublicShell";
import { ProjectCard } from "@/components/site/ProjectCard";
import { CopyEmail } from "@/components/site/CopyEmail";
import { jsonLdString, personJsonLd } from "@/lib/seo";
import { certifications, education, experiences, primaryCv, profile, publishedProjects, skills } from "@/lib/content";
import { homePath, projectsPath } from "@/lib/paths";
import { t, type Lang } from "@/lib/i18n";

export function HomeView({ lang }: { lang: Lang }) {
  const me = profile(lang);
  const cv = primaryCv(lang);
  const projects = publishedProjects({ featuredOnly: true });
  const words = me.name.split(/\s+/).filter(Boolean);
  const edu = education(lang);
  const certs = certifications();
  return (
    <PublicShell lang={lang} path={homePath(lang)} isHome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(personJsonLd(lang)) }} />
      <section className="hero" id="hero" aria-labelledby="h-hero">
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-inner">
          <h1 id="h-hero" className="giant words">
            {words.map((w, i) => <span key={i}><span className="w"><span style={{ "--i": i } as React.CSSProperties}>{w}</span></span>{i < words.length - 1 ? " " : ""}</span>)}
          </h1>
          <p className="who seq" style={{ "--d": 2 } as React.CSSProperties}>
            <b>{me.role}</b>{me.city ? (lang === "en" ? ` in ${me.city}.` : ` di ${me.city}.`) : ""} {me.heroLine}
          </p>
          <div className="hero-act seq" style={{ "--d": 4 } as React.CSSProperties}>
            <a className="btn hero-btn" href="#proyek">{t(lang, "see_projects")} <span className="arr">›</span></a>
            <span className="hero-links">
              {cv ? <><a href={`/cv/${cv.id}/`}>{t(lang, "download_cv")}</a><span aria-hidden="true">·</span></> : null}
              <a href="#kontak">{t(lang, "email")}</a>
            </span>
          </div>
        </div>
      </section>

      <main id="home">
        <div className="beat" id="beat-pc" aria-hidden="true" />
        <section aria-labelledby="h-proj" id="proyek">
          <h2 data-n="01" id="h-proj">{t(lang, "projects")}</h2>
          <div className="projects">{projects.map((p) => <ProjectCard key={p.id} p={p} lang={lang} />)}</div>
          <p className="more"><a href={projectsPath(lang)}>{t(lang, "all_projects")} <span className="arr">→</span></a></p>
        </section>

        <div className="beat" id="beat-open" aria-hidden="true" />
        <section aria-labelledby="h-about" id="tentang">
          <h2 data-n="02" id="h-about">{t(lang, "about")}</h2>
          {lines(me.about).map((l, i) => <p className="about" key={i}>{l}</p>)}
        </section>

        <div className="beat" id="beat-explode" aria-hidden="true" />
        <section aria-labelledby="h-exp" id="pengalaman">
          <h2 data-n="03" id="h-exp">{t(lang, "experience")}</h2>
          <ol className="timeline">
            {experiences(lang).map((e) => (
              <li key={e.id}><span className="when">{e.period}</span><span><span className="what">{e.role}</span>{e.org ? ` · ${e.org}` : ""}</span></li>
            ))}
          </ol>
          {edu.length ? <>
            <h3 className="subhead">{t(lang, "education")}</h3>
            <ol className="timeline">
              {edu.map((e) => (
                <li key={e.id}><span className="when">{e.yearEnd ?? ""}</span><span><span className="what">{e.degree}</span> · {e.school}{e.detail ? <span className="muted detail"> {e.detail}</span> : null}</span></li>
              ))}
            </ol>
          </> : null}
          {certs.length ? <>
            <h3 className="subhead">{t(lang, "certifications")}</h3>
            <ul className="certs">{certs.map((c) => <li key={c.id}><span className="what">{c.name}</span>{c.issuer ? ` · ${c.issuer}` : ""}</li>)}</ul>
          </> : null}
        </section>

        <div className="beat" id="beat-cpu" aria-hidden="true" />
        <section aria-labelledby="h-skill" id="keahlian">
          <h2 data-n="04" id="h-skill">{t(lang, "skills")}</h2>
          <dl className="skills">{skills(lang).map((s) => <div key={s.id}><dt>{s.group}</dt><dd>{s.items}</dd></div>)}</dl>
        </section>

        <section aria-labelledby="h-contact" id="kontak">
          <h2 data-n="05" id="h-contact">{t(lang, "contact")}</h2>
          <div className="contact">
            <p style={{ margin: 0 }}>{t(lang, "contact_lead")}</p>
            {me.email ? <CopyEmail email={me.email} copy={t(lang, "copy")} copied={t(lang, "copied")} /> : null}
            <p style={{ margin: 0 }} className="social">
              {me.github ? <a href={me.github} rel="me noopener">GitHub <span className="arr">↗</span></a> : null}
              {me.github && me.linkedin ? " · " : null}
              {me.linkedin ? <a href={me.linkedin} rel="me noopener">LinkedIn <span className="arr">↗</span></a> : null}
            </p>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
