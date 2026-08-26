import type { MetadataRoute } from "next";

import { asset, site } from "@/content/site";

export const dynamic = "force-static";

/**
 * Web app manifest.
 *
 * Not a bid to be an installable app — it is what makes an Android home-screen
 * shortcut, a Windows pinned site and the browser's own "add to home screen"
 * card carry the brand rather than a screenshot of the favicon. `display` stays
 * "browser" deliberately: this is a website, and a standalone window would take
 * away the address bar that tells a visitor they are on kenzed.in.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: "Kenzed",
    description: site.description,
    start_url: asset("/"),
    scope: asset("/"),
    display: "browser",
    background_color: "#05080d",
    theme_color: "#05080d",
    lang: "en-IN",
    categories: ["business", "productivity", "developer"],
    icons: [
      {
        src: asset("/icon.svg"),
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: asset("/favicon.ico"),
        type: "image/x-icon",
        sizes: "48x48",
      },
    ],
  };
}
