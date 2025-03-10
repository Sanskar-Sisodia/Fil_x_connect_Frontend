/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://52.66.8.192:8080/:path*", // Proxy to avoid Mixed Content issue
      },
    ];
  },
};

module.exports = nextConfig;
