'use client';

/**
 * FilterModal — slide-in drawer triggered by the search-bar filter icon.
 *
 * ARCHITECTURE:
 *   This component is a CONTROLLER UI only — it owns zero filter logic.
 *   All state lives in useFilterStore (store/filters.ts) which is also read
 *   by the /collection page.  Any change made here is immediately reflected
 *   in the collection product grid with no extra API calls.
 *
 *   Brand / category data comes from useReferenceStore (fetched once, shared).
 *   Price histogram is the canonical PriceHistogram component (same as sidebar).
 *
 * CLOSING THE MODAL:
 *   Does NOT reset filters.  Filters persist across modal open/close cycles
 *   so the user's context is preserved.
 */

import { X, ChevronUp, Search, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useFilterStore from '@/store/filters';
import useReferenceStore, { ProductType } from '@/store/reference';
import useCatalogStore from '@/store/catalog';
import PriceHistogram from '@/components/ui/PriceHistogram';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const [isMounted, setIsMounted]     = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [ingredientSearch, setIngredientSearch] = useState('');

  // ── Shared filter state ────────────────────────────────────────────────
  const globalMin          = useFilterStore((s) => s.globalMin);
  const globalMax          = useFilterStore((s) => s.globalMax);
  const selectedMin        = useFilterStore((s) => s.selectedMin);
  const selectedMax        = useFilterStore((s) => s.selectedMax);
  const selectedBrands     = useFilterStore((s) => s.selectedBrands);
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const selectedIngredients = useFilterStore((s) => s.selectedIngredients);
  const selectedRating     = useFilterStore((s) => s.selectedRating);
  const selectedProductType = useFilterStore((s) => s.selectedProductType);
  const promotionOnly      = useFilterStore((s) => s.promotionOnly);
  const featuredOnly       = useFilterStore((s) => s.featuredOnly);

  const setSelectedMin    = useFilterStore((s) => s.setSelectedMin);
  const setSelectedMax    = useFilterStore((s) => s.setSelectedMax);
  const toggleBrand       = useFilterStore((s) => s.toggleBrand);
  const toggleCategory    = useFilterStore((s) => s.toggleCategory);
  const toggleIngredient  = useFilterStore((s) => s.toggleIngredient);
  const toggleProductType = useFilterStore((s) => s.toggleProductType);
  const setSelectedRating = useFilterStore((s) => s.setSelectedRating);
  const setPromotionOnly  = useFilterStore((s) => s.setPromotionOnly);
  const setFeaturedOnly   = useFilterStore((s) => s.setFeaturedOnly);
  const resetFilters      = useFilterStore((s) => s.resetFilters);
  const ensureAggregates  = useFilterStore((s) => s.ensureAggregates);

  // ── Reference data (brands + categories + ingredients) ─────────────────────────────
  const brands           = useReferenceStore((s) => s.brands);
  const categories       = useReferenceStore((s) => s.categories);
  const ingredients      = useReferenceStore((s) => s.ingredients);
  const productTypes     = useReferenceStore((s) => s.productTypes);
  const ensureBrands     = useReferenceStore((s) => s.ensureBrands);
  const ensureCategories = useReferenceStore((s) => s.ensureCategories);
  const ensureIngredients = useReferenceStore((s) => s.ensureIngredients);
  const ensureProductTypes = useReferenceStore((s) => s.ensureProductTypes);
  const brandCounts      = useFilterStore((s) => s.brandCounts);
  const ingredientCounts = useFilterStore((s) => s.ingredientCounts);
  const categoryCounts   = useFilterStore((s) => s.categoryCounts);
  const productTypeCounts = useFilterStore((s) => s.productTypeCounts);
  const setBrandCounts      = useFilterStore((s) => s.setBrandCounts);
  const setIngredientCounts = useFilterStore((s) => s.setIngredientCounts);
  const setCategoryCounts   = useFilterStore((s) => s.setCategoryCounts);
  const setProductTypeCounts = useFilterStore((s) => s.setProductTypeCounts);

  const ensureProductsCache = useCatalogStore((s) => s.ensureProducts);

  useEffect(() => { setIsMounted(true); }, []);

  // Load reference data and price bounds when modal first opens
  useEffect(() => {
    if (isOpen) {
      ensureBrands();
      ensureCategories();
      ensureIngredients();
      ensureProductTypes();
      ensureAggregates();
    }
  }, [isOpen, ensureBrands, ensureCategories, ensureIngredients, ensureProductTypes, ensureAggregates]);

  // Compute brand/ingredient counts if they're empty (modal opened outside /collection)
  useEffect(() => {
    if (!isOpen) return;
    const hasBrandCounts = Object.keys(brandCounts).length > 0;
    const hasIngredientCounts = Object.keys(ingredientCounts).length > 0;
    const hasCategoryCounts = Object.keys(categoryCounts).length > 0;
    const hasProductTypeCounts = Object.keys(productTypeCounts).length > 0;
    if (hasBrandCounts && hasIngredientCounts && hasCategoryCounts && hasProductTypeCounts) return;

    // Build filter params from current filter state (same as collection page)
    const buildFilterParams = () => {
      const params: Record<string, unknown> = {};
      
      if (featuredOnly) {
        params['is_featured'] = 1;
      } else {
        if (selectedBrands.length > 0) params['brand_ids[]'] = selectedBrands;
        if (selectedCategories.length > 0) params['category_ids[]'] = selectedCategories;
        if (selectedIngredients.length > 0) params['ingredient_ids[]'] = selectedIngredients;
        if (globalMax && (selectedMin > globalMin || selectedMax < globalMax)) {
          params['price_min'] = selectedMin;
          params['price_max'] = selectedMax;
        }
        if (selectedRating !== null) params['min_rating'] = selectedRating;
        if (selectedProductType !== null) params['product_type'] = selectedProductType;
        if (promotionOnly) params['on_promotion'] = 1;
      }
      return params;
    };

    const params = buildFilterParams();
    ensureProductsCache('modal-filter', params).then((products) => {
      const bc: Record<number, number> = {};
      const ic: Record<number, number> = {};
      const cc: Record<number, number> = {};
      const pc: Record<string, { name: string; count: number }> = {};
      
      const slugify = (s: string) => s ? s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '';
      
      products.forEach((p) => {
        if (p.brand?.id) bc[p.brand.id] = (bc[p.brand.id] ?? 0) + 1;
        p.ingredients?.forEach((ing) => { if (ing.id) ic[ing.id] = (ic[ing.id] ?? 0) + 1; });
        if (p.category?.id) cc[p.category.id] = (cc[p.category.id] ?? 0) + 1;
        
        // Product types
        const nameFromType = p.product_type?.name ?? p.category?.name;
        const slugFromType = p.product_type?.slug ?? null;
        const name = nameFromType ?? 'Autre';
        const slug = slugFromType ?? slugify(name);
        if (!pc[slug]) pc[slug] = { name, count: 0 };
        pc[slug].count += 1;
      });
      
      if (!hasBrandCounts) setBrandCounts(bc);
      if (!hasIngredientCounts) setIngredientCounts(ic);
      if (!hasCategoryCounts) setCategoryCounts(cc);
      if (!hasProductTypeCounts) setProductTypeCounts(pc);
    });
  }, [isOpen, selectedBrands, selectedCategories, selectedIngredients, selectedMin, selectedMax, globalMin, globalMax, selectedRating, selectedProductType, promotionOnly, featuredOnly, brandCounts, ingredientCounts, categoryCounts, productTypeCounts, ensureProductsCache, setBrandCounts, setIngredientCounts, setCategoryCounts, setProductTypeCounts]);

  // Count active filters for the badge
  const activeFilterCount =
    selectedBrands.length +
    selectedCategories.length +
    selectedIngredients.length +
    (selectedRating !== null ? 1 : 0) +
    (selectedProductType !== null ? 1 : 0) +
    (promotionOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (selectedMin !== globalMin || selectedMax !== globalMax ? 1 : 0);

  const visibleBrands = brandSearch.trim()
    ? brands.filter((b) => b.name.toLowerCase() !== 'my bloom' && b.name.toLowerCase().includes(brandSearch.toLowerCase()) && (brandCounts[b.id] ?? 0) > 0)
    : brands.filter((b) => b.name.toLowerCase() !== 'my bloom' && (brandCounts[b.id] ?? 0) > 0);

  const visibleIngredients = ingredientSearch.trim()
    ? ingredients.filter((i) => i.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
    : ingredients;

  // Build URL for "View results" button with all active filters
  const buildCollectionUrl = () => {
    const params = new URLSearchParams();
    
    // Brands
    if (selectedBrands.length > 0) {
      selectedBrands.forEach((id) => params.append('brand_ids[]', String(id)));
    }
    
    // Categories
    if (selectedCategories.length > 0) {
      selectedCategories.forEach((id) => params.append('category_ids[]', String(id)));
    }
    
    // Ingredients
    if (selectedIngredients.length > 0) {
      selectedIngredients.forEach((id) => params.append('ingredient_ids[]', String(id)));
    }
    
    // Price range (only if changed from global min/max)
    if (selectedMin > globalMin || selectedMax < globalMax) {
      params.set('price_min', String(selectedMin));
      params.set('price_max', String(selectedMax));
    }
    
    // Rating
    if (selectedRating !== null) {
      params.set('min_rating', String(selectedRating));
    }
    
    // Product Type
    if (selectedProductType !== null) {
      params.set('product_type', selectedProductType);
    }
    
    // Promotions
    if (promotionOnly) {
      params.set('on_promotion', '1');
    }
    
    // Featured
    if (featuredOnly) {
      params.set('is_featured', '1');
    }
    
    const queryString = params.toString();
    return queryString ? `/collection?${queryString}` : '/collection';
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[101] w-full max-w-[400px] bg-[#f8f8f8] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header Desktop ───────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-between py-5 px-6 bg-white shrink-0 z-10 border-b border-gray-50">

          {/* Bouton Réinitialiser — même style que le bouton ✕ */}
          <button
            onClick={activeFilterCount > 0 ? resetFilters : undefined}
            className={`w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center transition-colors text-gray-700 hover:bg-gray-200 ${
              activeFilterCount === 0 ? 'invisible' : ''
            }`}
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Titre centré avec badge aligné */}
          <h2 className="flex items-center gap-2 text-[15px] font-serif font-bold text-[#333] tracking-widest uppercase">
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#da2966] text-white text-[10px] font-sans font-semibold leading-none">
                {activeFilterCount}
              </span>
            )}
          </h2>

          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center transition-colors text-gray-700 hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Header Mobile ────────────────────────────────────────────────── */}
        <div className="flex md:hidden items-center justify-between py-5 px-6 bg-white shrink-0 z-10 border-b border-gray-50">

          {/* Bouton Réinitialiser — même style que le bouton ✕ */}
          <button
            onClick={activeFilterCount > 0 ? resetFilters : undefined}
            className={`w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center transition-colors text-gray-700 hover:bg-gray-200 ${
              activeFilterCount === 0 ? 'invisible' : ''
            }`}
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Titre centré avec badge aligné */}
          <h2 className="flex items-center gap-2 text-[14px] font-serif font-bold text-[#333] tracking-[0.15em] uppercase">
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#da2966] text-white text-[10px] font-sans font-semibold leading-none">
                {activeFilterCount}
              </span>
            )}
          </h2>

          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center transition-colors text-gray-700 hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto space-y-[10px] px-0 py-2 sm:px-4 sm:py-4 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden">

          {/* Brand Section */}
          <div className="bg-white p-6 pt-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-[17px] text-gray-500">Brand</h3>
              <ChevronUp className="w-4 h-4 text-gray-800" />
            </div>

            <div className="bg-[#f8f8f8] p-3 flex items-center gap-3 mb-6">
              <Search className="w-[14px] h-[14px] text-gray-400 shrink-0" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brand...."
                className="bg-transparent border-none focus:outline-none text-[14px] w-full placeholder:text-gray-400 text-gray-700 font-serif"
              />
            </div>

            <div className="space-y-[18px] max-h-64 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
              {visibleBrands.length === 0 && (
                <p className="text-[13px] text-gray-400 font-serif italic">No brands found.</p>
              )}
              {visibleBrands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-4 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors shrink-0 ${
                      selectedBrands.includes(brand.id)
                        ? 'border-[#333]'
                        : 'border-gray-200 group-hover:border-gray-300'
                    }`}
                    onClick={() => toggleBrand(brand.id)}
                  >
                    {selectedBrands.includes(brand.id) && (
                      <div className="w-2.5 h-2.5 bg-[#333] rounded-full" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-serif text-[15px] ${
                        selectedBrands.includes(brand.id) ? 'text-[#333]' : 'text-[#444]'
                      }`}
                    >
                      {brand.name}
                    </span>
                    <span className="text-[12px] font-serif text-gray-400">
                      ({brandCounts[brand.id] ?? 0})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category Section */}
          <div className="bg-white p-6 pt-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-[17px] text-gray-500">Category</h3>
              <ChevronUp className="w-4 h-4 text-gray-800" />
            </div>

            <div className="space-y-[18px] max-h-64 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
              {categories.map((cat, i) => (
                <label key={cat.id} className="flex items-center gap-4 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors shrink-0 ${
                      selectedCategories.includes(cat.id)
                        ? 'border-[#333]'
                        : 'border-gray-200 group-hover:border-gray-300'
                    }`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {selectedCategories.includes(cat.id) && (
                      <div className="w-2.5 h-2.5 bg-[#333] rounded-full" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-serif text-[15px] ${
                        selectedCategories.includes(cat.id) ? 'text-[#333]' : 'text-[#444]'
                      }`}
                    >
                      {cat.name}
                    </span>
                    <span className="text-[12px] font-serif text-gray-400">
                      ({categoryCounts[cat.id] ?? 0})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Product Types Section */}
          <div className="bg-white p-6 pt-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-[17px] text-gray-500">Type de produit</h3>
              <ChevronUp className="w-4 h-4 text-gray-800" />
            </div>

            <div className="space-y-[18px] max-h-64 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
              {productTypes.length === 0 && Object.keys(productTypeCounts).length === 0 && (
                <p className="text-[13px] text-gray-400 font-serif italic">No product types found.</p>
              )}
              
              {/* Show productTypes from reference store if available */}
              {productTypes.length > 0 && productTypes.map((pt: ProductType) => {
                const slugify = (s: string) => s ? s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '';
                const slugKey = pt.slug || slugify(pt.name || String(pt.id || ''));
                const cnt = productTypeCounts[slugKey]?.count ?? 0;
                
                return (
                  <label key={pt.id} className="flex items-center gap-4 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors shrink-0 ${
                        selectedProductType === slugKey
                          ? 'border-[#333]'
                          : 'border-gray-200 group-hover:border-gray-300'
                      }`}
                      onClick={() => toggleProductType(slugKey)}
                    >
                      {selectedProductType === slugKey && (
                        <div className="w-2.5 h-2.5 bg-[#333] rounded-full" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-serif text-[15px] ${
                          selectedProductType === slugKey ? 'text-[#333]' : 'text-[#444]'
                        }`}
                      >
                        {pt.name}
                      </span>
                      <span className="text-[12px] font-serif text-gray-400">
                        ({cnt})
                      </span>
                    </div>
                  </label>
                );
              })}
              
              {/* Fallback: show from productTypeCounts if productTypes is empty */}
              {productTypes.length === 0 && Object.entries(productTypeCounts)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                .map(([slug, v]) => (
                  <label key={slug} className="flex items-center gap-4 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors shrink-0 ${
                        selectedProductType === slug
                          ? 'border-[#333]'
                          : 'border-gray-200 group-hover:border-gray-300'
                      }`}
                      onClick={() => toggleProductType(slug)}
                    >
                      {selectedProductType === slug && (
                        <div className="w-2.5 h-2.5 bg-[#333] rounded-full" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-serif text-[15px] ${
                          selectedProductType === slug ? 'text-[#333]' : 'text-[#444]'
                        }`}
                      >
                        {v.name}
                      </span>
                      <span className="text-[12px] font-serif text-gray-400">
                        ({v.count})
                      </span>
                    </div>
                  </label>
                ))}
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="bg-white p-6 pt-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-[17px] text-gray-500">Ingrédients</h3>
              <ChevronUp className="w-4 h-4 text-gray-800" />
            </div>

            <div className="bg-[#f8f8f8] p-3 flex items-center gap-3 mb-6">
              <Search className="w-[14px] h-[14px] text-gray-400 shrink-0" />
              <input
                type="text"
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                placeholder="Search ingredient...."
                className="bg-transparent border-none focus:outline-none text-[14px] w-full placeholder:text-gray-400 text-gray-700 font-serif"
              />
            </div>

            <div className="space-y-[18px] max-h-64 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
              {visibleIngredients.length === 0 && (
                <p className="text-[13px] text-gray-400 font-serif italic">No ingredients found.</p>
              )}
              {visibleIngredients.map((ingredient) => (
                <label key={ingredient.id} className="flex items-center gap-4 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors shrink-0 ${
                      selectedIngredients.includes(ingredient.id)
                        ? 'border-[#333]'
                        : 'border-gray-200 group-hover:border-gray-300'
                    }`}
                    onClick={() => toggleIngredient(ingredient.id)}
                  >
                    {selectedIngredients.includes(ingredient.id) && (
                      <div className="w-2.5 h-2.5 bg-[#333] rounded-full" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-serif text-[15px] ${
                        selectedIngredients.includes(ingredient.id) ? 'text-[#333]' : 'text-[#444]'
                      }`}
                    >
                      {ingredient.name}
                    </span>
                    <span className="text-[12px] font-serif text-gray-400">
                      ({ingredientCounts[ingredient.id] ?? 0})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-white p-6 pt-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-[17px] text-gray-500">Price</h3>
              <ChevronUp className="w-4 h-4 text-gray-800" />
            </div>

            <PriceHistogram
              globalMin={globalMin}
              globalMax={globalMax}
              selectedMin={selectedMin}
              selectedMax={selectedMax}
              onMinChange={setSelectedMin}
              onMaxChange={setSelectedMax}
            />
          </div>

          {/* Rating Section */}
          <div className="bg-white p-6 pt-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-[17px] text-gray-500">Rating</h3>
              <ChevronUp className="w-4 h-4 text-gray-800" />
            </div>
            <div className="flex flex-wrap gap-2">
              {([null, 5, 4, 3] as Array<number | null>).map((r) => (
                <button
                  key={r ?? 'all'}
                  onClick={() => setSelectedRating(r)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-serif transition-colors ${
                    selectedRating === r
                      ? 'bg-[#fde8ef] text-[#da2966] border border-[#da2966]'
                      : 'bg-[#f8f8f8] text-[#444] hover:bg-gray-200'
                  }`}
                >
                  {r === null ? 'All' : `★ ${r}.0+`}
                </button>
              ))}
            </div>
          </div>

          {/* Promotions Section */}
          <div className="bg-white p-6 pt-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-[17px] text-gray-500">Promotions</h3>
              <ChevronUp className="w-4 h-4 text-gray-800" />
            </div>
            <label className="flex items-center gap-4 cursor-pointer group mb-4">
              <div
                className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors shrink-0 ${
                  promotionOnly
                    ? 'border-[#333]'
                    : 'border-gray-200 group-hover:border-gray-300'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setPromotionOnly(!promotionOnly);
                }}
              >
                {promotionOnly && (
                  <div className="w-2.5 h-2.5 bg-[#333] rounded-full" />
                )}
              </div>
              <span className="text-[15px] text-[#444] font-serif">Offres Spéciales uniquement</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors shrink-0 ${
                  featuredOnly
                    ? 'border-[#333]'
                    : 'border-gray-200 group-hover:border-gray-300'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setFeaturedOnly(!featuredOnly);
                }}
              >
                {featuredOnly && (
                  <div className="w-2.5 h-2.5 bg-[#333] rounded-full" />
                )}
              </div>
              <span className="text-[15px] text-[#444] font-serif">Best Sellers uniquement</span>
            </label>
          </div>

        </div>

        {/* ── Footer / CTA ─────────────────────────────────────────────────── */}
        <div className="shrink-0 p-4 bg-white border-t border-gray-100 flex gap-3 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] md:shadow-none z-10 pb-safe">
          <Link
            href={buildCollectionUrl()}
            onClick={onClose}
            className="flex-1 bg-[#4a403a] text-white py-3 rounded-sm text-sm font-serif italic text-center hover:bg-[#3a322d] transition-colors"
          >
            View results
            {activeFilterCount > 0 && (
              <span className="ml-1 text-[#f9a8c4]">({activeFilterCount} active)</span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}