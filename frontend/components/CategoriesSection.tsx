 'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';
import useReferenceStore from '@/store/reference';

/** Returns how many items to show per "page" based on viewport width */
function usePerPage() {
  const getPerPage = () => {
    if (typeof window === 'undefined') return 6;
    if (window.innerWidth < 640)  return 2;   // mobile  — 2 columns
    if (window.innerWidth < 768)  return 4;   // sm      — 4 columns
    return 6;                                  // md+     — 6 columns
  };
  const [perPage, setPerPage] = useState(getPerPage);
  useEffect(() => {
    const handler = () => setPerPage(getPerPage());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return perPage;
}

export default function CategoriesSection() {
  const ingredients       = useReferenceStore((s) => s.ingredients);
  const ensureIngredients = useReferenceStore((s) => s.ensureIngredients);
  const [page, setPage]  = useState(0);
  const perPage          = usePerPage();

  useEffect(() => { ensureIngredients(); }, [ensureIngredients]);

  // Reset to page 0 whenever perPage changes so we never land on an out-of-range page
  useEffect(() => { setPage(0); }, [perPage]);

  const totalPages   = Math.ceil(ingredients.length / perPage);
  const visible      = ingredients.slice(page * perPage, (page + 1) * perPage);
  const canPrev      = page > 0;
  const canNext      = page < totalPages - 1;
  return (
    <section className="bg-white">
      {/* ── Why Shop with us ────────────────────────────────────────────────── */}
      <div className="relative py-20 md:py-48 overflow-hidden">
        {/* Background - rotated on mobile */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Mobile version (Rotated) - Adjusted so it doesn't zoom in so much that it disappears */}
          <div 
            className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vh] h-[100vw] min-w-[1200px] bg-cover bg-center bg-no-repeat rotate-90 opacity-90"
            style={{ backgroundImage: "url('/background.jpeg')" }}
          />
          {/* Desktop version (Normal) */}
          <div 
            className="hidden md:block absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/background.jpeg')" }}
          />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <SectionContainer>
            <div className="flex flex-col items-start text-left mb-10 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3a3a3a] font-serif">
                Why Shop with&nbsp;
                <span className="inline-block align-middle">
                  <Image src="/logo.png" alt="MyBloom" width={140} height={40} className="object-contain h-9 md:h-11 w-auto inline" />
                </span>
              </h2>
            </div>

          <div className="grid grid-cols-1 px-4 gap-8 md:gap-14 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto auto-rows-fr">
            {/* 1. Authentic */}
            <div className="flex flex-col items-center h-full">
              <div className="mb-3 md:mb-6 flex h-14 w-14 md:h-20 md:w-20 items-center justify-center">
                <Image 
                  src="/100_icon.jpeg" 
                  alt="Authentic icon" 
                  width={60} 
                  height={60} 
                  className="object-contain md:w-20 md:h-20"
                />
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-900 font-serif">100% Authentic Products</h3>
              <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-light text-center">Sourced from Authorized<br />Suppliers.</p>
            </div>

            {/* 2. Pricing */}
            <div className="flex flex-col items-center h-full">
              <div className="mb-3 md:mb-6 flex h-14 w-14 md:h-20 md:w-20 items-center justify-center">
                <Image 
                  src="/Competitive_icon.jpeg" 
                  alt="Competitive icon" 
                  width={60} 
                  height={60} 
                  className="object-contain md:w-20 md:h-20"
                />
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-900 font-serif">Competitive Pricing</h3>
              <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-light text-center">Best Prices, Guaranteed<br />Savings!</p>
            </div>

            {/* 3. Support */}
            <div className="flex flex-col items-center h-full">
              <div className="mb-3 md:mb-6 flex h-14 w-14 md:h-20 md:w-20 items-center justify-center">
                <Image 
                  src="/Customer_icon.jpeg" 
                  alt="Support icon" 
                  width={60} 
                  height={60} 
                  className="object-contain md:w-20 md:h-20"
                />
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-900 font-serif">Customer Support</h3>
              <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-light text-center">We’re here whenever<br />you need us.</p>
            </div>

            {/* 4. COD */}
            <div className="flex flex-col items-center h-full">
              <div className="mb-3 md:mb-6 flex h-14 w-14 md:h-20 md:w-20 items-center justify-center">
                <Image 
                  src="/Cash_Icon.jpeg" 
                  alt="COD icon" 
                  width={60} 
                  height={60} 
                  className="object-contain md:w-20 md:h-20"
                />
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-900 font-serif">Cash on Delivery</h3>
              <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-light text-center">Pay when you<br />receive.</p>
            </div>
          </div>
        </SectionContainer>
        </div>
      </div>

      {/* ── Discover by Notes ──────────────────────────────────────────────── */}
      <div className="py-16 sm:py-20">
        <SectionContainer>
          {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4a403a] font-serif">
              Discover by <span className="text-[#e63a6c] italic font-light ml-1 text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>Notes</span>
            </h2>
            <p className="mt-3 md:mt-4 text-xs md:text-base text-gray-700 max-w-xl leading-relaxed">
              Explore fragrances by their unique scent notes and discover the perfect blend of floral, woody, citrus, and spicy perfumes that suits your style.
            </p>
            {/* Mobile button under text */}
            <div className="mt-6 md:hidden">
              <Link 
                href="/categories" 
                className="inline-flex items-center justify-center bg-[#4a403a] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#3a322d] transition-colors rounded-md font-serif italic"
              >
                Shop all notes ›
              </Link>
            </div>
          </div>
          {/* Desktop button */}
          <Link 
            href="/categories" 
            className="hidden md:inline-flex items-center justify-center bg-[#4a403a] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#3a322d] transition-colors rounded-md font-serif italic"
          >
            Shop all notes ›
          </Link>
        </div>

        {/* Carousel / Grid */}
        <div className="relative mt-12">
            {/* Left arrow */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0 md:-translate-x-4 z-10 flex">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!canPrev}
                  className={`h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-opacity ${
                    canPrev ? 'text-gray-600 hover:text-gray-900 opacity-100' : 'text-gray-300 opacity-40 cursor-default'
                  }`}
                >
                    ‹
                </button>
            </div>

            {/* 6-per-page grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 md:gap-x-8 md:gap-y-12">
            {visible.map((ingredient) => (
                <Link key={ingredient.id} href={`/collection?ingredient=${ingredient.id}`} className="group block text-center">
                    <div className="relative mx-auto h-32 w-32 md:h-40 md:w-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src={ingredient.image_url ?? 'https://images.unsplash.com/photo-1598007264887-acc47d519b88?auto=format&fit=crop&q=80&w=200'}
                            alt={ingredient.name}
                            width={120}
                            height={120}
                            className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                        />
                    </div>
                    <h3 className="mt-4 md:mt-6 text-xs md:text-sm font-serif uppercase tracking-widest text-[#4a403a]">
                        {ingredient.name}
                    </h3>
                </Link>
            ))}
            </div>

            {/* Right arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0 md:translate-x-4 z-10 flex">
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={!canNext}
                  className={`h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-opacity ${
                    canNext ? 'text-gray-600 hover:text-gray-900 opacity-100' : 'text-gray-300 opacity-40 cursor-default'
                  }`}
                >
                    ›
                </button>
            </div>

            {/* Page dots */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === page ? 'w-6 bg-[#4a403a]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
        </div>
        </SectionContainer>
      </div>
    </section>
  );
}
