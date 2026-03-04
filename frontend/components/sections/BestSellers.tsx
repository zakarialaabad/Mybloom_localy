'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import SectionContainer from '@/components/SectionContainer';
import { productService, Product } from '@/services/api';
import { type ProductCardProps } from '@/components/ui/ProductCard';

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
    imageUrl:      p.primary_image,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
  };
}

const VISIBLE = 5; // cards visible at once on desktop

export default function BestSellers() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [canPrev, setCanPrev]   = useState(false);
  const [canNext, setCanNext]   = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch ALL featured products — no artificial limit
    productService.list({ is_featured: true, limit: 100 })
      .then(({ data }) => setProducts(data.map(productToCard)))
      .catch(() => {});
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
      <SectionContainer className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="mb-4 font-serif text-4xl">
            Best <span className="italic text-aura-gold">Sellers</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            Explore our diverse collection of best-selling perfumes for men and women.
            <br />
            Discover a variety of affordable luxury fragrances in your desired price range,
            <br />
            perfect for any occasion. Get ready to be excited and intrigued at Fragrance Market.
          </p>
        </div>
        <Link
          href="/collection?featured=1"
          className="rounded-md bg-aura-gold px-6 py-3 text-sm font-semibold text-white
            transition-colors hover:bg-yellow-600"
        >
          Shop Best Sellers &rsaquo;
        </Link>
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
            className="flex gap-6 overflow-x-hidden scroll-smooth"
          >
            {products.map((product) => (
              <div
                key={product.id}
                // Always show exactly VISIBLE cards: flex-none with percentage width
                className="flex-none"
                style={{ width: `calc((100% - ${(VISIBLE - 1) * 24}px) / ${VISIBLE})` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
