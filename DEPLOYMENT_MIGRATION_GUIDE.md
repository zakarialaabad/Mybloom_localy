# Deployment & Migration Guide

## 📋 Pre-Deployment Checklist

### Code Review:
- [x] All TypeScript files properly typed
- [x] No breaking changes to API contracts
- [x] Fallback behavior tested
- [x] Cache invalidation strategy documented

### Testing (Local Environment):
```bash
# 1. Test BestSellers cache
- Load home page
- Check browser console for "[CatalogStore] Cache HIT for featured:100"
- Navigate away and back
- Should see instant load

# 2. Test Collection page caching
- Go to collection page
- Apply filter (e.g., category = "Perfume")
- Check console for cache key: "collection:{...}"
- Apply same filter again
- Should see "[CatalogStore] Cache HIT"

# 3. Test Product detail from collection
- Go to collection
- Click on a product
- Product detail page loads
- Check console for "🚀 Found product in catalog cache"
- Should NOT see API call in Network tab

# 4. Test API fallback
- Go directly to product URL
- Check console for API call (not in cache initially)
- Should load with productService.show() fallback
```

---

## 🔄 Migration Strategy (Phased Rollout)

### **Stage 1: Internal Testing (Day 1)**
Deploy to local/development environment.

**Checklist**:
- [ ] Frontend build succeeds
- [ ] Backend caching works with Laravel cache driver
- [ ] All endpoints return correct data

**Commands**:
```bash
# Frontend
npm run build

# Backend
php artisan config:cache
php artisan cache:clear

# Test cache driver
php artisan tinker
# > Cache::put('test', 'value', 15);
# > Cache::get('test'); // "value"
```

---

### **Stage 2: Staging Environment (Day 2-3)**
Deploy to staging with production-like data volume.

**Deployment Steps**:

1. **Frontend Staging Deploy**:
```bash
# Build frontend
npm run build

# Deploy to staging CDN/server
# Verify: Base URL is production API endpoint
```

2. **Backend Staging Deploy**:
```bash
# Ensure cache driver is working
# If using Redis:
php artisan config:cache

# If using file cache:
php artisan cache:clear

# Start queue worker (if needed)
php artisan queue:work
```

3. **Environment Variables - Ensure Set**:
```env
# Frontend (.env.local or staging config)
NEXT_PUBLIC_API_URL=https://staging-api.yoursite.com

# Backend (.env)
CACHE_DRIVER=redis  # or 'file' or 'database'
CACHE_TTL=900       # 15 minutes in seconds
```

**Load Testing**:
```bash
# Simulate multiple users hitting endpoints
# Monitor:
# - API response times
# - Cache hit rate
# - Database load
# - Memory usage
```

---

### **Stage 3: Production Deployment (Day 4-5)**

#### **Pre-Production**:
```bash
# Create backup of existing cache state (if needed)
# Verify all code changes are in main branch
# Tag release: git tag v1.0.0-with-caching
```

#### **Backend Deployment** (First):
```bash
# 1. Pull latest code
git pull origin main

# 2. Install/update dependencies
composer install --no-dev

# 3. Cache config (ensures Cache facade works)
php artisan config:cache

# 4. Clear old cache state (safe to do)
php artisan cache:clear

# 5. Verify database connection still works
php artisan tinker
# > Health::check()
```

#### **Frontend Deployment** (After Backend Ready):
```bash
# 1. Build frontend
npm run build

# 2. Deploy to CDN/production server
# Wait for verification that:
# - /api calls are reaching new backend
# - Cache headers are correct

# 3. Smoke test in production
# - Load home page
# - Check Network tab for API calls
# - Hit same endpoints multiple times, verify caching
```

---

## ⚠️ Rollback Plan (If Issues Arise)

### **Frontend Rollback**:
```bash
# If caching behavior causes issues:
git checkout previous-tag frontend/
npm run build
# Deploy old version
```

### **Backend Rollback**:
```bash
# If cache driver causes issues:
git checkout previous-tag backend/
php artisan cache:clear
php artisan config:cache
```

### **Partial Rollback** (Keep cache, disable for specific endpoints):
```php
// In ProductController.php
// Temporarily disable cache for specific method
public function show($slug) {
    // Skip cache for debugging
    return ProductResource::make(
        Product::with([...])->whereSlug($slug)->firstOrFail()
    );
}
```

---

## 🔍 Monitoring After Deployment

### **Key Metrics to Watch**:

1. **Cache Hit Rate**:
   - Add logging to catalog.ts cache hits
   - Target: >70% hit rate after 1 hour user activity

2. **API Call Volume**:
   - Monitor daily/hourly API call count
   - Expected: 40-50% reduction from baseline

3. **Database Load**:
   - Monitor slow query log
   - Check `SHOW FULL PROCESSLIST` in MySQL
   - Expected: Fewer repeated identical queries

4. **Page Load Times**:
   - Measure Core Web Vitals (Largest Contentful Paint, First Input Delay)
   - Expected: 30-50% improvement

5. **Cache Memory Usage**:
   - If using Redis: `redis-cli INFO memory`
   - If using file cache: Monitor `/storage/framework/cache` size

### **Alerting**:
```
Set alerts for:
- API error rate > 5%
- Cache driver connection failures
- Unusual database query counts
- Memory usage spike (>80%)
```

---

## 🧪 Validation Tests Post-Deployment

### **Test 1: Basic Cache Functionality**
```javascript
// In browser console on production
// Check catalog cache exists
localStorage.getItem('catalog-store') // Should have data

// Check Network tab - do NOT see duplicate /api/v1/products?is_featured=true calls
```

### **Test 2: Home Page Performance**
```
1. Open incognito window (fresh cache)
2. Navigate to /
3. Measure time to render BestSellers
4. Wait 5 seconds
5. Go to /collection then back to /
6. BestSellers should render FASTER (from cache)
```

### **Test 3: Collection Filtering**
```
1. Go to /collection
2. Filter by category = "Perfume"
3. Wait for results, check Network tab
4. Clear filters
5. Filter by category = "Perfume" again
6. Should NOT see API call (cache hit)
```

### **Test 4: Product Detail from Collection**
```
1. Go to /collection
2. Click any product
3. Check Network tab - should NOT see GET /api/v1/products/{slug}
4. Product detail should load from catalog cache
```

### **Test 5: Cache Expiration**
```
1. Load home page, capture timestamp
2. Wait 15 minutes
3. Refresh page
4. Should see fresh API call (cache expired)
5. Featured product list updates as expected
```

---

## 📊 Expected Results Post-Deployment

### **Within First Hour**:
- ✅ BestSellers loads on second home visit (instant)
- ✅ Collection filters cached per combination
- ✅ Product details load without extra API calls

### **Within First Day**:
- ✅ API call volume down 40-50%
- ✅ Average page load time reduced 30%
- ✅ Database query count reduced 50%
- ✅ No error rates spike

### **After 1 Week**:
- ✅ Cache hit rate stabilizes at 60-75%
- ✅ Peak hour API load reduced significantly
- ✅ User session times faster
- ✅ Cost reduction (database, API calls)

---

## 🚨 Troubleshooting Common Issues

### **Issue 1: "Cache driver not working"**
```
Error: Cache directory not writable
Solution:
- If using file cache: chmod -R 775 storage/framework/cache
- If using Redis: Verify Redis is running and accessible
- Check env variable: CACHE_DRIVER=redis (or 'file')
```

### **Issue 2: "Products showing stale data"**
```
Error: Product detail shows old price/info
Solution:
- Might be 15-min cache TTL too long
- Reduce to 5 min: $cacheTTL = 5 in ProductController.php
- For admin updates: Immediately cache invalidation
  useCatalogStore.setState({ products: new Map() });
```

### **Issue 3: "Cache memory growing unbounded"**
```
Error: Redis/file cache size keeps increasing
Solution:
- Cache should auto-expire after TTL
- Check: Is cache driver properly deleting expired entries?
- If using file cache: run `php artisan cache:clear` periodically
- If using Redis: set maxmemory policy (allkeys-lru)
```

### **Issue 4: "Products not updating for editors"**
```
Error: Admin edits product, frontend shows old version
Solution:
- Admin edit should clear cache:
  Cache::forget('products:*');
  useCatalogStore.setState({ products: new Map() });
- Implement webhook or event listener for immediate cache clear
```

---

## 🔄 Zero-Downtime Deployment

### **Recommended Approach**:

1. **Deploy Backend First** (in background):
   - Backend v2 starts serving alongside v1
   - Old clients connect to v1, new clients to v2
   - Gradual traffic migration

2. **Requests Flow**:
   ```
   Browser (old code) → Load balancer → Backend v1 (still works)
   Browser (new code) → Load balancer → Backend v2 (with cache)
   ```

3. **Frontend Deploy** (after backend stable):
   - CDN starts serving new JS bundle
   - Existing page sessions continue (old code)
   - New page loads use new code (with cache integration)

4. **Full Migration**: ~15-30 minutes

---

## 📞 Support Contacts

For issues during/after deployment:

- **Frontend Issues**: Check browser console for cache errors
- **Backend Issues**: Check Laravel logs at `storage/logs/laravel.log`
- **Cache Issues**: Verify cache driver with `php artisan tinker`
- **Database Issues**: Monitor slow query log

---

## ✨ Success Criteria

Deployment successful if:

- [ ] No increase in error rates post-deployment
- [ ] API call volume reduced by 40%+
- [ ] Page load times improved by 30%+
- [ ] Cache hit rate > 60% after 2 hours
- [ ] No data freshness issues (products updating as expected)
- [ ] All core user journeys work (home→collection→product)

---

## 🎯 Next Steps After Successful Deployment

1. **Monitor metrics for 1 week**
2. **Gather feedback from customer base**
3. **Plan Phase 3**: Backend query optimization (product/show endpoint)
4. **Plan Phase 4**: Prefetching on hover for even faster perception
5. **Plan Phase 5**: Aggregates optimization (price ranges, brand counts)

