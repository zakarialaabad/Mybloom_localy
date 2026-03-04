'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Search, Grid, List } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { productService, Product } from '@/services/api';
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  // Apply URL params to filter store — re-runs on every URL change (soft navigation too)
  useEffect(() => {
    const categoryId = searchParams.get('category');
    const featured   = searchParams.get('featured');
    // Reset URL-controlled filters first, then apply current URL values
    setSelectedCategories(categoryId ? [Number(categoryId)] : []);
    setFeaturedOnly(featured === '1');
  }, [searchParams, setSelectedCategories, setFeaturedOnly]);

  // Fetch products when filters change.
  // Debounced (400 ms) so rapid slider drags don't flood the API.
  // AbortController cancels any in-flight request before issuing a new one,
  // preventing stale responses from overwriting fresher results (race condition).
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoadingProducts(true);
      const params: Record<string, unknown> = {};

      if (featuredOnly) {
        // "Best Sellers" mode — send ONLY is_featured=1.
        // No price, brand, category or any other filter.
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
  }, [selectedBrands, selectedCategories, selectedMin, selectedMax, selectedRating, promotionOnly, featuredOnly, aggregatesReady]);



  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {/* Banner */}
      <div className="w-full relative h-[200px] md:h-[300px] bg-[#5a1818]">
        <Image src="/Valentines-image.png" alt="Special Valentines Offer" fill className="object-cover" priority />
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-400 mb-8 font-serif italic">
          <Link href="/">Home</Link> / <span className="text-gray-900">Collection</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
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
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs text-gray-400 font-serif italic">{products.length} Produits</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <button className="text-gray-900 hover:text-gray-900 transition-colors"><Grid className="h-4 w-4" /></button>
                  <button className="hover:text-gray-900 transition-colors"><List className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-serif italic cursor-pointer group">
                  <span>Sort by: <span className="text-gray-900">Relevance (Default)</span></span>
                  <ChevronDown className="h-3 w-3 group-hover:text-gray-900 transition-colors" />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-100 rounded-sm animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-serif italic">No products found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                {products.map(p => (
                  <ProductCard key={p.id} {...productToCard(p)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
