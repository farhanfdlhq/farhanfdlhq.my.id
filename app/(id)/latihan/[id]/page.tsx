import { notFound } from "next/navigation";
import { safeDecode } from "@/lib/text";
import { ChallengeView } from "@/views/ChallengeView";
import { challengeMetadata } from "@/lib/seo-pages";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return challengeMetadata("id", safeDecode((await params).id) ?? "");
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = safeDecode((await params).id);
  if (id === null) notFound();
  return <ChallengeView lang="id" id={id} />;
}
