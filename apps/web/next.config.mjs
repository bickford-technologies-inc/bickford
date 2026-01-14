/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@bickford/canon",
    "@bickford/db",
    "@bickford/ledger",
    "@bickford/optr",
    "@bickford/ui",
  ],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
