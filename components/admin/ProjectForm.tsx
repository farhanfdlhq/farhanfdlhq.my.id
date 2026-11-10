"use client";
import { ActionForm } from "./ActionForm";
import { LangFields } from "./LangFields";
import { saveProject } from "@/app/actions/projects";
import type { ProjectRow } from "@/lib/content";

/** Form proyek lengkap untuk menulis studi kasus sendiri, dua bahasa. */
export function ProjectForm({ p }: { p: ProjectRow | null }) {
  const v = (f: string) => ({ id: p ? String((p as Record<string, unknown>)[`${f}_id`] ?? "") : "", en: p ? String((p as Record<string, unknown>)[`${f}_en`] ?? "") : "" });
  return (
    <ActionForm action={saveProject} className="form form-wide">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="field">
        <label htmlFor="title">Judul proyek</label>
        <input id="title" name="title" required maxLength={120} defaultValue={p?.title ?? ""} enterKeyHint="next" autoComplete="off" />
      </div>
      <LangFields name="summary" label="Ringkasan satu kalimat" values={v("summary")} hint="Tampil di kartu proyek." multiline rows={2} required />
      <LangFields name="role" label="Peran" values={v("role")} hint="Misalnya: Full-Stack Developer (remote)." />
      <LangFields name="period" label="Waktu" values={v("period")} hint="Misalnya: Mei 2026 – sekarang." />
      <LangFields name="context" label="Konteks" values={v("context")} hint="Pembuka di halaman detail: proyek apa ini dan untuk siapa." multiline rows={3} />
      <LangFields name="problem" label="Masalah" values={v("problem")} hint="Masalah yang diselesaikan. Satu paragraf per baris." multiline />
      <LangFields name="approach" label="Yang saya kerjakan" values={v("approach")} hint="Satu butir per baris. Kalimat pertama sebelum titik ditebalkan, misalnya: CMS dwibahasa. 7 halaman publik..." multiline rows={7} />
      <LangFields name="result" label="Hasil" values={v("result")} hint="Hanya hasil yang benar-benar terjadi. Satu paragraf per baris." multiline />
      <div className="field">
        <label htmlFor="stack">Stack</label>
        <input id="stack" name="stack" defaultValue={p?.stack ?? ""} aria-describedby="stack-hint" autoComplete="off" />
        <p className="hint" id="stack-hint">Pisahkan dengan koma. Dipakai untuk saringan di halaman Proyek.</p>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="year">Tahun <span className="opt">(opsional)</span></label>
          <input id="year" name="year" inputMode="numeric" pattern="[0-9]{4}" title="Isi tahun empat angka, misalnya 2026." defaultValue={p?.year ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="live_url">Link situs live <span className="opt">(opsional)</span></label>
          <input id="live_url" name="live_url" type="url" inputMode="url" autoCapitalize="none" placeholder="https://contoh.id" defaultValue={p?.live_url ?? ""} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="repo_url">Link repo <span className="opt">(opsional, hanya kalau boleh dibuka publik)</span></label>
        <input id="repo_url" name="repo_url" type="url" inputMode="url" autoCapitalize="none" placeholder="https://github.com/..." defaultValue={p?.repo_url ?? ""} />
      </div>
      <fieldset className="field choice-field">
        <legend className="label">Status</legend>
        <div className="choice-row">
          <label className="choice"><input type="radio" name="status" value="draft" defaultChecked={!p || p.status === "draft"} /><span>Draf</span></label>
          <label className="choice"><input type="radio" name="status" value="published" defaultChecked={p?.status === "published"} /><span>Terbit</span></label>
        </div>
      </fieldset>
      <fieldset className="field choice-field">
        <legend className="label">Beranda</legend>
        <div className="choice-row">
          <label className="choice"><input type="checkbox" name="featured" value="1" defaultChecked={!!p?.featured} /><span>Jadikan unggulan</span></label>
        </div>
      </fieldset>
      <div className="btn-row">
        <button className="btn primary" type="submit">{p ? "Simpan" : "Buat proyek"}</button>
        <a className="btn btn-quiet" href="/admin/">Kembali</a>
      </div>
    </ActionForm>
  );
}
