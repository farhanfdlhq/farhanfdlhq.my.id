import { RootShell } from "@/components/site/RootShell";
export { rootMetadata as metadata, rootViewport as viewport } from "@/lib/rootMeta";

export default function IdLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="id">{children}</RootShell>;
}
