"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import type { EditorHandle } from "./CodeEditor";
import { createRunner } from "@/lib/latihan/runner-client";
import { testLines } from "@/lib/latihan/format";
import { markPassed, markViewed, readProgress, safeStorage, setDraft, writeProgress, type Progress } from "@/lib/latihan/progress";
import type { GradeResult, GradeSpec } from "@/lib/latihan/types";
import { t, type Lang } from "@/lib/i18n";

type Props = { id: string; lang: Lang; starter: string };
type Outcome = { kind: "result"; result: GradeResult } | { kind: "message"; text: string } | null;

// Editor hanya dimuat di browser. Sebelum siap (dan tanpa JavaScript) yang tampil kode awal dari server.
const Editor = dynamic(() => import("./CodeEditor"), { ssr: false, loading: () => null });

/**
 * Editor, tombol Jalankan, hasil test, dan solusi untuk satu soal.
 * Tanpa JavaScript yang tampil hanya kode awal (dari server). Kode pengunjung dijalankan lewat createRunner (iframe sandbox).
 */
export function Workbench({ id, lang, starter }: Props) {
  const [initial] = useState(() => (typeof window === "undefined" ? starter : readProgress(safeStorage())[id]?.draft ?? starter));
  const [editorReady, setEditorReady] = useState(false);
  const editor = useRef<EditorHandle | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const runner = useRef<ReturnType<typeof createRunner> | null>(null);
  const spec = useRef<GradeSpec | null>(null);
  const busy = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [running, setRunning] = useState(false);
  const [supported, setSupported] = useState(true);
  const [canSave, setCanSave] = useState(true);
  const [status, setStatus] = useState<"passed" | "viewed" | undefined>();
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [confirm, setConfirm] = useState<"reset" | "giveup" | null>(null);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    const store = safeStorage();
    const next = fn(readProgress(store));
    writeProgress(store, next);
    setStatus(next[id]?.status);
  }, [id]);

  useEffect(() => {
    const store = safeStorage();
    setCanSave(!!store);
    setStatus(readProgress(store)[id]?.status);
    const r = createRunner(host.current!);
    runner.current = r;
    let alive = true;
    r.ready.then((ok) => { if (alive) setSupported(ok); });
    return () => { alive = false; r.destroy(); runner.current = null; if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [id]);

  const onChange = useCallback((code: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => update((p) => setDraft(p, id, code)), 500);
  }, [id, update]);

  async function fetchJson<T>(part: "tests" | "solution"): Promise<T> {
    const res = await fetch(`/api/latihan/${encodeURIComponent(id)}/${part}/`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    return res.json() as Promise<T>;
  }

  async function openSolution() {
    try {
      const s = solution ?? (await fetchJson<{ solution: string }>("solution")).solution;
      setSolution(s);
      setShowSolution(true);
    } catch {
      setOutcome({ kind: "message", text: t(lang, "load_failed") });
    }
  }

  async function run() {
    if (busy.current || !runner.current || !editor.current) return;
    busy.current = true;
    setRunning(true);
    try {
      spec.current ??= await fetchJson<GradeSpec>("tests");
      const out = await runner.current.run(editor.current.getCode(), spec.current);
      if (out.status === "cancelled") return;
      if (out.status === "timeout") return setOutcome({ kind: "message", text: t(lang, "timeout") });
      if (out.status === "unsupported") { setSupported(false); return setOutcome(null); }
      setOutcome({ kind: "result", result: out.result });
      if (out.result.ok) {
        update((p) => markPassed(p, id, Date.now()));
        await openSolution();
      }
    } catch {
      setOutcome({ kind: "message", text: t(lang, "load_failed") });
    } finally {
      busy.current = false;
      setRunning(false);
    }
  }

  function onConfirm(ok: boolean) {
    const which = confirm;
    setConfirm(null);
    if (!ok) return;
    if (which === "reset") {
      editor.current?.setCode(starter);
      update((p) => setDraft(p, id, starter));
      setOutcome(null);
    } else if (which === "giveup") {
      update((p) => markViewed(p, id));
      void openSolution();
    }
  }

  function solutionButton() {
    if (showSolution) return setShowSolution(false);
    if (status) return void openSolution();
    setConfirm("giveup");
  }

  const result = outcome?.kind === "result" ? outcome.result : null;
  const tests = spec.current?.tests ?? [];
  const passedCount = result ? result.results.filter((r) => r.pass).length : 0;
  const summary = result ? `${result.ok ? t(lang, "all_passed") + " " : ""}${t(lang, "result_summary", { a: passedCount, b: tests.length })}` : "";

  return (
    <div className="workbench">
      <div className="editor-wrap">
        {editorReady ? null : <pre className="starter"><code>{starter}</code></pre>}
        <Editor initial={initial} onChange={onChange} onReady={() => setEditorReady(true)} label={t(lang, "editor_label")} helpId={`help-${id}`} handle={editor} />
        <p className="muted editor-help" id={`help-${id}`}>{t(lang, "editor_help")}</p>
      </div>
      <div className="actions">
        <button id="run" type="button" className="btn primary" onClick={run} disabled={running || !supported}>{running ? t(lang, "running") : t(lang, "run")}</button>
        <button id="reset" type="button" className="btn" onClick={() => setConfirm("reset")} disabled={running}>{t(lang, "reset")}</button>
        <button id="giveup" type="button" className="btn" onClick={solutionButton}>
          {showSolution ? t(lang, "hide_solution") : status ? t(lang, "show_solution") : t(lang, "give_up")}
        </button>
      </div>
      {!supported ? <p className="run-error" role="alert">{t(lang, "unsupported")}</p> : null}
      {!canSave ? <p className="muted">{t(lang, "storage_off")}</p> : null}
      <div className="results">
        {/* Ringkasan, pesan waktu habis, dan error kode ada di satu region status supaya ikut diumumkan pembaca layar */}
        <div className="run-status" role="status" aria-live="polite">
          <p className="run-summary">{summary}</p>
          {outcome?.kind === "message" ? <p className="run-error">{outcome.text}</p> : null}
          {result?.error ? <pre className="run-error"><code>{result.error}</code></pre> : null}
        </div>
        {result && result.results.length ? (
          <ol className="test-results">
            {result.results.map((r, i) => {
              const test = tests[i];
              const cls = `${r.pass ? "pass" : "fail"}${test?.hidden ? " hidden-test" : ""}`;
              const mark = r.pass ? t(lang, "status_passed") : lang === "en" ? "Failed" : "Gagal";
              if (!test || test.hidden) return <li key={i} className={cls}><span className="mono verdict">{mark}</span> {t(lang, "hidden_test")} {i + 1}</li>;
              const lines = testLines(spec.current!.kind, spec.current!.entry, test);
              return (
                <li key={i} className={cls}>
                  <span className="mono verdict">{mark}</span>
                  {spec.current!.kind === "function" ? (
                    <>
                      <pre><code>{lines[0].call}</code></pre>
                      <p className="got"><span className="mono">{t(lang, "expected")}:</span> <code>{lines[0].expected}</code></p>
                    </>
                  ) : <pre><code>{lines.map((l) => (l.expected ? `${l.call}  // ${l.expected}` : l.call)).join("\n")}</code></pre>}
                  {!r.pass && r.got !== undefined ? <p className="got"><span className="mono">{t(lang, "got")}:</span> <code>{r.got}</code></p> : null}
                  {!r.pass && r.error ? <p className="got"><code>{r.error}</code></p> : null}
                </li>
              );
            })}
          </ol>
        ) : null}
        {result?.logs.length ? (
          <div className="output"><h3>{t(lang, "output")}</h3><pre><code>{result.logs.join("\n")}</code></pre></div>
        ) : null}
      </div>
      {showSolution && solution !== null ? (
        <section className="solution" aria-label={t(lang, "solution")}>
          <h3>{t(lang, "solution")}</h3>
          <pre><code>{solution}</code></pre>
        </section>
      ) : null}
      <div ref={host} className="runner-host" />
      <ConfirmDialog
        open={confirm !== null}
        title={confirm === "reset" ? t(lang, "confirm_reset_title") : t(lang, "confirm_giveup_title")}
        body={confirm === "reset" ? t(lang, "confirm_reset_body") : t(lang, "confirm_giveup_body")}
        okLabel={confirm === "reset" ? t(lang, "yes_reset") : t(lang, "yes_show")}
        cancelLabel={t(lang, "cancel")}
        onResult={onConfirm}
      />
    </div>
  );
}
