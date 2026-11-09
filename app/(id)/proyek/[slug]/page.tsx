import { notFound } from "next/navigation";
import { safeDecode } from "@/lib/text";
import { ProjectView } from "@/views/ProjectView";
import { projectMetadata } from "@/lib/seo-pages";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return projectMetadata("id", safeDecode((await params).slug) ?? "");
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = safeDecode((await params).slug);
  if (slug === null) notFound();
  return <ProjectView lang="id" slug={slug} />;
}
