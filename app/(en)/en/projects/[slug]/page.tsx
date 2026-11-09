import { ProjectView } from "@/views/ProjectView";
import { projectMetadata } from "@/lib/seo-pages";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return projectMetadata("en", decodeURIComponent((await params).slug));
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProjectView lang="en" slug={decodeURIComponent((await params).slug)} />;
}
