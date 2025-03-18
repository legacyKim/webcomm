import type { NextConfig } from "next";

module.exports = {
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin",
      },
    ];
  },
};

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
