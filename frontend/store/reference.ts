/**
 * reference.ts — Zustand store for static/reference data.
 *
 * WHY THIS EXISTS:
 * Brands and categories are fetched by multiple independent components:
 *   - BrandLogos      → GET /v1/brands
 *   - collection page → GET /v1/brands  (same data, second DB hit)
 *   - CategoriesSection → GET /v1/categories
 *   - collection page → GET /v1/categories (second DB hit)
 *
 * Without a shared store, each component fires its own useEffect fetch.
 * Navigate home → /collection → home and you get 4+ identical HTTP requests.
 *
 * SOLUTION:
 * A single Zustand store that:
 *   1. Fetches brands and categories ONCE (guarded by `brandsReady`, `categoriesReady`).
 *   2. Makes the data available to any component tree without prop drilling.
 *   3. Works across client-side navigations (SPA behavior in Next.js App Router).
 *
 * HOW TO USE IN A COMPONENT:
 *   const { brands, ensureBrands } = useReferenceStore();
 *   useEffect(() => { ensureBrands(); }, [ensureBrands]);
 *
 * THE BACKEND ALREADY CACHES:
 *   - GET /v1/brands      → server-side Cache::remember('api.brands', 10 min)
 *   - GET /v1/categories  → server-side Cache::remember('api.categories', 10 min)
 *
 * Together: DB is hit at most once per 10 min; HTTP request is made at most
 * once per browser session per resource type.
 */

import { create } from 'zustand';
import { bannerService, brandService, categoryService, ingredientService, reviewService, Banner, Brand, Category, Ingredient, ReviewItem, RatingSummary } from '@/services/api';

interface ReferenceStore {
  // ── Brands ──────────────────────────────────────────────────────────────────
  brands: Brand[];
  brandsReady: boolean;          // true once first successful fetch completes
  brandsLoading: boolean;
  ensureBrands: () => void;      // idempotent — call freely from any component

  // ── Categories (flat: parents + children merged) ─────────────────────────
  categories: Category[];
  topLevelCategories: Category[]; // parents only — used by CategoriesSection circles
  categoriesReady: boolean;
  categoriesLoading: boolean;
  ensureCategories: () => void;   // idempotent

  // ── Ingredients ──────────────────────────────────────────────────────────
  ingredients: Ingredient[];
  ingredientsReady: boolean;
  ingredientsLoading: boolean;
  ensureIngredients: () => void;  // idempotent

  // ── Homepage banners ─────────────────────────────────────────────────────
  banners: Banner[];
  bannersReady: boolean;
  bannersLoading: boolean;
  ensureBanners: () => void;      // idempotent

  // ── Homepage reviews ─────────────────────────────────────────────────────
  reviews: ReviewItem[];
  reviewSummary: RatingSummary;
  reviewsReady: boolean;
  reviewsLoading: boolean;
  ensureReviews: () => void;      // idempotent
}

const useReferenceStore = create<ReferenceStore>((set, get) => ({
  // ── Brands ──────────────────────────────────────────────────────────────────
  brands: [],
  brandsReady: false,
  brandsLoading: false,

  ensureBrands: () => {
    // Guard: already fetched or in-flight → do nothing
    if (get().brandsReady || get().brandsLoading) return;
    set({ brandsLoading: true });
    brandService
      .list()
      .then((data) => set({ brands: data, brandsReady: true }))
      .catch(() => {})
      .finally(() => set({ brandsLoading: false }));
  },

  // ── Categories ───────────────────────────────────────────────────────────
  categories: [],
  topLevelCategories: [],
  categoriesReady: false,
  categoriesLoading: false,

  ensureCategories: () => {
    if (get().categoriesReady || get().categoriesLoading) return;
    set({ categoriesLoading: true });
    categoryService
      .list()
      .then((data) => {
        // `data` = top-level categories with `.children` populated (from API)
        // `categories`         = flat list used by collection sidebar filter
        // `topLevelCategories` = parent-only list used by CategoriesSection circles
        const flat = [...data, ...data.flatMap((c) => c.children ?? [])];
        set({ categories: flat, topLevelCategories: data, categoriesReady: true });
      })
      .catch(() => {})
      .finally(() => set({ categoriesLoading: false }));
  },

  // ── Ingredients ──────────────────────────────────────────────────────────
  ingredients: [],
  ingredientsReady: false,
  ingredientsLoading: false,

  ensureIngredients: () => {
    if (get().ingredientsReady || get().ingredientsLoading) return;
    set({ ingredientsLoading: true });
    ingredientService
      .list()
      .then((data) => set({ ingredients: data, ingredientsReady: true }))
      .catch(() => {})
      .finally(() => set({ ingredientsLoading: false }));
  },

  // ── Homepage banners ─────────────────────────────────────────────────────
  banners: [],
  bannersReady: false,
  bannersLoading: false,

  ensureBanners: () => {
    if (get().bannersReady || get().bannersLoading) return;
    set({ bannersLoading: true });
    bannerService
      .getHomepage()
      .then((data) => set({ banners: data, bannersReady: true }))
      .catch(() => {})
      .finally(() => set({ bannersLoading: false }));
  },

  // ── Homepage reviews ─────────────────────────────────────────────────────
  reviews: [],
  reviewSummary: {
    average: 0,
    total: 0,
    distribution: { 5: { count: 0, percentage: 0 }, 4: { count: 0, percentage: 0 }, 3: { count: 0, percentage: 0 }, 2: { count: 0, percentage: 0 }, 1: { count: 0, percentage: 0 } },
  },
  reviewsReady: false,
  reviewsLoading: false,

  ensureReviews: () => {
    if (get().reviewsReady || get().reviewsLoading) return;
    set({ reviewsLoading: true });
    reviewService
      .list({ source: 'admin' })
      .then(({ data, rating_summary }) =>
        set({ reviews: data, reviewSummary: rating_summary, reviewsReady: true })
      )
      .catch(() => {})
      .finally(() => set({ reviewsLoading: false }));
  },
}));

export default useReferenceStore;
