import Header     from '@/components/layout/Header';
import Footer     from '@/components/layout/Footer';
import HeroSection  from '@/components/sections/HeroSection';
import BrandLogos   from '@/components/sections/BrandLogos';
import BestSellers  from '@/components/sections/BestSellers';
import CategoriesSection from '@/components/CategoriesSection';
import UniversSection from '@/components/UniversSection';
import ValentinesSection from '@/components/ValentinesSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';

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
        <CategoriesSection />
        <UniversSection />
        <ValentinesSection />
        <CustomerReviewsSection />
      </main>

      <Footer />
    </>
  );
}
