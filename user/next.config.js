/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  reactStrictMode: true, // Enforce best practices
  swcMinify: true, // Enable faster minification
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://43.205.229.123:8080/:path*", // Proxy to avoid Mixed Content issue
      },
    ];
  },
};

module.exports = nextConfig;
