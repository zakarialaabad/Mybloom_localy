/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers on every route
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // Image domains for remote optimization
  images: {
    remotePatterns: [
      // Backend in production (https)
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_HOST ?? 'localhost',
      },
      // Backend in local dev (http://localhost)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      // Backend in network dev (http://<LAN IP>)
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_API_HOST ?? 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Parfum',
  },
};

export default nextConfig;
