/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { missingSuspenseWithCSRBailout: false },
  // Output mode for production deployment
  output: 'standalone',

  // Local development only: let frontend code that calls /api/v1/*
  // reach the Laravel/XAMPP backend even though Next runs on port 3000.
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }

    let backendOrigin = 'http://localhost:8000';
    try {
      backendOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api').origin;
    } catch {
      // Keep the safe localhost default above.
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: '/api/health',
        destination: `${backendOrigin}/api/health`,
      },
    ];
  },

  // Ignore TypeScript and ESLint errors during build (for faster CI/CD)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

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
            value: (() => {
              const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'localhost';
              const apiPort = process.env.NODE_ENV === 'production' ? '' : ':8000';
              const apiSrc = process.env.NODE_ENV === 'production' 
                ? `https://${apiHost}` 
                : `http://${apiHost}${apiPort}`;
              
              return [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                `img-src 'self' data: blob: ${apiSrc} https://lh3.googleusercontent.com https://images.unsplash.com https://www.google-analytics.com`,
                "font-src 'self' https://fonts.gstatic.com",
                `connect-src 'self' ${apiSrc} https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com`,
                `media-src 'self' ${apiSrc}`,
                "frame-ancestors 'none'",
              ].join('; ');
            })(),
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
      // Backend in development (http)
      ...(process.env.NODE_ENV !== 'production' ? [
        // Laravel may publish storage URLs using its APP_URL. Allow the
        // network backend used by the local development environment.
        {
          protocol: 'http',
          hostname: '192.168.11.170',
          port: '8001',
          pathname: '/storage/**',
        },
        {
          protocol: 'http',
          hostname: process.env.NEXT_PUBLIC_API_HOST ?? 'localhost',
          port: '8000',
          pathname: '/storage/**',
        },
        {
          protocol: 'http',
          hostname: process.env.NEXT_PUBLIC_API_HOST ?? 'localhost',
          port: '8000',
          pathname: '/public_Image/**',
        },
      ] : []),
      // Third-party services
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
