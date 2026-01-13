/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@bickford/db": path.resolve(__dirname, "../../packages/db/dist"),
    };
    return config;
  },
};

export default nextConfig;
