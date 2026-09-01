import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/finance-tracker",
  assetPrefix: "/finance-tracker/",
};

export default nextConfig;
