 'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';
import ProductCard, { type ProductCardProps } from '@/components/ui/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import useCatalogStore from '@/store/catalog';
import { type Product } from '@/services/api';

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
    price:         p.min_price ?? 0,
    originalPrice: p.max_price ?? p.min_price ?? 0,
    rating:        p.avg_rating ?? 0,
    reviewCount:   p.review_count ?? 0,
    imageUrl,
    secondaryImageUrl,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
    category:      p.category?.name?.toLowerCase() === 'parfum' ? (p.product_type?.name ?? p.category?.name) : p.category?.name,
    productType:   p.category?.name?.toLowerCase() === 'parfum' ? (p.brand?.name ?? p.product_type?.name ?? '') : (p.product_type?.name ?? ''),
  };
}

export default function UniversSection() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading]   = useState(true);

  const ensureProducts = useCatalogStore((s) => s.ensureProducts);

  useEffect(() => {
    // Use shared catalog cache (15-min TTL) — avoids a redundant API call on every page visit
    ensureProducts('normal:10', { limit: 10, sort: 'newest', is_featured: 0 })
      .then((data) => setProducts(data.map(productToCard)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ensureProducts]);

  return (
    <section className="pb-20 bg-white">
      <SectionContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-5xl font-serif text-gray-800">L'Univers de <span className="text-[#e63a6c] italic font-light ml-1 text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>Bloom Parfums</span></h2>
            <p className="text-gray-500 text-sm mt-4 max-w-3xl leading-relaxed">
              Explorez notre catalogue complet regroupant tous nos produits, développés avec exigence pour répondre aux attentes les plus élevées, des solutions fiables et innovantes pensées pour vous apporter satisfaction, confiance et excellence.
            </p>
          </div>
          <Link href="/collection" className="inline-flex items-center justify-center bg-[#4a403a] px-6 md:px-8 py-2.5 md:py-3 text-sm font-bold text-white shadow-md hover:bg-[#3a322d] transition-colors rounded-md font-serif italic whitespace-nowrap shrink-0">
            Voir toute la collection ›
          </Link>
        </div>

        {/* Product Grid enclosed in a relative container for the overlay */}
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6">
            {loading || products.length === 0 ? (
              // Skeleton placeholders — shown during loading or if no products
              <div className="col-span-2 md:col-span-3 lg:col-span-5">
                <ProductGridSkeleton count={10} />
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>

          {/* Exact Adobe XD Linear Gradient Overlay (White #FFFFFF 100% to 0% Transparent) */}
          {/* Height covers the bottom row, pointer-events-none allows clicking cards underneath */}
          <div className="absolute bottom-0 left-0 right-0 h-48 md:h-[300px] bg-gradient-to-t from-[#ffffff] to-[#ffffff]/0 pointer-events-none z-10" />
        </div>

        {/* Centered Button 149px below the products grid on desktop, responsive on mobile */}
        <div className="flex justify-center mt-12 md:mt-[149px] relative z-20">
          <Link href="/collection" className="inline-flex items-center justify-center bg-[#4a403a] px-6 md:px-8 py-2.5 md:py-3 text-sm font-bold text-white shadow-lg hover:bg-[#3a322d] transition-colors rounded-md font-serif italic whitespace-nowrap">
            Voir toute la collection ›
          </Link>
        </div>
      </SectionContainer>
    </section>
  );
}

