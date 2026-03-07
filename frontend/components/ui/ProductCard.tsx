'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { isInWishlist, toggleWishlist } from '@/lib/wishlist';

export interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  badge?: string;
  isBestSeller?: boolean;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`h-3 w-3 fill-current ${filled ? 'text-aura-gold' : 'text-gray-300'}`}
      viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 
        1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 
        1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 
        1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 
        00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function ProductCard({
  id, slug, name, subtitle, description, price, originalPrice,
  rating, reviewCount, imageUrl, badge, isBestSeller,
}: ProductCardProps) {
  const [wished, setWished] = useState(() => isInWishlist(id));
  const stars = [1, 2, 3, 4, 5];

  return (
    <Link href={`/product/${slug}`} className="product-card group relative block">
      <article className="cursor-pointer bg-white">
        {/* Image container */}
        <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#f8f5f1]">


          {/* Product image */}
          <div className="relative h-full w-full">
            <Image
              src={imageUrl}
              alt={name}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Action buttons overlay bar */}
          <div className="absolute bottom-0 left-0 w-full translate-y-full bg-white/95 py-3 transition-transform duration-300 ease-in-out group-hover:translate-y-0 flex justify-center items-center gap-7 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <button className="text-gray-600 hover:text-black transition-colors" aria-label="Add to cart">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-black transition-colors" aria-label="Quick view">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-black transition-colors" aria-label="Compare">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(id);
                setWished((w) => !w);
              }}
              aria-label="Toggle wishlist"
              className="transition-colors"
            >
              <svg
                className={`h-5 w-5 ${wished ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600 hover:text-red-500'}`}
                stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5 px-2 pb-2 text-left">
          <h3 className="font-serif text-lg font-bold text-gray-900 tracking-wide">{name}</h3>
          <p className="text-xs text-gray-600 pb-2">{subtitle}</p>
          
          <div className="border-t border-gray-100/80 w-full mb-2"></div>

          <p className="text-[11px] text-gray-500 pt-1">{description}</p>

          <div className="flex items-center space-x-2 pt-1 pb-1">
            <span className="text-[13px] text-gray-900">{price} DH</span>
            {originalPrice > price && (
              <>
                <span className="text-[13px] text-gray-900">-</span>
                <span className="text-[13px] text-gray-400 line-through decoration-1">{originalPrice} DH</span>
              </>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center space-x-1">
            <div className="flex">
              {stars.map((s) => (
                <StarIcon key={s} filled={s <= Math.round(rating)} />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              <span className="text-gray-900 font-semibold pr-1">{rating}</span>({reviewCount})
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
