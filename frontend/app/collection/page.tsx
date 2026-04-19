'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Search, Grid, List, SlidersHorizontal, X, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Pertinence (Par défaut)' },
  { value: 'price_asc',   label: 'Prix : Du moins au plus cher' },
  { value: 'price_desc',  label: 'Prix : Du plus au moins cher' },
  { value: 'popular',     label: 'Plus populaire' },
  { value: 'brand_az',    label: 'Marque : A–Z' },
  { value: 'last_7_days', label: 'Ajouté ces 7 derniers jours' },
  { value: 'last_30_days',label: 'Ajouté ces 30 derniers jours' },
  { value: 'this_month',  label: 'Ajouté ce mois-ci' },
];
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Product, bannerService, Banner } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';
import { ProductGridSkeleton, FilterSkeleton, LoadingSpinner } from '@/components/Skeleton';
import useReferenceStore from '@/store/reference';
import useFilterStore from '@/store/filters';
import useCatalogStore from '@/store/catalog';
import PriceHistogram from '@/components/ui/PriceHistogram';
import { sanitizeImageUrl } from '@/lib/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

function productToCard(p: Product) {
  const imageUrl = p.primary_image || p.images?.[0]?.image_url || FALLBACK_IMG;
  const secondaryImageUrl = p.images?.[1]?.image_url || undefined;
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
    imageUrl,
    secondaryImageUrl,
    category: p.category?.name?.toLowerCase() === 'parfum' ? (p.product_type?.name ?? p.category?.name) : p.category?.name,
    productType: p.category?.name?.toLowerCase() === 'parfum' ? (p.brand?.name ?? p.product_type?.name ?? '') : (p.product_type?.name ?? ''),
  };
}

export default function CollectionPage() {
  const brands           = useReferenceStore((s) => s.brands);
  const categories       = useReferenceStore((s) => s.categories);
  const ingredients      = useReferenceStore((s) => s.ingredients);
  const ensureBrands     = useReferenceStore((s) => s.ensureBrands);
  const ensureCategories = useReferenceStore((s) => s.ensureCategories);
  const ensureIngredients = useReferenceStore((s) => s.ensureIngredients);

  const [perPage, setPerPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroBanner, setHeroBanner] = useState<Banner | null>(null);
  const [heroImageError, setHeroImageError] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(72);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const sortRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: true, price: true, category: true, ingredients: true, notes: true, promotions: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const globalMin          = useFilterStore((s) => s.globalMin);
  const globalMax          = useFilterStore((s) => s.globalMax);
  const selectedMin        = useFilterStore((s) => s.selectedMin);
  const selectedMax        = useFilterStore((s) => s.selectedMax);
  const selectedBrands     = useFilterStore((s) => s.selectedBrands);
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const selectedIngredients = useFilterStore((s) => s.selectedIngredients);
  const selectedRating     = useFilterStore((s) => s.selectedRating);
  const promotionOnly      = useFilterStore((s) => s.promotionOnly);
  const featuredOnly       = useFilterStore((s) => s.featuredOnly);

  const setSelectedMin        = useFilterStore((s) => s.setSelectedMin);
  const setSelectedMax        = useFilterStore((s) => s.setSelectedMax);
  const toggleBrand           = useFilterStore((s) => s.toggleBrand);
  const setSelectedBrands      = useFilterStore((s) => s.setSelectedBrands);
  const toggleCategory        = useFilterStore((s) => s.toggleCategory);
  const setSelectedCategories = useFilterStore((s) => s.setSelectedCategories);
  const setSelectedIngredients = useFilterStore((s) => s.setSelectedIngredients);
  const setSelectedRating     = useFilterStore((s) => s.setSelectedRating);
  const setPromotionOnly      = useFilterStore((s) => s.setPromotionOnly);
  const setFeaturedOnly       = useFilterStore((s) => s.setFeaturedOnly);
  const ensureAggregates      = useFilterStore((s) => s.ensureAggregates);
  const aggregatesReady       = useFilterStore((s) => s.aggregatesReady);
  const brandCounts           = useFilterStore((s) => s.brandCounts);
  const setBrandCounts        = useFilterStore((s) => s.setBrandCounts);
  const ingredientCounts      = useFilterStore((s) => s.ingredientCounts);
  const setIngredientCounts   = useFilterStore((s) => s.setIngredientCounts);
  const toggleIngredient      = useFilterStore((s) => s.toggleIngredient);

  const ensureProductsCache = useCatalogStore((s) => s.ensureProducts);
  const searchParams = useSearchParams();

  useEffect(() => { ensureBrands(); }, [ensureBrands]);
  useEffect(() => { ensureCategories(); }, [ensureCategories]);
  useEffect(() => { ensureIngredients(); }, [ensureIngredients]);
  useEffect(() => { ensureAggregates(); }, [ensureAggregates]);

  // Reference data loading is non-blocking — sidebar filters appear when ready,
  // but products load immediately without waiting for brands/categories/ingredients.

  useEffect(() => {
    const updatePerPage = () => setPerPage(window.innerWidth >= 768 ? 16 : 10);
    updatePerPage();
    window.addEventListener('resize', updatePerPage);
    return () => window.removeEventListener('resize', updatePerPage);
  }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Apply URL params to filter store — re-runs on every URL change (soft navigation too)
  // Only updates state when values actually change to avoid unnecessary re-renders
  // that would trigger the product fetch effect with the same cache key.
  const prevCatRef = useRef<string | null>(null);
  useEffect(() => {
    const catSlug       = searchParams.get('cat');
    const categoryId    = searchParams.get('category');
    const ingredientIds = searchParams.getAll('ingredient');
    const featured      = searchParams.get('featured');

    // Reset sidebar filters when the navbar category (cat slug) changes
    const prevCat = prevCatRef.current;
    prevCatRef.current = catSlug;
    if (prevCat !== null && prevCat !== catSlug) {
      setSelectedBrands([]);
      setSelectedIngredients([]);
      setSelectedRating(null);
      setPromotionOnly(false);
    }

    const newCategories = categoryId ? [Number(categoryId)] : [];
    const newIngredients = ingredientIds.length > 0 ? ingredientIds.map((id) => Number(id)) : [];
    const newFeatured = featured === '1';

    // Only call setters when values actually changed — avoids creating
    // new array references that would cascade through dependency arrays.
    if (JSON.stringify(newCategories) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(newCategories);
    }
    if (JSON.stringify(newIngredients) !== JSON.stringify(selectedIngredients)) {
      setSelectedIngredients(newIngredients);
    }
    if (newFeatured !== featuredOnly) {
      setFeaturedOnly(newFeatured);
    }
  }, [searchParams]);

  useEffect(() => {
    setHeroImageError(false);
    const categoryId = searchParams.get('category');
    bannerService.getCollectionHero(categoryId ? Number(categoryId) : null)
      .then(setHeroBanner).catch(() => setHeroBanner(null));
  }, [searchParams]);

  // ── INITIAL FETCH removed — the debounced filter useEffect below handles this ──
  // Previously: a separate immediate fetch ran on mount when aggregatesReady,
  // causing TWO overlapping API calls (one immediate + one debounced 400ms later).
  // The debounced effect already fires on mount (when deps first run), so this
  // duplicate was redundant and was racing against the debounced one.

  // Track whether this is the first render — skip debounce for initial load
  const isFirstFetchRef = useRef(true);
  const isCacheFresh = useCatalogStore((s) => s.isCacheFresh);

  // Build filter params (extracted so we can check cache synchronously)
  const buildFilterParams = () => {
    const params: Record<string, unknown> = {};
    if (sortBy !== 'newest') params['sort'] = sortBy;

    const searchTerm = searchParams.get('search');
    if (searchTerm) params['search'] = searchTerm;

    // Category slug from navbar (e.g. ?cat=parfum)
    const catSlug = searchParams.get('cat');
    if (catSlug) params['category'] = catSlug;

    const productType = searchParams.get('product_type');
    if (productType) params['product_type'] = productType;

    const isGift = searchParams.get('is_gift');
    if (isGift === 'true' || isGift === '1') params['is_gift'] = 1;

    if (featuredOnly) {
      params['is_featured'] = 1;
    } else {
      if (selectedBrands.length > 0) params['brand_ids[]'] = selectedBrands;
      // Only send category_ids[] when there's no cat slug (avoid conflicting filters)
      if (!catSlug && selectedCategories.length > 0) params['category_ids[]'] = selectedCategories;
      if (selectedIngredients.length > 0) params['ingredient_ids[]'] = selectedIngredients;
      // Only include price bounds when the user has actually moved the slider
      // away from the global min/max. This keeps the cache key STABLE across
      // the aggregatesReady transition (false→true), preventing a double fetch.
      if (aggregatesReady && (selectedMin > globalMin || selectedMax < globalMax)) {
        params['price_min'] = selectedMin;
        params['price_max'] = selectedMax;
      }
      if (selectedRating !== null) params['min_rating'] = selectedRating;
      if (promotionOnly) params['on_promotion'] = 1;
    }
    return params;
  };

  // Fetch products when filters change.
  // First load / cache hits → instant (0ms). Filter changes → debounced (400ms).
  useEffect(() => {
    const params = buildFilterParams();
    const cacheKey = `collection:${JSON.stringify(params)}`;

    // On first load or when cache is fresh, skip the 400ms debounce entirely.
    // The cache check is synchronous — no HTTP call, no waiting.
    const skipDebounce = isFirstFetchRef.current || isCacheFresh(cacheKey);

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await ensureProductsCache(cacheKey, params);
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setProducts([]);
        }
      } finally {
        setLoadingProducts(false);
        isFirstFetchRef.current = false;
      }
    };

    if (skipDebounce) {
      // Instant: cache hit or first page load — no waiting
      fetchProducts();
      return;
    }

    // Debounce: filter slider dragging, typing — wait 400ms before fetching
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [
    searchParams,
    selectedBrands,
    selectedCategories,
    selectedIngredients,
    selectedMin,
    selectedMax,
    globalMin,
    globalMax,
    selectedRating,
    promotionOnly,
    featuredOnly,
    aggregatesReady,
    sortBy,
    ensureProductsCache
  ]);

  // Reset to page 1 whenever the product list changes (new filter applied)
  useEffect(() => { setCurrentPage(1); }, [products]);

  useEffect(() => {
    const bc: Record<number, number> = {};
    const ic: Record<number, number> = {};
    products.forEach((p) => {
      if (p.brand?.id) bc[p.brand.id] = (bc[p.brand.id] ?? 0) + 1;
      p.ingredients?.forEach((ing) => { if (ing.id) ic[ing.id] = (ic[ing.id] ?? 0) + 1; });
    });
    setBrandCounts(bc);
    setIngredientCounts(ic);
  }, [products, setBrandCounts, setIngredientCounts]);

  const totalPages        = Math.ceil(products.length / perPage);
  const paginatedProducts = products.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      const header = document.querySelector('header');
      if (header) setHeaderHeight(header.getBoundingClientRect().height);
      setIsSticky(!entry.isIntersecting);
    }, { threshold: [1], rootMargin: `-${headerHeight}px 0px 0px 0px` });
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [headerHeight]);

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
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      {/* Loading Overlay — always renders behind spinner, same pattern as admin dashboard */}
      {loadingProducts && <LoadingSpinner />}
      <Header />
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">

        {heroBanner === null ? (
          <div className="w-full h-[200px] md:h-[300px] bg-gray-100 animate-pulse" />
        ) : (
          <div className="w-full relative h-[200px] md:h-[300px] bg-[#5a1818]">
            {heroBanner.link ? (
              <a href={heroBanner.link} className="absolute inset-0">
                <Image src={heroImageError ? FALLBACK_IMG : sanitizeImageUrl(heroBanner.image_path)} alt={heroBanner.title ?? 'Collection banner'} fill className="object-cover" priority onError={() => setHeroImageError(true)} />
              </a>
            ) : (
              <Image src={heroImageError ? FALLBACK_IMG : sanitizeImageUrl(heroBanner.image_path)} alt={heroBanner.title ?? 'Collection banner'} fill className="object-cover" priority onError={() => setHeroImageError(true)} />
            )}
          </div>
        )}

        <main className="container mx-auto px-4 pt-8 max-w-7xl">
          {/* Breadcrumbs */}
          <div className="text-sm text-gray-400 mb-8 font-serif italic flex items-center justify-between">
            <div>
              <Link href="/">Accueil</Link>
              {' / '}
              {(() => {
                const catSlug    = searchParams.get('cat');
                const productType = searchParams.get('product_type');
                const isGift     = searchParams.get('is_gift');
                const search     = searchParams.get('search');
                const featured   = searchParams.get('featured');
                const catMap: Record<string, string> = { beurre: 'Beurre', parfum: 'Parfum', gommage: 'Gommage', maquillage: 'Maquillage', 'hygiene-corporelle': 'Hygiène Corporelle' };

                if (catSlug) {
                  const catLabel = catMap[catSlug] ?? catSlug.charAt(0).toUpperCase() + catSlug.slice(1);
                  return (
                    <>
                      <Link href="/collection">Collection</Link>
                      {' / '}
                      <span className="text-gray-900">{catLabel}</span>
                    </>
                  );
                }
                if (isGift === 'true' || isGift === '1') return <span className="text-gray-900">Pack</span>;
                if (featured === '1') return <span className="text-gray-900">Best Sellers</span>;
                if (productType) return <span className="text-gray-900">{productType.charAt(0).toUpperCase() + productType.slice(1)}</span>;
                if (search) return <span className="text-gray-900">Recherche : {search}</span>;
                return <span className="text-gray-900">Collection</span>;
              })()}
            </div>
            <span className="md:hidden text-[14px] leading-tight text-gray-700 font-medium whitespace-nowrap not-italic">
              {loadingProducts ? '…' : `${products.length} Produit${products.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div ref={observerRef} className="h-0 w-0 absolute" style={{ top: '160px' }} />

          {/* Mobile Toolbar */}
          {isSticky && <div className="md:hidden h-[57px] mb-5" />}
          <div
            ref={filterBarRef}
            className={`md:hidden z-30 bg-white -mx-4 px-4 py-3 mb-5 border-b border-gray-100 flex items-center justify-between gap-2 transition-shadow ${isSticky ? 'fixed left-0 right-0 shadow-md' : 'relative'}`}
            style={isSticky ? { top: `${headerHeight}px`, margin: 0 } : {}}
          >
            <button onClick={() => setMobileFilterOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-xs text-gray-600 shrink-0 transition-colors active:bg-gray-50">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filtres
            </button>
            <div className="relative shrink-0">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none text-xs border border-gray-300 rounded-full pl-3 pr-6 py-1.5 text-gray-600 bg-white cursor-pointer focus:outline-none">
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shrink-0">
              <button onClick={() => setViewMode('grid')} className={`px-2.5 py-1.5 transition-all ${viewMode === 'grid' ? 'bg-[#4a403a] text-white' : 'text-gray-400'}`}><Grid className="h-3.5 w-3.5" /></button>
              <button onClick={() => setViewMode('list')} className={`px-2.5 py-1.5 border-l border-gray-200 transition-all ${viewMode === 'list' ? 'bg-[#4a403a] text-white' : 'text-gray-400'}`}><List className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="hidden md:block w-64 shrink-0 self-start sticky top-0">
              {brands.length === 0 || categories.length === 0 || !aggregatesReady ? <FilterSkeleton /> : (
                <div className="bg-[#fcfcfc] p-6 rounded-sm">
                  <h2 className="font-serif text-gray-500 mb-6">Filtrer</h2>

                  {/* Brand */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => toggleSection('brand')}>
                      <h3 className="font-serif text-gray-700">Marque</h3>
                      <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${expandedSections.brand ? 'rotate-0' : 'rotate-180'}`} />
                    </div>
                    {expandedSections.brand && (
                      <>
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <input type="text" placeholder="Rechercher une marque..." value={brandSearchTerm} onChange={(e) => setBrandSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-sm py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-gray-300" />
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                          {brands.filter(b => b.name.toLowerCase().includes(brandSearchTerm.toLowerCase())).map(brand => (
                            <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBrands.includes(brand.id) ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`} onClick={() => toggleBrand(brand.id)}>
                                {selectedBrands.includes(brand.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-xs ${selectedBrands.includes(brand.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{brand.name}</span>
                                <span className="text-[11px] text-gray-400">({brandCounts[brand.id] ?? 0})</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ingredients */}
                  <div className="mb-6 border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => toggleSection('ingredients')}>
                      <h3 className="font-serif text-gray-700">Ingrédients</h3>
                      <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${expandedSections.ingredients ? 'rotate-0' : 'rotate-180'}`} />
                    </div>
                    {expandedSections.ingredients && (
                      <>
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <input type="text" placeholder="Rechercher un ingrédient..." value={ingredientSearchTerm} onChange={(e) => setIngredientSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-sm py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-gray-300" />
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                          {ingredients.filter(i => i.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())).map(ingredient => (
                            <label key={ingredient.id} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedIngredients.includes(ingredient.id) ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`} onClick={() => toggleIngredient(ingredient.id)}>
                                {selectedIngredients.includes(ingredient.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-xs ${selectedIngredients.includes(ingredient.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{ingredient.name}</span>
                                <span className="text-[11px] text-gray-400">({ingredientCounts[ingredient.id] ?? 0})</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6 border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => toggleSection('price')}>
                      <h3 className="font-serif text-gray-700">Price</h3>
                      <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${expandedSections.price ? 'rotate-0' : 'rotate-180'}`} />
                    </div>
                    {expandedSections.price && (
                      <PriceHistogram globalMin={globalMin} globalMax={globalMax} selectedMin={selectedMin} selectedMax={selectedMax} onMinChange={setSelectedMin} onMaxChange={setSelectedMax} />
                    )}
                  </div>

                  {/* Category */}
                  <div className="mb-6 border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => toggleSection('category')}>
                      <h3 className="font-serif text-gray-700">Category</h3>
                      <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${expandedSections.category ? 'rotate-0' : 'rotate-180'}`} />
                    </div>
                    {expandedSections.category && (
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
                    )}
                  </div>

                  {/* ── Notes — #da2966 (desktop sidebar) ───────────────────── */}
                  <div className="mb-6 border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => toggleSection('notes')}>
                      <h3 className="font-serif text-gray-700">Notes</h3>
                      <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${expandedSections.notes ? 'rotate-0' : 'rotate-180'}`} />
                    </div>
                    {expandedSections.notes && (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelectedRating(null)} className={`px-3 py-1 rounded-sm text-xs font-medium ${selectedRating === null ? 'bg-[#fde8ef] text-[#da2966] border border-[#da2966]' : 'bg-gray-100 text-gray-600'}`}>Tout</button>
                        <button onClick={() => setSelectedRating(5)}    className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 5 ? 'bg-[#fde8ef] text-[#da2966] border border-[#da2966]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 5.0</button>
                        <button onClick={() => setSelectedRating(4)}    className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 4 ? 'bg-[#fde8ef] text-[#da2966] border border-[#da2966]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 4.0</button>
                      </div>
                    )}
                  </div>

                  {/* Promotions */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => toggleSection('promotions')}>
                      <h3 className="font-serif text-gray-700">Promotions</h3>
                      <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${expandedSections.promotions ? 'rotate-0' : 'rotate-180'}`} />
                    </div>
                    {expandedSections.promotions && (
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
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Top Bar */}
              <div className="hidden md:flex justify-between items-center sticky top-0 z-20 bg-white py-3 mb-3 border-b border-gray-100">
                <div className="text-xs text-gray-400 font-serif italic">
                  {products.length} Produit{products.length !== 1 ? 's' : ''}
                  {totalPages > 1 && <span className="ml-1 text-gray-300">— page {currentPage}/{totalPages}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                    <button onClick={() => setViewMode('grid')} title="Vue grille" className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-[#4a403a] text-white' : 'text-gray-400 hover:bg-[#fdf6e3] hover:text-[#b8860b]'}`}><Grid className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setViewMode('list')} title="Vue liste"  className={`p-2 transition-all border-l border-gray-200 ${viewMode === 'list' ? 'bg-[#4a403a] text-white' : 'text-gray-400 hover:bg-[#fdf6e3] hover:text-[#b8860b]'}`}><List className="h-3.5 w-3.5" /></button>
                  </div>
                  <div ref={sortRef} className="relative">
                    <button onClick={() => setShowSortMenu((v) => !v)} className="flex items-center gap-2 text-sm font-serif italic text-gray-500 hover:text-gray-900 transition-colors select-none">
                      <span>Trier par : <span className="text-[#3d342f] font-bold not-italic">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Relevance (Default)'}</span></span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showSortMenu && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-sm shadow-lg z-50 overflow-hidden">
                        {SORT_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-serif italic text-left transition-colors ${sortBy === opt.value ? 'bg-[#3d342f]/5 text-[#3d342f] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            {opt.label}
                            {sortBy === opt.value && <Check className="h-3.5 w-3.5 text-[#da2966] shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Grid / List */}
              {loadingProducts ? (
                viewMode === 'grid' ? <ProductGridSkeleton count={8} /> : (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-sm animate-pulse">
                        <div className="w-28 h-28 shrink-0 bg-gray-100 rounded-sm" />
                        <div className="flex-1 space-y-2 py-1"><div className="h-4 bg-gray-100 rounded w-1/3" /><div className="h-3 bg-gray-100 rounded w-1/5" /><div className="h-3 bg-gray-100 rounded w-2/3" /></div>
                        <div className="w-20 space-y-2 py-1"><div className="h-4 bg-gray-100 rounded" /><div className="h-3 bg-gray-100 rounded" /></div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6">
                      {paginatedProducts.map(p => <ProductCard key={p.id} {...productToCard(p)} />)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {paginatedProducts.map(p => (
                        <Link key={p.id} href={`/product/${p.slug}`} className="group flex items-center gap-5 bg-[#fcfcfc] hover:bg-[#fdf6e3] border border-gray-100 hover:border-[#b8860b]/30 rounded-sm p-4 transition-all duration-200">
                          <div className="relative w-28 h-28 shrink-0 rounded-sm overflow-hidden bg-white border border-gray-100">
                            <Image src={p.primary_image ?? FALLBACK_IMG} alt={p.name} fill unoptimized className="object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 className="font-serif text-lg font-bold text-gray-900 tracking-wide truncate">{p.name}</h3>
                            <p className="text-xs text-gray-600 pb-2">{p.brand?.name}</p>
                            <div className="border-t border-gray-100/80 w-full mb-2"></div>
                            <p className="text-[11px] text-gray-500 pt-1 line-clamp-2 leading-relaxed">{p.subtitle}</p>
                            <div className="flex items-center space-x-1 mt-2">
                              <div className="flex">
                                {[1,2,3,4,5].map(s => (
                                  <svg key={s} className={`h-3 w-3 fill-current ${s <= Math.round(p.avg_rating ?? 0) ? 'text-aura-gold' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-[10px] text-gray-500 font-medium"><span className="text-gray-900 font-semibold pr-1">{(p.avg_rating ?? 0).toFixed(1)}</span>({p.review_count ?? 0})</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right space-y-1.5 flex flex-col justify-between items-end h-full">
                            {p.is_featured && <span className="rounded border border-aura-gold bg-white px-2 py-1 text-[9px] font-semibold text-aura-gold tracking-wider uppercase mb-1">Best Seller</span>}
                            <div className="flex flex-col items-end gap-1 mt-auto">
                              <div className="flex items-center space-x-2">
                                <span className="text-[13px] text-gray-900">{p.min_price ?? 0} DH</span>
                                {(p.original_price != null) && p.original_price > (p.min_price ?? 0) && (
                                  <><span className="text-[13px] text-gray-900">-</span><span className="text-[13px] text-gray-400 line-through decoration-1">{p.original_price} DH</span></>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 font-serif italic mt-1">{p.category?.name}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-12 mb-4">
                      <button onClick={() => { setCurrentPage(p => p - 1); scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage === 1} className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-[#4a403a] hover:text-[#4a403a]'}`} aria-label="Page précédente">‹</button>
                      {buildPages(currentPage, totalPages).map((p, i) =>
                        p === '…' ? (
                          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-gray-300 select-none">…</span>
                        ) : (
                          <button key={p} onClick={() => { setCurrentPage(p as number); scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-9 h-9 flex items-center justify-center rounded-sm border text-xs font-medium transition-all ${currentPage === p ? 'bg-[#4a403a] border-[#4a403a] text-white shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-[#fdf6e3] hover:border-[#b8860b] hover:text-[#b8860b]'}`}>{p}</button>
                        )
                      )}
                      <button onClick={() => { setCurrentPage(p => p + 1); scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage === totalPages} className={`w-9 h-9 flex items-center justify-center rounded-sm border text-sm transition-all ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-[#4a403a] hover:text-[#4a403a]'}`} aria-label="Page suivante">›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* ── Mobile Filter Drawer ─────────────────────────────────────────── */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[88vh] flex flex-col">
              <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <span className="text-[16px] font-serif font-bold text-gray-900">Filtres</span>
                <button onClick={() => setMobileFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-5">
                {/* Brand */}
                <div className="mb-6">
                  <h3 className="font-serif text-gray-700 mb-4">Brand</h3>
                  <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" /><input type="text" placeholder="Search brand..." value={brandSearchTerm} onChange={(e) => setBrandSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-sm py-1.5 pl-8 pr-3 text-xs focus:outline-none" /></div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                    {brands.filter(b => b.name.toLowerCase().includes(brandSearchTerm.toLowerCase())).map(brand => (
                      <label key={brand.id} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBrands.includes(brand.id) ? 'border-gray-800' : 'border-gray-300'}`} onClick={() => toggleBrand(brand.id)}>{selectedBrands.includes(brand.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}</div>
                        <div className="flex items-baseline gap-2"><span className={`text-xs ${selectedBrands.includes(brand.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{brand.name}</span><span className="text-[11px] text-gray-400">({brandCounts[brand.id] ?? 0})</span></div>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Ingrédients */}
                <div className="mb-6 border-t border-gray-100 pt-6">
                  <h3 className="font-serif text-gray-700 mb-4">Ingrédients</h3>
                  <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" /><input type="text" placeholder="Search ingredient..." value={ingredientSearchTerm} onChange={(e) => setIngredientSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-sm py-1.5 pl-8 pr-3 text-xs focus:outline-none" /></div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                    {ingredients.filter(i => i.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())).map(ingredient => (
                      <label key={ingredient.id} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedIngredients.includes(ingredient.id) ? 'border-gray-800' : 'border-gray-300'}`} onClick={() => toggleIngredient(ingredient.id)}>{selectedIngredients.includes(ingredient.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}</div>
                        <div className="flex items-baseline gap-2"><span className={`text-xs ${selectedIngredients.includes(ingredient.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{ingredient.name}</span><span className="text-[11px] text-gray-400">({ingredientCounts[ingredient.id] ?? 0})</span></div>
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
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedCategories.includes(cat.id) ? 'border-gray-800' : 'border-gray-300'}`} onClick={() => toggleCategory(cat.id)}>{selectedCategories.includes(cat.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}</div>
                        <span className={`text-xs ${selectedCategories.includes(cat.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* ── Notes — #da2966 (mobile drawer) ─────────────────────── */}
                <div className="mb-6 border-t border-gray-100 pt-6">
                  <h3 className="font-serif text-gray-700 mb-4">Notes</h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedRating(null)} className={`px-3 py-1 rounded-sm text-xs font-medium ${selectedRating === null ? 'bg-[#fde8ef] text-[#da2966] border border-[#da2966]' : 'bg-gray-100 text-gray-600'}`}>Tout</button>
                    <button onClick={() => setSelectedRating(5)}    className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 5 ? 'bg-[#fde8ef] text-[#da2966] border border-[#da2966]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 5.0</button>
                    <button onClick={() => setSelectedRating(4)}    className={`px-3 py-1 rounded-sm text-xs flex items-center gap-1 ${selectedRating === 4 ? 'bg-[#fde8ef] text-[#da2966] border border-[#da2966]' : 'bg-gray-100 text-gray-600'}`}><span className="text-[10px]">★</span> 4.0</button>
                  </div>
                </div>
                {/* Promotions */}
                <div className="border-t border-gray-100 pt-6 pb-2">
                  <h3 className="font-serif text-gray-700 mb-4">Promotions</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={promotionOnly} onChange={(e) => setPromotionOnly(e.target.checked)} className="w-3.5 h-3.5" /><span className="text-xs text-gray-500">Offre Speciales</span></label>
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="w-3.5 h-3.5" /><span className="text-xs text-gray-500">Best Sellers</span></label>
                  </div>
                </div>
              </div>
              <div className="shrink-0 px-5 py-4 border-t border-gray-100">
                <button onClick={() => setMobileFilterOpen(false)} className="w-full py-3 bg-[#4a403a] text-white text-sm font-serif rounded-sm hover:bg-[#3a3028] transition-colors">
                  {loadingProducts ? 'Chargement…' : `Voir ${products.length} produit${products.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}