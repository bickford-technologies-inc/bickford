import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@bickford/core',
    '@bickford/types',
    '@bickford/authority',
    '@bickford/ledger',
    '@bickford/optr',
    '@bickford/ui',
  ],
};

export default nextConfig;
