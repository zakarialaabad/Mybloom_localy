'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, LayoutGrid, List, ChevronDown, Check, Star, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/Skeleton';
import { productService, Product } from '@/services/api';
import { getWishlist, removeFromWishlist } from '@/lib/wishlist';
import ProductCard from '@/components/ui/ProductCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevance',  label: 'Relevance (Default)' },
  { key: 'price-asc',  label: 'Price: Low → High'   },
  { key: 'price-desc', label: 'Price: High → Low'   },
  { key: 'name-asc',   label: 'Name: A → Z'         },
  { key: 'name-desc',  label: 'Name: Z → A'         },
  { key: 'rating',     label: 'Top Rated'            },
];

function sortProducts(products: Product[], key: SortKey): Product[] {
  const arr = [...products];
  switch (key) {
    case 'price-asc':  return arr.sort((a, b) => (a.min_price ?? 0) - (b.min_price ?? 0));
    case 'price-desc': return arr.sort((a, b) => (b.min_price ?? 0) - (a.min_price ?? 0));
    case 'name-asc':   return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':  return arr.sort((a, b) => b.name.localeCompare(a.name));
    case 'rating':     return arr.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    default:           return arr;
  }
}

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [sortBy, setSortBy]       = useState<SortKey>('relevance');
  const [viewMode, setViewMode]   = useState<ViewMode>('grid');
  const [sortOpen, setSortOpen]   = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = getWishlist();
    if (ids.length === 0) { setLoading(false); return; }
    productService.list({ ids })
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Close sort dropdown when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRemove = (productId: number) => {
    removeFromWishlist(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const sorted = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  
  // Pagination
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginatedProducts = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Build page number array with ellipsis: e.g. [1, '…', 4, 5, 6, '…', 12]
  function buildPages(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (current > 3) pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  }

  // Reset to first page when sort changes
  useEffect(() => { setCurrentPage(1); }, [sortBy, products.length]);

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? 'Relevance (Default)';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {loading && <LoadingSpinner />}
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-500 font-serif italic">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link> /{' '}
          <span className="text-gray-900">Wishlist</span>
        </nav>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b border-gray-100 pb-5">
          {/* Count */}
          <p className="text-sm font-serif italic text-gray-500">
            {sorted.length} Produit{sorted.length !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-6">
            {/* ── View toggle ── */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-sm overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#3d342f] text-white' : 'text-gray-400 hover:text-[#3d342f] hover:bg-gray-50'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#3d342f] text-white' : 'text-gray-400 hover:text-[#3d342f] hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* ── Sort dropdown ── */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(prev => !prev)}
                className="flex items-center gap-2 text-sm font-serif italic text-gray-500 hover:text-gray-900 transition-colors select-none"
              >
                <span>
                  Trier par :{' '}
                  <span className="text-[#3d342f] font-bold not-italic">{currentSortLabel}</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-sm shadow-lg z-30 overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-serif italic text-left transition-colors
                        ${sortBy === opt.key
                          ? 'bg-[#3d342f]/5 text-[#3d342f] font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      {opt.label}
                      {sortBy === opt.key && <Check className="h-3.5 w-3.5 text-[#da2966] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Empty state ── */}
        {!loading && sorted.length === 0 && (
          <div className="text-center py-24">
            <Heart className="h-14 w-14 text-gray-200 mx-auto mb-5" />
            <p className="text-gray-400 font-serif italic text-lg mb-1">Your wishlist is empty.</p>
            <p className="text-gray-300 font-serif italic text-sm mb-5">Save items you love to find them easily later.</p>
            <Link href="/collection" className="inline-block text-sm text-[#3d342f] border border-[#3d342f] px-6 py-2.5 rounded-sm hover:bg-[#3d342f] hover:text-white transition-colors font-serif italic">
              Browse Collection ›
            </Link>
          </div>
        )}

        {/* ── GRID view ── */}
        {!loading && sorted.length > 0 && viewMode === 'grid' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
              {paginatedProducts.map(product => (
                <div key={product.id} className="relative flex flex-col h-full group">
                  <div className="flex-grow">
                    <ProductCard
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      subtitle={product.brand?.name || ''}
                      description={product.subtitle || ''}
                      price={product.min_price ?? 0}
                      originalPrice={product.original_price ?? 0}
                      rating={product.avg_rating ?? 0}
                      reviewCount={product.review_count ?? 0}
                      imageUrl={product.primary_image ?? FALLBACK_IMG}
                      category={product.category?.name}
                      productType={product.gender}
                      onWishlistToggle={handleRemove}
                    />
                  </div>
                  <button
                    onClick={() => router.push(`/product/${product.slug}`)}
                    className="w-full bg-[#3d342f] text-white py-3 rounded-sm font-serif italic text-sm hover:bg-[#2d2622] transition-colors mt-3 active:scale-[0.98] shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    Add to Bag ›
                  </button>
                </div>
              ))}
            </div>
            
            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-16 mb-8">
                <button
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${
                    currentPage === 1
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-500 hover:border-[#3d342f] hover:text-[#3d342f]'
                  }`}
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {buildPages(currentPage, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-gray-300 select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => { setCurrentPage(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-9 h-9 flex items-center justify-center rounded-sm border text-xs font-medium transition-all ${
                        currentPage === p
                          ? 'bg-[#3d342f] border-[#3d342f] text-white shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${
                    currentPage === totalPages
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-500 hover:border-[#3d342f] hover:text-[#3d342f]'
                  }`}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── LIST view ── */}
        {!loading && sorted.length > 0 && viewMode === 'list' && (
          <div>
            <div className="flex flex-col divide-y divide-gray-100">
              {paginatedProducts.map(product => (
                <div key={product.id} className="flex items-center gap-5 py-5 group">
                  {/* Thumbnail */}
                  <Link href={`/product/${product.slug}`} className="relative shrink-0 w-24 h-28 sm:w-28 sm:h-32 rounded-sm overflow-hidden bg-gray-50">
                    <Image
                      src={product.primary_image ?? FALLBACK_IMG}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    {product.brand?.name && (
                      <p className="text-xs text-gray-400 font-serif italic uppercase tracking-widest mb-0.5">{product.brand.name}</p>
                    )}
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug hover:text-[#da2966] transition-colors truncate">{product.name}</h3>
                    </Link>
                    {product.subtitle && (
                      <p className="text-xs text-gray-400 font-serif italic mt-0.5 line-clamp-1">{product.subtitle}</p>
                    )}
                    {/* Rating */}
                    {(product.avg_rating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.round(product.avg_rating ?? 0) ? 'text-aura-gold fill-aura-gold' : 'text-gray-200 fill-gray-200'}`}
                          />
                        ))}
                        {(product.review_count ?? 0) > 0 && (
                          <span className="text-xs text-gray-400 ml-1">({product.review_count})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price + Actions */}
                  <div className="shrink-0 flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-base font-bold text-[#3d342f]">{(product.min_price ?? 0).toLocaleString('fr-FR')} DH</p>
                      {(product.original_price ?? 0) > (product.min_price ?? 0) && (
                        <p className="text-xs text-gray-400 line-through">{(product.original_price ?? 0).toLocaleString('fr-FR')} DH</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/product/${product.slug}`)}
                        className="flex items-center gap-1.5 bg-[#3d342f] text-white text-xs font-serif italic px-4 py-2 rounded-sm hover:bg-[#2d2622] active:scale-[0.97] transition-all shadow-sm"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Add to Bag
                      </button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        title="Remove from wishlist"
                        className="p-2 rounded-full border border-gray-200 text-[#da2966] hover:bg-red-50 hover:border-red-200 transition-all"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-16 mb-8">
                <button
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${
                    currentPage === 1
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-500 hover:border-[#3d342f] hover:text-[#3d342f]'
                  }`}
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {buildPages(currentPage, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-gray-300 select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => { setCurrentPage(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-9 h-9 flex items-center justify-center rounded-sm border text-xs font-medium transition-all ${
                        currentPage === p
                          ? 'bg-[#3d342f] border-[#3d342f] text-white shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${
                    currentPage === totalPages
                      ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-500 hover:border-[#3d342f] hover:text-[#3d342f]'
                  }`}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
