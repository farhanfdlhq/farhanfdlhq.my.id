import { ProjectsView } from "@/views/ProjectsView";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ tech?: string }> }) {
  return <ProjectsView lang="en" tech={(await searchParams).tech} />;
}
