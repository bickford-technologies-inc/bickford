/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {},
  webpack(config) {
    config.externals = config.externals || [];
    return config;
  },
};
