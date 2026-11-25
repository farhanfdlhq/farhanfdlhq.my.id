import { PracticeListView } from "@/views/PracticeListView";
import { practiceMetadata } from "@/lib/seo-pages";
export const dynamic = "force-dynamic";
export const generateMetadata = () => practiceMetadata("en");
export default function Page() {
  return <PracticeListView lang="en" />;
}
