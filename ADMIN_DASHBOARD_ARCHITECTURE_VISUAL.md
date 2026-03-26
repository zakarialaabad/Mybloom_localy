# Admin Dashboard - Visual Architecture & Dependencies

## Complete File Dependency Tree

### Dashboard Page Hierarchy
```
frontend/app/admin/dashboard/
│
├── layout.tsx (wrapper)
│   └── provides sidebar, header, routing
│
└── page.tsx (Main Dashboard)
    ├── Imports:
    │   ├── dashboardService (API)
    │   ├── useEffect, useState, useCallback (React)
    │   └── lucide-react icons
    │
    ├── Internal Components:
    │   ├── RevenueIcon() ──→ SVG
    │   ├── OrdersIcon() ──→ SVG
    │   ├── CustomersIcon() ──→ SVG
    │   ├── Status helpers (inline)
    │   └── Widget renderers (inline)
    │
    └── State Management:
        ├── dashboardData
        ├── summary stats
        ├── charts data
        ├── customers list
        └── loading states
```

### Orders Page Hierarchy
```
frontend/app/admin/dashboard/orders/
│
├── page.tsx (Orders List)
│   ├── Imports:
│   │   ├── adminOrderService
│   │   ├── React hooks
│   │   ├── lucide-react icons
│   │   └── ./components/OrderDetailsSidebar
│   │
│   ├── Internal Components:
│   │   ├── getStatusBadgeClass() ──→ CSS
│   │   ├── getStatusDotClass() ──→ CSS  
│   │   ├── getInitials() ──→ Avatar text
│   │   ├── Table renderer (inline)
│   │   ├── Filter UI (inline)
│   │   ├── Search UI (inline)
│   │   ├── Pagination UI (inline)
│   │   └── Stats cards (inline)
│   │
│   ├── State:
│   │   ├── orders[] (list)
│   │   ├── stats (summary)
│   │   ├── currentPage
│   │   ├── totalPages
│   │   ├── search string
│   │   ├── statusFilter
│   │   ├── selectedOrder (detail view)
│   │   ├── isLoading, isDeleting
│   │   └── showDetailsSidebar
│   │
│   └── Event Handlers:
│       ├── handleSearch()
│       ├── handleStatusFilter()
│       ├── handlePageChange()
│       ├── handleSelectOrder()
│       ├── handleUpdateStatus()
│       └── handleDeleteOrder()
│
└── components/
    └── OrderDetailsSidebar.tsx ⟵ SHARED COMPONENT
        ├── Props:
        │   ├── order (AdminOrderFull)
        │   ├── onClose callback
        │   └── onStatusUpdate callback
        │
        ├── Displays:
        │   ├── Order header (number, date)
        │   ├── Customer info
        │   ├── Order items table
        │   ├── Shipping details
        │   ├── Totals (subtotal, discount, shipping, total)
        │   ├── Coupon info
        │   ├── Status history
        │   └── Status update dropdown
        │
        └── Calls:
            └── adminOrderService.updateStatus()
```

### Products Page Hierarchy
```
frontend/app/admin/dashboard/products/
│
├── page.tsx (Products List)
│   ├── Imports:
│   │   ├── adminProductService
│   │   ├── adminCategoryService
│   │   ├── adminProductTypeService
│   │   ├── React hooks
│   │   └── lucide-react icons
│   │
│   ├── Internal Components:
│   │   ├── stockStatus() ──→ 'active'|'low_stock'|'inactive'
│   │   ├── stockLabel() ──→ { text, cls }
│   │   ├── STATUS_META lookup ──→ labels & colors
│   │   ├── Table renderer (inline)
│   │   ├── Stock column (inline)
│   │   ├── Filter UI (inline)
│   │   ├── Search UI (inline)
│   │   └── Pagination UI (inline)
│   │
│   ├── State:
│   │   ├── products[] (list)
│   │   ├── categories[] (for filter)
│   │   ├── types[] (for filter)
│   │   ├── currentPage
│   │   ├── totalPages
│   │   ├── search (product name)
│   │   ├── LOW_STOCK_THRESHOLD = 10
│   │   ├── ITEMS_PER_PAGE = 15
│   │   ├── isLoading
│   │   └── sortBy, sortOrder
│   │
│   └── Workflow:
│       ├── Page loads → Load categories, types
│       ├── User searches → Filter products (client-side)
│       ├── User changes page → Fetch from API with pagination
│       ├── Can edit → Navigate to /admin/dashboard/products/[id]/edit
│       └── Can delete → Show warning, DELETE via API
│
├── add/
│   └── page.tsx (Add Product Form)
│       ├── Sections (all in one 1200+ line file):
│       │   ├── Details section
│       │   ├── Images section (upload)
│       │   ├── Tags section (category, brand, type)
│       │   ├── Pricing section
│       │   ├── Variants section
│       │   ├── Ingredients section
│       │   ├── FAQs section
│       │   └── Reviews section
│       │
│       ├── State:
│       │   ├── formData (all product fields)
│       │   ├── images[] (new file uploads)
│       │   ├── categories[], types[], brands[]
│       │   ├── isSaving
│       │   ├── errors
│       │   └── modal states
│       │
│       └── Calls:
│           ├── adminCategoryService.list() (on mount)
│           ├── adminProductTypeService.list() (on mount)
│           ├── brandService.list() (on mount)
│           └── resourceService.create() or custom POST (on save)
│
├── [id]/
│   └── edit/
│       └── page.tsx (Edit Product Form)
│           └── Same structure as add/ but loads existing product data
│               ├── adminProductService.get(id) (on mount)
│               └── Form populated with product data
│
└── new/
    └── (empty - alternate route?)
```

### Reviews Page Hierarchy
```
frontend/app/admin/dashboard/reviews/
│
├── page.tsx (Reviews Management)
│   ├── Imports:
│   │   ├── adminReviewService
│   │   ├── dynamic import ReviewEditorModal
│   │   ├── React hooks
│   │   └── lucide-react icons
│   │
│   ├── Tabs:
│   │   ├── "Reviews" ──→ activeView === 'reviews'
│   │   │   ├── Shows: Review list with ratings
│   │   │   ├── Actions: Approve, Reject, Edit, Delete
│   │   │   └── Filters: Rating filter (1-5 stars)
│   │   │
│   │   └── "Feedback" ──→ activeView === 'feedback'
│   │       └── Alternative view (implementation details TBD)
│   │
│   ├── Internal Components:
│   │   ├── getInitials() ──→ Avatar text
│   │   ├── formatDate() ──→ Formatted date
│   │   ├── RatingStars renderer (inline)
│   │   ├── Review card (inline)
│   │   ├── Stats summary (inline)
│   │   └── Pagination (inline)
│   │
│   ├── State:
│   │   ├── activeView ('reviews'|'feedback')
│   │   ├── reviews[]
│   │   ├── stats
│   │   ├── currentPage
│   │   ├── totalPages
│   │   ├── selectedReview (for modal)
│   │   ├── showModal
│   │   ├── isLoading
│   │   ├── isDeletingId (which review being deleted)
│   │   └── search/filter states
│   │
│   ├── Event Handlers:
│   │   ├── handleApprove(id)
│   │   ├── handleReject(id)
│   │   ├── handleEdit(review)
│   │   ├── handleSaveReview(edited)
│   │   ├── handleDeleteReview(id)
│   │   └── handleStatusUpdate()
│   │
│   └── Calls:
│       ├── adminReviewService.list()
│       ├── adminReviewService.stats()
│       ├── adminReviewService.approve(id)
│       ├── adminReviewService.reject(id)
│       ├── adminReviewService.update(id, data)
│       ├── adminReviewService.destroy(id)
│       └── dynamic → ReviewEditorModal (on demand)
│
└── components/
    └── ReviewEditorModal.tsx ⟵ SHARED COMPONENT
        ├── Props:
        │   ├── isOpen boolean
        │   ├── review (AdminReview)
        │   ├── onClose callback
        │   └── onSave callback
        │
        ├── Features:
        │   ├── Edit reviewer name
        │   ├── Edit rating (star picker)
        │   ├── Edit body text
        │   ├── Edit product (dropdown)
        │   ├── Upload images (file input)
        │   └── Form validation
        │
        └── Calls:
            └── adminReviewService.update(id, data)
```

### Coupons Page Hierarchy
```
frontend/app/admin/dashboard/coupons/
│
├── page.tsx (Coupons List)
│   ├── Imports:
│   │   ├── adminCouponService
│   │   ├── React hooks
│   │   └── lucide-react icons
│   │
│   ├── Internal Components:
│   │   ├── formatDate() ──→ Formatted date
│   │   ├── isExpiredDate() ──→ boolean
│   │   ├── Status badge renderer (inline)
│   │   ├── Coupon type badge (inline)
│   │   ├── Filter UI (inline)
│   │   ├── Search UI (inline)
│   │   └── Table renderer (inline)
│   │
│   ├── State:
│   │   ├── coupons[]
│   │   ├── stats
│   │   ├── currentPage
│   │   ├── totalPages
│   │   ├── search (code)
│   │   ├── statusFilter ('all'|'active'|'expired'|'exhausted'|'usable')
│   │   ├── isLoading
│   │   └── isDeletingId
│   │
│   ├── Event Handlers:
│   │   ├── handleSearch()
│   │   ├── handleStatusFilter()
│   │   ├── handlePageChange()
│   │   ├── handleEditCoupon()
│   │   └── handleDeleteCoupon()
│   │
│   └── Calls:
│       ├── adminCouponService.list()
│       ├── adminCouponService.stats()
│       ├── adminCouponService.destroy(id)
│       └── adminCouponService.update(id, data)
│
├── create/
│   └── page.tsx (Create Coupon)
│       ├── Form fields:
│       │   ├── Code (text, required)
│       │   ├── Campaign (text, optional)
│       │   ├── Promo Type (dropdown)
│       │   ├── Start Date (date)
│       │   ├── End Date (date)
│       │   ├── Discount Type (radio: 'percent'|'fixed')
│       │   ├── Discount Value (number, required)
│       │   └── Max Uses (number, optional)
│       │
│       ├── State:
│       │   ├── form fields (individual state)
│       │   ├── isSaving
│       │   └── error
│       │
│       └── Calls:
│           └── adminCouponService.create(payload)
│
└── [id]/
    └── edit/
        └── page.tsx (Edit Coupon)
            └── Same as create, but loads & updates existing coupon
```

### Banners Page Hierarchy
```
frontend/app/admin/dashboard/banners/
│
└── page.tsx (Banners Management)
    ├── Imports:
    │   ├── adminBannerService
    │   ├── React hooks
    │   └── lucide-react icons
    │
    ├── Configuration:
    │   └── HOMEPAGE_POSITIONS = [1, 2, 3, 4]
    │
    ├── Internal Components:
    │   ├── UploadArea component (inline)
    │   │   ├── Props: position, onUploaded callback
    │   │   ├── Drag & drop support
    │   │   ├── File input
    │   │   └── Upload loading state
    │   │
    │   └── Banner slot renderer (inline)
    │
    ├── State:
    │   ├── banners[] (grouped by position)
    │   ├── isLoading
    │   ├── uploadingPosition (which slot uploading)
    │   └── error
    │
    ├── Features:
    │   ├── 4 slot positions
    │   ├── Drag-drop image upload
    │   ├── Display uploaded banners
    │   ├── Delete banners
    │   ├── Edit link (optional)
    │   └── Edit title (optional)
    │
    └── Calls:
        ├── adminBannerService.list()
        ├── adminBannerService.store(formData) [upload]
        ├── adminBannerService.update(id, formData)
        └── adminBannerService.destroy(id)
```

### Settings Page Hierarchy
```
frontend/app/admin/dashboard/settings/
│
└── page.tsx (General Settings)
    ├── Imports:
    │   ├── adminProfileService
    │   ├── React hooks
    │   └── lucide-react icons
    │
    ├── Sections:
    │   ├── Profile Info
    │   │   ├── Fields: username, email, phone
    │   │   ├── Image upload (with preview)
    │   │   ├── Save button
    │   │   └── Calls: adminProfileService.updateProfile()
    │   │
    │   └── Password Change
    │       ├── Fields:
    │       │   ├── Current password (hidden)
    │       │   ├── New password (hidden)
    │       │   └── Confirm password (hidden)
    │       │
    │       ├── Validation:
    │       │   ├── Min length
    │       │   ├── Uppercase letter
    │       │   ├── Lowercase letter
    │       │   ├── Number
    │       │   └── Special character
    │       │
    │       ├── Strength indicator
    │       └── Calls: adminProfileService.changePassword()
    │
    ├── State:
    │   ├── profile { username, email, phone }
    │   ├── imagePreview
    │   ├── imageFile
    │   ├── passwords { current, new, confirmation }
    │   ├── showCurrentPassword
    │   ├── showNewPassword
    │   ├── strength { length, upper, lower, number, special }
    │   ├── isSavingProfile
    │   ├── isSavingPassword
    │   ├── message { type, text }
    │   └── isLoading
    │
    └── Workflow:
        ├── Page loads → fetchProfile()
        ├── User edits profile → Save → adminProfileService.updateProfile()
        ├── User changes password → Validate → adminProfileService.changePassword()
        └── Show success/error messages
```

---

## Component Dependency Graph

```
                    ┌─────────────────────────────────────────┐
                    │   frontend/services/api.ts              │
                    │   (All API services & types)            │
                    └──────────────┬──────────────────────────┘
                                   │
                   ┌───────────────┼───────────────────────┐
                   ▼               ▼                       ▼
        ┌──────────────────┐ ┌──────────────┐ ┌─────────────────┐
        │ Dashboard Page   │ │ Orders Page  │ │ Products Page   │ ...
        └──────────────────┘ └──────┬───────┘ └─────────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │ OrderDetailsSidebar (SHARED)   │
                    └────────────────────────────────┘

        ┌──────────────────┐      ┌────────────────────┐
        │ Add/Edit Product │      │ Create/Edit Coupon │
        │ (1200+ lines,    │      │ (400+ lines)       │
        │ monolithic)      │      └────────────────────┘
        └──────────────────┘

        ┌──────────────────┐      ┌────────────────────┐
        │ Reviews Page     │      │ Banners Page       │
        │ + Modal (lazy)   │      │ + UploadArea       │
        └──────────────────┘      └────────────────────┘

        ┌──────────────────┐
        │ ReviewEditorModal│
        │ (SHARED DYNAMIC) │
        └──────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
         ┌──────────────────┐      ┌──────────────────┐
         │  Page Component  │      │  Page Component  │
         │  (Monolithic,    │      │  (Monolithic,    │
         │  600-1200 lines) │      │  600-1200 lines) │
         └────────┬─────────┘      └────────┬─────────┘
                  │                          │
        ┌─────────┴────────┐        ┌────────┴──────────┐
        ▼                  ▼        ▼                   ▼
    ┌────────┐        ┌────────┐┌────────┐        ┌──────────┐
    │useState│        │ API    ││useEff  │        │ useCall  │
    │        │        │Service ││ect     │        │ back     │
    └────────┘        └────────┘└────────┘        └──────────┘
        ▲                  │           │               │
        │                  ▼           │               │
        │            ┌─────────────────┴───────┐       │
        │            │  API Request Handler    │       │
        └────────────┤  (Request interceptor)  │◄──────┘
                     │  (Token injection)      │
                     │  (Response handler)     │
                     └──────────┬──────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   Backend Server     │
                    │  /v1/admin/xyz       │
                    └──────────────────────┘
```

---

## State Management Pattern by Page Type

### List Pages (Orders, Products, Reviews, Coupons)
```
┌─────────────┐
│  useEffect  │ ← Triggers on mount & when filters change
└──────┬──────┘
       │
       ▼
┌──────────────────────┐      ┌─────────────────┐
│ API Service Call     │─────▶│ setData()       │
│ .list(params)        │      │ setMeta()       │
│ .stats()             │      │ setLoading(f)   │
└──────────────────────┘      └─────────────────┘
       ▲                                │
       │                                ▼
       │                          ┌───────────┐
       │                          │   Render  │
       │                          │   Table   │
       │                          └─────┬─────┘
       │                                │
       └────── Pagination/Filter Changes─┘
```

### Form Pages (Add/Edit, Create/Edit)
```
┌──────────────────────┐
│ useRef (file input)  │
│ useState (form data) │
│ useState (images)    │
│ useState (errors)    │
└──────────────────────┘
         │ (form change)
         ▼
┌──────────────────────┐      ┌──────────────────┐
│ handleChange()       │─────▶│ setFormData()    │
│ handleImageSelect()  │      │ setImages()      │
│ handleValidation()   │      │ setErrors()      │
└──────────────────────┘      └──────────────────┘
         ▲                            │
         │ (user input)               ▼
         │ (on save click)      ┌──────────────────┐
         │                      │ handleSave()     │
         │                      │ API.create/update│
         └──────────────────────┤                  │
                                └──────────────────┘
                                        │
                            ┌───────────┴──────────┐
                            ▼                      ▼
                      ┌──────────┐         ┌──────────────┐
                      │ Success  │         │ Error        │
                      │ Navigate │         │ setError()   │
                      │ Back     │         │ Show message │
                      └──────────┘         └──────────────┘
```

---

## Component Size Distribution

```
Product Add/Edit:      ████████████████████ (1200+ LOC)
Dashboard:             ████████████       (800+ LOC)
Orders List:           ███████████        (650+ LOC)
Products List:         ███████████        (700+ LOC)
Reviews List:          ████████████       (800+ LOC)
Coupons List:          ██████████         (600+ LOC)
Banners:               ████████           (400+ LOC)
Settings:              ████████           (400+ LOC)
Create Coupon:         ██████             (300+ LOC)
OrderDetailsSidebar:   ████               (400+ LOC)
ReviewEditorModal:     ███                (300+ LOC)

Typical single page: 600-1200 lines (mostly monolithic)
```

---

## API Service Request Pattern

```
┌────────────────────────────────────────────────────────────────┐
│                  axios.create()                                │
│                 (baseURL configured)                           │
└────────────┬───────────────────────────────────────────────────┘
             │
    ┌────────┴─────────┐
    ▼                  ▼
┌──────────────────┐  ┌─────────────────────────────────┐
│ Request Int.     │  │ Response Int.                   │
│                  │  │                                 │
│ - Read cookie    │  │ - 200 OK → return response     │
│ - Add Bearer     │  │ - 401 → clear cookie, redirect │
│ - Continue       │  │ - Other error → reject         │
└──────────────────┘  └─────────────────────────────────┘
     ▲                         │
     │                         │
     └─────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│         Backend API                │
│    /v1/admin/resource/method       │
└────────────────────────────────────┘
```

---

## Summary: Architecture At A Glance

| Aspect | Details |
|--------|---------|
| **Total Pages** | 8 main pages (+ 5 sub-pages) |
| **Code Organization** | Monolithic per page (600-1200 lines) |
| **Shared Components** | 2 (OrderDetailsSidebar, ReviewEditorModal) |
| **State Management** | React hooks (useState, useEffect) only |
| **Data Fetching** | Direct API service calls |
| **Authentication** | Sanctum + Bearer token via interceptor |
| **Api Layer** | Centralized in services/api.ts |
| **Component Modularity** | Low (most pages self-contained) |
| **Code Reusability** | Limited (inline components & utils) |
| **Testing Difficulty** | High (large monolithic components) |
| **Bundle Size Per Page** | ~50-100 KB (unoptimized) |

