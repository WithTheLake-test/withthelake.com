import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // The repo root has its own lockfile; pin the root so this app resolves only its own node_modules.
  turbopack: { root: __dirname },
};

export default nextConfig;
