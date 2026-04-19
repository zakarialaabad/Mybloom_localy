'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { isInWishlist, toggleWishlist } from '@/lib/wishlist';
import useCartStore from '@/store/cart';
import useCatalogStore from '@/store/catalog';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

/** Sanitize an image URL: strip newlines only. Do NOT percent-encode — the browser handles
 *  encoding from a raw src attribute. Encoding here causes double-encoding (%20 → %2520). */
function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return FALLBACK_IMG;
  // Strip any embedded newline / carriage-return chars (seeder data issue)
  const cleaned = url.replace(/[\r\n\t]+/g, '').trim();
  if (!cleaned) return FALLBACK_IMG;
  return cleaned;
}

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
  secondaryImageUrl?: string;
  badge?: string;
  isBestSeller?: boolean;
  category?: string;
  productType?: string;
  onWishlistToggle?: (id: number) => void;
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
  rating, reviewCount, imageUrl, secondaryImageUrl, badge, isBestSeller, category, productType, onWishlistToggle,
}: ProductCardProps) {
  const [wished, setWished] = useState(() => isInWishlist(id));
  const [isHovered, setIsHovered] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'cart' | 'favorite' }>({ show: false, message: '', type: 'cart' });
  const addItem = useCartStore((s) => s.addItem);
  const prefetchProductDetail = useCatalogStore((s) => s.prefetchProductDetail);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const safeImageUrl = sanitizeImageUrl(imageUrl);
  const safeSecondaryUrl = secondaryImageUrl ? sanitizeImageUrl(secondaryImageUrl) : undefined;
  const hasSecondary = !!safeSecondaryUrl;

  const stars = [1, 2, 3, 4, 5];
  const categoryDisplay = category || productType || description;

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Cleanup prefetch timeout on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Prefetch product detail after 300ms hover to avoid excessive prefetching
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchProductDetail(slug);
    }, 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Clear prefetch timeout on mouse leave
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(id);
    } else {
      toggleWishlist(id);
      const newState = !wished;
      setWished(newState);
      setToast({ show: true, message: newState ? 'Ajouté aux favoris' : 'Retiré des favoris', type: 'favorite' });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId:     id,
      productName:   name,
      slug,
      sizeId:        0,
      sizeLabel:     null,
      quantity:      1,
      unitPrice:     price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      imageUrl,
    });
    setToast({ show: true, message: 'Produit ajouté au panier avec succès !', type: 'cart' });
  };

  return (
    <>
    <Link
      href={`/product/${slug}`}
      className="product-card group relative block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <article className="cursor-pointer bg-white border border-t-0 border-gray-200">
        {/* Image container */}
        <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#f8f5f1]">

          {/* Header overlay – favorite icon + discount badge */}
          <div className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-2.5 flex items-start justify-between">
            {/* Favorite Icon */}
            <button
              onClick={handleWishlistClick}
              className="flex items-center justify-center transition-colors"
              aria-label="Toggle wishlist"
            >
              <svg
                className={`h-5 w-5 sm:h-6 sm:w-6 ${wished ? 'fill-red-500 text-red-500' : 'fill-none text-gray-700'}`}
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>

            {/* Discount Badge */}
            {originalPrice > price && (
              <div className="rounded-sm bg-red-100/95 px-2 py-1 sm:px-2.5 sm:py-1">
                <span className="text-[11px] sm:text-xs font-semibold text-red-600">
                  - {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Product image — crossfade between primary and secondary */}
          <div className="relative h-full w-full">
            {/* Primary image — fades out on hover when secondary exists */}
            <Image
              src={safeImageUrl}
              alt={name}
              fill
              unoptimized
              className={`object-cover transition-opacity duration-500 ease-in-out will-change-opacity ${
                hasSecondary && isHovered ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
            {/* Secondary image — fades in on hover */}
            {hasSecondary && safeSecondaryUrl && (
              <Image
                src={safeSecondaryUrl}
                alt={`${name} hover`}
                fill
                unoptimized
                className={`object-cover absolute inset-0 transition-opacity duration-500 ease-in-out will-change-opacity ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
              />
            )}
          </div>

          {/* Action buttons overlay bar – slides up + fades in on hover */}
          <div className={`
            absolute bottom-0 left-0 w-full
            bg-white/95
            py-2 md:py-3
            flex justify-between items-center
            px-4 md:px-6
            shadow-[0_-2px_10px_rgba(0,0,0,0.05)]
            transition-all duration-300 ease-out
            will-change-transform
            ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          `}>
            <button onClick={handleAddToCart} className="flex-1 flex justify-center text-gray-600 hover:text-black transition-colors" aria-label="Add to cart">
              <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button className="flex-1 flex justify-center text-gray-600 hover:text-black transition-colors" aria-label="Quick view">
              <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button
              onClick={handleWishlistClick}
              aria-label="Toggle wishlist"
              className={`flex-1 flex justify-center transition-colors ${
                wished 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <svg
                className="h-5 w-5 md:h-6 md:w-6 fill-current"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Info Section — Structured & Aligned Layout */}
        <div className="px-4 py-3 text-left flex flex-col gap-2" style={{ backgroundColor: '#FAFAFA' }}>
          {/* HEADER BLOCK — Product Name & Brand */}
          <div className="space-y-0.5 pb-2 border-b border-gray-200">
            {/* Product Name — Single line, clean overflow */}
            <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 tracking-wide leading-tight h-6 overflow-hidden">
              {name}
            </h3>
            
            {/* Product Type — 1 line, 16px height */}
            <p className="text-xs text-gray-600 line-clamp-1 h-4 capitalize">
              {productType || subtitle}
            </p>
          </div>

          {/* CATEGORY — Single line, 16px height */}
          <p className="text-xs text-gray-500 line-clamp-1 h-4">
            {category || description}
          </p>

          {/* FOOTER BLOCK — Price & Rating */}
          <div className="space-y-0.5 pt-0.5">
            {/* Price Row — Consistent height */}
            <div className="flex items-baseline space-x-2 h-6">
              <span className="text-base sm:text-lg font-bold text-gray-900 leading-none">{price} DH</span>
              {originalPrice > price && (
                <>
                  <span className="text-xs text-gray-400 line-through decoration-1">{originalPrice} DH</span>
                </>
              )}
            </div>

            {/* Rating Row — Consistent height */}
            <div className="flex items-center space-x-1 h-5">
              <div className="flex gap-0.5">
                {stars.map((s) => (
                  <StarIcon key={s} filled={s <= Math.round(rating)} />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                <span className="text-gray-900 font-semibold pr-1">{rating}</span>({reviewCount})
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
    
    {/* Toast Notification — cart (brown) or favourite (pink) */}
    {toast.show && (
      <div
        className={`fixed top-4 right-4 z-[9999] flex items-center space-x-3 px-5 py-3 rounded-md shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4 pointer-events-none ${
          toast.type === 'cart'
            ? 'bg-[#4a403a] text-white border border-[#342f2d]'
            : 'bg-[#df4079]/90 backdrop-blur-md text-white border border-[#df4079]/50 shadow-[0_4px_20px_-4px_rgba(223,64,121,0.4)]'
        }`}
      >
        {toast.type === 'cart' ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )}
        <span className="font-serif text-sm md:text-base tracking-wide">{toast.message}</span>
      </div>
    )}
    </>
  );
}
