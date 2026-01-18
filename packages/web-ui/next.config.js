/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bickford/ledger", "@bickford/execution-convergence"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
