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
      <article className="cursor-pointer">
        {/* Image container */}
        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-sm bg-aura-soft-gray">

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(id);
              setWished((w) => !w);
            }}
          aria-label="Toggle wishlist"
          className="absolute left-4 top-4 z-10 rounded-full bg-white/80 p-2 transition-colors
            hover:bg-white"
        >
          <svg
            className={`h-5 w-5 transition-colors ${wished ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400 hover:text-red-500'}`}
            stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 
                00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Badges */}
        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1">
          {badge && (
            <span className="rounded bg-aura-gold px-2 py-1 text-[9px] text-white">
              {badge}
            </span>
          )}
          {isBestSeller && (
            <span className="rounded border border-aura-gold bg-white px-2 py-1
              text-[9px] text-aura-gold">
              Best Seller
            </span>
          )}
        </div>

        {/* Product image */}
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          className="object-contain p-8 mix-blend-multiply transition-transform
            duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-bold text-gray-900">{name}</h3>
        <p className="text-xs text-gray-400">{subtitle}</p>
        <p className="py-1 text-[10px] text-gray-500">{description}</p>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-900">{price} DH</span>
          <span className="text-xs text-gray-400 line-through">{originalPrice} DH</span>
        </div>

        {/* Stars */}
        <div className="flex items-center space-x-1 pt-1">
          <div className="flex">
            {stars.map((s) => (
              <StarIcon key={s} filled={s <= Math.round(rating)} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">
            {rating} ({reviewCount})
          </span>
        </div>
      </div>
      </article>
    </Link>
  );
}
