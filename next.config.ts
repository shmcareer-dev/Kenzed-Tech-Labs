import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  basePath: isProd ? "/Kenzed-Tech-Labs" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
