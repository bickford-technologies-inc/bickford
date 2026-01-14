// Canonical Next.js config for monorepo workspace resolution

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
  // ...add any other workspace packages as needed
};

module.exports = nextConfig;
