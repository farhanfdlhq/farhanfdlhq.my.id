"use client";
import { useEffect, useState } from "react";
import { nextUp, readProgress, recommendedAfter, safeStorage, type Progress } from "@/lib/latihan/progress";

export type ListItem = { id: string; title: string; topic: string; href: string };
export type ListLevel = { n: number; name: string; items: ListItem[] };
type Labels = { level: string; recommended: string; continue: string; passed: string; viewed: string; progress: string; allDone: string };

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

/**
 * Daftar soal per level. Dirender di server tanpa status (tetap utuh tanpa JavaScript),
 * lalu status, progres per level, dan "soal berikutnya" diisi dari localStorage setelah halaman dimuat.
 */
export function PracticeList({ levels, labels }: { levels: ListLevel[]; labels: Labels }) {
  const [p, setP] = useState<Progress | null>(null);
  useEffect(() => { setP(readProgress(safeStorage())); }, []);

  const ids = levels.flatMap((l) => l.items.map((i) => i.id));
  const items = new Map(levels.flatMap((l) => l.items.map((i) => [i.id, i] as const)));
  const next = p ? nextUp(ids, p) : null;
  const rec = p ? recommendedAfter(levels.map((l) => ({ n: l.n, ids: l.items.map((i) => i.id) })), p) : null;
  const nextItem = next ? items.get(next) : undefined;

  return (
    <>
      {p ? (
        <p className="practice-next" aria-live="polite">
          {nextItem ? <a className="btn primary" href={nextItem.href}>{labels.continue} {nextItem.title}</a> : <span>{labels.allDone}</span>}
        </p>
      ) : null}
      {levels.map((l) => {
        const done = p ? l.items.filter((i) => p[i.id]?.status === "passed").length : 0;
        return (
          <section key={l.n} className="level" aria-labelledby={`h-level-${l.n}`}>
            <h2 id={`h-level-${l.n}`}><span className="mono lv">{labels.level} {l.n}</span>{l.name}</h2>
            {p ? (
              <div className="level-meta">
                <span className="mono">{fill(labels.progress, { a: done, b: l.items.length })}</span>
                <span className="bar" aria-hidden="true"><span style={{ width: `${(done / Math.max(1, l.items.length)) * 100}%` }} /></span>
                {rec !== null && l.n > rec ? <span className="mono muted">{fill(labels.recommended, { n: rec })}</span> : null}
              </div>
            ) : null}
            <ol className="soal-list">
              {l.items.map((i) => {
                const st = p?.[i.id]?.status;
                return (
                  <li key={i.id}>
                    <a className="soal-link" href={i.href}>{i.title}</a>
                    <span className="mono muted topic">{i.topic}</span>
                    {st ? <span className={`mono state state-${st}`}>{st === "passed" ? labels.passed : labels.viewed}</span> : null}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </>
  );
}
