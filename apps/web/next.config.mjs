/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@bickford/authority",
    "@bickford/canon",
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
