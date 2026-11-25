/** Progres latihan di browser pengunjung (localStorage). Tidak pernah dikirim ke server. */
export const PROGRESS_KEY = "fdq.latihan.v1";
export type Entry = { status?: "passed" | "viewed"; passedAt?: number; draft?: string };
export type Progress = Record<string, Entry>;

/** null kalau localStorage tidak ada atau diblokir (mode privat, cookie diblokir). */
export function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const k = PROGRESS_KEY + ".cek";
    s.setItem(k, "1");
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
}

function clean(v: unknown): Entry | null {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return null;
  const r = v as Record<string, unknown>;
  const e: Entry = {};
  if (r.status === "passed" || r.status === "viewed") e.status = r.status;
  if (typeof r.passedAt === "number" && Number.isFinite(r.passedAt)) e.passedAt = r.passedAt;
  if (typeof r.draft === "string") e.draft = r.draft;
  return e;
}

export function readProgress(store: Storage | null): Progress {
  if (!store) return {};
  try {
    const raw = JSON.parse(store.getItem(PROGRESS_KEY) ?? "{}");
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
    const out: Progress = {};
    for (const [id, v] of Object.entries(raw)) { const e = clean(v); if (e) out[id] = e; }
    return out;
  } catch {
    return {};
  }
}

export function writeProgress(store: Storage | null, p: Progress): boolean {
  if (!store) return false;
  try {
    store.setItem(PROGRESS_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export const markPassed = (p: Progress, id: string, now: number): Progress => ({ ...p, [id]: { ...p[id], status: "passed", passedAt: now } });

export const markViewed = (p: Progress, id: string): Progress =>
  p[id]?.status === "passed" ? p : { ...p, [id]: { ...p[id], status: "viewed" } };

export const setDraft = (p: Progress, id: string, code: string): Progress => ({ ...p, [id]: { ...p[id], draft: code } });

export const nextUp = (ids: string[], p: Progress): string | null => ids.find((id) => p[id]?.status !== "passed") ?? null;

export function recommendedAfter(levels: { n: number; ids: string[] }[], p: Progress): number | null {
  return levels.find((l) => l.ids.some((id) => p[id]?.status !== "passed"))?.n ?? null;
}
