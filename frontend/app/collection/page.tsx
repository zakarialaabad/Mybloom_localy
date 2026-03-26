'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Search, Grid, List, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Relevance (Default)' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'popular',     label: 'Most Popular' },
  { value: 'brand_az',    label: 'Brand: A–Z' },
  { value: 'last_7_days', label: 'Added in Last 7 Days' },
  { value: 'last_30_days',label: 'Added in Last 30 Days' },
  { value: 'this_month',  label: 'Added This Month' },
];
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { productService, Product, bannerService, Banner } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';
import useReferenceStore from '@/store/reference';
import useFilterStore from '@/store/filters';
import PriceHistogram from '@/components/ui/PriceHistogram';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

function productToCard(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.brand?.name ?? '',
    description: p.subtitle ?? '',
    price: p.min_price ?? 0,
    originalPrice: p.min_price ?? 0,
    rating: p.avg_rating ?? 0,
    reviewCount: p.review_count ?? 0,
    imageUrl: p.primary_image ?? FALLBACK_IMG,
  };
}

export default function CollectionPage() {
  // Reference data from global store — fetched once, reused across navigations
  const brands           = useReferenceStore((s) => s.brands);
  const categories       = useReferenceStore((s) => s.categories);
  const ensureBrands     = useReferenceStore((s) => s.ensureBrands);
  const ensureCategories = useReferenceStore((s) => s.ensureCategories);

  const PER_PAGE = 10;
  const [products, setProducts] = useState<Product[]>([]);
  const [heroBanner, setHeroBanner] = useState<Banner | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // ── Filter state — shared with FilterModal via useFilterStore ─────────────
  const globalMin          = useFilterStore((s) => s.globalMin);
  const globalMax          = useFilterStore((s) => s.globalMax);
  const selectedMin        = useFilterStore((s) => s.selectedMin);
  const selectedMax        = useFilterStore((s) => s.selectedMax);
  const selectedBrands     = useFilterStore((s) => s.selectedBrands);
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const selectedRating     = useFilterStore((s) => s.selectedRating);
  const promotionOnly      = useFilterStore((s) => s.promotionOnly);
  const featuredOnly       = useFilterStore((s) => s.featuredOnly);

  const setSelectedMin       = useFilterStore((s) => s.setSelectedMin);
  const setSelectedMax       = useFilterStore((s) => s.setSelectedMax);
  const toggleBrand          = useFilterStore((s) => s.toggleBrand);
  const toggleCategory       = useFilterStore((s) => s.toggleCategory);
  const setSelectedCategories = useFilterStore((s) => s.setSelectedCategories);
  const setSelectedRating    = useFilterStore((s) => s.setSelectedRating);
  const setPromotionOnly     = useFilterStore((s) => s.setPromotionOnly);
  const setFeaturedOnly      = useFilterStore((s) => s.setFeaturedOnly);
  const ensureAggregates     = useFilterStore((s) => s.ensureAggregates);
  const aggregatesReady      = useFilterStore((s) => s.aggregatesReady);

  // Reactive URL params — works for both fresh loads and soft navigations
  const searchParams = useSearchParams();

  // Ensure reference data + price bounds loaded (idempotent — no-op if already in store)
  useEffect(() => { ensureBrands(); }, [ensureBrands]);
  useEffect(() => { ensureCategories(); }, [ensureCategories]);
  useEffect(() => { ensureAggregates(); }, [ensureAggregates]);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Apply URL params to filter store — re-runs on every URL change (soft navigation too)
  useEffect(() => {
    const categoryId = searchParams.get('category');
    const featured   = searchParams.get('featured');
    // Reset URL-controlled filters first, then apply current URL values
    setSelectedCategories(categoryId ? [Number(categoryId)] : []);
    setFeaturedOnly(featured === '1');
  }, [searchParams, setSelectedCategories, setFeaturedOnly]);

  // Fetch hero banner for the active collection (category) or global
  useEffect(() => {
    const categoryId = searchParams.get('category');
    bannerService
        .getCollectionHero(categoryId ? Number(categoryId) : null)
        .then(setHeroBanner)
        .catch(() => setHeroBanner(null));
  }, [searchParams]);

  // Fetch products when filters change.
  // Debounced (400 ms) so rapid slider drags don't flood the API.
  // AbortController cancels any in-flight request before issuing a new one,
  // preventing stale responses from overwriting fresher results (race condition).
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoadingProducts(true);
      const params: Record<string, unknown> = {};

      // Sort applies globally (including featuredOnly mode)
      if (sortBy !== 'newest') params['sort'] = sortBy;

      if (featuredOnly) {
        // "Best Sellers" mode — send ONLY is_featured=1 + sort.
        // Stale store values from a previous session must not interfere.
        params['is_featured'] = 1;
      } else {
        if (selectedBrands.length > 0) params['brand_ids[]'] = selectedBrands;
        if (selectedCategories.length > 0) params['category_ids[]'] = selectedCategories;
        // Only apply price filter once real bounds are known — avoids the default
        // 0-100 range silently wiping out products before aggregates load.
        if (aggregatesReady) {
          params['price_min'] = selectedMin;
          params['price_max'] = selectedMax;
        }
        if (selectedRating !== null) params['min_rating'] = selectedRating;
        if (promotionOnly) params['on_promotion'] = 1;
      }
      try {
        const result = await productService.list(params, controller.signal);
        setProducts(result.data);
      } catch (err: unknown) {
        // Ignore AbortError — it means a newer request superseded this one
        if (err instanceof Error && err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setProducts([]);
        }
      } finally {
        setLoadingProducts(false);
      }
    }, 400);

    // Cleanup: cancel the debounce timer AND abort any in-flight request
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedBrands, selectedCategories, selectedMin, selectedMax, selectedRating, promotionOnly, featuredOnly, aggregatesReady, sortBy]);

  // Reset to page 1 whenever the product list changes (new filter applied)
  useEffect(() => { setCurrentPage(1); }, [products]);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const paginatedProducts = products.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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



  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {/* Collection Hero Banner — dynamic from API, falls back to a solid color block */}
      <div className="w-full relative h-[200px] md:h-[300px] bg-[#5a1818]">
        {heroBanner ? (
          heroBanner.link ? (
            <a href={heroBanner.link} className="absolute inset-0">
              <Image
                src={heroBanner.image_path}
                alt={heroBanner.title ?? 'Collection banner'}
                fill
                className="object-cover"
                priority
              />
            </a>
          ) : (
            <Image
              src={heroBanner.image_path}
              alt={heroBanner.title ?? 'Collection banner'}
              fill
              className="object-cover"
              priority
            />
          )
        ) : null}
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-400 mb-8 font-serif italic">
          <Link href="/">Home</Link> / <span className="text-gray-900">Collection</span>
        </div>

        {/* ─── Mobile Toolbar ─────────────────────────────────────────────── */}
        <div className="md:hidden sticky top-16 z-30 bg-white -mx-4 px-4 py-3 mb-5 border-b border-gray-100 flex items-center gap-2">
          <span className="text-xs text-gray-400 font-serif italic flex-1 min-w-0 truncate">
            {loadingProducts ? '…' : `${products.length} Produit${products.length !== 1 ? 's' : ''}`}
          </span>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-full text-xs text-gray-600 shrink-0 transition-colors active:bg-gray-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtres
          </button>
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none text-xs border border-gray-300 rounded-full pl-3 pr-6 py-1.5 text-gray-600 bg-white cursor-pointer focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-all ${viewMode === 'grid' ? 'bg-[#4a403a] text-white' : 'text-gray-400'}`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 border-l border-gray-200 transition-all ${viewMode === 'list' ? 'bg-[#4a403a] text-white' : 'text-gray-400'}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-[#fcfcfc] p-6 rounded-sm">
              <h2 className="font-serif text-gray-500 mb-6">Filter</h2>

              {/* Brand Filter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Brand</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input type="text" placeholder="Search brand..." className="w-full bg-white border border-gray-200 rounded-sm py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-gray-300" />
                </div>
                <div className="space-y-3">
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBrands.includes(brand.id) ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`} onClick={() => toggleBrand(brand.id)}>
                        {selectedBrands.includes(brand.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${selectedBrands.includes(brand.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Price</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>

                {/* Unified histogram + range slider (shared PriceHistogram component) */}
                <PriceHistogram
                  globalMin={globalMin}
                  globalMax={globalMax}
                  selectedMin={selectedMin}
                  selectedMax={selectedMax}
                  onMinChange={setSelectedMin}
                  onMaxChange={setSelectedMax}
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Category</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedCategories.includes(cat.id) ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`} onClick={() => toggleCategory(cat.id)}>
                        {selectedCategories.includes(cat.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${selectedCategories.includes(cat.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Notes</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedRating(null)} className={`px-3 py-1 rounded-sm text-xs font-medium ${selectedRating === null ? 'bg-[#fdf6e3] text-[#b8860b]' : 'bg-gray-100 text-gray-600'}`}>Tout</button>
                  <button onClick={() => setSelectedRating(5)} className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 5 ? 'bg-[#fdf6e3] text-[#b8860b]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 5.0</button>
                  <button onClick={() => setSelectedRating(4)} className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 4 ? 'bg-[#fdf6e3] text-[#b8860b]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 4.0</button>
                </div>
              </div>

              {/* Promotions Filter */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Promotions</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={promotionOnly} onChange={(e) => setPromotionOnly(e.target.checked)} className="w-3.5 h-3.5" />
                    <span className="text-xs text-gray-500">Offre Speciales</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="w-3.5 h-3.5" />
                    <span className="text-xs text-gray-500">Best Sellers</span>
                  </label>
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <div className="text-xs text-gray-400 font-serif italic">
                {products.length} Produit{products.length !== 1 ? 's' : ''}
                {totalPages > 1 && <span className="ml-1 text-gray-300">— page {currentPage}/{totalPages}</span>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Vue grille"
                    className={`p-2 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[#4a403a] text-white'
                        : 'text-gray-400 hover:bg-[#fdf6e3] hover:text-[#b8860b]'
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="Vue liste"
                    className={`p-2 transition-all border-l border-gray-200 ${
                      viewMode === 'list'
                        ? 'bg-[#4a403a] text-white'
                        : 'text-gray-400 hover:bg-[#fdf6e3] hover:text-[#b8860b]'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Sort dropdown */}
                <div ref={sortRef} className="relative">
                  <button
                    onClick={() => setShowSortMenu((v) => !v)}
                    className="flex items-center gap-1 text-xs text-gray-500 font-serif italic hover:text-gray-900 transition-colors select-none"
                  >
                    <span>
                      Sort by:{' '}
                      <span className="text-gray-900 not-italic font-medium">
                        {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Relevance (Default)'}
                      </span>
                    </span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${showSortMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showSortMenu && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-white border border-gray-200 rounded-sm shadow-lg overflow-hidden">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                            sortBy === opt.value
                              ? 'bg-[#fdf6e3] text-[#b8860b] font-medium'
                              : 'text-gray-600 hover:bg-[#fdf6e3] hover:text-[#b8860b]'
                          }`}
                        >
                          {opt.value === sortBy && <span className="mr-1.5 text-[#b8860b]">✓</span>}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid / List */}
            {loadingProducts ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-gray-100 rounded-sm animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-sm animate-pulse">
                      <div className="w-28 h-28 shrink-0 bg-gray-100 rounded-sm" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/5" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                      <div className="w-20 space-y-2 py-1">
                        <div className="h-4 bg-gray-100 rounded" />
                        <div className="h-3 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-serif italic">No products found.</div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6">
                    {paginatedProducts.map(p => (
                      <ProductCard key={p.id} {...productToCard(p)} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {paginatedProducts.map(p => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="group flex items-center gap-5 bg-[#fcfcfc] hover:bg-[#fdf6e3] border border-gray-100 hover:border-[#b8860b]/30 rounded-sm p-4 transition-all duration-200"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-28 h-28 shrink-0 rounded-sm overflow-hidden bg-white border border-gray-100">
                          <Image
                            src={p.primary_image ?? FALLBACK_IMG}
                            alt={p.name}
                            fill
                            unoptimized
                            className="object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="font-serif text-lg font-bold text-gray-900 tracking-wide truncate">{p.name}</h3>
                          <p className="text-xs text-gray-600 pb-2">{p.brand?.name}</p>
                          
                          <div className="border-t border-gray-100/80 w-full mb-2"></div>
                          
                          <p className="text-[11px] text-gray-500 pt-1 line-clamp-2 leading-relaxed">{p.subtitle}</p>
                          
                          {/* Stars */}
                          <div className="flex items-center space-x-1 mt-2">
                            <div className="flex">
                              {[1,2,3,4,5].map(s => (
                                <svg key={s} className={`h-3 w-3 fill-current ${ s <= Math.round(p.avg_rating ?? 0) ? 'text-aura-gold' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">
                              <span className="text-gray-900 font-semibold pr-1">{(p.avg_rating ?? 0).toFixed(1)}</span>({p.review_count ?? 0})
                            </span>
                          </div>
                        </div>

                        {/* Price + badge */}
                        <div className="shrink-0 text-right space-y-1.5 flex flex-col justify-between items-end h-full">
                          {p.is_featured && (
                            <span className="rounded border border-aura-gold bg-white px-2 py-1 text-[9px] font-semibold text-aura-gold tracking-wider uppercase mb-1">
                              Best Seller
                            </span>
                          )}
                          <div className="flex flex-col items-end gap-1 mt-auto">
                            <div className="flex items-center space-x-2">
                              <span className="text-[13px] text-gray-900">{p.min_price ?? 0} DH</span>
                              {(p.original_price != null) && p.original_price > (p.min_price ?? 0) && (
                                <>
                                  <span className="text-[13px] text-gray-900">-</span>
                                  <span className="text-[13px] text-gray-400 line-through decoration-1">{p.original_price} DH</span>
                                </>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-serif italic mt-1">{p.category?.name}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-12 mb-4">
                    {/* Prev */}
                    <button
                      onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${
                        currentPage === 1
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-gray-500 hover:border-[#4a403a] hover:text-[#4a403a]'
                      }`}
                      aria-label="Page précédente"
                    >
                      ‹
                    </button>

                    {/* Page numbers */}
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
                              ? 'bg-[#4a403a] border-[#4a403a] text-white shadow-sm'
                              : 'border-gray-200 text-gray-500 hover:bg-[#fdf6e3] hover:border-[#b8860b] hover:text-[#b8860b]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${
                        currentPage === totalPages
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-gray-500 hover:border-[#4a403a] hover:text-[#4a403a]'
                      }`}
                      aria-label="Page suivante"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* ─── Mobile Filter Drawer ─────────────────────────────────────────── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Bottom sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[88vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <span className="text-[16px] font-serif font-bold text-gray-900">Filtres</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {/* Scrollable filter content */}
            <div className="overflow-y-auto flex-1 px-5 py-5">
              {/* Brand */}
              <div className="mb-6">
                <h3 className="font-serif text-gray-700 mb-4">Brand</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input type="text" placeholder="Search brand..." className="w-full bg-white border border-gray-200 rounded-sm py-1.5 pl-8 pr-3 text-xs focus:outline-none" />
                </div>
                <div className="space-y-3">
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBrands.includes(brand.id) ? 'border-gray-800' : 'border-gray-300'}`} onClick={() => toggleBrand(brand.id)}>
                        {selectedBrands.includes(brand.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${selectedBrands.includes(brand.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Price */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <h3 className="font-serif text-gray-700 mb-4">Price</h3>
                <PriceHistogram globalMin={globalMin} globalMax={globalMax} selectedMin={selectedMin} selectedMax={selectedMax} onMinChange={setSelectedMin} onMaxChange={setSelectedMax} />
              </div>
              {/* Category */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <h3 className="font-serif text-gray-700 mb-4">Category</h3>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedCategories.includes(cat.id) ? 'border-gray-800' : 'border-gray-300'}`} onClick={() => toggleCategory(cat.id)}>
                        {selectedCategories.includes(cat.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${selectedCategories.includes(cat.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Notes */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <h3 className="font-serif text-gray-700 mb-4">Notes</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedRating(null)} className={`px-3 py-1 rounded-sm text-xs font-medium ${selectedRating === null ? 'bg-[#fdf6e3] text-[#b8860b]' : 'bg-gray-100 text-gray-600'}`}>Tout</button>
                  <button onClick={() => setSelectedRating(5)} className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 5 ? 'bg-[#fdf6e3] text-[#b8860b]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 5.0</button>
                  <button onClick={() => setSelectedRating(4)} className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 4 ? 'bg-[#fdf6e3] text-[#b8860b]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 4.0</button>
                </div>
              </div>
              {/* Promotions */}
              <div className="border-t border-gray-100 pt-6 pb-2">
                <h3 className="font-serif text-gray-700 mb-4">Promotions</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={promotionOnly} onChange={(e) => setPromotionOnly(e.target.checked)} className="w-3.5 h-3.5" />
                    <span className="text-xs text-gray-500">Offre Speciales</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="w-3.5 h-3.5" />
                    <span className="text-xs text-gray-500">Best Sellers</span>
                  </label>
                </div>
              </div>
            </div>
            {/* Apply button */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#4a403a] text-white text-sm font-serif rounded-sm hover:bg-[#3a3028] transition-colors"
              >
                {loadingProducts ? 'Chargement…' : `Voir ${products.length} produit${products.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
