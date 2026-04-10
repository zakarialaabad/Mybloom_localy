 'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';
import { Skeleton } from '@/components/Skeleton';
import useReferenceStore from '@/store/reference';

export default function CategoriesSection() {
  const ingredients       = useReferenceStore((s) => s.ingredients);
  const ensureIngredients = useReferenceStore((s) => s.ensureIngredients);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => { ensureIngredients(); }, [ensureIngredients]);

  const syncArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    syncArrows();
    window.addEventListener('resize', syncArrows);
    return () => window.removeEventListener('resize', syncArrows);
  }, [ingredients]);

  const scroll = (dir: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({ left: dir === 'next' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  };

  const toggleIngredient = (id: number) => {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section className="bg-white">
      {/* ── Why Shop with us ────────────────────────────────────────────────── */}
      <div className="relative py-12 md:py-0 overflow-hidden w-full h-auto md:h-[502px] flex flex-col justify-center">
        {/* Background - rotated on mobile */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Mobile version (Rotated) - Adjusted so it doesn't zoom in so much that it disappears */}
          <div 
            className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vh] h-[100vw] min-w-[1200px] bg-cover bg-top bg-no-repeat rotate-90 opacity-90"
            style={{ backgroundImage: "url('/background.jpeg')" }}
          />
          {/* Desktop version (Normal) - Focus on upper side */}
          <div 
            className="hidden md:block absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: "url('/background.jpeg')" }}
          />
        </div>
        
        <div className="relative z-10 w-full px-4 md:px-[69px]">
            <div className="flex flex-col items-start text-left mb-8 md:mb-12 mt-4 md:mt-0">
              {/* Flex container ensures perfect logo alignment with title text */}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3a3a3a] font-serif">
                  Why Shop with <span className="text-[#df4079] italic font-light ml-1" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>My Bloom</span>
                </h2>
              </div>
            </div>

          <div className="grid grid-cols-1 px-4 gap-8 md:gap-14 sm:grid-cols-2 lg:grid-cols-4 w-full auto-rows-fr">
            {/* 1. Authentic */}
            <div className="flex flex-col items-center h-full">
              <div className="mb-3 md:mb-6 flex h-14 w-14 md:h-20 md:w-20 items-center justify-center">
                <Image 
                  src="/100_icon.png" 
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
                  src="/Competitive_icon.png" 
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
                  src="/Customer_icon.png" 
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
                  src="/Cash_Icon.png" 
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
                href="/collection" 
                className="inline-flex items-center justify-center bg-[#4a403a] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#3a322d] transition-colors rounded-md font-serif italic"
              >
                Shop all notes ›
              </Link>
            </div>
          </div>
          {/* Desktop button */}
          <Link 
            href="/collection" 
            className="hidden md:inline-flex items-center justify-center bg-[#4a403a] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#3a322d] transition-colors rounded-md font-serif italic"
          >
            Shop all notes ›
          </Link>
        </div>

        {/* Carousel / Grid */}
        <div className="relative mt-12 px-4 md:px-12 group">
            {/* Left arrow */}
            {canPrev && (
              <div className="absolute left-0 top-[40%] md:top-1/2 -translate-y-1/2 z-10 flex">
                  <button
                    onClick={() => scroll('prev')}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md text-gray-600 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
                  >
                      ‹
                  </button>
              </div>
            )}

            {/* Scrollable Track */}
            <div 
              ref={trackRef}
              onScroll={syncArrows}
              className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-4 select-none"
              style={{
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
            {ingredients.length === 0 ? (
              // Skeleton placeholders
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-none w-[120px] md:w-[160px] flex flex-col items-center">
                  <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full mb-3 md:mb-6" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ))
            ) : (
              ingredients.map((ingredient) => {
              const isSelected = selectedIngredients.includes(ingredient.id);
              
              return (
                <button
                  key={ingredient.id}
                  onClick={() => toggleIngredient(ingredient.id)}
                  className="flex-none w-[120px] md:w-[160px] group/item block text-center focus:outline-none"
                >
                    <div className={`relative mx-auto h-32 w-32 md:h-40 md:w-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover/item:scale-105 ring-2 ${
                      isSelected ? 'ring-[#da2966]' : 'ring-transparent'
                    }`}>
                        <Image
                            src={ingredient.image_url ?? 'https://images.unsplash.com/photo-1598007264887-acc47d519b88?auto=format&fit=crop&q=80&w=200'}
                            alt={ingredient.name}
                            width={120}
                            height={120}
                            className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                        />
                    </div>
                    <h3 className={`mt-4 md:mt-6 text-xs md:text-sm font-serif uppercase tracking-widest transition-colors ${
                      isSelected ? 'text-[#da2966] font-semibold' : 'text-[#4a403a]'
                    }`}>
                        {ingredient.name}
                    </h3>
                </button>
              );
              })
            )}
            </div>

            {/* Right arrow */}
            {canNext && (
              <div className="absolute right-0 top-[40%] md:top-1/2 -translate-y-1/2 translate-x-0 md:translate-x-4 z-10 flex">
                  <button
                    onClick={() => scroll('next')}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md text-gray-600 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
                  >
                      ›
                  </button>
              </div>
            )}

            {/* Page dots and View Collection button */}
            <div className="mt-8 flex flex-col items-center gap-6">
              {/* Dots removed for drag-scroll layout */}
              {selectedIngredients.length > 0 && (
                <Link
                  href={`/collection?${selectedIngredients.map((id) => `ingredient=${id}`).join('&')}`}
                  className="inline-flex items-center justify-center bg-[#da2966] px-6 md:px-8 py-2.5 md:py-3 text-sm font-bold text-white shadow-md hover:bg-[#c7235a] transition-colors rounded-md font-serif italic whitespace-nowrap"
                >
                  View Collection ›
                </Link>
              )}
            </div>
        </div>
        </SectionContainer>
      </div>
    </section>
  );
}
