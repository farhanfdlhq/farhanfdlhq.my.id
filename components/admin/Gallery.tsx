import { ActionForm } from "./ActionForm";
import { ConfirmButton } from "./ConfirmButton";
import { FileInput } from "./FileInput";
import { deleteProjectImage, reorderProjectImages, saveImageAltAction, setHeroImage, uploadProjectImage } from "@/app/actions/media";
import type { ProjectImage } from "@/lib/content";

/** Galeri proyek di admin: unggah, pilih gambar utama, ubah urutan, isi teks alt ID/EN, dan hapus. */
export function Gallery({ projectId, hero, images }: { projectId: number; hero: string; images: ProjectImage[] }) {
  return (
    <section className="admin-sec" aria-labelledby="gal-h">
      <h2 id="gal-h">Gambar</h2>
      <p className="admin-sub">Gambar utama tampil di kartu proyek dan di atas halaman detail. Gambar lain tampil di bagian Galeri.</p>
      {hero ? <figure className="hero-now"><img src={hero} alt="" /><figcaption>Gambar utama sekarang</figcaption></figure> : <p className="muted">Belum ada gambar utama.</p>}
      <ActionForm action={uploadProjectImage} className="form upload-form">
        <input type="hidden" name="project_id" value={projectId} />
        <FileInput label="Tambah gambar" accept="image/jpeg,image/png,image/webp" image hint="JPG, PNG, atau WebP, maksimal 12 MB. Disimpan sebagai WebP selebar 1600 px, data lokasi di foto dibuang." />
        <div><button className="btn primary" type="submit">Unggah</button></div>
      </ActionForm>
      <ol className="gal-admin">
        {images.map((im, i) => (
          <li key={im.id} className="gal-item">
            <img src={im.url} alt="" width={240} height={150} />
            <div className="gal-body">
              {im.url === hero ? <span className="badge ok">Gambar utama</span> : null}
              <ActionForm action={saveImageAltAction} className="form alt-form">
                <input type="hidden" name="image_id" value={im.id} />
                <div className="field"><label htmlFor={`alt-id-${im.id}`}>Teks alt <span className="lang-tag">ID</span></label><input id={`alt-id-${im.id}`} name="alt_id" defaultValue={im.alt_id} placeholder="Misalnya: Halaman jadwal di HP" autoComplete="off" enterKeyHint="next" /></div>
                <div className="field"><label htmlFor={`alt-en-${im.id}`}>Teks alt <span className="lang-tag">EN</span></label><input id={`alt-en-${im.id}`} name="alt_en" defaultValue={im.alt_en} placeholder="e.g. Schedule page on mobile" autoComplete="off" enterKeyHint="done" /></div>
                <div><button className="btn btn-quiet btn-small" type="submit">Simpan teks alt</button></div>
              </ActionForm>
              <div className="row-actions">
                <form action={reorderProjectImages}><input type="hidden" name="image_id" value={im.id} /><button className="btn btn-quiet btn-small" name="dir" value="up" disabled={i === 0} aria-label="Naikkan gambar">↑</button><button className="btn btn-quiet btn-small" name="dir" value="down" disabled={i === images.length - 1} aria-label="Turunkan gambar">↓</button></form>
                {im.url !== hero ? <form action={setHeroImage}><input type="hidden" name="image_id" value={im.id} /><button className="btn btn-quiet btn-small">Jadikan gambar utama</button></form> : null}
                <form action={deleteProjectImage}><input type="hidden" name="image_id" value={im.id} /><ConfirmButton danger title="Hapus gambar ini?" message="File gambarnya ikut terhapus dari server." confirmLabel="Hapus">Hapus</ConfirmButton></form>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
