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
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              `img-src 'self' data: blob: http://localhost:8000 http://127.0.0.1:8000 https://lh3.googleusercontent.com https://images.unsplash.com`,
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' http://127.0.0.1:8000 http://localhost:8000`,
              "media-src 'self' http://localhost:8000 http://127.0.0.1:8000",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
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
      {
        protocol: 'https',
        hostname: 'www.freepnglogos.com',
      },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Parfum',
  },

  // Strip console.log in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
