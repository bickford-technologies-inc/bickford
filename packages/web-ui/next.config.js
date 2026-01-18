/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

  /**
   * CRITICAL:
   * Next.js MUST be told to transpile workspace packages.
   * Without this, webpack cannot resolve @bickford/ledger
   * inside app/api routes.
   */
  transpilePackages: [
    "@bickford/ledger",
    "@bickford/types",
    "@bickford/execution-convergence",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
