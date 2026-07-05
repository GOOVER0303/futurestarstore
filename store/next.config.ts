import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sql.js"],
  images: { unoptimized: true },
};

export default nextConfig;
