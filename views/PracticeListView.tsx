import "@/app/latihan.css";
import { PublicShell } from "@/components/site/PublicShell";
import { Attribution } from "@/components/latihan/Attribution";
import { Paragraphs } from "@/components/latihan/InlineCode";
import { PracticeList, type ListLevel } from "@/components/latihan/PracticeList";
import { LEVELS } from "@/lib/latihan/catalog";
import { soalText, visibleSoal } from "@/lib/latihan/content";
import { challengePath, practicePath } from "@/lib/paths";
import { getSetting } from "@/lib/settings";
import { t, type Lang } from "@/lib/i18n";

export function PracticeListView({ lang }: { lang: Lang }) {
  const list = visibleSoal();
  const levels: ListLevel[] = LEVELS.map((l) => ({
    n: l.n, name: l.name[lang],
    items: list.filter((s) => s.level === l.n).map((s) => ({ id: s.id, title: soalText(s, lang).title, topic: s.topic[lang], href: challengePath(lang, s.id) })),
  })).filter((l) => l.items.length);
  const intro = getSetting("latihan_intro", lang) || t(lang, "practice_intro");
  return (
    <PublicShell lang={lang} path={practicePath(lang)} footNote={<Attribution lang={lang} />}>
      <main id="practice">
        <section className="practice-head" aria-labelledby="h-practice">
          <h1 className="list-title" id="h-practice">{t(lang, "practice")}</h1>
          <Paragraphs text={intro} className="summary" />
        </section>
        <PracticeList levels={levels} labels={{
          level: t(lang, "level"), recommended: t(lang, "recommended_after"), continue: t(lang, "continue"),
          passed: t(lang, "status_passed"), viewed: t(lang, "status_viewed"), progress: t(lang, "progress_of"), allDone: t(lang, "all_done"),
        }} />
      </main>
    </PublicShell>
  );
}
