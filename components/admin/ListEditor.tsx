import { ActionForm } from "./ActionForm";
import { ConfirmButton } from "./ConfirmButton";
import { listItemOp, saveListItem } from "@/app/actions/profile";
import { listRows, LIST_KINDS, type ListKind } from "@/lib/profile-admin";

const LABELS: Record<ListKind, { title: string; add: string; item: (r: Row) => string; fields: Record<string, { label: string; hint?: string; numeric?: boolean }> }> = {
  experience: { title: "Pengalaman", add: "Tambah pengalaman", item: (r) => String(r.role_id), fields: { role: { label: "Peran" }, org: { label: "Tempat" }, period: { label: "Waktu", hint: "Misalnya: Mei 2026 – sekarang." } } },
  education: { title: "Pendidikan", add: "Tambah pendidikan", item: (r) => String(r.school), fields: { school: { label: "Sekolah atau kampus" }, degree: { label: "Jurusan atau gelar" }, detail: { label: "Keterangan" }, year_end: { label: "Tahun lulus", numeric: true } } },
  certification: { title: "Sertifikasi", add: "Tambah sertifikasi", item: (r) => String(r.name), fields: { name: { label: "Nama sertifikasi" }, issuer: { label: "Penerbit" } } },
  skill: { title: "Keahlian", add: "Tambah kelompok keahlian", item: (r) => String(r.group_id), fields: { group: { label: "Kelompok", hint: "Misalnya: Frontend." }, items: { label: "Isi", hint: "Pisahkan dengan koma, misalnya: React, Next.js, TypeScript." } } },
};

type Row = Record<string, unknown>;

function Fields({ kind, row }: { kind: ListKind; row: Row | null }) {
  const key = row ? String(row.id) : "new";
  return (
    <>
      {LIST_KINDS[kind].fields.map((f) => {
        const ui = LABELS[kind].fields[f.name];
        const input = (col: string, tag?: string, optional?: boolean) => {
          const id = `${kind}-${key}-${col}`;
          return (
            <div className="field" key={col}>
              <label htmlFor={id}>{ui.label}{tag ? <span className="lang-tag">{tag}</span> : null}{optional ? <span className="opt"> (opsional)</span> : null}</label>
              <input id={id} name={col} defaultValue={row ? String(row[col] ?? "") : ""} required={!!f.required && !optional && tag !== "EN"} inputMode={ui.numeric ? "numeric" : undefined}
                maxLength={ui.numeric ? 4 : 200} autoComplete="off" enterKeyHint="next" aria-describedby={ui.hint ? `${kind}-${f.name}-hint` : undefined} />
            </div>
          );
        };
        return f.bi ? (
          <div className="lang-pair" key={f.name}>
            {input(`${f.name}_id`, "ID")}
            {input(`${f.name}_en`, "EN", true)}
            {ui.hint ? <p className="hint" id={`${kind}-${f.name}-hint`}>{ui.hint}</p> : null}
          </div>
        ) : (
          <div key={f.name} className="field-solo">
            {input(f.name, undefined, !f.required)}
            {ui.hint ? <p className="hint" id={`${kind}-${f.name}-hint`}>{ui.hint}</p> : null}
          </div>
        );
      })}
    </>
  );
}

/** Satu daftar riwayat: setiap item bisa diubah, dipindah naik/turun, dan dihapus; di bawahnya form tambah. */
export function ListEditor({ kind }: { kind: ListKind }) {
  const rows = listRows(kind);
  const ui = LABELS[kind];
  return (
    <section className="admin-sec" aria-labelledby={`${kind}-h`} id={kind}>
      <h2 id={`${kind}-h`}>{ui.title}</h2>
      {rows.length === 0 ? <p className="muted">Belum ada isi. Bagian ini disembunyikan di situs sampai ada isinya.</p> : null}
      <ol className="admin-list">
        {rows.map((r, i) => (
          <li key={String(r.id)} className="list-item">
            <details>
              <summary><span className="row-title">{ui.item(r) || "(tanpa judul)"}</span><span className="summary-hint">Ubah</span></summary>
              <ActionForm action={saveListItem} className="form form-wide">
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="id" value={String(r.id)} />
                <Fields kind={kind} row={r} />
                <div><button className="btn primary btn-small" type="submit">Simpan</button></div>
              </ActionForm>
            </details>
            <form action={listItemOp} className="row-actions">
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="id" value={String(r.id)} />
              <button className="btn btn-quiet btn-small" name="op" value="up" disabled={i === 0} aria-label={`Naikkan ${ui.item(r)}`}>↑</button>
              <button className="btn btn-quiet btn-small" name="op" value="down" disabled={i === rows.length - 1} aria-label={`Turunkan ${ui.item(r)}`}>↓</button>
              <ConfirmButton danger title={`Hapus ${ui.item(r)}?`} message="Item ini hilang dari situs." confirmLabel="Hapus" name="op" value="delete">Hapus</ConfirmButton>
            </form>
          </li>
        ))}
      </ol>
      <details className="add-box">
        <summary className="btn btn-quiet">{ui.add}</summary>
        <ActionForm action={saveListItem} className="form form-wide" resetOnOk>
          <input type="hidden" name="kind" value={kind} />
          <Fields kind={kind} row={null} />
          <div><button className="btn primary" type="submit">Tambah</button></div>
        </ActionForm>
      </details>
    </section>
  );
}
