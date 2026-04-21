'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import SectionContainer from '@/components/SectionContainer';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { Product } from '@/services/api';
import { type ProductCardProps } from '@/components/ui/ProductCard';
import useCatalogStore from '@/store/catalog';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

function productToCard(p: Product): ProductCardProps {
  // Ensure imageUrl falls back to first image if primary_image is null
  const imageUrl = p.primary_image || p.images?.[0]?.image_url || FALLBACK_IMG;
  const secondaryImageUrl = p.images?.[1]?.image_url || undefined;
  const defaultVariant = p.variants?.find(v => v.is_default) ?? p.variants?.[0];
  const defaultSizeLabel = defaultVariant ? `${defaultVariant.size}${defaultVariant.unit ?? 'ml'}` : undefined;
  const defaultSizeId = defaultVariant?.id;
  const defaultVariantPrice = defaultVariant?.final_price;
  const defaultVariantOriginalPrice = defaultVariant?.original_price ?? undefined;
  
  return {
    id:            p.id,
    slug:          p.slug,
    name:          p.name,
    subtitle:      p.brand?.name ?? '',
    description:   p.subtitle ?? '',
    price:         defaultVariantPrice ?? p.min_price,
    originalPrice: defaultVariantOriginalPrice ?? defaultVariantPrice ?? p.max_price ?? p.min_price,
    rating:        p.avg_rating,
    reviewCount:   p.review_count,
    imageUrl,
    secondaryImageUrl,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
    category:      p.category?.name?.toLowerCase() === 'parfum' ? (p.product_type?.name ?? p.category?.name) : p.category?.name,
    productType:   p.category?.name?.toLowerCase() === 'parfum' ? (p.brand?.name ?? p.product_type?.name ?? '') : (p.product_type?.name ?? ''),
    defaultSizeLabel,
    defaultSizeId,
    defaultVariantPrice,
    defaultVariantOriginalPrice,
  };
}

const VISIBLE = 5; // cards visible at once on desktop

export default function BestSellers() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [canPrev, setCanPrev]   = useState(false);
  const [canNext, setCanNext]   = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Use catalog cache for featured products
  const ensureProducts = useCatalogStore((s) => s.ensureProducts);

  useEffect(() => {
    // Fetch ALL featured products from cache (15-min TTL)
    // Cache key: "featured:100" ensures same featured list is reused across home page visits
    setLoading(true);
    console.log('[BestSellers] Starting to fetch featured products...');
    
    ensureProducts('featured:100', { is_featured: true, limit: 100 })
      .then((data) => {
        console.log('[BestSellers] ✅ Received featured data:', data);
        
        if (!data || data.length === 0) {
          console.warn('[BestSellers] ⚠️ No featured products found! Falling back to latest products...');
          // Fallback: fetch latest products instead
          return ensureProducts('latest:100', { limit: 100 });
        }
        
        return data;
      })
      .then((data) => {
        const cards = data.map(productToCard);
        console.log('[BestSellers] Transformed to cards:', cards.length, 'products');
        setProducts(cards);
      })
      .catch((err) => {
        console.error('[BestSellers] ❌ Error fetching products:', err);
        setProducts([]);
      })
      .finally(() => {
        console.log('[BestSellers] Finished loading');
        setLoading(false);
      });
  }, [ensureProducts]);

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
    <section id="best-sellers" className="pb-16 md:pb-24 pt-4 md:pt-12">
      {/* Section header */}
      <SectionContainer className="mb-8 md:mb-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4a403a] font-serif mb-4">
              Meilleures <span className="text-[#e63a6c] italic font-light ml-1 text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>Ventes</span>
            </h2>
            <p className="text-gray-500 text-sm mt-4 max-w-3xl leading-relaxed">
              Découvrez nos parfums, beurres corporels et gommages les plus appréciés par nos clientes. Des fragrances envoûtantes et soins naturels à des prix accessibles, parfaits pour chaque occasion. Laissez-vous séduire chez MyBloom.
            </p>
          </div>
          <Link
            href="/collection?featured=1"
            className="mt-2 md:mt-0 inline-flex items-center justify-center bg-[#4a403a] px-6 md:px-8 py-2.5 md:py-3 text-sm font-bold text-white shadow-md hover:bg-[#3a322d] transition-colors rounded-md font-serif italic whitespace-nowrap"
          >
            Découvrir nos meilleures ventes ›
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
