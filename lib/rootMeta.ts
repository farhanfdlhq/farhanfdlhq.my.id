import type { Metadata, Viewport } from "next";

export const rootMetadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3300"),
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const rootViewport: Viewport = { themeColor: "#050505", colorScheme: "dark" };
