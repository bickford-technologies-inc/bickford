/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@bickford/execution-convergence",
    "@bickford/ledger"
  ],

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
