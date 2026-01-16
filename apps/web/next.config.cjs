// Converted to CommonJS for Next.js 14 compatibility
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bickford/db"],
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  // ...add any other workspace packages as needed
};

module.exports = nextConfig;
