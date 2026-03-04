 'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';
import ProductCard, { type ProductCardProps } from '@/components/ui/ProductCard';
import { productService, Product } from '@/services/api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

function productToCard(p: Product): ProductCardProps {
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
    imageUrl:      p.primary_image ?? FALLBACK_IMG,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
  };
}

export default function UniversSection() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // is_featured=0 → exclude Best Seller products; show only normal products
    productService
      .list({ limit: 10, sort: 'newest', is_featured: 0 })
      .then(({ data }) => setProducts(data.map(productToCard)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-12 py-20 bg-white">
      <SectionContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-5xl font-serif text-gray-800">L'Univers de <span className="italic text-yellow-500 font-serif" style={{fontFamily: 'var(--font-serif, Playfair Display, serif)'}}>Bloom Parfums</span></h2>
            <p className="text-gray-500 text-sm mt-4 max-w-3xl leading-relaxed">
              Explorez notre catalogue complet regroupant tous nos produits, développés avec exigence pour répondre aux attentes les plus élevées, des solutions fiables et innovantes pensées pour vous apporter satisfaction, confiance et excellence.
            </p>
          </div>
          <Link href="/collection" className="bg-[#3D2B1F] text-white px-8 py-3 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors shrink-0">
            See all collection <span>›</span>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6">
          {loading ? (
            // Skeleton placeholders — same grid slot count, same aspect ratio
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-sm aspect-[4/5] mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <p className="col-span-5 text-center text-sm text-gray-400 font-serif italic py-12">
              No products available at the moment.
            </p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          )}
        </div>
      </SectionContainer>
    </section>
  );
}

