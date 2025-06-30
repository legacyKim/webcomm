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
  experimental: {
    serverActions: false, // 혹시 사용하고 있다면 안전하게 비활성화
  },
};

module.exports = nextConfig;
