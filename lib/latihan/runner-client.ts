/**
 * Sisi halaman soal untuk runner latihan: iframe sandbox tanpa allow-same-origin yang menjalankan kode pengunjung di worker.
 * Semua pesan dari iframe dianggap data tidak tepercaya: sumbernya dicek, bentuknya divalidasi, dan teksnya dipotong.
 */
import type { GradeResult, GradeSpec, TestResult } from "./types";

export const TIMEOUT_MS = 2000;
const READY_MS = 3000;
const MAX = 2000;
const MAX_LOGS = 200;
export const RUNNER_SRC = "/latihan-runner/runner.html";

export type RunnerMsg = { type: "ready"; workerOk: boolean } | ({ type: "result"; runId: number } & GradeResult);
export type RunOutcome = { status: "done"; result: GradeResult } | { status: "timeout" } | { status: "unsupported" } | { status: "cancelled" };

const cut = (s: string) => (s.length > MAX ? s.slice(0, MAX) + "…" : s);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const optStr = (v: unknown) => v === undefined || typeof v === "string";

export function parseRunnerMessage(data: unknown, testCount: number): RunnerMsg | null {
  if (!isObj(data)) return null;
  if (data.type === "ready") return typeof data.workerOk === "boolean" ? { type: "ready", workerOk: data.workerOk } : null;
  if (data.type !== "result") return null;
  const { runId, ok, error, results, logs } = data;
  if (!Number.isInteger(runId) || typeof ok !== "boolean" || !optStr(error)) return null;
  if (!Array.isArray(results) || results.length > testCount || !Array.isArray(logs)) return null;
  const outResults: TestResult[] = [];
  for (const r of results) {
    if (!isObj(r) || typeof r.pass !== "boolean" || !optStr(r.got) || !optStr(r.error)) return null;
    const t: TestResult = { pass: r.pass };
    if (typeof r.got === "string") t.got = cut(r.got);
    if (typeof r.error === "string") t.error = cut(r.error);
    outResults.push(t);
  }
  if (!logs.every((l) => typeof l === "string")) return null;
  const msg: RunnerMsg = { type: "result", runId: runId as number, ok, results: outResults, logs: (logs as string[]).slice(0, MAX_LOGS).map(cut) };
  if (typeof error === "string") msg.error = cut(error);
  return msg;
}

type Pending = { runId: number; tests: number; resolve: (o: RunOutcome) => void; timer: ReturnType<typeof setTimeout> };

export function createRunner(host: HTMLElement): { readonly ready: Promise<boolean>; run(code: string, spec: GradeSpec): Promise<RunOutcome>; destroy(): void } {
  let frame: HTMLIFrameElement | null = null;
  let ready: Promise<boolean> = Promise.resolve(false);
  let markReady: (ok: boolean) => void = () => {};
  let pending: Pending | null = null;
  let seq = 0;

  function mount() {
    frame?.remove();
    const f = document.createElement("iframe");
    f.setAttribute("sandbox", "allow-scripts");
    f.setAttribute("aria-hidden", "true");
    f.tabIndex = -1;
    f.hidden = true;
    f.title = "runner";
    ready = new Promise<boolean>((resolve) => {
      const t = setTimeout(() => resolve(false), READY_MS);
      markReady = (ok) => { clearTimeout(t); resolve(ok); };
    });
    f.src = RUNNER_SRC;
    host.appendChild(f);
    frame = f;
  }

  function onMessage(e: MessageEvent) {
    if (!frame || e.source !== frame.contentWindow) return;
    const msg = parseRunnerMessage(e.data, pending?.tests ?? 0);
    if (!msg) return;
    if (msg.type === "ready") return markReady(msg.workerOk);
    if (!pending || msg.runId !== pending.runId) return;
    const p = pending;
    pending = null;
    clearTimeout(p.timer);
    const { type: _t, runId: _r, ...result } = msg;
    p.resolve({ status: "done", result });
  }

  window.addEventListener("message", onMessage);
  mount();

  return {
    get ready() { return ready; },
    async run(code, spec) {
      if (pending) { clearTimeout(pending.timer); pending.resolve({ status: "cancelled" }); pending = null; }
      const runId = ++seq;
      if (!(await ready)) return { status: "unsupported" };
      if (runId !== seq) return { status: "cancelled" };
      return new Promise<RunOutcome>((resolve) => {
        const timer = setTimeout(() => {
          if (pending?.runId !== runId) return;
          pending = null;
          // Loop tak berujung: buang iframe beserta worker-nya, lalu siapkan yang baru untuk run berikutnya
          mount();
          resolve({ status: "timeout" });
        }, TIMEOUT_MS);
        pending = { runId, tests: spec.tests.length, resolve, timer };
        // Origin iframe sandbox adalah "null", jadi targetOrigin harus "*". Pesan ini hanya berisi kode dan test, tanpa data sesi.
        frame?.contentWindow?.postMessage({ type: "run", runId, code, spec }, "*");
      });
    },
    destroy() {
      window.removeEventListener("message", onMessage);
      if (pending) { clearTimeout(pending.timer); pending.resolve({ status: "cancelled" }); pending = null; }
      frame?.remove();
      frame = null;
    },
  };
}
