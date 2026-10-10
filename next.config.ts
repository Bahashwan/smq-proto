import type { NextConfig } from "next";

// Static export: every route is pre-rendered from the fixtures; nothing runs on a server.
// SMQ_DIST_DIR lets several dev servers run side by side (one per working agent).
const nextConfig: NextConfig = {
  output: "export",
  distDir: process.env.SMQ_DIST_DIR || ".next",
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
  devIndicators: false,
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
