import type { MetadataRoute } from "next";

import { services } from "@/content/services";
import { site } from "@/content/site";

export const dynamic = "force-static";

/** Static routes, highest priority first. */
const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/technology", priority: 0.7, changeFrequency: "monthly" },
  { path: "/infrastructure", priority: 0.7, changeFrequency: "monthly" },
  { path: "/industries", priority: 0.7, changeFrequency: "monthly" },
  { path: "/process", priority: 0.6, changeFrequency: "monthly" },
  { path: "/team", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...routes.map((route) => ({
      url: new URL(route.path, site.url).toString(),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...services.map((service) => ({
      url: new URL(`/services/${service.slug}`, site.url).toString(),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
