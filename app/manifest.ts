import type { MetadataRoute } from "next";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: getSetting("name") || "farhanfdlhq.my.id",
    short_name: "farhanfdlhq",
    start_url: "/",
    display: "browser",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
