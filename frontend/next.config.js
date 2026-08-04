/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const cleanTarget = backendUrl.endsWith('/api') ? backendUrl.slice(0, -4) : backendUrl;
    return [
      {
        source: '/api/:path*',
        destination: `${cleanTarget}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
