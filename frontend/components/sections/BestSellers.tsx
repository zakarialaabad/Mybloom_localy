'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import SectionContainer from '@/components/SectionContainer';
import { productService, Product } from '@/services/api';
import { type ProductCardProps } from '@/components/ui/ProductCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

function productToCard(p: Product): ProductCardProps {
  return {
    id:            p.id,
    slug:          p.slug,
    name:          p.name,
    subtitle:      p.subtitle ?? '',
    description:   p.description,
    price:         p.min_price,
    originalPrice: p.max_price ?? p.min_price,
    rating:        p.avg_rating,
    reviewCount:   p.review_count,
    imageUrl:      p.primary_image ?? FALLBACK_IMG,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
  };
}

const VISIBLE = 5; // cards visible at once on desktop

export default function BestSellers() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [canPrev, setCanPrev]   = useState(false);
  const [canNext, setCanNext]   = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch ALL featured products — no artificial limit
    productService.list({ is_featured: true, limit: 100 })
      .then(({ data }) => setProducts(data.map(productToCard)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Update arrow visibility whenever products load or scroll position changes
  const syncArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    syncArrows();
  }, [products]);

  const scroll = (dir: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by one card width (track width / VISIBLE)
    const cardWidth = el.scrollWidth / (products.length || 1);
    el.scrollBy({ left: dir === 'next' ? cardWidth : -cardWidth, behavior: 'smooth' });
  };

  return (
    <section id="best-sellers" className="pb-24 pt-16">
      {/* Section header */}
      <SectionContainer className="mb-8 md:mb-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-3xl">
            <h2 className="mb-4 font-serif text-4xl font-bold text-gray-900 tracking-tight">
              Best <span className="text-[#df4079] italic font-light ml-1" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>Sellers</span>
            </h2>
            <p className="text-[11px] md:text-sm leading-relaxed text-gray-800">
              Explore our diverse collection of best-selling perfumes for men and women. Discover a variety of affordable luxury fragrances in your desired price range, perfect for any occasion. Get ready to be excited and intrigued at Fragrance Market.
            </p>
          </div>
          <Link
            href="/collection?featured=1"
            className="mt-2 md:mt-0 flex w-auto items-center justify-center rounded-sm bg-[#4a403a] px-6 md:px-8 py-2.5 md:py-3 text-xs md:text-sm font-bold font-serif italic text-white shadow-sm transition-colors hover:bg-[#3a322d] whitespace-nowrap"
          >
            Shop Best Sellers ›
          </Link>
        </div>
      </SectionContainer>

      {/* Carousel */}
      <SectionContainer>
        <div className="relative">
          {/* Prev arrow */}
          <button
            aria-label="Previous"
            onClick={() => scroll('prev')}
            disabled={!canPrev}
            className={`absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full border border-gray-200 bg-white
              shadow-sm transition-opacity ${
                canPrev ? 'text-gray-700 hover:text-gray-900 opacity-100' : 'text-gray-300 opacity-40 cursor-default'
              }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            aria-label="Next"
            onClick={() => scroll('next')}
            disabled={!canNext}
            className={`absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full border border-gray-200 bg-white
              shadow-sm transition-opacity ${
                canNext ? 'text-gray-700 hover:text-gray-900 opacity-100' : 'text-gray-300 opacity-40 cursor-default'
              }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scroll track */}
          <div
            ref={trackRef}
            onScroll={syncArrows}
            className="flex gap-4 md:gap-6 overflow-x-auto md:overflow-x-hidden scroll-smooth snap-x snap-mandatory pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {loading || products.length === 0 ? (
              // Skeleton placeholders
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-none snap-start w-[calc(50%-8px)] md:w-[calc(20%-19.2px)] animate-pulse"
                >
                  <div className="bg-gray-100 rounded-sm aspect-[4/5] mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                    <div className="h-2 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex-none snap-start w-[calc(50%-8px)] md:w-[calc(20%-19.2px)]"
                >
                  <ProductCard {...product} />
                </div>
              ))
            )}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
