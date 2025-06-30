/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin",
      },
    ];
  },
};

module.exports = nextConfig;
