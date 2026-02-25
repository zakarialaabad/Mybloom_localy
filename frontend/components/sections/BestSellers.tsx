'use client';

import { useEffect, useState } from 'react';
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

export default function BestSellers() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);

  useEffect(() => {
    productService.list({ is_featured: true, limit: 5 })
      .then(({ data }) => setProducts(data.map(productToCard)))
      .catch(() => {});
  }, []);

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
          href="#"
          className="rounded-md bg-aura-gold px-6 py-3 text-sm font-semibold text-white
            transition-colors hover:bg-yellow-600"
        >
          Shop Best Sellers &rsaquo;
        </Link>
      </SectionContainer>

      {/* Product grid */}
      <SectionContainer>
        <div className="relative">
          {/* Prev arrow */}
          <button
            aria-label="Previous"
            className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full border border-gray-200 bg-white
              text-gray-400 shadow-sm hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            aria-label="Next"
            className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full border border-gray-200 bg-white
              text-gray-400 shadow-sm hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
