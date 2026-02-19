import Header     from '@/components/layout/Header';
import Footer     from '@/components/layout/Footer';
import HeroSection  from '@/components/sections/HeroSection';
import BrandLogos   from '@/components/sections/BrandLogos';
import BestSellers  from '@/components/sections/BestSellers';

/**
 * Public store home page — assembled from isolated section components.
 * SSG: rendered at build time, no auth required.
 */
export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSection />
        <BrandLogos />
        <BestSellers />
      </main>

      <Footer />
    </>
  );
}
