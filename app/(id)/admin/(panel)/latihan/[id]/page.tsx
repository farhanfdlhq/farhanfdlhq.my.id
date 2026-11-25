import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveLatihanText } from "@/app/actions/latihan";
import { catalog, LEVELS } from "@/lib/latihan/catalog";
import { adminSoalOverride } from "@/lib/latihan/content";
import { safeDecode } from "@/lib/text";

export const metadata = { title: "Ubah soal" };

const FIELDS = [
  { key: "title", label: "Judul", max: 120, rows: 0 },
  { key: "story", label: "Cerita soal", max: 4000, rows: 8 },
  { key: "hint1", label: "Petunjuk 1", max: 1000, rows: 3 },
  { key: "hint2", label: "Petunjuk 2", max: 1000, rows: 3 },
] as const;

export default async function AdminLatihanEdit({ params }: { params: Promise<{ id: string }> }) {
  const id = safeDecode((await params).id) ?? "";
  await requireAdmin(`/admin/latihan/${encodeURIComponent(id)}/`);
  const s = catalog().find((x) => x.id === id);
  if (!s) notFound();
  const o = adminSoalOverride(s.id);
  return (
    <>
      <AdminNav current="/admin/latihan/" />
      <main className="admin-main">
        <h1>{s.text.id.title}</h1>
        <p className="admin-sub">Level {s.level} · {LEVELS.find((l) => l.n === s.level)?.name.id} · <code>{s.entry}</code>. Kolom kosong berarti memakai teks bawaan dari repo, yang tampil samar di dalam kolom. Tulis <code>`kode`</code> dengan backtick.</p>
        <ActionForm action={saveLatihanText} className="form form-wide">
          <input type="hidden" name="id" value={s.id} />
          {FIELDS.map((f) => (
            <div className="lang-pair" key={f.key}>
              {(["id", "en"] as const).map((lang) => {
                const name = `${f.key}_${lang}` as const;
                const props = { id: name, name, defaultValue: o[name], placeholder: s.text[lang][f.key], maxLength: f.max, "aria-describedby": `${f.key}-hint` };
                return (
                  <div className="field" key={lang}>
                    <label htmlFor={name}>{f.label} <span className="lang-tag">{lang === "id" ? "ID" : "EN"}</span> <span className="opt">(opsional)</span></label>
                    {f.rows ? <textarea {...props} rows={f.rows} /> : <input {...props} type="text" enterKeyHint="next" />}
                  </div>
                );
              })}
              <p className="hint" id={`${f.key}-hint`}>Maksimal {f.max} karakter.</p>
            </div>
          ))}
          <div><button className="btn primary" type="submit">Simpan</button></div>
        </ActionForm>
      </main>
    </>
  );
}
