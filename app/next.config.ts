import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Native React/Next View Transitions for crossfade route animations.
    viewTransition: true,
  },
};

export default nextConfig;
