/**
 * catalog.ts — Zustand store for product catalog caching.
 *
 * WHY THIS EXISTS:
 * Products are fetched from multiple independent components:
 *   - BestSellers       → GET /v1/products?is_featured=true&limit=100
 *   - CollectionPage   → GET /v1/products?filters...
 *   - ProductDetail    → GET /v1/products/{slug}
 *   - Recommendations  → Already in ProductDetail response
 *
 * Without a shared cache, same products are fetched 10+ times per session.
 * Navigate home → collection → product → home = 6-8 redundant API calls.
 *
 * SOLUTION:
 * A Zustand store that:
 *   1. Caches product lists by filter key (e.g., "featured:100", "collection:{hash}")
 *   2. Automatically invalidates on TTL (15 min default)
 *   3. Allows ProductDetail to lookup products before API call
 *   4. Deduplicates requests for same product set
 *
 * HOW TO USE:
 *   // BestSellers component
 *   const ensureFeatured = useCatalogStore((s) => s.ensureProducts);
 *   useEffect(() => {
 *     ensureFeatured('featured:100', { is_featured: true, limit: 100 })
 *       .then(products => setProducts(products.map(productToCard)));
 *   }, [ensureFeatured]);
 *
 *   // ProductDetail component
 *   const findProductBySlug = useCatalogStore((s) => s.findProductBySlug);
 *   const cached = findProductBySlug(slug);
 *   if (cached) {
 *     setProduct(cached);
 *     return; // Skip API call!
 *   }
 *   // Fallback to API if not cached
 *   productService.show(slug).then(setProduct);
 *
 * CACHE INVALIDATION:
 * Automatic TTL expiry; for manual bust:
 *   useCatalogStore.setState({ products: new Map() });
 */

import { create } from 'zustand';
import { productService, Product } from '@/services/api';

interface CacheEntry {
  data: Product[];
  timestamp: number;
}

interface CatalogStore {
  // ── Product Cache ──────────────────────────────────────────────────────
  products: Map<string, CacheEntry>;
  productDetails: Map<string, { data: Product; timestamp: number }>;
  loading: Record<string, boolean>;
  
  // Cache TTL in milliseconds (15 minutes default)
  readonly CACHE_TTL: number;
  
  // ── Methods ────────────────────────────────────────────────────────────
  /**
   * Smart product fetch with automatic caching & dedup
   * @param key - Cache key: "featured:100", "collection:{filterHash}", etc.
   * @param params - Query params to send to API
   * @returns Promise<Product[]>
   *
   * Behavior:
   * 1. If cached & fresh → return immediately (no API call)
   * 2. If cached & stale → fetch fresh data in background, return stale (UX: instant)
   * 3. If not cached → fetch from API & cache
   * 4. If in-flight → wait for existing request (dedup)
   */
  ensureProducts: (key: string, params?: Record<string, unknown>) => Promise<Product[]>;
  
  /**
   * Find a single product by slug in any cached list
   * Searches through all cached product lists
   * @param slug - Product slug
   * @returns Product | null
   */
  findProductBySlug: (slug: string) => Product | null;

  /**
   * Get a full product detail from cache by slug (if fresh)
   * @param slug - Product slug
   * @returns Product | null
   */
  getProductDetailBySlug: (slug: string) => Product | null;

  /**
   * Cache a full product detail payload from the detail API
   * @param product - Product detail payload
   */
  cacheProductDetail: (product: Product) => void;

  /**
   * Prefetch a product detail in the background (non-blocking)
   * @param slug - Product slug to prefetch
   */
  prefetchProductDetail: (slug: string) => void;
  
  /**
   * Get all cached products (for recommendations, comparisons, etc.)
   * @returns Product[] - Flattened array of all cached products (deduplicated by ID)
   */
  getAllCachedProducts: () => Product[];
  
  /**
   * Clear all caches manually (e.g., after admin edit)
   */
  clearCache: () => void;
  
  /**
   * Check if a cache key exists and is fresh
   * @param key - Cache key to check
   * @returns boolean
   */
  isCacheFresh: (key: string) => boolean;
}

// Shared in-flight promise map — prevents polling, enables real dedup
const inflightRequests = new Map<string, Promise<Product[]>>();

const useCatalogStore = create<CatalogStore>((set, get) => ({
  products: new Map(),
  productDetails: new Map(),
  loading: {},
  CACHE_TTL: 15 * 60 * 1000, // 15 minutes

  ensureProducts: async (key: string, params?: Record<string, unknown>) => {
    const { products, CACHE_TTL } = get();
    
    // 1. Check if cached & fresh
    const cached = products.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[CatalogStore] Cache HIT for key: ${key}`);
      return cached.data;
    }
    
    // 2. If already in-flight, share the same promise (no polling)
    const existing = inflightRequests.get(key);
    if (existing) {
      console.log(`[CatalogStore] Request in-flight for key: ${key}, sharing promise...`);
      return existing;
    }
    
    // 3. Fetch fresh data from API
    console.log(`[CatalogStore] Cache MISS for key: ${key}, fetching...`);
    console.log(`[CatalogStore] Parameters being sent to API:`, JSON.stringify(params));
    set((state) => ({
      loading: { ...state.loading, [key]: true }
    }));
    
    const promise = (async () => {
      try {
        console.log(`[CatalogStore] Calling productService.list with params:`, params);
        const result = await productService.list(params);
        console.log(`[CatalogStore] API Response - received ${Array.isArray(result) ? result.length : result.data?.length || 0} products`);
        
        const data = Array.isArray(result) ? result : result.data || [];
        console.log(`[CatalogStore] Extracted ${data.length} products from response for key: ${key}`);
        
        if (data.length === 0) {
          console.warn(`[CatalogStore] ⚠️ No products returned for key: ${key} with params:`, params);
        }
        
        set((state) => ({
          products: new Map(state.products).set(key, {
            data,
            timestamp: Date.now(),
          }),
          loading: { ...state.loading, [key]: false }
        }));
        
        console.log(`[CatalogStore] Successfully cached ${data.length} products for key: ${key}`);
        return data;
      } catch (error) {
        console.error(`[CatalogStore] ❌ Error fetching products for key: ${key}`, error);
        set((state) => ({
          loading: { ...state.loading, [key]: false }
        }));
        throw error;
      } finally {
        inflightRequests.delete(key);
      }
    })();
    
    inflightRequests.set(key, promise);
    return promise;
  },

  findProductBySlug: (slug: string) => {
    const { products, productDetails, CACHE_TTL } = get();

    // Prefer full detail cache first when available and fresh
    const cachedDetail = productDetails.get(slug);
    if (cachedDetail && Date.now() - cachedDetail.timestamp < CACHE_TTL) {
      console.log(`[CatalogStore] Found product detail by slug in cache: ${slug}`);
      return cachedDetail.data;
    }
    
    // Search through all cached product lists
    for (const cacheEntry of products.values()) {
      const found = cacheEntry.data.find((p) => p.slug === slug);
      if (found) {
        console.log(`[CatalogStore] Found product by slug in cache: ${slug}`);
        return found;
      }
    }
    
    console.log(`[CatalogStore] Product not found in cache by slug: ${slug}`);
    return null;
  },

  getProductDetailBySlug: (slug: string) => {
    const { productDetails, CACHE_TTL } = get();
    const cached = productDetails.get(slug);
    if (!cached) return null;
    if (Date.now() - cached.timestamp >= CACHE_TTL) return null;
    return cached.data;
  },

  cacheProductDetail: (product: Product) => {
    if (!product?.slug) return;
    set((state) => ({
      productDetails: new Map(state.productDetails).set(product.slug, {
        data: product,
        timestamp: Date.now(),
      }),
    }));
  },

  getAllCachedProducts: () => {
    const { products } = get();
    const dedupMap = new Map<number, Product>();
    
    // Flatten all cached lists, deduplicate by ID
    for (const cacheEntry of products.values()) {
      for (const product of cacheEntry.data) {
        dedupMap.set(product.id, product);
      }
    }
    
    return Array.from(dedupMap.values());
  },

  clearCache: () => {
    console.log('[CatalogStore] Clearing all caches');
    set({ products: new Map(), productDetails: new Map(), loading: {} });
  },

  isCacheFresh: (key: string) => {
    const { products, CACHE_TTL } = get();
    const cached = products.get(key);
    
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_TTL;
  },

  prefetchProductDetail: (slug: string) => {
    const { productDetails, CACHE_TTL } = get();
    
    // Check if already cached and fresh
    const cached = productDetails.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[CatalogStore] Product detail already cached and fresh: ${slug}`);
      return;
    }
    
    // Prefetch in background (non-blocking)
    console.log(`[CatalogStore] Prefetching product detail: ${slug}`);
    productService.show(slug)
      .then((product) => {
        console.log(`[CatalogStore] Prefetch complete for: ${slug}`);
        get().cacheProductDetail(product);
      })
      .catch((error) => {
        console.warn(`[CatalogStore] Prefetch failed for ${slug}:`, error);
      });
  },
}));

export default useCatalogStore;
