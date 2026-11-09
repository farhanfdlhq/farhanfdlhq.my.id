import { AdminNav } from "@/components/admin/AdminNav";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CvUploadForm } from "@/components/admin/CvUploadForm";
import { allCvs } from "@/lib/cv";
import { deleteCv, setPrimaryCv } from "@/app/actions/media";

export const metadata = { title: "CV" };

const LANG = { id: "Indonesia", en: "Inggris", both: "Dua bahasa" } as const;
const date = (ms: number) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(ms);

export default function CvAdmin() {
  const list = allCvs();
  return (
    <>
      <AdminNav current="/admin/cv/" />
      <main className="admin-main">
        <h1>CV</h1>
        <p className="admin-sub">Tombol Unduh CV di situs memakai CV utama sesuai bahasa halaman. Kalau tidak ada, dipakai CV utama mana saja.</p>
        <CvUploadForm />
        {list.length === 0 ? <p className="muted">Belum ada CV. Tombol Unduh CV disembunyikan sampai ada CV.</p> : null}
        <ol className="admin-list">
          {list.map((c) => (
            <li key={c.id} className="admin-row">
              <div className="row-main">
                <a className="row-title" href={`/cv/${c.id}/`}>{c.label}</a>
                <div className="badges">
                  <span className="badge">{LANG[c.lang]}</span>
                  {c.is_primary ? <span className="badge ok">Utama</span> : null}
                  <span className="badge">{date(c.uploaded_at)}</span>
                </div>
              </div>
              <div className="row-actions">
                {!c.is_primary ? <form action={setPrimaryCv}><input type="hidden" name="id" value={c.id} /><button className="btn btn-quiet btn-small">Jadikan utama</button></form> : null}
                <form action={deleteCv}><input type="hidden" name="id" value={c.id} /><ConfirmButton danger title={`Hapus ${c.label}?`} message="File PDF-nya ikut terhapus dari server." confirmLabel="Hapus">Hapus</ConfirmButton></form>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
