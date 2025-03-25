/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable App Router to prevent conflicts
  experimental: {
    appDir: false
  },
  images: {
    domains: ['plus.unsplash.com', 'images.unsplash.com'],
  },
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    buildActivity: true
  }
};

module.exports = nextConfig;