import type { NextConfig } from "next";

// Base path for hosting under a subdirectory (GitHub Pages: /<repo>).
// Empty in local dev; set to "/gantt-ng" by the deploy workflow.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Static HTML/JS export — no Node server needed (local-first, no backend).
  output: "export",
  basePath,
  // Emit `route/index.html` so static hosts resolve clean URLs on refresh.
  trailingSlash: true,
  // next/image optimization needs a server; disable for static export.
  images: { unoptimized: true },
  reactCompiler: true,
  experimental: {
    // Native React/Next View Transitions for crossfade route animations.
    viewTransition: true,
  },
};

export default nextConfig;
