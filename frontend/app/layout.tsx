import type { Metadata } from 'next';
import MobileActionBar from '@/components/sections/MobileActionBar';
import { Providers } from '@/app/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  verification: {
    google: 'dX_E6NeynjFmkG4cNcDhp_mhUls_SgXWtdSCYGDeHn8',
  },
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'MyBloom'}`,
    default: 'Parfum Maroc - Fragrances Luxe Pas Cher | MyBloom',
  },
  description: 'Découvrez les plus beaux parfums au Maroc. Fragrances originales pour femme et homme. Livraison gratuite à partir de 600 DH. 100% authentique.',
  keywords: ['parfum', 'maroc', 'femme', 'homme', 'pas cher', 'original', 'luxe', 'parfum maroc', 'acheter parfum en ligne'],
  openGraph: {
    title: 'Parfum Maroc - Fragrances Luxe Pas Cher | MyBloom',
    description: 'Découvrez les plus beaux parfums au Maroc. Fragrances originales pour femme et homme. Livraison gratuite à partir de 600 DH. 100% authentique.',
    locale: 'fr_MA',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />

      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-PZ2KE5VFJJ"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-PZ2KE5VFJJ');
      `}} />
      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-PZ2KE5VFJJ"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-PZ2KE5VFJJ');
      `}} />
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
