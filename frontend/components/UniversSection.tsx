 'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';
import ProductCard, { type ProductCardProps } from '@/components/ui/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
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
    secondaryImageUrl: p.images?.[1]?.image_url,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
    category:      p.category?.name,
    productType:   p.gender,
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
            <h2 className="text-5xl font-serif text-gray-800">L'Univers de <span className="text-[#e63a6c] italic font-light ml-1 text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>Bloom Parfums</span></h2>
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
      </SectionContainer>
    </section>
  );
}

