'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import CartDrawer from '@/components/CartDrawer';
import FilterModal from '@/components/FilterModal';
import useCartStore from '@/store/cart';

const NAV_LINKS = [
  { label: 'MEN',          href: '#' },
  { label: 'WOMEN',        href: '#' },
  { label: 'BEAUTY',       href: '#' },
  { label: 'SALE',         href: '#', highlight: true },
  { label: 'GIFT SETS',    href: '#' },
  { label: 'NEW ARRIVALS', href: '#' },
  { label: 'BRANDS',       href: '#' },
];

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const cartItemCount = useCartStore((s) => s.itemCount());
  const [query, setQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

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
      <div className="container mx-auto flex items-center justify-between px-4 py-5">
        {/* Logo */}
        <div className="w-1/4">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.jpeg"
              alt="Bloom Parfums"
              width={220}
              height={64}
              className="object-contain h-12 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Search */}
        <div className="w-2/4 px-4">
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
        <div className="flex w-1/4 items-center justify-end space-x-6">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="text-gray-600 transition-colors hover:text-aura-purple"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
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
      <nav className="container mx-auto px-4 pb-4">
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
    </>
  );
}
