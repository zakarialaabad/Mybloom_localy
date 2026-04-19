'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useCartStore from '@/store/cart';

export default function MobileActionBar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const cartItemCount = useCartStore((s) => s.itemCount());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setHidden((e as CustomEvent<{ isOpen: boolean }>).detail.isOpen);
    };
    window.addEventListener('mobile-menu-change', handler);
    window.addEventListener('image-gallery-change', handler);
    return () => {
      window.removeEventListener('mobile-menu-change', handler);
      window.removeEventListener('image-gallery-change', handler);
    };
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  if (hidden) {
    return null;
  }

  const navItem = (href: string, label: string, isActive: boolean, children: React.ReactNode) => (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
    >
      {children}
      <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
      {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-900 rounded-full" />}
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]" style={{ height: '64px' }}>
      <div className="flex items-center justify-between h-full px-4">

        {navItem('/track-order', 'My Order', pathname === '/track-order',
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="22" strokeLinecap="round" />
            <line x1="2" y1="12" x2="4" y2="12" strokeLinecap="round" />
            <line x1="20" y1="12" x2="22" y2="12" strokeLinecap="round" />
          </svg>
        )}

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('trigger-mobile-search'))}
          className="relative flex flex-col items-center justify-center gap-1 text-gray-400 flex-1 h-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-medium">Search</span>
        </button>

        {navItem('/', 'Accueil', pathname === '/',
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )}

        {navItem('/wishlist', 'Favoris', pathname === '/wishlist',
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('trigger-cart'))}
          className="relative flex flex-col items-center justify-center gap-1 text-gray-400 flex-1 h-full"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {isMounted && cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center
                rounded-full bg-red-500 text-[9px] text-white">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Panier</span>
        </button>

      </div>
    </div>
  );
}
