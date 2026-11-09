import type { Metadata, Viewport } from "next";
import { siteUrl } from "./seo";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const rootViewport: Viewport = { themeColor: "#050505", colorScheme: "dark" };
