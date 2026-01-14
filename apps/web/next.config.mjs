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
  // Removed webpack customization - packages resolve naturally through workspace protocol
};

export default nextConfig;
