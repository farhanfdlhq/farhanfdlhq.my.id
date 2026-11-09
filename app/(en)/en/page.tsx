import { HomeView } from "@/views/HomeView";
import { homeMetadata } from "@/lib/seo-pages";
export const dynamic = "force-dynamic";
export const generateMetadata = () => homeMetadata("en");
export default function Page() { return <HomeView lang="en" />; }
