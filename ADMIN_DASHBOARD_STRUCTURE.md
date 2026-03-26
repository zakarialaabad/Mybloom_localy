# Admin Dashboard Structure - Comprehensive Analysis

## 1. ADMIN PAGES & ROUTES

### Located: `frontend/app/admin/dashboard/`

```
/admin/dashboard/
├── page.tsx                          [Main dashboard home]
│   Route: /admin/dashboard
│   Type: Dashboard summary with widgets
│   Status: **MONOLITHIC** (675+ lines currently edited)
│   Components: Revenue, Orders, Customers inline
│
├── orders/
│   ├── page.tsx                      [Orders list]
│   │   Route: /admin/dashboard/orders
│   │   Type: List view with table, search, pagination
│   │   Status: **MONOLITHIC** (800+ lines)
│   │   Features: Status filtering, order details sidebar, stats
│   │   Imported: OrderDetailsSidebar component
│   │
│   └── components/
│       └── OrderDetailsSidebar.tsx   [Shared component - order details panel]
│
├── products/
│   ├── page.tsx                      [Products list]
│   │   Route: /admin/dashboard/products
│   │   Type: List view with table, search, pagination, stock status
│   │   Status: **MONOLITHIC** (700+ lines)
│   │   Features: Virtual stock system, inline status computation
│   │   Stock thresholds: LOW_STOCK_THRESHOLD = 10
│   │
│   ├── add/
│   │   └── page.tsx                  [Add product form]
│   │       Route: /admin/dashboard/products/add
│   │       Type: Form page (creation)
│   │       Status: **MONOLITHIC** (1200+ lines)
│   │       Features: Multi-section form with icons, toggles
│   │       Sections: Details, Images, Variants, Ingredients, FAQs, Reviews
│   │
│   ├── new/                          [Appears empty - alternate route?]
│   │   └── (empty folder)
│   │
│   ├── [id]/
│   │   └── edit/
│   │       └── page.tsx              [Edit product form]
│   │           Route: /admin/dashboard/products/[id]/edit
│   │           Type: Form page (editing existing)
│   │           Status: **MONOLITHIC** (similar structure to add/)
│   │           Features: Load product data, edit all sections
│   │
│
├── reviews/
│   ├── page.tsx                      [Reviews management]
│   │   Route: /admin/dashboard/reviews
│   │   Type: List view with toggle between reviews/feedback
│   │   Status: **MONOLITHIC** (uses dynamic import for modal)
│   │   Features: Star ratings, stats, approval system
│   │
│   └── components/
│       └── ReviewEditorModal.tsx     [Shared modal component - edit review]
│
├── coupons/
│   ├── page.tsx                      [Coupons list]
│   │   Route: /admin/dashboard/coupons
│   │   Type: List view with table, search, filters
│   │   Status: **MONOLITHIC** (600+ lines)
│   │   Features: Status filtering (all, active, expired, exhausted)
│   │
│   ├── create/
│   │   └── page.tsx                  [Create coupon]
│   │       Route: /admin/dashboard/coupons/create
│   │       Type: Form page (creation)
│   │       Status: **MONOLITHIC** (300+ lines)
│   │       Fields: Code, Type, Value, Dates, Usage limit
│   │
│   └── [id]/
│       └── edit/
│           └── page.tsx              [Edit coupon]
│               Route: /admin/dashboard/coupons/[id]/edit
│               Type: Form page (editing)
│
├── banners/
│   └── page.tsx                      [Homepage banners management]
│       Route: /admin/dashboard/banners
│       Type: Multi-slot upload interface
│       Status: **MONOLITHIC** (400+ lines)
│       Features: 4 homepage slots, drag-drop upload
│
├── settings/
│   └── page.tsx                      [Admin profile & password settings]
│       Route: /admin/dashboard/settings
│       Type: Settings form
│       Status: **MONOLITHIC** (400+ lines)
│       Sections: Profile info, image upload, password change
│
└── layout.tsx                        [Dashboard layout wrapper]
    Shared header, sidebar, routing container
```

---

## 2. SHARED COMPONENTS

### Location: `frontend/components/admin/`

Currently **MINIMAL** - Only 1 component:

```
components/admin/
└── ReviewEditorModal.tsx            [Modal for editing reviews]
    - Used in: reviews/page.tsx
    - Type: Modal dialog (dynamically imported)
    - Purpose: Inline editing of review details
```

### Other Shared Components Used:
Located in `frontend/components/`:

```
components/
├── OrderDetailsSidebar.tsx          [Order details panel]
│   - Used in: orders/page.tsx
│   - Displays: Order status, items, customer info, totals
│
├── CartDrawer.tsx                   [Not admin - customer feature]
├── layout/                          [Layout components]
├── ui/                              [Generic UI components]
└── other shared components...
```

### Components Within Individual Pages:

Pages tend to define **inline components** rather than extract them:

- **Dashboard page**: Revenue widget, status helpers (getStatusStyle, getStatusDot)
- **Orders page**: Status badge classes, initials generator, inline helpers
- **Products page**: Stock status component (LOW_STOCK_THRESHOLD logic)
- **Coupons page**: Formatters and status helpers
- **Product forms**: Multiple sections (Card, ToggleRow, IngredientCircle) defined inline

---

## 3. API SERVICE STRUCTURE

### Location: `frontend/services/api.ts`

#### Configuration:
- **Base URL**: `process.env.NEXT_PUBLIC_API_URL`
- **Auth Method**: Sanctum cookies with Bearer token injection
- **Request Interceptor**: Reads `admin_token` cookie, injects as `Authorization: Bearer`
- **Response Interceptor**: 401 → redirect to `/admin/login`
- **Timeout**: 15 seconds

#### Admin Services:

```typescript
// ── Admin Authentication ──────────────────────────────────────────
adminAuthService
├── login(email, password)        → { token, admin }
├── logout()                      → void
└── me()                          → { id, email }

// ── Admin Products ────────────────────────────────────────────────
adminProductService
├── list(params?, signal?)        → { data: AdminProduct[], meta }
├── get(id)                       → AdminProductDetail
└── destroy(id)                   → void

// ── Admin Categories & Types ──────────────────────────────────────
adminCategoryService
└── list()                        → { id, name, slug }[]

adminProductTypeService
└── list()                        → { id, name, slug }[]

// ── Admin Orders ───────────────────────────────────────────────────
adminOrderService
├── list(params?)                 → { data: AdminOrder[], meta }
├── get(orderId)                  → AdminOrderFull
├── stats()                       → AdminOrderStats
└── updateStatus(orderId, status) → void

// ── Admin Reviews ──────────────────────────────────────────────────
adminReviewService
├── list(params?)                 → { data: AdminReview[], meta }
├── stats()                       → AdminReviewStats
├── create(payload)               → AdminReview
├── update(id, payload)           → AdminReview
├── approve(id)                   → void
├── reject(id)                    → void
└── destroy(id)                   → void

// ── Admin Coupons ──────────────────────────────────────────────────
adminCouponService
├── list(params?)                 → { data: AdminCoupon[], meta }
├── get(id)                       → AdminCoupon
├── stats()                       → AdminCouponStats
├── create(payload)               → AdminCoupon
├── update(id, payload)           → AdminCoupon
└── destroy(id)                   → void

// ── Admin Banners ──────────────────────────────────────────────────
adminBannerService
├── list()                        → Banner[]
├── store(formData)               → Banner
├── update(id, formData)          → Banner
└── destroy(id)                   → void

// ── Admin Profile ──────────────────────────────────────────────────
adminProfileService
├── getProfile()                  → any
├── updateProfile(formData)       → any
└── changePassword(payload)       → any

// ── Dashboard ──────────────────────────────────────────────────────
dashboardService
└── get()                         → DashboardData
    ├── summary: { revenue, trend, orders, etc }
    ├── sales_chart: { labels, values }
    ├── top_customers: DashboardCustomer[]
    └── recent_orders: DashboardOrder[]

// ── Generic Resource Helper ────────────────────────────────────────
resourceService
├── list<T>(resource, params?)    → { data: T[], meta }
├── get<T>(resource, id)          → T
├── create<T>(resource, payload)  → T
├── update<T>(resource, id, payload) → T
└── destroy(resource, id)         → void
```

#### Data Types (Admin):

```typescript
// Orders
AdminOrder | AdminOrderFull | AdminOrderItem | AdminOrderStats | AdminOrderMeta

// Products
AdminProduct | AdminProductDetail | AdminProductMeta

// Reviews
AdminReview | AdminReviewStats

// Coupons
AdminCoupon | AdminCouponStats

// Banners
Banner

// Generic
PaginatedResponse<T> | ApiValidationError
```

---

## 4. DATABASE MODELS

### Location: `backend/app/Models/`

```
Models/
├── Admin.php
│   Fields: id, email, password, created_at, updated_at
│   Relations: None (Authenticatable)
│
├── Product.php
│   Fields: id, brand_id, category_id, product_type_id, name, slug, subtitle,
│            description, ingredients, gender, price, original_price, stock,
│            is_active, is_featured, is_best_seller, is_gift, is_recommended,
│            created_at, updated_at, deleted_at (soft deletes)
│   Relations: BelongsTo(Brand, Category, ProductType)
│              HasMany(Variants, Images, Sizes, Reviews, FAQs)
│
├── Order.php
│   Fields: id, order_number, coupon_id, shipping_method_id, customer_name,
│            customer_phone, customer_email, shipping_address, shipping_city,
│            shipping_province, shipping_postal_code, subtotal, discount_amount,
│            shipping_cost, total, status, notes, admin_notes,
│            created_at, updated_at
│   Relations: HasMany(OrderItems, StatusHistories)
│              BelongsTo(Coupon, ShippingMethod)
│   Features: Auto-generates order_number on create
│
├── Review.php
│   Fields: id, product_id, order_number, reviewer_name, rating, body,
│            is_approved, approved_at, created_at, updated_at
│   Relations: BelongsTo(Product)
│              HasMany(ReviewImages)
│
├── Coupon.php
│   Fields: id, code, type ('percent'|'fixed'), value, min_order_amount,
│            usage_limit, used_count, expires_at, is_active,
│            created_at, updated_at
│   Helper Methods:
│     - isExpired() → bool
│     - isExhausted() → bool
│     - isUsable() → bool
│
├── Banner.php           [Marketing banners]
├── Brand.php            [Product brands]
├── Category.php         [Product categories]
├── OrderItem.php        [Order line items]
├── OrderStatusHistory.php [Order status tracking]
├── ProductFaq.php       [Product FAQs]
├── ProductImage.php     [Product images]
├── ProductSize.php      [Product sizes]
├── ProductType.php      [Product types]
├── ProductVariant.php   [Product variants]
├── ReviewImage.php      [Review images]
├── ShippingMethod.php   [Shipping options]
└── Ingredient.php       [Product ingredients]
```

---

## 5. PAGE ARCHITECTURE ANALYSIS

### **Overall Pattern: MONOLITHIC PAGES**

All admin dashboard pages follow a **monolithic architecture**:

#### Characteristics:

✗ **NOT Modular**: Each page contains 600-1200+ lines of code
✓ **Single File**: Page logic + UI + styling all in one file
✓ **Inline Components**: Helper components defined within page files
✓ **Direct API Calls**: Pages directly call API services
✓ **Local State Management**: useState for all data/UI state
✓ **Inline Utilities**: Helper functions (formatters, validators) defined in file

#### Example - Orders Page (`orders/page.tsx`):

```
600+ lines total:
├── 50 lines: Imports + type definitions
├── 100 lines: Helper functions (getStatusBadgeClass, getStatusDotClass, getInitials)
├── 80 lines: Constant definitions (VALID_STATUSES)
├── 350+ lines: Component logic (useState, useEffect, useCallback, event handlers)
└── 20 lines: JSX rendering (only the final 20%)
```

#### Page Categories:

**List Pages** (Orders, Products, Reviews, Coupons):
- Search/filter state
- Pagination state
- Table rendering with inline helpers
- Action buttons (edit, delete, view)
- Status computation/display
- ~600-800 lines each

**Form Pages** (Add Product, Edit Product, Create Coupon, Settings):
- Multiple form sections
- Image upload handlers
- Validation state
- Loading/saving states
- Dynamic section expansion
- ~300-1200 lines each

**Dashboard Page**:
- Widget components (inline)
- Chart data computation
- Summary statistics
- Recent items display
- ~800+ lines

### Why Monolithic?

1. **Simple State Flow**: Single component manages all related state
2. **Tight Coupling**: Direct API calls, no data layer abstraction
3. **Rapid Development**: Less file navigation needed during development
4. **Inline Utilities**: Helper functions only used in that page

### Impact:

✗ **Difficult to test**: Large component with many concerns
✗ **Hard to reuse**: Logic specific to page-level state
✗ **Bundle size**: All page code loaded at once
✗ **Maintenance**: Changes affect large file

---

## 6. API ENDPOINTS USED

### Admin Dashboard Endpoints:

```
Authentication:
POST   /v1/admin/auth/login       → { token, admin }
POST   /v1/admin/auth/logout      → void
GET    /v1/admin/auth/me          → { id, email }

Dashboard:
GET    /v1/admin/dashboard        → DashboardData

Products:
GET    /v1/admin/products         → { data, meta }
GET    /v1/admin/products/{id}    → AdminProductDetail
DELETE /v1/admin/products/{id}    → void

Orders:
GET    /v1/admin/orders           → { data, meta }
GET    /v1/admin/orders/{id}      → AdminOrderFull
GET    /v1/admin/orders/stats     → AdminOrderStats
PATCH  /v1/admin/orders/{id}/status → void

Reviews:
GET    /v1/admin/reviews          → { data, rating_summary }
GET    /v1/admin/reviews/stats    → AdminReviewStats
POST   /v1/admin/reviews          → AdminReview
PATCH  /v1/admin/reviews/{id}     → AdminReview
PATCH  /v1/admin/reviews/{id}/approve → void
PATCH  /v1/admin/reviews/{id}/reject → void
DELETE /v1/admin/reviews/{id}     → void

Coupons:
GET    /v1/admin/coupons          → { data, meta }
GET    /v1/admin/coupons/{id}     → AdminCoupon
GET    /v1/admin/coupons/stats    → AdminCouponStats
POST   /v1/admin/coupons          → AdminCoupon
PUT    /v1/admin/coupons/{id}     → AdminCoupon
DELETE /v1/admin/coupons/{id}     → void

Banners:
GET    /v1/admin/banners          → Banner[]
POST   /v1/admin/banners          → Banner
PUT    /v1/admin/banners/{id}     → Banner
DELETE /v1/admin/banners/{id}     → void

Categories & Types:
GET    /v1/admin/categories       → { id, name, slug }[]
GET    /v1/admin/product-types    → { id, name, slug }[]

Profile:
GET    /v1/admin/profile          → data
POST   /v1/admin/profile          → data
PUT    /v1/admin/profile/password → data
```

---

## 7. KEY FINDINGS & OBSERVATIONS

### Strengths:
✓ Clear separation between API service layer and UI pages
✓ Consistent API patterns across all resources
✓ Proper auth handling with request/response interceptors
✓ Good use of TypeScript interfaces for data typing
✓ Pagination, filtering, search implemented consistently

### Improvement Opportunities:
✗ Extract components from monolithic pages
✗ Create shared utilities/hooks (formatters, validators)
✗ Implement custom hooks (useOrders, useProducts, etc.)
✗ Extract form sections as separate components
✗ Better separation of concerns (business logic vs UI)
✗ Add component library for common patterns

### Architecture Recommendations:
1. **Extract Components**: Break pages into smaller, reusable components
2. **Create Hooks**: useDashboard, useOrders, useProducts hooks
3. **Separate Forms**: Create form components for each section
4. **Utilities Module**: Centralize formatters, validators, helpers
5. **Constants Module**: Extract magic numbers, status mappings

---

## 8. COMPONENT DEPENDENCY MAP

```
Dashboard Page
├── API: dashboardService
├── State: Summary, Charts, Customers, Orders (inline)
└── Utilities: getStatusStyle, getStatusDot (inline)

Orders Page
├── API: adminOrderService
├── Components: OrderDetailsSidebar (imported)
├── State: Orders, Stats, Filters, Search, Pagination (inline)
└── Utilities: getStatusBadgeClass, getInitials (inline)

Products Page
├── API: adminProductService, adminCategoryService, adminProductTypeService
├── State: Products, Categories, Types, Filters, Search, Pagination (inline)
└── Utilities: stockStatus, stockLabel, STATUS_META (inline)

Reviews Page
├── API: adminReviewService
├── Components: ReviewEditorModal (dynamic import)
├── State: Reviews, Stats, Filters, Modal, Pagination (inline)
└── Utilities: getInitials, formatDate (inline)

Coupons Page
├── API: adminCouponService
├── State: Coupons, Stats, Filters, Search, Pagination (inline)
└── Utilities: formatDate, isExpiredDate (inline)

Banners Page
├── API: adminBannerService
├── State: Banners by slot, Upload state (inline)
└── Utilities: Slot configuration constants

Settings Page
├── API: adminProfileService
├── State: Profile form, Password form, Image upload (inline)
└── Utilities: Password strength checker (inline)

Product Add/Edit
├── API: adminProductService, brandService, adminCategoryService, adminProductTypeService
├── Components: Card, ToggleRow, IngredientCircle (inline)
├── State: Form fields, Images, Variants, Reviews, FAQs (inline)
└── Utilities: Image entry types, review/faq types (inline)

ReviewEditorModal
├── Purpose: Edit review details in modal
└── Used by: reviews/page.tsx

OrderDetailsSidebar
├── Purpose: Display order details in sidebar
└── Used by: orders/page.tsx
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Total Pages** | 8 main pages + 5 sub-pages (edit/create) |
| **Architecture Pattern** | Monolithic |
| **Shared Components** | 2 (ReviewEditorModal, OrderDetailsSidebar) |
| **API Services** | 10 main services + generic resource helper |
| **Database Models** | 14 models (primary + supporting) |
| **Code Organization** | Page-level state + inline components/utilities |
| **State Management** | React hooks (useState, useEffect) |
| **Authentication** | Sanctum + Bearer token injection |
| **Data Types** | Properly typed with TypeScript interfaces |
| **Lines of Code** | 600-1200 per page (monolithic) |

