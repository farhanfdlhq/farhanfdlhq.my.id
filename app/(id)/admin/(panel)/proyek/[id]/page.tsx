import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { projectById } from "@/lib/projects-admin";
import { Gallery } from "@/components/admin/Gallery";
import { projectImages } from "@/lib/content";

export const metadata = { title: "Proyek" };

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  // Layout tidak cukup: navigasi RSC bisa melewati layout, jadi setiap halaman memeriksa login sendiri
  const { id } = await params;
  await requireAdmin(`/admin/proyek/${encodeURIComponent(id)}/`);
  const p = id === "baru" ? null : projectById(Number(id));
  if (id !== "baru" && !p) notFound();
  return (
    <>
      <AdminNav current="/admin/" />
      <main className="admin-main">
        <h1>{p ? p.title : "Proyek baru"}</h1>
        <p className="admin-sub">{p ? `Alamat: /proyek/${p.slug}/` : "Proyek baru disimpan sebagai draf sampai kamu memilih Terbit."}</p>
        <ProjectForm p={p} />
        {p ? <Gallery projectId={p.id} hero={p.hero_image} images={projectImages(p.id)} /> : null}
      </main>
    </>
  );
}
