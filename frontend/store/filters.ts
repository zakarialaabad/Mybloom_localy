/**
 * filters.ts — Zustand store for all collection filter state.
 *
 * WHY THIS EXISTS:
 * The collection page and the FilterModal (opened from the Header's search bar)
 * must share a single filtration engine.  Without this store each UI would own
 * its own disconnected state, producing:
 *   – Modal changes that never affect the collection
 *   – Duplicate API calls
 *   – Inconsistent UX
 *
 * SINGLE SOURCE OF TRUTH:
 *   FilterModal  ──┐
 *                  ├──→  useFilterStore  ──→  collection page product fetch
 *   /collection ───┘
 *
 * HOW TO USE:
 *   const { selectedMin, setSelectedMin, toggleBrand } = useFilterStore();
 *
 * PRICE BOUNDS:
 *   globalMin / globalMax come from GET /v1/products/aggregates.
 *   Call ensureAggregates() once on mount; subsequent calls are no-ops.
 */

import { create } from 'zustand';
import { productService } from '@/services/api';

interface FilterStore {
  // ── Price bounds (from aggregates API) ──────────────────────────────────
  globalMin: number;
  globalMax: number;
  aggregatesReady: boolean;
  aggregatesLoading: boolean;
  ensureAggregates: () => void;

  // ── Active filter values ─────────────────────────────────────────────────
  selectedMin: number;
  selectedMax: number;
  selectedBrands: number[];
  selectedCategories: number[];
  selectedIngredients: number[];
  selectedRating: number | null;
  selectedProductType: string | null;
  promotionOnly: boolean;
  featuredOnly: boolean;

  // ── Dynamic brand counts (based on current filtered products) ────────────
  brandCounts: Record<number, number>; // brand_id -> product_count
  setBrandCounts: (counts: Record<number, number>) => void;
  ingredientCounts: Record<number, number>; // ingredient_id -> product_count
  setIngredientCounts: (counts: Record<number, number>) => void;
  productTypeCounts: Record<string, { name: string; count: number }>; // slug -> { name, count }
  setProductTypeCounts: (counts: Record<string, { name: string; count: number }>) => void;

  // ── Mutations ───────────────────────────────────────────────────────
  setSelectedMin: (v: number) => void;
  setSelectedMax: (v: number) => void;
  toggleBrand: (id: number) => void;
  setSelectedBrands: (ids: number[]) => void;
  toggleCategory: (id: number) => void;
  setSelectedCategories: (ids: number[]) => void;
  toggleIngredient: (id: number) => void;
  setSelectedIngredients: (ids: number[]) => void;
  setSelectedRating: (r: number | null) => void;
  setSelectedProductType: (slug: string | null) => void;
  toggleProductType: (slug: string) => void;
  setPromotionOnly: (v: boolean) => void;
  setFeaturedOnly: (v: boolean) => void;
  resetFilters: () => void;
}

const useFilterStore = create<FilterStore>((set, get) => ({
  // ── Price bounds ─────────────────────────────────────────────────────────
  globalMin: 0,
  globalMax: 100,
  aggregatesReady: false,
  aggregatesLoading: false,

  ensureAggregates: () => {
    if (get().aggregatesReady || get().aggregatesLoading) return;
    set({ aggregatesLoading: true });
    productService
      .aggregates()
      .then((agg) => {
        const gmin = agg.min_price ?? 0;
        const gmax = agg.max_price ?? 100;
        set({
          globalMin: gmin,
          globalMax: gmax,
          // Only initialise selection bounds on first load
          selectedMin: gmin,
          selectedMax: gmax,
          aggregatesReady: true,
        });
      })
      .catch(() => {})
      .finally(() => set({ aggregatesLoading: false }));
  },

  // ── Filter values ─────────────────────────────────────────────────────────
  selectedMin: 0,
  selectedMax: 100,
  selectedBrands: [],
  selectedCategories: [],
  selectedIngredients: [],
  selectedRating: null,
  selectedProductType: null,
  promotionOnly: false,
  featuredOnly: false,

  // ── Dynamic brand counts ──────────────────────────────────────────────────
  brandCounts: {},
  setBrandCounts: (counts) => set({ brandCounts: counts }),
  ingredientCounts: {},
  setIngredientCounts: (counts) => set({ ingredientCounts: counts }),
  productTypeCounts: {},
  setProductTypeCounts: (counts) => set({ productTypeCounts: counts }),

  // ── Mutations ─────────────────────────────────────────────────────────────
  setSelectedMin: (v) => set({ selectedMin: v }),
  setSelectedMax: (v) => set({ selectedMax: v }),

  toggleBrand: (id) =>
    set((s) => ({
      selectedBrands: s.selectedBrands.includes(id)
        ? s.selectedBrands.filter((b) => b !== id)
        : [...s.selectedBrands, id],
    })),

  setSelectedBrands: (ids) => set({ selectedBrands: ids }),

  toggleCategory: (id) =>
    set((s) => ({
      selectedCategories: s.selectedCategories.includes(id)
        ? s.selectedCategories.filter((c) => c !== id)
        : [...s.selectedCategories, id],
    })),

  setSelectedCategories: (ids) => set({ selectedCategories: ids }),

  toggleIngredient: (id) =>
    set((s) => ({
      selectedIngredients: s.selectedIngredients.includes(id)
        ? s.selectedIngredients.filter((i) => i !== id)
        : [...s.selectedIngredients, id],
    })),

  setSelectedIngredients: (ids) => set({ selectedIngredients: ids }),

  setSelectedRating: (r) => set({ selectedRating: r }),

  setSelectedProductType: (slug) => set({ selectedProductType: slug }),
  
  toggleProductType: (slug) =>
    set((s) => ({
      selectedProductType: s.selectedProductType === slug ? null : slug,
    })),

  setPromotionOnly: (v) => set({ promotionOnly: v }),
  setFeaturedOnly: (v) => set({ featuredOnly: v }),

  resetFilters: () => {
    const { globalMin, globalMax } = get();
    set({
      selectedMin: globalMin,
      selectedMax: globalMax,
      selectedBrands: [],
      selectedCategories: [],
      selectedIngredients: [],
      selectedRating: null,
      selectedProductType: null,
      promotionOnly: false,
      featuredOnly: false,
    });
  },
}));

export default useFilterStore;
