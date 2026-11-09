import { ProjectsView } from "@/views/ProjectsView";
import { projectsMetadata } from "@/lib/seo-pages";
export const dynamic = "force-dynamic";
export const generateMetadata = () => projectsMetadata("id");
export default async function Page({ searchParams }: { searchParams: Promise<{ tech?: string | string[] }> }) {
  return <ProjectsView lang="id" tech={(await searchParams).tech} />;
}
