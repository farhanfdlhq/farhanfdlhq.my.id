import { ProjectView } from "@/views/ProjectView";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProjectView lang="id" slug={decodeURIComponent((await params).slug)} />;
}
