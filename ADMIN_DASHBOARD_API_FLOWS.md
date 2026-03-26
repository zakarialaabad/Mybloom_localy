# Admin Dashboard - API & Data Flow Reference

## Complete API Endpoint Reference

### Authentication Endpoints

#### Login
```
POST /v1/admin/auth/login
{
  email: string,
  password: string
}
↓
Response 200 OK
{
  message: string,
  token: string,
  admin: { id: number, email: string }
}
```
**Frontend Impact**: Token stored in `admin_token` cookie, subsequent requests auto-inject Bearer token

#### Logout
```
POST /v1/admin/auth/logout
↓
Response 200 OK
```
**Frontend Impact**: Cookie cleared, user redirected to login

#### Get Current User
```
GET /v1/admin/auth/me
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: { id: number, email: string }
}
```

---

## Dashboard Endpoints

### Get Dashboard Summary
```
GET /v1/admin/dashboard
Authorization: Bearer {token}
↓
Response 200 OK
{
  summary: {
    total_revenue: number,
    revenue_trend: number (% change),
    total_orders: number,
    orders_trend: number,
    top_product: { name, subtitle, units_sold }
  },
  sales_chart: {
    labels: string[] (dates),
    values: number[] (revenue)
  },
  top_customers: [
    { phone, name, orders, total_spent }
  ],
  recent_orders: [
    { id, order_number, product, date, customer, phone, status, amount }
  ]
}
```

---

## Products Endpoints

### List Products (Paginated)
```
GET /v1/admin/products?page=1&per_page=15&search=name
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: [
    {
      id, name, slug, subtitle, price, original_price, stock,
      is_active, is_featured, deleted_at, primary_image,
      category: { id, name, slug },
      brand: { id, name, slug },
      product_type: { id, name, slug },
      created_at
    }
  ],
  meta: {
    current_page: 1,
    last_page: 5,
    per_page: 15,
    total: 75
  }
}
```

**Frontend Implementation** (products/page.tsx):
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [search, setSearch] = useState('');

useEffect(() => {
  const { data, meta } = await adminProductService.list({
    page: currentPage,
    search: search || undefined
  });
  setProducts(data);
  setTotalPages(meta.last_page);
}, [currentPage, search]);
```

### Get Single Product
```
GET /v1/admin/products/{id}
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: {
    id, name, slug, subtitle, description, gender,
    price, original_price, stock,
    is_active, is_featured, is_best_seller, is_gift, is_recommended,
    brand: { id, name },
    category: { id, name },
    product_type: { id, name },
    images: [
      { id, image_url, is_primary, sort_order }
    ],
    variants: [
      { id, size, price, final_price, original_price, promotion_percent, is_default, stock_quantity }
    ],
    sizes: [
      { id, label, price_modifier, promotion_percent, stock_quantity }
    ],
    ingredients: [
      { id, name, image_url }
    ],
    faqs: [
      { id, question, answer }
    ],
    all_reviews: [
      { id, reviewer_name, rating, comment, date, photo_url }
    ]
  }
}
```

**Frontend Implementation** (products/[id]/edit/page.tsx):
```typescript
useEffect(() => {
  const product = await adminProductService.get(productId);
  setName(product.name);
  setSubtitle(product.subtitle);
  setDescription(product.description);
  setImages(product.images);
  setVariants(product.variants);
  // ... populate all form fields
}, [productId]);
```

### Delete Product (Soft Delete)
```
DELETE /v1/admin/products/{id}
Authorization: Bearer {token}
↓
Response 200 OK (empty or { message })
```

**Frontend Implementation**:
```typescript
const handleDelete = async (id: number) => {
  try {
    await adminProductService.destroy(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showSuccess('Product deleted');
  } catch (err) {
    showError('Delete failed');
  }
};
```

### List Categories
```
GET /v1/admin/categories
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: [
    { id, name, slug }
  ]
}
```

### List Product Types
```
GET /v1/admin/product-types
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: [
    { id, name, slug }
  ]
}
```

---

## Orders Endpoints

### List Orders (Paginated)
```
GET /v1/admin/orders?page=1&per_page=15&status=pending
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: [
    {
      id, order_number, customer_name, customer_email, customer_phone,
      total, status, items_count, created_at
    }
  ],
  meta: { current_page, last_page, per_page, total }
}
```

**Frontend Implementation** (orders/page.tsx):
```typescript
const [statusFilter, setStatusFilter] = useState('all');

const handleStatusChange = async (newStatus) => {
  const { data, meta } = await adminOrderService.list({
    page: 1,
    status: newStatus === 'all' ? undefined : newStatus
  });
  setOrders(data);
  setCurrentPage(1);
};
```

### Get Single Order (Full Details)
```
GET /v1/admin/orders/{orderId}
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: {
    id, order_number, customer_name, customer_email, customer_phone,
    total, status, items_count, created_at,
    items: [
      {
        id, product_id, quantity, unit_price, line_total, size_label,
        product: {
          id, name, slug, image_url,
          images: [{ url, is_primary, sort_order }]
        }
      }
    ],
    shipping_method: { id, name },
    coupon: { id, code } | null,
    // Backend also loads statusHistories (not shown here)
  }
}
```

**Frontend Implementation** (OrderDetailsSidebar.tsx):
```typescript
useEffect(() => {
  const order = await adminOrderService.get(selectedOrderId);
  setOrderDetails(order);
  // Render items, customer info, totals in sidebar
}, [selectedOrderId]);
```

### Get Order Statistics
```
GET /v1/admin/orders/stats
Authorization: Bearer {token}
↓
Response 200 OK
{
  total: { count: number, trend: number },
  confirmed: { count: number, trend: number },
  delivered: { count: number, trend: number }
}
```

**Frontend Implementation** (orders/page.tsx):
```typescript
useEffect(() => {
  const stats = await adminOrderService.stats();
  setStats(stats);
  // Display in stat cards
}, []);
```

### Update Order Status
```
PATCH /v1/admin/orders/{orderId}/status
Authorization: Bearer {token}
{
  status: string ('pending'|'confirmed'|'preparing'|'shipped'|'delivered'|'cancelled')
}
↓
Response 200 OK (likely empty)
```

**Frontend Implementation**:
```typescript
const handleStatusUpdate = async (orderId, newStatus) => {
  try {
    await adminOrderService.updateStatus(orderId, newStatus);
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    showSuccess('Status updated');
  } catch (err) {
    showError('Update failed');
  }
};
```

---

## Reviews Endpoints

### List Reviews (Paginated)
```
GET /v1/admin/reviews?page=1&per_page=15&approved_only=false
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: [
    {
      id, reviewer_name, rating, body, is_approved, approved_at,
      order_number, product: { id, name, slug },
      images: [{ image_url }],
      created_at
    }
  ],
  meta: { current_page, last_page, per_page, total }
}
```

### Get Review Statistics
```
GET /v1/admin/reviews/stats
Authorization: Bearer {token}
↓
Response 200 OK
{
  average_rating: number,
  total: number,
  pending: number (not approved count),
  distribution: {
    1: { count: number, percentage: number },
    2: { count: number, percentage: number },
    3: { count: number, percentage: number },
    4: { count: number, percentage: number },
    5: { count: number, percentage: number }
  },
  most_reviewed: { product_name: string, count: number } | null
}
```

### Create Review (via Admin)
```
POST /v1/admin/reviews
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
{
  reviewer_name: string,
  rating: number (1-5),
  body?: string | null,
  product_id?: number | null,
  images[]?: File[] (optional)
}

OR

JSON:
{
  reviewer_name: string,
  rating: number,
  body?: string | null,
  product_id?: number | null
}

↓
Response 200 OK
{
  data: {
    id, reviewer_name, rating, body, is_approved, approved_at,
    order_number, product: { id, name, slug },
    images: [{ image_url }],
    created_at
  }
}
```

### Update Review
```
PATCH /v1/admin/reviews/{id}
Authorization: Bearer {token}
{
  reviewer_name?: string,
  rating?: number,
  body?: string | null,
  product_id?: number | null
}

↓
Response 200 OK
{
  data: { ...updated review }
}
```

### Approve Review
```
PATCH /v1/admin/reviews/{id}/approve
Authorization: Bearer {token}
↓
Response 200 OK
```

### Reject Review (Delete)
```
PATCH /v1/admin/reviews/{id}/reject
Authorization: Bearer {token}
↓
Response 200 OK
```

### Delete Review
```
DELETE /v1/admin/reviews/{id}
Authorization: Bearer {token}
↓
Response 200 OK
```

**Frontend Implementation** (reviews/page.tsx):
```typescript
const handleApprove = async (reviewId) => {
  try {
    await adminReviewService.approve(reviewId);
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, is_approved: true, approved_at: new Date().toISOString() } : r
    ));
  } catch (err) {
    showError('Approval failed');
  }
};

const handleEdit = (review) => {
  setSelectedReview(review);
  setShowModal(true);
};

const handleSaveReview = async (editedReview) => {
  try {
    const updated = await adminReviewService.update(editedReview.id, editedReview);
    setReviews(prev => prev.map(r => r.id === editedReview.id ? updated : r));
    setShowModal(false);
  } catch (err) {
    showError('Update failed');
  }
};
```

---

## Coupons Endpoints

### List Coupons (Paginated)
```
GET /v1/admin/coupons?page=1&per_page=15&active_only=false
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: [
    {
      id, code, type ('percent'|'fixed'), value, min_order_amount,
      usage_limit, used_count, expires_at, is_active,
      is_expired, is_exhausted, is_usable,
      created_at
    }
  ],
  meta: { current_page, last_page, per_page, total }
}
```

### Get Single Coupon
```
GET /v1/admin/coupons/{id}
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: { ...coupon object (see list above) }
}
```

### Get Coupon Statistics
```
GET /v1/admin/coupons/stats
Authorization: Bearer {token}
↓
Response 200 OK
{
  total: number,
  active: number,
  expiring_soon: number (expiring in next 7 days),
  total_redemptions: number
}
```

### Create Coupon
```
POST /v1/admin/coupons
Authorization: Bearer {token}
{
  code: string (required, e.g., "SUMMER20"),
  type: 'percent' | 'fixed' (required),
  value: number (required, percentage or fixed amount),
  min_order_amount?: number (default 0),
  usage_limit?: number | null (null = unlimited),
  expires_at?: string | null (ISO date or null for no expiry),
  is_active: boolean (default true)
}

↓
Response 200 OK | 422 Unprocessable Entity
{
  data: { ...created coupon }
}

OR

{
  message: string,
  errors: { field: string[] }
}
```

**Frontend Implementation** (coupons/create/page.tsx):
```typescript
const handleSave = async () => {
  try {
    await adminCouponService.create({
      code: code.toUpperCase().trim(),
      type: discountType,
      value: parseFloat(discountValue),
      usage_limit: maxUses ? parseInt(maxUses) : undefined,
      expires_at: endDate || null,
      is_active: true,
    });
    router.push('/admin/dashboard/coupons');
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create');
  }
};
```

### Update Coupon
```
PUT /v1/admin/coupons/{id}
Authorization: Bearer {token}
{
  code?: string,
  type?: 'percent' | 'fixed',
  value?: number,
  min_order_amount?: number,
  usage_limit?: number | null,
  expires_at?: string | null,
  is_active?: boolean
}

↓
Response 200 OK
{
  data: { ...updated coupon }
}
```

### Delete Coupon
```
DELETE /v1/admin/coupons/{id}
Authorization: Bearer {token}
↓
Response 200 OK
```

---

## Banners Endpoints

### List Banners
```
GET /v1/admin/banners
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: [
    {
      id, title, image_path, link, position, type, collection_id, is_active
    }
  ]
}
```

### Create Banner
```
POST /v1/admin/banners
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
{
  type: 'homepage_slot' | 'collection_hero',
  position: number (1-4 for homepage_slot),
  image: File (required),
  title?: string,
  link?: string,
  collection_id?: number (if type=collection_hero),
  is_active?: boolean
}

↓
Response 200 OK | 422 Unprocessable Entity
{
  data: { ...created banner }
}
```

**Frontend Implementation** (banners/page.tsx):
```typescript
const handleUploaded = async (file: File, position: number) => {
  const form = new FormData();
  form.append('type', 'homepage_slot');
  form.append('position', String(position));
  form.append('image', file);
  
  const banner = await adminBannerService.store(form);
  setBanners(prev => [...prev, banner]);
};
```

### Update Banner
```
PUT /v1/admin/banners/{id}
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData: (same as create)

↓
Response 200 OK
{
  data: { ...updated banner }
}
```

### Delete Banner
```
DELETE /v1/admin/banners/{id}
Authorization: Bearer {token}
↓
Response 200 OK
```

---

## Profile Endpoints

### Get Admin Profile
```
GET /v1/admin/profile
Authorization: Bearer {token}
↓
Response 200 OK
{
  data: {
    id, username, email, phone,
    profile_image_url (if exists)
  }
}
```

### Update Admin Profile
```
POST /v1/admin/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
{
  username?: string,
  email?: string,
  phone?: string,
  profile_image?: File
}

↓
Response 200 OK | 422 Unprocessable Entity
{
  message: string,
  data?: { ...updated profile }
}
```

**Frontend Implementation** (settings/page.tsx):
```typescript
const handleProfileSave = async () => {
  const form = new FormData();
  form.append('username', profile.username);
  form.append('email', profile.email);
  form.append('phone', profile.phone);
  if (imageFile) form.append('profile_image', imageFile);
  
  try {
    await adminProfileService.updateProfile(form);
    showSuccess('Profile updated');
  } catch (err) {
    showError('Update failed');
  }
};
```

### Change Password
```
PUT /v1/admin/profile/password
Authorization: Bearer {token}
{
  current_password: string,
  new_password: string,
  new_password_confirmation: string
}

↓
Response 200 OK | 422 Unprocessable Entity
{
  message: string
}

OR

{
  message: string,
  errors: { field: string[] }
}
```

**Frontend Implementation** (settings/page.tsx):
```typescript
const handlePasswordChange = async () => {
  try {
    await adminProfileService.changePassword({
      current_password: passwords.current_password,
      new_password: passwords.new_password,
      new_password_confirmation: passwords.new_password_confirmation
    });
    showSuccess('Password changed');
    setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
  } catch (err) {
    showError(err.response?.data?.message || 'Change failed');
  }
};
```

---

## Error Handling Pattern

### Standard Error Response (422 Unprocessable Entity)
```json
{
  "message": "Validation failed",
  "code": "validation_error",
  "errors": {
    "code": ["Coupon code is required", "Code must be unique"],
    "value": ["Value must be a number"]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated"
}
```
**Frontend**: Request interceptor removes cookie and redirects to `/admin/login`

### Not Found (404)
```json
{
  "message": "Resource not found"
}
```

### Frontend Error Handling:
```typescript
try {
  const result = await adminXyzService.method(params);
} catch (err) {
  const errorData = err.response?.data;
  
  if (err.response?.status === 422) {
    // Validation errors
    const errors = errorData.errors;
    Object.keys(errors).forEach(field => {
      setFieldError(field, errors[field][0]);
    });
  } else if (err.response?.status === 401) {
    // Already handled by interceptor
  } else if (err.response?.status === 404) {
    showError('Resource not found');
  } else {
    showError(errorData?.message || 'An error occurred');
  }
}
```

---

## Data Flow Diagrams

### Product List Flow
```
User navigates to /admin/dashboard/products
      ↓
Page.tsx useEffect triggers
      ↓
adminProductService.list({ page: 1, search: '' })
      ↓
apiClient GET /v1/admin/products
      ↓
Request interceptor adds Bearer token
      ↓
Server validates token
      ↓
Server fetches products with pagination
      ↓
Response 200 OK { data, meta }
      ↓
setProducts(data)
setTotalPages(meta.last_page)
      ↓
UI renders table with products
```

### Product Edit Flow
```
User clicks edit on product
      ↓
Router navigates to /admin/dashboard/products/[id]/edit
      ↓
EditProductPage useEffect triggers
      ↓
adminProductService.get(productId)
      ↓
apiClient GET /v1/admin/products/{id}
      ↓
Server returns product with all relations
      ↓
Form fields populated with product data
      ↓
User modifies form
      ↓
User clicks Save
      ↓
[PUT /v1/admin/products/{id}] (if endpoint exists)
      OR
      ↓
This may use generic resourceService.update()
      ↓
Success: Router navigates back to /admin/dashboard/products
      OR
Error: Display validation errors in form
```

### Review Approval Flow
```
User opens /admin/dashboard/reviews
      ↓
adminReviewService.list()
      ↓
Reviews displayed with approval buttons
      ↓
User clicks "Approve" on a review
      ↓
handleApprove(reviewId) triggers
      ↓
adminReviewService.approve(reviewId)
      ↓
apiClient PATCH /v1/admin/reviews/{id}/approve
      ↓
Server marks review as approved, sets approved_at
      ↓
Response 200 OK
      ↓
Frontend updates local state
      ↓
UI shows "Approved" badge
```

### Coupon Creation Flow
```
User navigates to /admin/dashboard/coupons/create
      ↓
User fills form:
  - Code: "SUMMER20"
  - Type: "percent"
  - Value: "20"
  - MaxUses: "100"
  - EndDate: "2024-12-31"
      ↓
User clicks "Save Coupon"
      ↓
Validation checks occur
      ↓
adminCouponService.create({
  code: "SUMMER20",
  type: "percent",
  value: 20,
  usage_limit: 100,
  expires_at: "2024-12-31",
  is_active: true
})
      ↓
apiClient POST /v1/admin/coupons
      ↓
Server validates & creates coupon
      ↓
Response 201 Created { data: {...coupon} }
      ↓
Router redirects to /admin/dashboard/coupons
      ↓
User sees new coupon in list
```

---

## Mutation Patterns

### Create Pattern
```typescript
const handleCreate = async (formData) => {
  setIsSaving(true);
  try {
    const newItem = await adminXyzService.create(formData);
    // Navigate or add to list
    router.push(`/admin/dashboard/xyz`);
  } catch (err) {
    setError(err.response?.data?.message);
  } finally {
    setIsSaving(false);
  }
};
```

### Update Pattern
```typescript
const handleUpdate = async (id, formData) => {
  setIsUpdating(true);
  try {
    const updated = await adminXyzService.update(id, formData);
    // Update local state
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    showSuccess('Updated successfully');
  } catch (err) {
    setError(err.response?.data?.errors);
  } finally {
    setIsUpdating(false);
  }
};
```

### Delete Pattern
```typescript
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  
  setIsDeleting(true);
  try {
    await adminXyzService.destroy(id);
    setItems(prev => prev.filter(i => i.id !== id));
    showSuccess('Deleted successfully');
  } catch (err) {
    showError('Delete failed');
  } finally {
    setIsDeleting(false);
  }
};
```

