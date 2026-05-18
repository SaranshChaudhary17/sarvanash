/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };

    config.resolveLoader = {
      ...config.resolveLoader,
      symlinks: false,
    };

    return config;
  },
};

export default nextConfig;
