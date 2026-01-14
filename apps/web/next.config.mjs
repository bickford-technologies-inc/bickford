/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
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
