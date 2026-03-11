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
        className={`fixed inset-y-0 right-0 z-[101] w-full max-w-[400px] bg-[#f8f8f8] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center p-5 relative bg-white shrink-0 z-10 hidden md:flex">
          <h2 className="text-[15px] font-serif font-bold text-[#333] tracking-widest uppercase">
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
              className="absolute left-6 flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#cda873] transition-colors font-serif uppercase tracking-wider"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={onClose}
            className="absolute right-6 w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center transition-colors text-gray-700 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Header (Matches screenshot) */}
        <div className="flex md:hidden items-center justify-center py-5 px-6 relative bg-white shrink-0 z-10 border-b border-gray-50">
          <button
            onClick={onClose}
            className="absolute left-6 w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center transition-colors text-gray-700 hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          
          <h2 className="text-[14px] font-serif font-bold text-[#333] tracking-[0.15em] uppercase">
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-[10px] font-sans font-semibold">
                {activeFilterCount}
              </span>
            )}
          </h2>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="absolute right-6 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
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
              {visibleBrands.map((brand, i) => (
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
                      ({12 + (i % 15)})
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
                      ({15 + (i % 20)})
                    </span>
                  </div>
                </label>
              ))}
            </div>
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
                      ? 'bg-[#fdf6e3] text-[#b8860b] border border-[#cda873]'
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