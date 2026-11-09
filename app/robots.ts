import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/cv/"] }], sitemap: abs("/sitemap.xml") };
}
