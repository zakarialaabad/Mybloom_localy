'use client';

import { ReactNode, useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import BestSellers from '@/components/sections/BestSellers';
import CategoriesSection from '@/components/CategoriesSection';
import UniversSection from '@/components/UniversSection';
import ValentinesSection from '@/components/ValentinesSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { LoadingSpinner } from '@/components/Skeleton';
import useReferenceStore from '@/store/reference';

type HomePageClientProps = {
  brandSection: ReactNode;
};

export default function HomePageClient({ brandSection }: HomePageClientProps) {
  const categoriesReady = useReferenceStore((s) => s.categoriesReady);
  const ensureCategories = useReferenceStore((s) => s.ensureCategories);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    ensureCategories();
  }, [ensureCategories]);

  useEffect(() => {
    if (categoriesReady) {
      setPageLoading(false);
    }
  }, [categoriesReady]);

  return (
    <>
      {pageLoading && <LoadingSpinner />}

      <Header />

      <main>
        <HeroSection />
        {brandSection}
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
