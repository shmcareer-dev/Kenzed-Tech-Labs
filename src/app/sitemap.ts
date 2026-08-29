import type { MetadataRoute } from "next";

import { allNav } from "@/content/nav";
import { services } from "@/content/services";
import { canonicalUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * The route list used to live here as its own array, maintained by hand
 * alongside the header's links and the footer's columns. It now reads from
 * content/nav.ts, which is also what feeds the SiteNavigationElement graph and
 * llms.txt — so a page cannot be in the sitemap and missing from the machine
 * -readable navigation, which is exactly the inconsistency that stops Google
 * treating a section as a sitelink candidate.
 *
 * Every URL goes through canonicalUrl(), so the sitemap agrees with the
 * canonical tag on the page it points at. It did not before: the sitemap
 * advertised /technology while the page claimed /technology/, which is two
 * spellings of one page and a redirect on the way in to every entry.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...allNav.map((entry) => ({
      url: canonicalUrl(entry.path),
      lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
    ...services.map((service) => ({
      url: canonicalUrl(`/services/${service.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
