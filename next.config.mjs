/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Force PostCSS processing
    return config;
  },
};

export default nextConfig;
