// Canonical Next.js config for monorepo workspace resolution

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bickford/db", "@bickford/canon"],
  experimental: {
    serverComponentsExternalPackages: ["@bickford/core"],
  },
  // ...add any other workspace packages as needed
};

module.exports = nextConfig;
