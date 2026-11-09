import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ListEditor } from "@/components/admin/ListEditor";

export const metadata = { title: "Riwayat" };

export default async function HistoryAdmin() {
  // Layout tidak cukup: navigasi RSC bisa melewati layout, jadi setiap halaman memeriksa login sendiri
  await requireAdmin();
  return (
    <>
      <AdminNav current="/admin/riwayat/" />
      <main className="admin-main">
        <h1>Riwayat</h1>
        <p className="admin-sub">Urutan di sini sama dengan urutan di situs. Isian EN yang kosong memakai teks ID.</p>
        <nav className="jump" aria-label="Lompat ke daftar">
          <a href="#experience">Pengalaman</a><a href="#education">Pendidikan</a><a href="#certification">Sertifikasi</a><a href="#skill">Keahlian</a>
        </nav>
        <ListEditor kind="experience" />
        <ListEditor kind="education" />
        <ListEditor kind="certification" />
        <ListEditor kind="skill" />
      </main>
    </>
  );
}
