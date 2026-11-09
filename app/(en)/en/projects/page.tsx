import { ProjectsView } from "@/views/ProjectsView";
import { projectsMetadata } from "@/lib/seo-pages";
export const dynamic = "force-dynamic";
export const generateMetadata = () => projectsMetadata("en");
export default async function Page({ searchParams }: { searchParams: Promise<{ tech?: string | string[] }> }) {
  return <ProjectsView lang="en" tech={(await searchParams).tech} />;
}
