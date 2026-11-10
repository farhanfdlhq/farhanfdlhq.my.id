import { langAttr, pick, t, type Lang } from "@/lib/i18n";
import { stackList, type ProjectRow } from "@/lib/content";
import { hostOf } from "@/lib/text";

/** Lembar spesifikasi proyek: peran, waktu (opsional), stack, dan status. */
export function Spec({ p, lang, withPeriod, full }: { p: ProjectRow; lang: Lang; withPeriod?: boolean; full?: boolean }) {
  const roleP = pick(p, "role", lang), periodP = pick(p, "period", lang);
  const role = roleP.text, period = periodP.text;
  const stack = stackList(p.stack);
  const shown = full ? stack : stack.slice(0, 4);
  return (
    <dl className="spec">
      {role ? <><dt>{t(lang, "k_role")}</dt><dd lang={langAttr(roleP)}>{role}</dd></> : null}
      {withPeriod && period ? <><dt>{t(lang, "k_when")}</dt><dd lang={langAttr(periodP)}>{period}</dd></> : null}
      {shown.length ? <><dt>{t(lang, "k_stack")}</dt><dd>{shown.join(" · ")}</dd></> : null}
      {p.live_url || p.repo_url ? (
        <>
          <dt>{t(lang, "k_status")}</dt>
          <dd>
            {p.live_url ? <span className="live">{t(lang, "live")}</span> : null}
            {full && p.live_url ? <> · <a href={p.live_url} rel="noopener">{hostOf(p.live_url)} <span className="arr">↗</span></a></> : null}
            {p.repo_url ? <>{p.live_url ? " · " : ""}<a href={p.repo_url} rel="noopener">{t(lang, "repo")} <span className="arr">↗</span></a></> : null}
          </dd>
        </>
      ) : null}
    </dl>
  );
}
