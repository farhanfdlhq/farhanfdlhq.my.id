import { RootShell } from "@/components/site/RootShell";
export { rootMetadata as metadata, rootViewport as viewport } from "@/lib/rootMeta";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
