import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ActionForm } from "@/components/admin/ActionForm";
import { LangFields } from "@/components/admin/LangFields";
import { saveProfile } from "@/app/actions/profile";
import { getSetting, type SettingKey } from "@/lib/settings";

export const metadata = { title: "Profil" };

export default async function ProfileAdmin() {
  // Layout tidak cukup: navigasi RSC bisa melewati layout, jadi setiap halaman memeriksa login sendiri
  await requireAdmin("/admin/profil/");
  const s = (k: SettingKey) => getSetting(k);
  const pair = (k: "hero_line" | "about" | "seo_title" | "seo_desc" | "seo_projects_desc") => ({ id: s(`${k}_id`), en: s(`${k}_en`) });
  return (
    <>
      <AdminNav current="/admin/profil/" />
      <main className="admin-main">
        <h1>Profil</h1>
        <p className="admin-sub">Nama, peran, dan kontak tampil di Beranda dan di hasil pencarian. Nomor telepon sengaja tidak ada di sini.</p>
        <ActionForm action={saveProfile} className="form form-wide">
          <div className="form-row">
            <div className="field"><label htmlFor="name">Nama</label><input id="name" name="name" required maxLength={80} defaultValue={s("name")} autoComplete="name" enterKeyHint="next" /></div>
            <div className="field"><label htmlFor="role">Peran</label><input id="role" name="role" maxLength={80} defaultValue={s("role")} autoComplete="organization-title" enterKeyHint="next" aria-describedby="role-hint" /><p className="hint" id="role-hint">Tampil tebal di hero, misalnya: UI/UX | Software Engineer.</p></div>
          </div>
          <div className="form-row">
            <div className="field"><label htmlFor="city">Kota <span className="opt">(opsional)</span></label><input id="city" name="city" maxLength={60} defaultValue={s("city")} autoComplete="address-level2" enterKeyHint="next" /></div>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" inputMode="email" autoCapitalize="none" autoComplete="email" placeholder="nama@gmail.com" defaultValue={s("email")} enterKeyHint="next" /></div>
          </div>
          <div className="form-row form-row-even">
            <div className="field"><label htmlFor="github_url">GitHub <span className="opt">(opsional)</span></label><input id="github_url" name="github_url" type="url" inputMode="url" autoCapitalize="none" autoComplete="url" placeholder="https://github.com/..." defaultValue={s("github_url")} enterKeyHint="next" /></div>
            <div className="field"><label htmlFor="linkedin_url">LinkedIn <span className="opt">(opsional)</span></label><input id="linkedin_url" name="linkedin_url" type="url" inputMode="url" autoCapitalize="none" autoComplete="url" placeholder="https://www.linkedin.com/in/..." defaultValue={s("linkedin_url")} enterKeyHint="next" /></div>
          </div>
          <LangFields name="hero_line" label="Kalimat setelah peran di hero" values={pair("hero_line")} hint="Boleh kosong." multiline rows={2} />
          <LangFields name="about" label="Tentang" values={pair("about")} hint="Satu paragraf per baris." multiline rows={6} />
          <h2 className="form-sec">SEO</h2>
          <LangFields name="seo_title" label="Judul di hasil pencarian" values={pair("seo_title")} hint="Sekitar 50–60 huruf." />
          <LangFields name="seo_desc" label="Deskripsi di hasil pencarian" values={pair("seo_desc")} hint="Untuk Beranda. Sekitar 140–160 huruf." multiline rows={3} />
          <LangFields name="seo_projects_desc" label="Deskripsi halaman Proyek" values={pair("seo_projects_desc")} hint="Kosong berarti memakai kalimat bawaan. Sekitar 140–160 huruf." multiline rows={3} />
          <div><button className="btn primary" type="submit">Simpan profil</button></div>
        </ActionForm>
      </main>
    </>
  );
}
