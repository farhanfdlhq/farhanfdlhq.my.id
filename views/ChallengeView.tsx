import "@/app/latihan.css";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { Attribution } from "@/components/latihan/Attribution";
import { InlineCode, Paragraphs } from "@/components/latihan/InlineCode";
import { Workbench } from "@/components/latihan/Workbench";
import { LEVELS } from "@/lib/latihan/catalog";
import { soalById, soalNeighbors, soalText } from "@/lib/latihan/content";
import { testLines } from "@/lib/latihan/format";
import { challengePath, practicePath } from "@/lib/paths";
import { t, type Lang } from "@/lib/i18n";

export function ChallengeView({ lang, id }: { lang: Lang; id: string }) {
  const s = soalById(id);
  if (!s) notFound();
  const tx = soalText(s, lang);
  const level = LEVELS.find((l) => l.n === s.level)!;
  const { prev, next } = soalNeighbors(s.id);
  const examples = s.tests.filter((x) => x.example);
  return (
    <PublicShell lang={lang} path={challengePath(lang, s.id)} footNote={<Attribution lang={lang} />}>
      <main id="challenge">
        <a className="back" href={practicePath(lang)}>{t(lang, "back_practice")}</a>
        <section className="soal-head" aria-labelledby="h-soal">
          <p className="mono kicker">{t(lang, "level")} {s.level} · {level.name[lang]} · {s.topic[lang]}</p>
          <h1 id="h-soal">{tx.title}</h1>
          <Paragraphs text={tx.story} className="story" />
          {s.target ? <p className="mono target">{t(lang, "target")}: {s.target}</p> : null}
          <div className="examples">
            <h2>{t(lang, "examples")}</h2>
            {examples.map((ex, i) => (
              <pre key={i} className="example"><code>{testLines(s.kind, s.entry, ex).map((l) => (l.expected ? `${l.call}  // ${l.expected}` : l.call)).join("\n")}</code></pre>
            ))}
          </div>
        </section>
        <section className="work" aria-labelledby="h-work">
          <h2 id="h-work">{t(lang, "starter_code")}</h2>
          <noscript><p className="muted">{t(lang, "needs_js")}</p></noscript>
          <Workbench id={s.id} lang={lang} starter={s.starter} />
        </section>
        <section className="hints" aria-label={t(lang, "hint")}>
          {[tx.hint1, tx.hint2].map((h, i) => (
            <details key={i} className="hint">
              <summary>{t(lang, "hint")} {i + 1}</summary>
              <p><InlineCode text={h} /></p>
            </details>
          ))}
        </section>
        {prev || next ? (
          <nav className="pager" aria-label={lang === "en" ? "Other problems" : "Soal lain"}>
            {prev ? <a href={challengePath(lang, prev.id)} rel="prev">← {soalText(prev, lang).title}</a> : <span />}
            {next ? <a href={challengePath(lang, next.id)} rel="next">{soalText(next, lang).title} →</a> : <span />}
          </nav>
        ) : null}
      </main>
    </PublicShell>
  );
}
