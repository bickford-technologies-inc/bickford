/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@bickford/ledger",
    "@bickford/execution-convergence",
    "@bickford/types",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
