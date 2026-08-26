import type { NextConfig } from "next";

/**
 * basePath is empty for root-domain hosting (kenzed.in).
 * The GitHub Pages workflow sets NEXT_PUBLIC_BASE_PATH=/Kenzed-Tech-Labs
 * so that deployment target keeps working unchanged.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  /**
   * Load-bearing, not cosmetic.
   *
   * Without it the export emits a page file and an RSC-payload directory with
   * the SAME name — `technology.html` next to `technology/` — and both claim
   * the URL `/technology`. LiteSpeed's directory handler and the .htaccess
   * rewrite then race for every route, and the winner is not stable: on the
   * live site ten routes redirected into a directory with no index and
   * returned 404, four served correctly, and `/privacy` swapped sides between
   * two requests minutes apart.
   *
   * With it, Next emits `technology/index.html` and there is exactly one thing
   * at that path. The cost is that every public URL now carries a trailing
   * slash; Next rewrites its own hrefs, canonicals and og:urls to match, and
   * `canonicalUrl()` in lib/seo.ts keeps the hand-built ones (sitemap,
   * breadcrumbs, JSON-LD) in step.
   */
  trailingSlash: true,
  // `next dev` and `next build` must not share a distDir: the dev server writes
  // its turbopack cache there, and it was ending up in the deploy artifact
  // (84MB of .sst files). Dev keeps .next, the export owns dist.
  distDir: process.env.NODE_ENV === "production" ? "dist" : ".next",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
