import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { LangFields } from "@/components/admin/LangFields";
import { saveLatihanIntro, toggleLatihanHidden } from "@/app/actions/latihan";
import { LEVELS } from "@/lib/latihan/catalog";
import { adminSoalList, soalText } from "@/lib/latihan/content";
import { challengePath } from "@/lib/paths";
import { getSetting } from "@/lib/settings";

export const metadata = { title: "Latihan" };

export default async function AdminLatihan() {
  // Layout tidak cukup: navigasi RSC bisa melewati layout, jadi setiap halaman memeriksa login sendiri
  await requireAdmin("/admin/latihan/");
  const rows = adminSoalList();
  const pair = (k: "latihan_intro" | "seo_latihan_desc") => ({ id: getSetting(`${k}_id`), en: getSetting(`${k}_en`) });
  return (
    <>
      <AdminNav current="/admin/latihan/" />
      <main className="admin-main">
        <h1>Latihan</h1>
        <p className="admin-sub">Soal, test, dan solusi ada di folder <code>latihan/</code> di repo. Di sini kamu bisa mengubah teks soal dan menyembunyikan soal yang bermasalah.</p>
        {LEVELS.map((l) => {
          const list = rows.filter((r) => r.soal.level === l.n);
          if (!list.length) return null;
          return (
            <section key={l.n} aria-labelledby={`lv-${l.n}`}>
              <h2 className="form-sec" id={`lv-${l.n}`}>Level {l.n} · {l.name.id}</h2>
              <ol className="admin-list">
                {list.map(({ soal, hidden, overridden }) => {
                  const title = soalText(soal, "id").title;
                  return (
                    <li key={soal.id} className="admin-row">
                      <div className="row-main">
                        <a className="row-title" href={`/admin/latihan/${soal.id}/`}>{title}</a>
                        <div className="badges">
                          <span className={`badge ${hidden ? "" : "ok"}`}>{hidden ? "Disembunyikan" : "Tampil"}</span>
                          {overridden ? <span className="badge">Teks diubah</span> : null}
                        </div>
                        {hidden ? null : <a className="row-link" href={challengePath("id", soal.id)} target="_blank" rel="noopener">{challengePath("id", soal.id)} ↗</a>}
                      </div>
                      <form action={toggleLatihanHidden} className="row-actions">
                        <input type="hidden" name="id" value={soal.id} />
                        {hidden
                          ? <button className="btn btn-quiet btn-small" name="hidden" value="0">Tampilkan</button>
                          : <ConfirmButton title={`Sembunyikan ${title}?`} message="Soal ini hilang dari daftar, sitemap, dan alamatnya menjadi 404 sampai ditampilkan lagi." confirmLabel="Sembunyikan" name="hidden" value="1">Sembunyikan</ConfirmButton>}
                      </form>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
        <h2 className="form-sec">Pengantar dan SEO</h2>
        <ActionForm action={saveLatihanIntro} className="form form-wide intro-form">
          <LangFields name="latihan_intro" label="Pengantar halaman Latihan" values={pair("latihan_intro")} hint="Kosong berarti memakai kalimat bawaan. Satu paragraf per baris." multiline rows={4} />
          <LangFields name="seo_latihan_desc" label="Deskripsi di hasil pencarian" values={pair("seo_latihan_desc")} hint="Kosong berarti memakai kalimat bawaan. Sekitar 140–160 huruf." multiline rows={3} />
          <div><button className="btn primary" type="submit">Simpan</button></div>
        </ActionForm>
      </main>
    </>
  );
}
