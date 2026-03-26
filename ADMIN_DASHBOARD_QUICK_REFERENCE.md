# Admin Dashboard - Quick Reference Guide

## File Tree with Line Counts

```
frontend/app/admin/dashboard/
├── layout.tsx                              (Layout wrapper)
├── page.tsx                                (Dashboard home) ~800 lines
│
├── orders/
│   ├── page.tsx                            (Orders list) ~650 lines
│   └── components/
│       └── OrderDetailsSidebar.tsx         (Order details panel)
│
├── products/
│   ├── page.tsx                            (Products list) ~700 lines
│   ├── add/
│   │   └── page.tsx                        (Add product) ~1200 lines
│   ├── new/                                (Empty folder)
│   └── [id]/
│       └── edit/
│           └── page.tsx                    (Edit product) ~1200 lines
│
├── reviews/
│   ├── page.tsx                            (Reviews list) ~800 lines
│   └── components/
│       └── ReviewEditorModal.tsx           (Edit modal)
│
├── coupons/
│   ├── page.tsx                            (Coupons list) ~600 lines
│   ├── create/
│   │   └── page.tsx                        (Create coupon) ~300 lines
│   └── [id]/
│       └── edit/
│           └── page.tsx                    (Edit coupon)
│
├── banners/
│   └── page.tsx                            (Banners management) ~400 lines
│
└── settings/
    └── page.tsx                            (Admin settings) ~400 lines
```

---

## Quick Route Reference

| Route | Purpose | Type |
|-------|---------|------|
| `/admin/dashboard` | Main dashboard | Dashboard |
| `/admin/dashboard/orders` | View/manage orders | List |
| `/admin/dashboard/orders/[id]` | View order detail (sidebar) | Detail view |
| `/admin/dashboard/products` | View/manage products | List |
| `/admin/dashboard/products/add` | Create new product | Form |
| `/admin/dashboard/products/[id]/edit` | Edit existing product | Form |
| `/admin/dashboard/reviews` | Manage reviews | List |
| `/admin/dashboard/coupons` | Manage coupons | List |
| `/admin/dashboard/coupons/create` | Create new coupon | Form |
| `/admin/dashboard/coupons/[id]/edit` | Edit coupon | Form |
| `/admin/dashboard/banners` | Manage homepage banners | Slots |
| `/admin/dashboard/settings` | Profile & password settings | Settings |

---

## API Services Quick Map

### Import Pattern:
```typescript
import {
  adminOrderService,
  adminProductService,
  adminReviewService,
  adminCouponService,
  adminBannerService,
  adminProfileService,
  dashboardService,
  adminCategoryService,
  adminProductTypeService,
  brandService,
} from '@/services/api';
```

### Common Patterns:

#### List Data with Pagination:
```typescript
const { data: items, meta } = await adminXyzService.list(params);
// meta: { current_page, last_page, per_page, total }
```

#### Get Single Item:
```typescript
const item = await adminXyzService.get(id);
```

#### Create Item:
```typescript
const newItem = await adminXyzService.create(payload);
```

#### Update Item:
```typescript
const updated = await adminXyzService.update(id, payload);
```

#### Delete Item:
```typescript
await adminXyzService.destroy(id);
```

#### Get Stats:
```typescript
const stats = await adminXyzService.stats();
```

---

## Component Structure

### Shared Components (frontend/components/admin/):

**ReviewEditorModal.tsx**
- Used in: `reviews/page.tsx`
- Props: Modal open/close state, review data
- Features: Edit review, submit

**OrderDetailsSidebar.tsx**
- Used in: `orders/page.tsx`
- Props: Order ID or order data
- Features: Display order items, customer info, shipping, totals

### Inline Page Components:

**Dashboard Page**:
- `RevenueIcon()`, `OrdersIcon()`, etc. (SVG icons)

**Orders Page**:
- Status helpers (getStatusBadgeClass, getStatusDotClass)
- Inline table rendering

**Products Page**:
- Stock status helpers
- Table rendering with images

**Product Add/Edit**:
- `Card` component (wrapper)
- `ToggleRow` component (toggle switches)
- `IngredientCircle` component (ingredient display)
- Multiple form sections

**Coupons Page**:
- Status and expiry helpers
- Coupon badge rendering

---

## Database Model Relationships

### Primary Models Used in Admin:

```
Product
├── belongsTo Brand
├── belongsTo Category
├── belongsTo ProductType
├── hasMany Variants
├── hasMany Images
├── hasMany Sizes
└── hasMany Reviews

Order
├── belongsTo Coupon (optional)
├── belongsTo ShippingMethod
├── hasMany OrderItems
│   └── belongsTo Product (via OrderItem)
└── hasMany OrderStatusHistories

Review
├── belongsTo Product
└── hasMany ReviewImages

Coupon
└── hasMany Orders (implied)

Admin
└── No relations (just auth user)
```

---

## Form Sections Structure

### Product Add/Edit Page Sections:

1. **Details Card** (Details Icon)
   - Name, Slug, Subtitle
   - Description (textarea)
   - Gender selector (Face, Hair, Body, Home icons)

2. **Images Card** (Camera Icon)
   - Primary image upload
   - Additional images gallery
   - Drag & drop support

3. **Tags Card** (Tag Icon)
   - Category selector
   - Brand selector
   - Product Type selector

4. **Pricing Card** (settings expected)
   - Price, Original Price
   - Active/Featured toggles

5. **Variants Card**
   - Size, Price, Stock
   - Add/Remove variants

6. **Ingredients Card** (Leaf Icon)
   - Ingredient circles (add/edit/remove)

7. **FAQs Card** (Chat Icon)
   - Question/Answer pairs

8. **Reviews Card** (Star Icon)
   - Display existing reviews
   - Edit/Delete options

### Coupon Create/Edit Sections:

1. **Basic Info**
   - Code (required)
   - Campaign name
   - Promo type dropdown

2. **Discount Settings**
   - Discount type (Percent / Fixed)
   - Discount value

3. **Duration**
   - Start date
   - End date (expires_at)

4. **Limits**
   - Max uses (usage_limit)

---

## Filter & Search Patterns

### Orders Page:
- Search: Order number, customer name, email, phone
- Filter: Status (6 options: pending, confirmed, preparing, shipped, delivered, cancelled)
- Sort: Implicit (by creation date)

### Products Page:
- Search: Product name
- Filter: None (virtual stock status computed client-side)
- Sort: Implicit (by creation date)

### Reviews Page:
- View toggle: 'reviews' | 'feedback'
- Filter: None (implicit in view)
- Rating filter: None (displayed in stats)

### Coupons Page:
- Search: Coupon code
- Filter: Status (all, active, expired, exhausted, usable)
- Expiry badges: Automatically checked

---

## Page State Patterns

### List Pages (Orders, Products, Reviews, Coupons):

```typescript
// Data
const [items, setItems] = useState<Item[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [stats, setStats] = useState<Stats | null>(null);

// Filters & Search
const [search, setSearch] = useState('');
const [statusFilter, setStatusFilter] = useState('all');

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const itemsPerPage = 15; // Typical

// UI
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
const [showModal, setShowModal] = useState(false);

// Loading
const [isDeleting, setIsDeleting] = useState(false);
const [isUpdating, setIsUpdating] = useState(false);
```

### Form Pages (Add/Edit Product, Create/Edit Coupon):

```typescript
// Form state (varies by form)
const [formData, setFormData] = useState<FormData>({...initialData});

// Loading
const [isSaving, setIsSaving] = useState(false);
const [isLoading, setIsLoading] = useState(true);

// Errors & messages
const [error, setError] = useState('');
const [message, setMessage] = useState<{type, text} | null>(null);

// Upload
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

---

## Common Utilities by Page

### Dashboard Page:
- `getStatusStyle(status)` → CSS class
- `getStatusDot(status)` → CSS class for colored dot

### Orders Page:
- `getStatusBadgeClass(status)` → CSS class
- `getStatusDotClass(status)` → CSS class
- `getInitials(name)` → Avatar initials

### Products Page:
- `stockStatus(stock)` → 'active' | 'low_stock' | 'inactive'
- `stockLabel(stock)` → { text, cls }
- `STATUS_META` lookup table

### Reviews Page:
- `getInitials(name)` → Avatar initials
- `formatDate(iso)` → Formatted date string

### Coupons Page:
- `formatDate(iso)` → Formatted date string
- `isExpiredDate(iso)` → Boolean

### Settings Page:
- Password strength validation
- Form validation helpers

---

## Constants & Thresholds

```typescript
// Products page
LOW_STOCK_THRESHOLD = 10
ITEMS_PER_PAGE = 15

// Review types
type ReviewStatus = 'pending' | 'approved' | 'rejected'

// Order statuses (VALID_STATUSES in orders/page.tsx)
VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']

// Coupon types
COUPON_TYPES = ['percent', 'fixed']

// Coupon statuses (computed)
'all' | 'active' | 'expired' | 'exhausted' | 'usable'

// Banners
HOMEPAGE_POSITIONS = [1, 2, 3, 4]

// Product gender (UI icons)
GENDER_OPTIONS = ['men', 'women', 'unisex']
```

---

## Authentication Flow

```typescript
// Login
const { token, admin } = await adminAuthService.login(email, password);
// Token automatically set in cookie by frontend
// Request interceptor will inject Bearer token

// Subsequent requests
// Interceptor reads cookie → adds Authorization header
// Backend validates token

// Logout
await adminAuthService.logout();
// Frontend removes cookie
// Backend invalidates token

// 401 Response
// Response interceptor removes cookie
// Redirects to /admin/login
```

---

## Pagination Pattern

```typescript
// List endpoint returns:
{
  data: Item[],
  meta: {
    current_page: number,
    last_page: number,
    per_page: number,
    total: number
  }
}

// Frontend typically:
const [currentPage, setCurrentPage] = useState(1);
const params = { page: currentPage, per_page: 15 };
const { data, meta } = await service.list(params);

// Navigation:
{meta.current_page < meta.last_page && (
  <button onClick={() => setCurrentPage(p => p + 1)}>Next</button>
)}
{meta.current_page > 1 && (
  <button onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
)}
```

---

## File Organization Assets

### Within Pages:
- Sidebar component for details (orders)
- Modal component lazy-loaded (reviews)
- Inline SVG icons
- Inline helper functions
- Inline type definitions

### Imported from Services:
- API service functions
- Data type definitions (interfaces)

### Imported from Components:
- OrderDetailsSidebar
- ReviewEditorModal
- Lucide-react icons (secondary imports)

---

## Performance Considerations

1. **ReviewEditorModal** uses dynamic import:
   ```typescript
   const ReviewEditorModal = dynamic(
     () => import('@/components/admin/ReviewEditorModal'),
     { ssr: false }
   );
   ```

2. **Pagination reduces initial load** (15 items/page typical)

3. **Search/filter are client-side** (no API calls during typing)

4. **Stats cached** on page load, not live-updated

5. **Product images** loaded from external URLs (not optimized in pages shown)

---

## Naming Conventions

### API Service Naming:
- `adminXyzService` for admin-specific services
- `xyzService` for public services (products, banners)

### Page/Component Naming:
- `Page` suffix for route components (e.g., `ReviewsPage`)
- `Modal`, `Sidebar`, `Form` suffix for sub-components

### Type Naming:
- `Admin{Entity}` for admin models (AdminProduct, AdminOrder)
- `{Entity}` for public models (Product, Review)
- `{Entity}Meta` for pagination metadata

### State Variable Naming:
- `{entity}s` for list state (orders, products)
- `is{Action}` for boolean loading states (isSaving, isLoading)
- `{entity}Filter` or `{entity}Search` for filters

---

## Common Issues & Solutions

### Issue: Type mismatch in forms
**Solution**: Ensure form state matches AdminProduct/AdminCoupon interface

### Issue: Image upload failures
**Solution**: Use FormData in POST, set 'Content-Type': 'multipart/form-data'

### Issue: Pagination resets on filter
**Solution**: Reset currentPage to 1 when filter/search changes

### Issue: Modal doesn't close
**Solution**: Check showModal state is properly toggled and passed to onClose

### Issue: Order details not showing
**Solution**: Ensure OrderDetailsSidebar receives either orderId or order prop

---

## Next Steps for Improvement

1. **Extract List Page Template**
   ```
   Create: ListPageTemplate.tsx
   Handle: pagination, search, filters, table
   Use in: orders, products, reviews, coupons
   ```

2. **Extract Form Sections**
   ```
   ProductDetailsSection.tsx
   ProductImagesSection.tsx
   ProductVariantsSection.tsx
   etc.
   ```

3. **Create Custom Hooks**
   ```
   useAdminOrders()
   useAdminProducts()
   useAdminReviews()
   ```

4. **Centralize Utilities**
   ```
   utils/formatters.ts
   utils/validators.ts
   utils/constants.ts
   ```

5. **Component Library**
   ```
   StatusBadge.tsx
   PaginationControls.tsx
   SearchBar.tsx
   etc.
   ```
