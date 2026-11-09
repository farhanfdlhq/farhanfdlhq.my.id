import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@/app/globals.css";
import type { Lang } from "@/lib/lang";

// Kerangka html bersama untuk dua root layout: (id) dan (en)
export function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
