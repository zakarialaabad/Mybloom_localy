'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import SectionContainer from '@/components/SectionContainer';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { productService, Product } from '@/services/api';
import { type ProductCardProps } from '@/components/ui/ProductCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

function productToCard(p: Product): ProductCardProps {
  // Ensure imageUrl falls back to first image if primary_image is null
  const imageUrl = p.primary_image || p.images?.[0]?.image_url || FALLBACK_IMG;
  const secondaryImageUrl = p.images?.[1]?.image_url || undefined;
  
  return {
    id:            p.id,
    slug:          p.slug,
    name:          p.name,
    subtitle:      p.brand?.name ?? '',
    description:   p.subtitle ?? '',
    price:         p.min_price,
    originalPrice: p.max_price ?? p.min_price,
    rating:        p.avg_rating,
    reviewCount:   p.review_count,
    imageUrl,
    secondaryImageUrl,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
    category:      p.category?.name?.toLowerCase() === 'parfum' ? (p.product_type?.name ?? p.category?.name) : p.category?.name,
    productType:   p.category?.name?.toLowerCase() === 'parfum' ? (p.brand?.name ?? p.product_type?.name ?? '') : (p.product_type?.name ?? ''),
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
    const scrollAmount = 320; // Approximate width of 1 ProductCard + gap
    if (dir === 'prev') {
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="best-sellers" className="pb-24 pt-16">
      {/* Section header */}
      <SectionContainer className="mb-8 md:mb-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
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
            className="mt-2 md:mt-0 inline-flex items-center justify-center bg-[#4a403a] px-6 md:px-8 py-2.5 md:py-3 text-sm font-bold text-white shadow-md hover:bg-[#3a322d] transition-colors rounded-md font-serif italic whitespace-nowrap"
          >
            Shop Best Sellers ›
          </Link>
        </div>
      </SectionContainer>

      {/* Carousel */}
      <SectionContainer>
        <div className="relative group">
          {/* Prev arrow */}
          {canPrev && (
            <button
              aria-label="Previous"
              onClick={() => scroll('prev')}
              className="absolute left-0 top-[40%] z-20 flex w-10 h-10 -translate-y-1/2
                items-center justify-center rounded-full border border-gray-200 bg-white
                shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-50
                transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {canNext && (
            <button
              aria-label="Next"
              onClick={() => scroll('next')}
              className="absolute right-0 top-[40%] z-20 flex w-10 h-10 -translate-y-1/2
                items-center justify-center rounded-full border border-gray-200 bg-white
                shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-50
                transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scroll track */}
          <div
            ref={trackRef}
            onScroll={syncArrows}
            className="overflow-x-auto scrollbar-hide pb-6 md:pb-4"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex gap-3 sm:gap-4 md:gap-6" style={{ minWidth: 'min-content' }}>
              {loading || products.length === 0 ? (
                // Skeleton placeholders
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-auto"
                    style={{ width: '220px' }}
                  >
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-auto"
                    style={{ width: '220px' }}
                  >
                    <ProductCard {...product} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
