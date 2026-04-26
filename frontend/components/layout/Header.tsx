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
import { Instagram, Facebook } from 'lucide-react';

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

// Snapchat SVG (not in lucide) - Outline style to match lucide icons
function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-3.866 0-5.5 2.5-5.5 5.5 0 1.8.6 3.2 1.5 4.2-.4.8-.5 1.5-.5 2.3 0 1.5 1 2.5 2 2.5.4 0 .8-.1 1.2-.3.8.5 1.8.8 2.8.8s2-.3 2.8-.8c.4.2.8.3 1.2.3 1 0 2-1 2-2.5 0-.8-.1-1.5-.5-2.3.9-1 1.5-2.4 1.5-4.2 0-3-1.634-5.5-5.5-5.5z" />
      <path d="M8.5 14c-.5.5-1 1-2 1" />
      <path d="M15.5 14c.5.5 1 1 2 1" />
    </svg>
  );
}


const NAV_LINKS = [
  { label: 'PACK',                href: '/collection?is_gift=true', highlight: true },
  { label: 'BEURRE',              href: '/collection?cat=beurre' },
  { label: 'PARFUM',              href: '/collection?cat=parfum' },
  { label: 'GOMMAGE',             href: '/collection?cat=gommage' },
  { label: 'MAQUILLAGE',          href: '/collection?cat=maquillage' },
  { label: 'HYGIÈNE CORPORELLE',  href: '/collection?cat=hygiene-corporelle' },
];

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

  useEffect(() => {
    setIsMounted(true);
    setWishlistCount(getWishlist().length);
    const onWishlistChanged = () => setWishlistCount(getWishlist().length);
    window.addEventListener('wishlist-changed', onWishlistChanged);
    return () => window.removeEventListener('wishlist-changed', onWishlistChanged);
  }, []);

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
      <div className="container mx-auto flex items-center justify-between px-4 md:px-[69px] py-4 md:py-5">
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
      </div>

      {/* ── Main Navigation ─────────────────────────────────────────────── */}
      <nav className="hidden md:block container mx-auto px-4 pb-4">
        <ul className="flex justify-center space-x-10 text-[16px] tracking-widest text-gray-700" style={{ fontFamily: "'Sitka Banner', serif", fontWeight: 'bold' }}>
          {NAV_LINKS.map(({ label, href }) => {
            // Determine active state by comparing pathname and search params when present in href
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
              <li key={label}>
                <Link
                  href={href}
                  className={`transition-colors duration-200 ease-in-out ${isActive ? 'text-[#da2966]' : 'hover:text-[#da2966] text-gray-700'}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
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
            {NAV_LINKS.map(({ label, href }) => {
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
              { href: 'https://www.snapchat.com/add/bloom_parfum?share_id=AAULxDsQR66nH9XmS_Hb_A&locale=fr_GB',        icon: <SnapchatIcon className="w-[18px] h-[18px]" />,  label: 'Snapchat' },
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
