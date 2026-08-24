import type { NextConfig } from "next";

/**
 * basePath is empty for root-domain hosting (kenzed.in).
 * The GitHub Pages workflow sets NEXT_PUBLIC_BASE_PATH=/Kenzed-Tech-Labs
 * so that deployment target keeps working unchanged.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
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
