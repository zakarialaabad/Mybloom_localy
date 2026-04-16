# Cache System - Quick Reference & Maintenance

## 🎯 Essential Commands

### **View Cache State** (Browser Console):
```javascript
// See all cached products and their metadata
useCatalogStore.getState().products

// Get specific cache entry
useCatalogStore.getState().products.get('featured:100')

// Get all products flattened (deduped)
useCatalogStore.getState().getAllCachedProducts()

// Check if specific cache is fresh
useCatalogStore.getState().isCacheFresh('collection:{...}')
```

### **Manual Cache Operations**:
```javascript
// Clear all cache
useCatalogStore.setState({ products: new Map() })

// Clear specific key only
const state = useCatalogStore.getState();
state.products.delete('featured:100');

// Force prefetch specific data
useCatalogStore.getState().ensureProducts('featured:100', { is_featured: true })

// Get current cache hits meter
console.log(useCatalogStore.getState().products.size, 'cache entries')
```

### **Backend Cache Commands**:
```bash
# Clear all cache
php artisan cache:clear

# Clear specific cache key
php artisan tinker
# > Cache::forget('products:*');

# Check what's cached
php artisan tinker
# > Cache::store('redis')->get('products:...')

# Monitor Redis cache
redis-cli
# > KEYS "products:*"
# > TTL "products:abc123"
```

---

## 🚀 Adding Cache to New Endpoints

### **Example: Adding cache to new "Trending" endpoint**

1. **Frontend: Update Collection page or Create new component**:
```typescript
import useCatalogStore from '@/store/catalog';

export default function TrendingSection() {
  const ensureProducts = useCatalogStore((s) => s.ensureProducts);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Use cache for trending products
    ensureProducts('trending:20', { is_trending: true, limit: 20 })
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to load trending:', err));
  }, [ensureProducts]);

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

2. **Backend: Add cache to new endpoint**:
```php
// In ProductController.php
public function trending(Request $request)
{
    $cacheKey = 'products:trending:' . md5(json_encode($request->query()));
    $cacheTTL = 15; // minutes
    
    $products = Cache::remember($cacheKey, now()->addMinutes($cacheTTL), function () {
        return Product::where('is_trending', true)
            ->where('is_active', true)
            ->limit(20)
            ->get();
    });
    
    return ProductResource::collection($products);
}
```

3. **Result**:
- ✅ First fetch → API call
- ✅ Subsequent calls within 15 min → cached
- ✅ Automatically integrated with `getAllCachedProducts()`

---

## 🔄 Invalidating Cache on Admin Updates

### **Pattern 1: After Product Edit** (Quick fix):
```php
// In your product update endpoint
public function update(Request $request, Product $product)
{
    $product->update($request->validated());
    
    // Invalidate cache
    Cache::forget('products:*'); // Clear all product caches
    
    return response()->json(['message' => 'Updated']);
}
```

### **Pattern 2: More Granular** (Recommended):
```php
// Only clear affected caches
public function update(Request $request, Product $product)
{
    $oldPrice = $product->price;
    $product->update($request->validated());
    
    // Invalidate specific cache keys
    if ($product->wasChanged('is_featured')) {
        Cache::forget('products:' . md5(json_encode(['is_featured' => 1])));
    }
    
    if ($product->wasChanged('category_id')) {
        // Clear collection filters for this category
        Cache::forget('products:' . md5(json_encode(['category_id' => $product->category_id])));
    }
    
    // Also clear frontend cache
    event(new ProductUpdated($product));
    
    return response()->json(['message' => 'Updated']);
}
```

### **Pattern 3: Event Listener** (Best Practice):
```php
// app/Events/ProductUpdated.php
class ProductUpdated
{
    public function __construct(public Product $product) {}
}

// app/Listeners/InvalidateProductCache.php
class InvalidateProductCache
{
    public function handle(ProductUpdated $event)
    {
        // Clear all product-related caches
        Cache::tags(['products'])->flush();
    }
}

// app/Http/Controllers/Api/V1/ProductController.php
public function update(Request $request, Product $product)
{
    $product->update($request->validated());
    event(new ProductUpdated($product)); // Cache auto-invalidates
}
```

---

## 📊 Monitoring Cache Performance

### **Browser DevTools** (Developer Experience):

1. **Network Tab**:
   - Watch for repeated GET calls
   - Same URL called = cache miss opportunity
   - No GET call = cache hit ✅

2. **Console Logs**:
   ```
   [CatalogStore] Cache HIT for featured:100
   [CatalogStore] Cache MISS for featured:100 - fetching from API
   ```

3. **Performance Tab**:
   - Compare page load time on first visit vs second
   - Second visit should be 3-5x faster if cache working

### **Server Monitoring** (DevOps):

1. **Laravel**:
   ```bash
   # Check cache driver
   php artisan config:show cache
   
   # Monitor cache hits in logs
   tail -f storage/logs/laravel.log | grep Cache
   ```

2. **Redis** (if using Redis cache):
   ```bash
   redis-cli INFO stats
   # Look for: hits, misses ratio
   
   redis-cli --bigkeys
   # Identify large cached objects
   ```

3. **Database Query Log**:
   ```sql
   -- MySQL slow query log (if 15+ min caches working)
   SET @@GLOBAL.slow_query_log = 'ON';
   -- Should see significantly fewer product list queries
   ```

---

## 🛠️ Maintenance Tasks

### **Daily**:
- Monitor API error rates in production
- Check database query count (should be stable)

### **Weekly**:
- Review cache hit rate metrics
- Check for stale product data reports
- Monitor memory usage (if using Redis)

### **Monthly**:
- Analyze cache effectiveness
  ```bash
  # Generate report
  php artisan cache:clear --measurement
  ```
- Plan cache TTL adjustments if needed
- Review for new optimization opportunities

### **On-Demand** (When Issues Arise):
```bash
# Clear cache immediately
php artisan cache:clear

# Restart cache service
systemctl restart redis-server # or your cache service

# Verify cache driver is working
php artisan tinker
# > Cache::put('test', 'value', 5);
# > Cache::get('test');
```

---

## 💡 Optimization Tips

### **Tip 1: Cache Key Strategy**
Good cache keys are:
- ✅ Consistent: Same filters → same key
- ✅ Minimal: Only include relevant params
- ✅ Readable: Can debug from key name

```typescript
// BAD - includes timestamps (cache never hits)
`collection:${new Date().getTime()}:${params}`

// GOOD - stable across identical filters
`collection:${JSON.stringify(sortedParams)}`
```

### **Tip 2: Cache TTL Tuning**
- Static data (brands, categories): 30+ min
- Frequently-updated (products): 10-15 min
- Highly-variable: 5 min or no cache

```php
// Adjust per endpoint
Cache::remember($key, now()->addMinutes(30), ...) // Static data
Cache::remember($key, now()->addMinutes(15), ...) // Products
Cache::remember($key, now()->addMinutes(5), ....) // Trending
```

### **Tip 3: Memory Management**
Prevent cache bloat:
```php
// Limit cache size in Redis
# In redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru

// Or: Auto-clear old entries
$maxAge = now()->subHours(2);
Cache::tags(['products'])->flush(); // Periodic cleanup
```

### **Tip 4: Cache Warming** (Optional future enhancement)
Pre-populate cache on server restart:
```php
// In AppServiceProvider::boot()
if (app()->isProduction()) {
    // Pre-warm popular queries
    Cache::remember('products:featured', ..., fn() => 
        Product::where('is_featured', true)->get()
    );
}
```

---

## 🐛 Debugging Checklist

### **"Cache not working"**:
- [ ] Is cache driver running? (`ps aux | grep cache-service`)
- [ ] Does cache directory exist? (`ls storage/framework/cache`)
- [ ] Permissions correct? (`chmod 775 storage/framework`)
- [ ] Cache facade imported? (`use Illuminate\Support\Facades\Cache;`)
- [ ] TTL syntax valid? (`now()->addMinutes(15)`)

### **"Getting stale data"**:
- [ ] Check TTL - is it too long?
- [ ] Is cache being invalidated on updates?
- [ ] Check browser cache (disable if testing)
- [ ] Clear frontend cache: `useCatalogStore.setState({ products: new Map() })`

### **"Cache missing entries"**:
- [ ] Check cache key consistency
- [ ] Verify API response is cached (check Network tab)
- [ ] Ensure no cache clear operations running
- [ ] Check cache memory isn't full (`redis-cli INFO memory`)

---

## 📖 File Locations Quick Reference

```
Frontend Cache System:
├── frontend/store/catalog.ts ..................... Main cache store
├── frontend/components/sections/BestSellers.tsx . Cache integration
├── frontend/app/collection/page.tsx ............. Dynamic cache keys
└── frontend/app/product/[slug]/page.tsx ......... Smart lookup pattern

Backend Cache System:
├── backend/app/Http/Controllers/Api/V1/ProductController.php
└── backend/.env (CACHE_DRIVER=redis or file)

Configuration:
├── backend/.env (CACHE_TTL=900)
├── config/cache.php (Laravel cache config)
└── redis.conf (if using Redis)

Documentation:
├── OPTIMIZATION_IMPLEMENTATION_COMPLETE.md (This module)
├── DEPLOYMENT_MIGRATION_GUIDE.md (How to deploy)
└── CACHE_MAINTENANCE_QUICK_REFERENCE.md (This file)
```

---

## 🎓 Training for New Team Members

**What they need to know**:

1. **How cache works** (5 min):
   - Products fetched from API
   - Stored in-memory (RAM) with timestamp
   - Same request within 15 min uses cached copy
   - Cache expires automatically after TTL

2. **Where to look for issues** (10 min):
   - Frontend: `frontend/store/catalog.ts`
   - Backend: `ProductController.php` Cache usage
   - Config: `.env` CACHE_DRIVER setting

3. **How to debug** (10 min):
   - Browser console: Check for cache hits/misses
   - Network tab: Should see fewer API calls
   - Laravel logs: `storage/logs/laravel.log`
   - Redis CLI: `redis-cli KEYS '*'`

4. **Common tasks**:
   - Clear cache: `php artisan cache:clear`
   - Check status: `php artisan tinker` then `Cache::get('key')`
   - Add to new endpoint: Copy pattern from `BestSellers.tsx`

---

## ✅ Pre-Production Checklist

Before going to production:
- [ ] All cache keys are consistent (no timestamps)
- [ ] TTL values tested and tuned
- [ ] Cache invalidation strategy in place
- [ ] Monitoring dashboards set up
- [ ] Rollback plan documented
- [ ] Team trained on system
- [ ] Performance tests passed
- [ ] Error handling tested (cache driver down)

---

**Need Help?** Reference sections:
- **"How do I..."** with cache → See "Essential Commands"
- **"Endpoint X isn't cached"** → "Adding Cache to New Endpoints"
- **"Cache showing stale data"** → "Debugging Checklist"
- **"Deploy to production"** → See `DEPLOYMENT_MIGRATION_GUIDE.md`

