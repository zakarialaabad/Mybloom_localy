'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileActionBar() {
  const pathname = usePathname();

  const navItem = (href: string, label: string, isActive: boolean, children: React.ReactNode) => (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
    >
      {children}
      <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
      {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full" />}
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]" style={{ height: '64px' }}>
      <div className="flex items-center justify-between h-full px-4">

        {navItem('/track-order', 'My Order', pathname === '/track-order',
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        )}

        <button className="relative flex flex-col items-center justify-center gap-1 text-gray-400 flex-1 h-full">
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

        <button className="relative flex flex-col items-center justify-center gap-1 text-gray-400 flex-1 h-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-[10px] font-medium">Panier</span>
        </button>

      </div>
    </div>
  );
}
