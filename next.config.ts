import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin",
      },
    ];
  },
};

export default nextConfig;
