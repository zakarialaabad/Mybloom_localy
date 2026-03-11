'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import CartDrawer from '@/components/CartDrawer';
import FilterModal from '@/components/FilterModal';
import useCartStore from '@/store/cart';
import { getWishlist } from '@/lib/wishlist';


const NAV_LINKS = [
  { label: 'NOUVEAUTÉS',    href: '#' },
  { label: 'PARFUMS',       href: '#' },
  { label: 'SOINS',         href: '#' },
  { label: 'MARQUES',       href: '#' },
  { label: 'OUTLETS',       href: '#', highlight: true },
  { label: 'ABONNEMENT',    href: '#' },
];

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const cartItemCount = useCartStore((s) => s.itemCount());
  const [query, setQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWishlistCount(getWishlist().length);
    const onWishlistChanged = () => setWishlistCount(getWishlist().length);
    window.addEventListener('wishlist-changed', onWishlistChanged);
    return () => window.removeEventListener('wishlist-changed', onWishlistChanged);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ── Announcement Bar ─────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-black py-2 text-[10px] font-medium uppercase tracking-widest text-white">
        <span className="scrolling-text">
          PROFITEZ DE LA LIVRAISON GRATUITE À PARTIR DE 590 DH &nbsp;|&nbsp; QUALITÉ 100%
          AUTHENTIQUE GARANTIE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FREE SHIPPING ON ORDERS OVER
          $150 &nbsp;|&nbsp; 100% AUTHENTIC GUARANTEE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PROFITEZ
          DE LA LIVRAISON GRATUITE À PARTIR DE 590 DH &nbsp;|&nbsp; QUALITÉ 100% AUTHENTIQUE
          GARANTIE
        </span>
      </div>

      {/* ── Logo · Search · Actions ─────────────────────────────────────── */}
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:py-5">
        {/* Mobile Hamburger (hidden on pb-desktop) */}
        <div className="flex w-1/4 md:hidden">
          <button aria-label="Menu" className="text-gray-900" onClick={() => setIsMenuOpen(true)}>
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h8" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex w-2/4 justify-center md:w-1/4 md:justify-start">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.jpeg"
              alt="Bloom Parfums"
              width={220}
              height={64}
              className="object-contain h-6 md:h-12 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:block w-2/4 px-4">
          <div className="relative mx-auto max-w-xl">
            {/* magnifier */}
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for brand, perfumes, colognes..."
              className="w-full rounded-full border border-gray-200 py-2 pl-10 pr-10 text-sm
                focus:border-aura-gold focus:outline-none focus:ring-1 focus:ring-aura-gold"
            />
            {/* filter icon */}
            <svg
              onClick={() => setIsFilterOpen(true)}
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>

        {/* Icons */}
        <div className="flex w-1/4 items-center justify-end space-x-5 md:space-x-6">
          {/* Track Order */}
          <Link
            href="/track-order"
            aria-label="Track Order"
            className="relative text-gray-600 transition-colors hover:text-aura-purple"
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
        <ul className="flex justify-center space-x-10 text-sm font-semibold tracking-widest text-gray-700">
          {NAV_LINKS.map(({ label, href, highlight }) => (
            <li key={label}>
              <Link
                href={href}
                className={`transition-colors hover:text-aura-gold ${
                  highlight ? 'text-red-500' : ''
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
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
        <div className="fixed inset-0 z-[100] bg-white flex flex-col pt-safe pb-safe overflow-y-auto">
          {/* Header inside menu */}
          <div className="flex items-center justify-between px-4 py-4 mb-2">
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src="/logo.jpeg"
              alt="Bloom Parfums"
              width={160}
              height={40}
              className="object-contain h-6"
            />
            {/* Right placeholder to keep logo perfectly centered between close button and edge */}
            <div className="w-8" />
          </div>

          {/* Search */}
          <div className="px-6 py-2 mb-6">
            <div className="relative border-b border-gray-300 pb-2 flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search for a scent..." 
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-500 font-medium"
              />
              <svg 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsFilterOpen(true);
                }}
                className="w-4 h-4 text-gray-400 ml-3 cursor-pointer hover:text-gray-600 transition-colors" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col px-6 space-y-7 mb-auto">
            <Link href="#" className="font-serif text-[22px] uppercase text-[#e63a6c] transition-colors">GIFTS</Link>
            <Link href="#" className="font-serif text-[22px] uppercase text-gray-900 transition-colors">VISAGE</Link>
            <Link href="#" className="font-serif text-[22px] uppercase text-gray-900 transition-colors">CORPS</Link>
            <Link href="#" className="font-serif text-[22px] uppercase text-gray-900 transition-colors">PARFUMS</Link>
            <Link href="#" className="font-serif text-[22px] uppercase text-gray-900 transition-colors">SKINCARE</Link>
            <Link href="#" className="font-serif text-[22px] uppercase text-gray-900 transition-colors">HAIR</Link>
          </div>

          {/* Collection Highlights */}
          <div className="mt-12 px-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">COLLECTION HIGHLIGHTS</h3>
              <Link href="#" className="text-xs text-[#e63a6c] font-semibold">View All</Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Link href="#best-sellers" className="relative flex-none w-[200px] h-[110px] rounded-xl overflow-hidden snap-start group border border-gray-100">
                <Image src="https://images.unsplash.com/photo-1615397323214-cb9192415d86?auto=format&fit=crop&q=80&w=400" alt="Best Sellers" fill className="object-cover opacity-90 transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-white/20 p-4 flex flex-col justify-end">
                  <h4 className="font-serif font-bold text-black text-xl">Best Sellers</h4>
                  <p className="text-[11px] text-gray-800 mt-1 font-medium">Shop Now</p>
                </div>
              </Link>
              <Link href="#" className="relative flex-none w-[200px] h-[110px] rounded-xl overflow-hidden snap-start group border border-gray-100">
                <Image src="https://images.unsplash.com/photo-1595425970377-c9703bc48b4d?auto=format&fit=crop&q=80&w=400" alt="Gift Sets" fill className="object-cover opacity-90 transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-white/20 p-4 flex flex-col justify-end">
                  <h4 className="font-serif font-bold text-black text-xl">Gift Sets</h4>
                  <p className="text-[11px] text-gray-800 mt-1 font-medium">Discover</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Social Icons */}
          <div className="mt-8 pt-6 pb-10 flex justify-center space-x-6 w-full">
            <a href="#" className="text-gray-800 hover:text-black transition-transform hover:scale-110">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
            </a>
            <a href="#" className="text-gray-800 hover:text-black transition-transform hover:scale-110">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </a>
            <a href="#" className="flex items-center text-gray-800 hover:text-black transition-transform hover:scale-110">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186a2.6 2.6 0 00-1.83-1.84C18.14 3.9 12 3.9 12 3.9s-6.14 0-7.75.446a2.6 2.6 0 00-1.83 1.84C2 7.82 2 12 2 12s0 4.18.42 5.814a2.601 2.601 0 001.83 1.841c1.61.445 7.75.445 7.75.445s6.14 0 7.75-.445a2.602 2.602 0 001.83-1.84 27.604 27.604 0 00.42-5.815s.005-4.18-.418-5.814zM9.9 15.3v-6.6l5.72 3.3-5.72 3.3z"/></svg>
            </a>
            <a href="#" className="text-gray-800 hover:text-black transition-transform hover:scale-110">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.964 11.964 0 0012 .29C5.39.29.02 5.66.02 12.27c0 2.11.55 4.17 1.6 5.99L.25 23.63l5.52-1.44c1.78.96 3.79 1.47 5.86 1.47h.01c6.61 0 11.98-5.37 11.98-11.98 0-3.21-1.25-6.22-3.52-8.49L20.52 3.48zM12 21.68c-1.8 0-3.55-.48-5.09-1.4l-.36-.21-3.78.99.99-3.69-.23-.37a9.9 9.9 0 01-1.43-5.1C2.08 6.44 6.55 2.05 12 2.05c2.61 0 5.06 1.02 6.91 2.87A9.8 9.8 0 0121.8 11.93c0 5.46-4.47 9.85-10.05 9.85h-.01zm5.5-7.53c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.33-.9-.67-1.5-1.5-1.68-1.8-.18-.3-.02-.46.13-.61.14-.14.3-.3.45-.45.15-.15.2-.26.3-.43.1-.18.05-.33-.03-.48-.08-.15-.68-1.64-.93-2.25-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.52 0 1.49 1.08 2.93 1.23 3.13.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35z"/></svg>
            </a>
          </div>
        </div>
      )}

    </>
  );
}
