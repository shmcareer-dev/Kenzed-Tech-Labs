import type { MetadataRoute } from "next";

import { site } from "@/content/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The lead inbox and API endpoints have nothing to index.
      disallow: ["/admin", "/api"],
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
