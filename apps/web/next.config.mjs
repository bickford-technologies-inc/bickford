/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@bickford/core",
    "@bickford/types",
    "@bickford/authority",
    "@bickford/ledger",
    "@bickford/optr",
    "@bickford/ui",
  ],
};

export default nextConfig;
