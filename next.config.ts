import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/hcclab.github.io",
  assetPrefix: "/hcclab.github.io",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
