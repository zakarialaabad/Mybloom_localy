'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CartDrawer from '@/components/CartDrawer';
import FilterModal from '@/components/FilterModal';
import useCartStore from '@/store/cart';
import { getWishlist } from '@/lib/wishlist';
import { productService, Product } from '@/services/api';
import useReferenceStore from '@/store/reference';
import { Instagram, Facebook } from 'lucide-react';
import SectionContainer from '@/components/SectionContainer';

// TikTok SVG (not in lucide)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

// WhatsApp SVG (not in lucide)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

// Snapchat SVG
function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M12 23.2499c-1.1717 -0.1677 -2.24011 -0.7624 -3 -1.67 -0.3282 -0.3276 -0.72995 -0.572 -1.17178 -0.7129 -0.44183 -0.1409 -0.91093 -0.1742 -1.36822 -0.0971l-0.64 0.11c-0.21793 0.043 -0.44322 0.0299 -0.65468 -0.0381 -0.21146 -0.0681 -0.40215 -0.1888 -0.55414 -0.3507 -0.15199 -0.162 -0.26029 -0.36 -0.31473 -0.5754 -0.05443 -0.2153 -0.05321 -0.441 0.00355 -0.6558 0.04973 -0.2092 0.01729 -0.4296 -0.09062 -0.6156 -0.1079 -0.186 -0.28306 -0.3236 -0.48938 -0.3844l-2 -0.41c-0.16646 -0.049 -0.31395 -0.1477 -0.42263 -0.283 -0.10868 -0.1353 -0.17335 -0.3006 -0.18533 -0.4737 -0.01197 -0.1731 0.02932 -0.3458 0.11834 -0.4947 0.08902 -0.149 0.22149 -0.2671 0.37962 -0.3386 0.91169 -0.3744 1.77465 -0.8579 2.57 -1.44 0.17671 -0.1321 0.31861 -0.3053 0.41344 -0.5046 0.09484 -0.1992 0.13977 -0.4185 0.13091 -0.639 -0.00886 -0.2205 -0.07124 -0.4356 -0.18176 -0.6266 -0.11051 -0.191 -0.26584 -0.3522 -0.45259 -0.4698l-1.23 -0.78c-0.1681 -0.1076 -0.31335 -0.2474 -0.42745 -0.4112 -0.1141 -0.1638 -0.19481 -0.3485 -0.23753 -0.5435 -0.04271 -0.195 -0.0466 -0.3965 -0.01142 -0.593 0.03517 -0.1965 0.1087 -0.38417 0.2164 -0.55226 0.23368 -0.34061 0.59002 -0.57765 0.99448 -0.66152 0.40445 -0.08388 0.82567 -0.00808 1.17552 0.21152l1.32 0.83996V6.88994c0.06398 -1.58424 0.73832 -3.08233 1.88186 -4.18062C8.9154 1.61103 10.4395 0.997681 12.025 0.997681c1.5855 0 3.1096 0.613349 4.2531 1.711639C17.4217 3.80761 18.096 5.3057 18.16 6.88994v3.18996l1.32 -0.83996c0.3498 -0.2196 0.7711 -0.2954 1.1755 -0.21152 0.4045 0.08387 0.7608 0.32091 0.9945 0.66152 0.1077 0.16809 0.1812 0.35576 0.2164 0.55226 0.0352 0.1965 0.0313 0.398 -0.0114 0.593 -0.0427 0.195 -0.1234 0.3797 -0.2375 0.5435s-0.2594 0.3036 -0.4275 0.4112l-1.23 0.78c-0.1867 0.1176 -0.3421 0.2788 -0.4526 0.4698 -0.1105 0.191 -0.1729 0.4061 -0.1817 0.6266 -0.0089 0.2205 0.036 0.4398 0.1309 0.639 0.0948 0.1993 0.2367 0.3725 0.4134 0.5046 0.7954 0.5821 1.6583 1.0656 2.57 1.44 0.1581 0.0715 0.2906 0.1896 0.3796 0.3386 0.089 0.149 0.1303 0.3216 0.1184 0.4947 -0.012 0.1731 -0.0767 0.3384 -0.1854 0.4737 -0.1087 0.1353 -0.2561 0.234 -0.4226 0.283l-2 0.41c-0.2063 0.0608 -0.3815 0.1984 -0.4894 0.3844 -0.1079 0.186 -0.1403 0.4064 -0.0906 0.6156 0.0529 0.2113 0.0524 0.4324 -0.0016 0.6433 -0.054 0.211 -0.1597 0.4052 -0.3076 0.565 -0.148 0.1598 -0.3334 0.2803 -0.5395 0.3504 -0.2062 0.0702 -0.4266 0.0878 -0.6413 0.0513l-0.64 -0.11c-0.4573 -0.0771 -0.9264 -0.0438 -1.3682 0.0971 -0.4418 0.1408 -0.8436 0.3853 -1.1718 0.7129 -0.7762 0.9323 -1.8767 1.5362 -3.08 1.69Z" strokeWidth="1.5"/>
    </svg>
  );
}
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const cartItemCount = useCartStore((s) => s.itemCount());
  const [query, setQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const topLevelCategories = useReferenceStore((s) => s.topLevelCategories);
  const categoriesReady    = useReferenceStore((s) => s.categoriesReady);
  const ensureCategories   = useReferenceStore((s) => s.ensureCategories);

  const navLinks = [
    ...[...topLevelCategories]
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((cat) => ({ label: cat.name.toUpperCase(), href: `/collection?cat=${cat.slug}` })),
  ];

  const openMenu = () => {
    setIsMenuOpen(true);
    window.dispatchEvent(new CustomEvent('mobile-menu-change', { detail: { isOpen: true } }));
  };
  const closeMenu = () => {
    setIsMenuOpen(false);
    window.dispatchEvent(new CustomEvent('mobile-menu-change', { detail: { isOpen: false } }));
  };

  // ── Listen for mobile search request from Bottom Nav ─────────────────────
  useEffect(() => {
    const handleMobileSearch = () => {
      openMenu();
      // Small timeout to allow the menu to render before focusing
      setTimeout(() => {
        if (mobileSearchInputRef.current) {
          mobileSearchInputRef.current.focus();
        }
      }, 300);
    };
    window.addEventListener('trigger-mobile-search', handleMobileSearch);
    const handleTriggerCart = () => setIsCartOpen(true);
    window.addEventListener('trigger-cart', handleTriggerCart);
    return () => {
      window.removeEventListener('trigger-mobile-search', handleMobileSearch);
      window.removeEventListener('trigger-cart', handleTriggerCart);
    };
  }, []);

  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchFocusRequested = searchParams.get('focusSearch') === '1';

  useEffect(() => {
    setIsMounted(true);
    setWishlistCount(getWishlist().length);
    ensureCategories();
    const onWishlistChanged = () => setWishlistCount(getWishlist().length);
    window.addEventListener('wishlist-changed', onWishlistChanged);
    return () => window.removeEventListener('wishlist-changed', onWishlistChanged);
  }, [ensureCategories]);

  useEffect(() => {
    if (!mobileSearchFocusRequested || typeof window === 'undefined' || window.innerWidth >= 768) {
      return;
    }

    openMenu();

    const focusTimer = window.setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 300);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('focusSearch');
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const replaceTimer = window.setTimeout(() => {
      router.replace(nextUrl);
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(replaceTimer);
    };
  }, [mobileSearchFocusRequested, pathname, router, searchParams]);

  // Instant search effect
  useEffect(() => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    // Instant search - no delay
    productService
      .list({ search: query.trim(), limit: 8 })
      .then((response) => {
        setSearchResults(Array.isArray(response.data) ? response.data : []);
        setShowSearchDropdown(true);
        setIsSearching(false);
      })
      .catch(() => {
        setSearchResults([]);
        setIsSearching(false);
      });

    return () => controller.abort();
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchRef.current && 
        !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ── Announcement Bar ─────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-black py-2 text-[10px] font-medium uppercase tracking-widest text-white">
        {/* Desktop: Static centered text */}
        <div className="hidden md:flex items-center justify-center">
          <span>
            PROFITEZ DE LA LIVRAISON GRATUITE À PARTIR DE 600 DH &nbsp;|&nbsp; QUALITÉ 100%
          </span>
        </div>
        {/* Mobile: Infinite scroll marquee */}
        <div className="md:hidden flex">
          <div className="flex w-max animate-[scrollAnnounce_20s_linear_infinite] gap-8">
            <span className="whitespace-nowrap">PROFITEZ DE LA LIVRAISON GRATUITE À PARTIR DE 600 DH &nbsp;|&nbsp; QUALITÉ 100%</span>
            <span className="whitespace-nowrap">PROFITEZ DE LA LIVRAISON GRATUITE À PARTIR DE 600 DH &nbsp;|&nbsp; QUALITÉ 100%</span>
            <span className="whitespace-nowrap">PROFITEZ DE LA LIVRAISON GRATUITE À PARTIR DE 600 DH &nbsp;|&nbsp; QUALITÉ 100%</span>
            <span className="whitespace-nowrap">PROFITEZ DE LA LIVRAISON GRATUITE À PARTIR DE 600 DH &nbsp;|&nbsp; QUALITÉ 100%</span>
          </div>
        </div>
      </div>

      {/* ── Logo · Search · Actions ─────────────────────────────────────── */}
      <SectionContainer className="flex items-center justify-between py-4 md:py-5">
        {/* Mobile Hamburger (hidden on pb-desktop) */}
        <div className="flex w-1/4 md:hidden">
          <button aria-label="Menu" className="text-gray-900" onClick={openMenu}>
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h8" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex w-2/4 justify-center md:w-1/4 md:justify-start">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="MyBloom"
              width={220}
              height={64}
              className="object-contain h-6 md:h-12 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:block w-2/4 px-4">
          <div ref={searchRef} className="relative mx-auto max-w-xl">
            {/* magnifier */}
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (query.trim()) {
                    setShowSearchDropdown(false);
                    router.push(`/collection?search=${encodeURIComponent(query.trim())}`);
                  }
                }
              }}
              placeholder="Rechercher par marque, parfum..."
              className="w-full rounded-full border border-gray-200 py-2 pl-10 pr-10 text-sm
                focus:border-[#da2966] focus:outline-none focus:ring-1 focus:ring-[#da2966]"
            />
            {/* filter icon */}
            <svg
              onClick={() => setIsFilterOpen(true)}
              className="absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors z-10"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="10" x2="20" y2="3" />
              <line x1="2" y1="14" x2="6" y2="14" />
              <line x1="10" y1="8" x2="14" y2="8" />
              <line x1="18" y1="16" x2="22" y2="16" />
            </svg>

            {/* Search Dropdown */}
            {showSearchDropdown && query.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
                {isSearching ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Recherche en cours...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Aucun résultat trouvé
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setQuery('');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={product.primary_image || product.images?.[0]?.image_url || FALLBACK_IMG}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {product.product_type?.name || product.category?.name || 'Produit'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Icons */}
        <div className="flex w-1/4 items-center justify-end space-x-5 md:space-x-6">
          {/* Track Order - Hidden on Mobile, Shown on Desktop */}
          <Link
            href="/track-order"
            aria-label="Track Order"
            className="relative hidden md:block text-gray-600 transition-colors hover:text-aura-purple"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="8" />
              <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
              <line x1="12" y1="20" x2="12" y2="22" strokeLinecap="round" />
              <line x1="2" y1="12" x2="4" y2="12" strokeLinecap="round" />
              <line x1="20" y1="12" x2="22" y2="12" strokeLinecap="round" />
            </svg>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative text-gray-600 transition-colors hover:text-aura-purple"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isMounted && wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center
                rounded-full bg-red-500 text-[10px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            aria-label="Cart"
            onClick={() => setIsCartOpen(true)}
            className="relative text-gray-600 transition-colors hover:text-aura-purple"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {isMounted && cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center
                rounded-full bg-red-500 text-[10px] text-white">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </SectionContainer>

      {/* ── Main Navigation ─────────────────────────────────────────────── */}
      <SectionContainer className="hidden md:block pb-4">
        <ul className="flex justify-center space-x-10 text-[16px] tracking-widest text-gray-700" style={{ fontFamily: "'Sitka Banner', serif", fontWeight: 'bold' }}>
          {!categoriesReady
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              ))
            : navLinks.map(({ label, href }) => {
                const [basePath, qs] = href.split('?');
                let isActive = false;
                if (basePath === pathname) {
                  if (!qs) isActive = true;
                  else {
                    const params = new URLSearchParams(qs);
                    isActive = true;
                    for (const [k, v] of params.entries()) {
                      if (!searchParams.getAll(k).includes(v)) { isActive = false; break; }
                    }
                  }
                }
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`transition-colors duration-200 ease-in-out ${isActive ? 'text-[#da2966]' : 'hover:text-[#da2966] text-gray-700'}`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })
          }
        </ul>
      </SectionContainer>
    </header>

    <CartDrawer 
      isOpen={isCartOpen} 
      onClose={() => setIsCartOpen(false)} 
    />
    <FilterModal 
      isOpen={isFilterOpen} 
      onClose={() => setIsFilterOpen(false)} 
    />


      {/* ── Mobile Menu Overlay ───────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col pt-safe pb-safe overflow-y-auto overflow-x-hidden">
          {/* Header inside menu */}
          <div className="flex items-center justify-between px-4 py-4 mb-[20px]">
            <button 
              onClick={closeMenu}
              className="flex items-center justify-center text-gray-700 transition-colors hover:text-gray-900"
              style={{ width: 31, height: 31 }}
            >
              <svg style={{ width: 31, height: 31 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src="/logo.png"
              alt="MyBloom"
              width={95}
              height={29}
              className="object-contain"
              style={{ width: 95, height: 29 }}
            />
            {/* Right placeholder to keep logo perfectly centered */}
            <div style={{ width: 31 }} />
          </div>

          {/* Search */}
          <div ref={mobileSearchRef} className="py-2 mb-[25px] relative" style={{ marginLeft: 35, marginRight: 35 }}>
            <div className="relative border-b border-gray-300 pb-2 flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                ref={mobileSearchInputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (query.trim()) {
                      setShowSearchDropdown(false);
                      closeMenu();
                      router.push(`/collection?search=${encodeURIComponent(query.trim())}`);
                    }
                  }
                }}
                placeholder="Search for a scent..." 
                className="flex-1 min-w-0 w-full bg-transparent focus:outline-none placeholder-gray-400"
                style={{ fontFamily: "'Akhbar MT', 'Amiri', serif", fontSize: 18 }}
              />
              <svg 
                onClick={() => {
                  closeMenu();
                  setIsFilterOpen(true);
                }}
                className="w-[18px] h-[18px] text-gray-500 ml-3 cursor-pointer hover:text-gray-900 transition-colors shrink-0" 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="10" x2="20" y2="3" />
                <line x1="2" y1="14" x2="6" y2="14" />
                <line x1="10" y1="8" x2="14" y2="8" />
                <line x1="18" y1="16" x2="22" y2="16" />
              </svg>
            </div>

            {/* Mobile Search Dropdown */}
            {showSearchDropdown && query.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
                {isSearching ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Recherche en cours...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Aucun résultat trouvé
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setQuery('');
                          closeMenu();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={product.primary_image || product.images?.[0]?.image_url || FALLBACK_IMG}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {product.product_type?.name || product.category?.name || 'Produit'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col px-6 mb-auto" style={{ gap: 16 }}>
            {navLinks.map(({ label, href }) => {
              const [basePath, qs] = href.split('?');
              let isActive = false;
              if (basePath === pathname) {
                if (!qs) isActive = true;
                else {
                  const params = new URLSearchParams(qs);
                  isActive = true;
                  for (const [k, v] of params.entries()) {
                    const current = searchParams.get(k) ?? '';
                    if (current !== v) { isActive = false; break; }
                  }
                }
              }

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className={`uppercase transition-colors duration-200 ease-in-out ${isActive ? 'text-[#da2966]' : 'text-[#111827] hover:text-[#da2966]'}`}
                  style={{
                    fontFamily: "'Sitka Banner', serif",
                    fontSize: 20,
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Collection Highlights */}
          <div className="mt-8 px-6">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="uppercase tracking-[1px] text-[#999999]"
                style={{ fontFamily: "'Akhbar MT', 'Amiri', serif", fontSize: 18 }}
              >
                COLLECTION HIGHLIGHTS
              </h3>
              <Link
                href="/collection"
                onClick={closeMenu}
                className="text-[#C9527A]"
                style={{ fontFamily: "'Akhbar MT', 'Amiri', serif", fontSize: 16 }}
              >
                View All
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Link href="/collection?featured=1" onClick={closeMenu} className="relative flex-none w-[200px] h-[110px] rounded-xl overflow-hidden snap-start group border border-gray-100">
                <Image src="/Best Sellers.jpg" alt="Best Sellers" fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4 flex flex-col justify-end">
                  <h4 className="font-serif font-bold text-white text-xl drop-shadow">Best Sellers</h4>
                  <p className="text-[11px] text-white/80 mt-1 font-medium">Shop Now</p>
                </div>
              </Link>
              <Link href="/collection?is_gift=true" onClick={closeMenu} className="relative flex-none w-[200px] h-[110px] rounded-xl overflow-hidden snap-start group border border-gray-100">
                <Image src="/Gift Sets.jpg" alt="Gift Sets" fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4 flex flex-col justify-end">
                  <h4 className="font-serif font-bold text-white text-xl drop-shadow">Gift Sets</h4>
                  <p className="text-[11px] text-white/80 mt-1 font-medium">Discover</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Social Icons */}
          <div className="mt-6 pb-10 flex justify-center gap-3 w-full px-6">
            {[
              { href: 'https://www.instagram.com/my_bloom.ma?igsh=MTV4Y29odHI4b3NqNw%3D%3D&utm_source=qr',      icon: <Instagram className="w-[18px] h-[18px]" />,     label: 'Instagram' },
              { href: 'https://www.facebook.com/share/1AzUrWv47t/?mibextid=wwXIfr',        icon: <Facebook className="w-[18px] h-[18px]" />,      label: 'Facebook'  },
              { href: 'https://www.tiktok.com/@my.bloom.ma?_r=1&_t=ZS-95fpT2RLgaP',          icon: <TikTokIcon className="w-[16px] h-[16px]" />,    label: 'TikTok'    },
              { href: 'https://www.snapchat.com/add/bloom_parfum?share_id=AAULxDsQR66nH9XmS_Hb_A&locale=fr_GB',        icon: <SnapchatIcon className="w-[19px] h-[19px]" />,  label: 'Snapchat' },
              { href: 'https://wa.me/212608656271',  icon: <WhatsAppIcon className="w-[17px] h-[17px]" />,  label: 'WhatsApp'  },
            ].map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-[38px] h-[38px] rounded-full bg-[#f1f1f1] flex items-center justify-center text-gray-700 hover:bg-[#da2966] hover:text-white transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      )}

    </>
  );
}
