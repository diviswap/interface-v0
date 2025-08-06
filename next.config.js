/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir is now default in Next.js 14+
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure headers for PWA files
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Ensure PWA files are properly served
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
      {
        source: '/manifest.json',
        destination: '/manifest.json',
      },
    ];
  },
};

module.exports = nextConfig;
