import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { allProjectsForAdmin, missingEn } from "@/lib/projects-admin";
import { projectListAction } from "@/app/actions/projects";
import { projectPath } from "@/lib/paths";

export const metadata = { title: "Proyek" };

export default async function AdminProjects() {
  // Layout tidak cukup: navigasi RSC bisa melewati layout, jadi setiap halaman memeriksa login sendiri
  await requireAdmin("/admin/");
  const list = allProjectsForAdmin();
  return (
    <>
      <AdminNav current="/admin/" />
      <main className="admin-main">
        <div className="admin-title-row">
          <div><h1>Proyek</h1><p className="admin-sub">Urutan di sini sama dengan urutan di situs. Proyek unggulan tampil di Beranda.</p></div>
          <a className="btn primary" href="/admin/proyek/baru/">Proyek baru</a>
        </div>
        {list.length === 0 ? <p className="muted">Belum ada proyek. Mulai dengan tombol Proyek baru.</p> : null}
        <ol className="admin-list">
          {list.map((p, i) => {
            const miss = missingEn(p);
            return (
              <li key={p.id} className="admin-row">
                <div className="row-main">
                  <a className="row-title" href={`/admin/proyek/${p.id}/`}>{p.title}</a>
                  <div className="badges">
                    <span className={`badge ${p.status === "published" ? "ok" : ""}`}>{p.status === "published" ? "Terbit" : "Draf"}</span>
                    {p.featured ? <span className="badge">Unggulan</span> : null}
                    {miss.length ? <span className="badge warn" title={`Isian EN kosong: ${miss.join(", ")}`}>EN kosong</span> : null}
                  </div>
                  {p.status === "published" ? <a className="row-link" href={projectPath("id", p.slug)} target="_blank" rel="noopener">{projectPath("id", p.slug)} ↗</a> : null}
                </div>
                <form action={projectListAction} className="row-actions">
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn btn-quiet btn-small" name="op" value="up" disabled={i === 0} aria-label={`Naikkan ${p.title}`}>↑</button>
                  <button className="btn btn-quiet btn-small" name="op" value="down" disabled={i === list.length - 1} aria-label={`Turunkan ${p.title}`}>↓</button>
                  <button className="btn btn-quiet btn-small" name="op" value={p.status === "published" ? "draft" : "publish"}>{p.status === "published" ? "Jadikan draf" : "Terbitkan"}</button>
                  <ConfirmButton danger title={`Hapus ${p.title}?`} message="Proyek dan semua gambarnya hilang dari situs. Ini tidak bisa dibatalkan." confirmLabel="Hapus" name="op" value="delete">Hapus</ConfirmButton>
                </form>
              </li>
            );
          })}
        </ol>
      </main>
    </>
  );
}
