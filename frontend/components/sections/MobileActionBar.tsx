import Link from 'next/link';

export default function MobileActionBar() {
  return (
    <div className="flex md:hidden items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
      <Link href="/track-order" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="text-[10px] font-medium">My Order</span>
      </Link>
      
      <button className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <Link href="/" className="flex flex-col items-center gap-1.5 text-gray-900 border-b-2 border-gray-900 pb-1 -mb-[5px]">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-[10px] font-bold">Accueil</span>
      </Link>

      <Link href="/wishlist" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="text-[10px] font-medium">Favoris</span>
      </Link>

      <button className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span className="text-[10px] font-medium">Panier</span>
      </button>
    </div>
  );
}
