/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@bickford/authority",
    "@bickford/canon",
    "@bickford/core",
    "@bickford/db",
    "@bickford/ledger",
    "@bickford/optr",
    "@bickford/types",
    "@bickford/ui",
  ],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
