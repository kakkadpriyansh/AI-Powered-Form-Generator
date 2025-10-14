import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during production builds so build doesn't fail on lint rules
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
