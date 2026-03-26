import type { Metadata } from 'next';
import MobileActionBar from '@/components/sections/MobileActionBar';
import { Providers } from '@/app/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'Parfum'}`,
    default: process.env.NEXT_PUBLIC_APP_NAME ?? 'Parfum',
  },
  description: 'Parfum — Your premium fragrance destination.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pb-[64px] md:pb-0">
        <Providers>
          {children}
          <MobileActionBar />
        </Providers>
      </body>
    </html>
  );
}
