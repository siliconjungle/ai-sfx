/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      // or layers: true if needed
    };
    return config;
  },
};

module.exports = nextConfig;
