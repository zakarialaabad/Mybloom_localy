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
import useReferenceStore from '@/store/reference';
import PriceHistogram from '@/components/ui/PriceHistogram';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const [isMounted, setIsMounted]     = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  // ── Shared filter state ────────────────────────────────────────────────
  const globalMin          = useFilterStore((s) => s.globalMin);
  const globalMax          = useFilterStore((s) => s.globalMax);
  const selectedMin        = useFilterStore((s) => s.selectedMin);
  const selectedMax        = useFilterStore((s) => s.selectedMax);
  const selectedBrands     = useFilterStore((s) => s.selectedBrands);
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const selectedRating     = useFilterStore((s) => s.selectedRating);
  const promotionOnly      = useFilterStore((s) => s.promotionOnly);
  const featuredOnly       = useFilterStore((s) => s.featuredOnly);

  const setSelectedMin    = useFilterStore((s) => s.setSelectedMin);
  const setSelectedMax    = useFilterStore((s) => s.setSelectedMax);
  const toggleBrand       = useFilterStore((s) => s.toggleBrand);
  const toggleCategory    = useFilterStore((s) => s.toggleCategory);
  const setSelectedRating = useFilterStore((s) => s.setSelectedRating);
  const setPromotionOnly  = useFilterStore((s) => s.setPromotionOnly);
  const setFeaturedOnly   = useFilterStore((s) => s.setFeaturedOnly);
  const resetFilters      = useFilterStore((s) => s.resetFilters);
  const ensureAggregates  = useFilterStore((s) => s.ensureAggregates);

  // ── Reference data (brands + categories) ─────────────────────────────
  const brands           = useReferenceStore((s) => s.brands);
  const categories       = useReferenceStore((s) => s.categories);
  const ensureBrands     = useReferenceStore((s) => s.ensureBrands);
  const ensureCategories = useReferenceStore((s) => s.ensureCategories);

  useEffect(() => { setIsMounted(true); }, []);

  // Load reference data and price bounds when modal first opens
  useEffect(() => {
    if (isOpen) {
      ensureBrands();
      ensureCategories();
      ensureAggregates();
    }
  }, [isOpen, ensureBrands, ensureCategories, ensureAggregates]);

  // Count active filters for the badge
  const activeFilterCount =
    selectedBrands.length +
    selectedCategories.length +
    (selectedRating !== null ? 1 : 0) +
    (promotionOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (selectedMin !== globalMin || selectedMax !== globalMax ? 1 : 0);

  const visibleBrands = brandSearch.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands;

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
        className={`fixed inset-y-0 right-0 z-[101] w-full max-w-[400px] bg-[#f9f9f9] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center p-6 relative bg-white border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-serif font-bold text-gray-800">
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#cda873] text-white text-[10px] font-sans font-semibold">
                {activeFilterCount}
              </span>
            )}
          </h2>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="absolute left-6 flex items-center gap-1 text-xs text-gray-400 hover:text-[#cda873] transition-colors font-serif italic"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}

          <button
            onClick={onClose}
            className="absolute right-6 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden">

          {/* Brand Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg text-gray-500">Brand</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>

            <div className="bg-[#f9f9f9] rounded-sm p-2.5 flex items-center gap-2 mb-5">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brand..."
                className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-gray-400 text-gray-600 font-sans"
              />
            </div>

            <div className="space-y-4 max-h-52 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden">
              {visibleBrands.length === 0 && (
                <p className="text-xs text-gray-400 font-serif italic">No brands found.</p>
              )}
              {visibleBrands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      selectedBrands.includes(brand.id)
                        ? 'border-gray-800'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}
                    onClick={() => toggleBrand(brand.id)}
                  >
                    {selectedBrands.includes(brand.id) && (
                      <div className="w-2 h-2 bg-gray-800 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`font-serif text-[15px] ${
                      selectedBrands.includes(brand.id) ? 'text-gray-800 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {brand.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg text-gray-500">Price</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
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

          {/* Category Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg text-gray-500">Category</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-52 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      selectedCategories.includes(cat.id)
                        ? 'border-gray-800'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {selectedCategories.includes(cat.id) && (
                      <div className="w-2 h-2 bg-gray-800 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`font-serif text-[15px] ${
                      selectedCategories.includes(cat.id) ? 'text-gray-800 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg text-gray-500">Rating</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {([null, 5, 4, 3] as Array<number | null>).map((r) => (
                <button
                  key={r ?? 'all'}
                  onClick={() => setSelectedRating(r)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-serif transition-colors ${
                    selectedRating === r
                      ? 'bg-[#fdf6e3] text-[#b8860b] border border-[#cda873]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === null ? 'All' : `★ ${r}.0+`}
                </button>
              ))}
            </div>
          </div>

          {/* Promotions Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg text-gray-500">Promotions</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={promotionOnly}
                onChange={(e) => setPromotionOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#cda873]"
              />
              <span className="text-sm text-gray-500 font-serif">Offres Spéciales uniquement</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#cda873]"
              />
              <span className="text-sm text-gray-500 font-serif">Best Sellers uniquement</span>
            </label>
          </div>

        </div>

        {/* ── Footer / CTA ─────────────────────────────────────────────────── */}
        <div className="shrink-0 p-4 bg-white border-t border-gray-100 flex gap-3">
          <Link
            href="/collection"
            onClick={onClose}
            className="flex-1 bg-[#4a403a] text-white py-3 rounded-sm text-sm font-serif italic text-center hover:bg-[#3a322d] transition-colors"
          >
            View results
            {activeFilterCount > 0 && (
              <span className="ml-1 text-[#e8c99b]">({activeFilterCount} active)</span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}