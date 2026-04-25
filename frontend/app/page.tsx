'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Header     from '@/components/layout/Header';
import Footer     from '@/components/layout/Footer';
import HeroSection  from '@/components/sections/HeroSection';
import BrandLogos   from '@/components/sections/BrandLogos';
import BestSellers  from '@/components/sections/BestSellers';
import CategoriesSection from '@/components/CategoriesSection';
import UniversSection from '@/components/UniversSection';
import ValentinesSection from '@/components/ValentinesSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { LoadingSpinner } from '@/components/Skeleton';
import useReferenceStore from '@/store/reference';

/**
 * Public store home page — assembled from isolated section components.
 * Shows full-page loading skeleton until initial data is ready.
 */
export default function HomePage() {
  const brands     = useReferenceStore((s) => s.brands);
  const categories = useReferenceStore((s) => s.categories);
  const ensureBrands = useReferenceStore((s) => s.ensureBrands);
  const ensureCategories = useReferenceStore((s) => s.ensureCategories);

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => { ensureBrands(); }, [ensureBrands]);
  useEffect(() => { ensureCategories(); }, [ensureCategories]);

  // Mark page as loaded once initial data is ready
  useEffect(() => {
    if (brands.length > 0 && categories.length > 0) {
      setPageLoading(false);
    }
  }, [brands.length, categories.length]);

  // Always render the full page layout.
  // The spinner overlays ON TOP of the rendered page — same as admin dashboard.
  return (
    <>
      {/* Spinner overlay — sits on top of rendered sections when loading */}
      {pageLoading && <LoadingSpinner />}

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
