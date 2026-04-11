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
      // Backend in local dev (http://localhost) — storage paths
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      // Backend in local dev (http://localhost) — public image paths (banners)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/public_Image/**',
      },
      // Backend in local dev (http://127.0.0.1) — loopback IP
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      // Backend in local dev (http://127.0.0.1) — public image paths
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/public_Image/**',
      },
      // Backend in network dev (http://<LAN IP>) — env-driven
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_API_HOST ?? 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      // Backend in network dev (http://<LAN IP>) — public image paths
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_API_HOST ?? 'localhost',
        port: '8000',
        pathname: '/public_Image/**',
      },
      // LAN IP hardcoded in .env.network (192.168.11.105) — covers DB rows
      // that were stored with the old host before resolveUrl() normalisation.
      {
        protocol: 'http',
        hostname: '192.168.11.105',
        port: '8000',
        pathname: '/storage/**',
      },
      // LAN IP — public image paths
      {
        protocol: 'http',
        hostname: '192.168.11.105',
        port: '8000',
        pathname: '/public_Image/**',
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
