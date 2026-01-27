// Trigger Railway deployment: 2026-01-26
/** @type {import('next').NextConfig} */
const nextConfig = {
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
  output: "standalone",
  webpack: (config) => {
    // Handle .js extensions in TypeScript imports
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
      ".mjs": [".mjs", ".mts"],
      ".cjs": [".cjs", ".cts"],
    };
    return config;
  },
};

export default nextConfig;
