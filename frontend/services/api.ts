import axios, { AxiosError, AxiosResponse } from 'axios';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ApiValidationError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  admin: { id: number; username: string; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
}

// â”€â”€â”€ Axios instance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// No Bearer token. No js-cookie reads.
// Sanctum admin_token cookie is sent automatically by the browser (withCredentials).

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: 15_000,
});

// â”€â”€â”€ Request interceptor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Reads the admin_token cookie (non-HttpOnly, so JS can access it) and injects
// it as Authorization: Bearer on every request. This replaces the fragile
// server-side InjectAdminTokenFromCookie middleware that crashed PHP on Windows.

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = 'Bearer ' + token;
    }
  }
  return config;
});

// â”€â”€â”€ Response interceptor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 401 → redirect to /gestion-bloom-secure/authentification. No retry. No token refresh.

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiValidationError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        document.cookie = 'admin_logged_in=; path=/; max-age=0; SameSite=Lax';
        window.location.href = '/gestion-bloom-secure/authentification';
      }
    }
    // Always rethrow the full AxiosError so callers can access error.response
    return Promise.reject(error);
  },
);

// â”€â”€â”€ Admin auth service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const adminAuthService = {
  login: async (payload: AdminLoginPayload): Promise<AdminLoginResponse> => {
    const { data } = await apiClient.post<AdminLoginResponse>('/v1/admin/auth/login', payload);
    if (typeof window !== 'undefined' && data.token) {
      // Persist token for request interceptor injection (reliable cross-origin)
      localStorage.setItem('admin_token', data.token);
      // Flag cookie so Next.js middleware can gate /admin/* routes server-side
      const maxAge = 60 * 60 * 24; // 24 h
      document.cookie = `admin_logged_in=1; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/v1/admin/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      document.cookie = 'admin_logged_in=; path=/; max-age=0; SameSite=Lax';
    }
  },

  me: async (): Promise<{ id: number; email: string }> => {
    const { data } = await apiClient.get<{ data: { id: number; email: string } }>('/v1/admin/auth/me');
    return data.data;
  },
};

// â”€â”€â”€ Generic resource helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const resourceService = {
  list: async <T>(resource: string, params?: Record<string, unknown>) => {
    const { data } = await apiClient.get<{ data: T[]; meta?: unknown }>(resource, { params });
    return data;
  },

  get: async <T>(resource: string, id: number | string) => {
    const { data } = await apiClient.get<{ data: T }>(`${resource}/${id}`);
    return data.data;
  },

  create: async <T>(resource: string, payload: unknown) => {
    const { data } = await apiClient.post<{ data: T }>(resource, payload);
    return data.data;
  },

  update: async <T>(resource: string, id: number | string, payload: unknown) => {
    const { data } = await apiClient.put<{ data: T }>(`${resource}/${id}`, payload);
    return data.data;
  },

  destroy: async (resource: string, id: number | string) => {
    await apiClient.delete(`${resource}/${id}`);
  },
};

// â”€â”€â”€ Domain types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ProductSize {
  id: number;
  volume_ml: number;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  sku: string;
}

export interface ProductVariant {
  id: number;
  size: number;           // in ml or g
  unit?: 'ml' | 'g';     // unit of measure
  price: number;          // base price before promotion
  final_price: number;    // price after promotion
  original_price: number | null; // base price shown crossed-out (null if no promo)
  promotion_percent: number;
  is_default: boolean;
  stock_quantity: number; // quantity in stock
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ReviewItem {
  id: number;
  reviewer_name: string;
  rating: number;
  body: string;
  images: { image_url: string }[];
  created_at: string;
}

export interface RatingDistributionEntry {
  count: number;
  percentage: number;
}

export interface RatingSummary {
  average: number;
  total: number;
  distribution: Record<number, RatingDistributionEntry>;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  ingredients?: { id: number; name: string; image_url: string | null }[];
  gender: 'men' | 'women' | 'unisex';
  is_featured: boolean;
  brand: { id: number; name: string; slug: string };
  category: { id: number; name: string; slug: string };
  product_type?: { id: number; name: string; slug: string };
  primary_image: string | null;
  images?: ProductImage[];
  sizes?: ProductSize[];
  variants?: ProductVariant[];
  reviews?: ReviewItem[];
  faqs?: { id: number; question: string; answer: string }[];
  avg_rating: number;
  review_count: number;
  stock: number;
  min_price: number;
  max_price: number;
  original_price?: number;
  badges?: string[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  products_count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  parent_id?: number | null;
  children?: Category[];
}

export interface Ingredient {
  id: number;
  name: string;
  image_url: string | null;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  price: number;
  free_over: number | null;
}

export interface CouponValidateResult {
  valid: boolean;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  savings_amount: number;
  message: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  company_name: string | null;
  promo_type: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  is_expired: boolean;
  is_exhausted: boolean;
  is_usable: boolean;
  created_at: string;
}

export interface AdminCouponStats {
  total: number;
  active: number;
  expiring_soon: number;
  total_redemptions: number;
}

export interface PlaceOrderPayload {
  customer_name: string;
  customer_phone: string;
  shipping_address: { city: string; quartier: string; zip: string; address: string };
  shipping_method_id: number;
  coupon_code?: string;
  items: { product_id: number; size_id: number; quantity: number }[];
}

export interface OrderTrackResult {
  order_number: string;
  customer_name: string;
  status: string;
  status_histories: { status: string; label: string; location: string | null; created_at: string }[];
  items: { product_name: string; product_size_label: string; quantity: number; image_url?: string; product_id: number; unit_price: number }[];
  shipping_address: { city: string };
  subtotal: number;
  shipping_cost: number;
  coupon_discount: number;
  total: number;
}

// â”€â”€â”€ Product service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const productService = {
  list: async (params?: Record<string, unknown>, signal?: AbortSignal) => {
    const { data } = await apiClient.get<{ data: Product[]; meta?: unknown }>('/v1/products', { params, signal });
    return data;
  },

  show: async (slug: string) => {
    const url = `/v1/products/${slug}`;
    console.log('[productService.show] Requesting:', `${process.env.NEXT_PUBLIC_API_URL}${url}`);
    try {
      const { data } = await apiClient.get<{ data: Product }>(url);
      console.log('[productService.show] Success:', data.data);
      return data.data;
    } catch (error) {
      console.error('[productService.show] Error:', error);
      throw error;
    }
  },
  // Aggregates for price histogram and min/max
  aggregates: async () => {
    const { data } = await apiClient.get<{ data: { min_price: number; max_price: number; buckets: number[] } }>('/v1/products/aggregates');
    return data.data;
  },
};

// â”€â”€â”€ Brand service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const brandService = {
  list: async () => {
    const { data } = await apiClient.get<{ data: Brand[] }>('/v1/brands');
    return data.data;
  },
};

// â”€â”€â”€ Category service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const categoryService = {
  list: async () => {
    const { data } = await apiClient.get<{ data: Category[] }>('/v1/categories');
    return data.data;
  },
};

// ─── Ingredient service ──────────────────────────────────────────────────────

export const ingredientService = {
  list: async () => {
    const { data } = await apiClient.get<{ data: Ingredient[] }>('/v1/ingredients');
    return data.data;
  },
};

// â”€â”€â”€ Shipping service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const shippingService = {
  list: async () => {
    const { data } = await apiClient.get<{ data: ShippingMethod[] }>('/v1/shipping-methods');
    return data.data;
  },
};

// â”€â”€â”€ Coupon service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const couponService = {
  validate: async (code: string, subtotal: number): Promise<CouponValidateResult> => {
    const { data } = await apiClient.post<CouponValidateResult>('/v1/coupons/validate', {
      code,
      order_subtotal: subtotal,
    });
    return data;
  },
};

// ─── Admin coupon service ─────────────────────────────────────────────────────────

export const adminCouponService = {
  get: async (id: number): Promise<AdminCoupon> => {
    const { data } = await apiClient.get<{ data: AdminCoupon }>(`/v1/admin/coupons/${id}`);
    return data.data;
  },
  list: async (params?: Record<string, unknown>): Promise<{ data: AdminCoupon[]; meta: AdminProductMeta }> => {
    const { data } = await apiClient.get<{ data: AdminCoupon[]; meta: AdminProductMeta }>('/v1/admin/coupons', { params });
    return data;
  },
  stats: async (): Promise<AdminCouponStats> => {
    const { data } = await apiClient.get<AdminCouponStats>('/v1/admin/coupons/stats');
    return data;
  },
  create: async (payload: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const { data } = await apiClient.post<{ data: AdminCoupon }>('/v1/admin/coupons', payload);
    return data.data;
  },
  update: async (id: number, payload: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const { data } = await apiClient.put<{ data: AdminCoupon }>(`/v1/admin/coupons/${id}`, payload);
    return data.data;
  },
  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/coupons/${id}`);
  },
};

// â”€â”€â”€ Order service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const orderService = {
  place: async (payload: PlaceOrderPayload) => {
    const { data } = await apiClient.post<{ data: { order_number: string; total: number } }>('/v1/orders', payload);
    return data.data;
  },

  track: async (orderNumber: string, phone: string): Promise<OrderTrackResult> => {
    const { data } = await apiClient.get<{ data: OrderTrackResult }>(`/v1/orders/${orderNumber}/track`, { params: { phone } });
    return data.data;
  },
};

// â”€â”€â”€ Review service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const reviewService = {
  list: async (params?: Record<string, unknown>): Promise<{ data: ReviewItem[]; rating_summary: RatingSummary }> => {
    const { data } = await apiClient.get<{ data: ReviewItem[]; rating_summary: RatingSummary }>('/v1/reviews', { params });
    return { data: data.data, rating_summary: data.rating_summary };
  },

  submit: async (
    payload: {
      product_id: number;
      order_number?: string;
      reviewer_name: string;
      rating: number;
      body: string;
    },
    images: File[] = [],
  ) => {
    // Always use FormData so the backend can receive both fields and files
    const form = new FormData();
    form.append('product_id',    String(payload.product_id));
    form.append('reviewer_name', payload.reviewer_name);
    form.append('rating',        String(payload.rating));
    form.append('body',          payload.body ?? '');
    if (payload.order_number) form.append('order_number', payload.order_number);
    images.forEach((file) => form.append('images[]', file));

    console.log('[reviewService.submit] POST /v1/reviews â€” product_id:', payload.product_id, 'rating:', payload.rating, 'images:', images.length);

    try {
      const { data } = await apiClient.post<{ data: ReviewItem }>('/v1/reviews', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('[reviewService.submit] Success â€” response:', data);
      return data.data;
    } catch (err) {
      console.error('[reviewService.submit] Request failed â€” error:', err);
      throw err;
    }
  },
};

// â”€â”€â”€ Dashboard service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DashboardSummary {
  total_revenue: number;
  revenue_trend: number;
  total_orders: number;
  orders_trend: number;
  top_product: { name: string; subtitle: string; units_sold: number };
}

export interface DashboardChartData {
  labels: string[];
  values: number[];
  orders: number[];
}

export interface DashboardCustomer {
  phone: string;
  name: string;
  orders: number;
  total_spent: string;
}

export interface DashboardOrder {
  id: number;
  order_number: string;
  items_count: number;
  date: string;
  customer: string;
  phone: string;
  status: string;
  amount: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  sales_chart: DashboardChartData;
  top_customers: DashboardCustomer[];
  recent_orders: DashboardOrder[];
}

export const dashboardService = {
  get: async (): Promise<DashboardData> => {
    const { data } = await apiClient.get<DashboardData>('/v1/admin/dashboard');
    return data;
  },
};

// â”€â”€â”€ Admin product types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  deleted_at: string | null;
  primary_image: string | null;
  category: { id: number; name: string; slug: string } | null;
  brand: { id: number; name: string; slug: string } | null;
  product_type: { id: number; name: string; slug: string } | null;
  variants?: { id: number; size: number; unit?: 'ml' | 'g'; price: number; final_price: number; original_price: number | null; promotion_percent: number; is_default: boolean; stock_quantity: number }[];
  created_at: string;
}

export interface AdminProductDetail {
  id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  gender: string;
  price: number;
  original_price?: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_gift: boolean;
  is_recommended: boolean;
  brand: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  product_type: { id: number; name: string } | null;
  images: { id: number; image_url: string; is_primary: boolean; sort_order: number }[];
  variants: { id: number; size: number; unit?: 'ml' | 'g'; price: number; final_price: number; original_price: number | null; promotion_percent: number; is_default: boolean; stock_quantity: number }[];
  sizes: { id: number; label: string; price_modifier: number; promotion_percent: number; stock_quantity: number }[];
  ingredients: { id: number; name: string; image_url: string | null }[];
  faqs: { id: number; question: string; answer: string }[];
  all_reviews: { id: number; reviewer_name: string; rating: number; comment: string; date: string | null; photo_url: string | null }[];
}

export interface AdminProductMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const adminProductService = {
  list: async (params?: Record<string, unknown>, signal?: AbortSignal): Promise<{ data: AdminProduct[]; meta: AdminProductMeta }> => {
    const { data } = await apiClient.get<{ data: AdminProduct[]; meta: AdminProductMeta }>('/v1/admin/products', { params, signal });
    return data;
  },

  get: async (id: number): Promise<AdminProductDetail> => {
    const { data } = await apiClient.get<{ data: AdminProductDetail }>(`/v1/admin/products/${id}`);
    return data.data;
  },

  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/products/${id}`);
  },
};

// ─── Admin catalogue types ────────────────────────────────────────────────────

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  parent_id: number | null;
  children?: AdminCategory[];
  products_count?: number;
}

export interface AdminBrand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  products_count?: number;
}

export interface AdminIngredient {
  id: number;
  name: string;
  slug?: string;
  image_url: string | null;
  products_count?: number;
}

// ─── Admin category service ───────────────────────────────────────────────────

export const adminCategoryService = {
  list: async (): Promise<AdminCategory[]> => {
    const { data } = await apiClient.get<{ data: AdminCategory[] }>('/v1/admin/categories');
    return data.data;
  },
  get: async (id: number): Promise<AdminCategory> => {
    const { data } = await apiClient.get<{ data: AdminCategory }>(`/v1/admin/categories/${id}`);
    return data.data;
  },
  create: async (payload: { name: string; parent_id?: number | null; sort_order?: number; image_url?: string | null }): Promise<AdminCategory> => {
    const { data } = await apiClient.post<{ data: AdminCategory }>('/v1/admin/categories', payload);
    return data.data;
  },
  update: async (id: number, payload: { name?: string; parent_id?: number | null; sort_order?: number; image_url?: string | null }): Promise<AdminCategory> => {
    const { data } = await apiClient.put<{ data: AdminCategory }>(`/v1/admin/categories/${id}`, payload);
    return data.data;
  },
  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/categories/${id}`);
  },
};

// ─── Admin brand service ──────────────────────────────────────────────────────

export const adminBrandService = {
  list: async (): Promise<AdminBrand[]> => {
    const { data } = await apiClient.get<{ data: AdminBrand[] }>('/v1/admin/brands');
    return data.data;
  },
  get: async (id: number): Promise<AdminBrand> => {
    const { data } = await apiClient.get<{ data: AdminBrand }>(`/v1/admin/brands/${id}`);
    return data.data;
  },
  create: async (payload: { name: string; logo_url?: string | null }): Promise<AdminBrand> => {
    const { data } = await apiClient.post<{ data: AdminBrand }>('/v1/admin/brands', payload);
    return data.data;
  },
  update: async (id: number, payload: { name?: string; logo_url?: string | null }): Promise<AdminBrand> => {
    const { data } = await apiClient.put<{ data: AdminBrand }>(`/v1/admin/brands/${id}`, payload);
    return data.data;
  },
  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/brands/${id}`);
  },
};

// ─── Admin ingredient service ─────────────────────────────────────────────────

export const adminIngredientService = {
  list: async (): Promise<AdminIngredient[]> => {
    const { data } = await apiClient.get<{ data: AdminIngredient[] }>('/v1/ingredients');
    return data.data;
  },
  get: async (id: number): Promise<AdminIngredient> => {
    const { data } = await apiClient.get<{ data: AdminIngredient }>(`/v1/admin/ingredients/${id}`);
    return data.data;
  },
  create: async (formData: FormData): Promise<AdminIngredient> => {
    const { data } = await apiClient.post<{ data: AdminIngredient }>('/v1/admin/ingredients', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  update: async (id: number, formData: FormData): Promise<AdminIngredient> => {
    formData.set('_method', 'PUT');
    const { data } = await apiClient.post<{ data: AdminIngredient }>(`/v1/admin/ingredients/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/ingredients/${id}`);
  },
};

export const adminProductTypeService = {
  list: async (): Promise<{ id: number; name: string; slug: string }[]> => {
    const { data } = await apiClient.get<{ data: { id: number; name: string; slug: string }[] }>('/v1/admin/product-types');
    return data.data;
  },
};

// ─── Banner types ─────────────────────────────────────────────────────────────

export interface Banner {
  id: number;
  title: string | null;
  image_path: string;
  link: string | null;
  position?: number;
  type?: 'homepage_slot' | 'collection_hero';
  collection_id?: number | null;
  is_active?: boolean;
}

// ─── Hero video types ─────────────────────────────────────────────────────────

export interface HeroVideo {
  id: number;
  url: string;
  path: string;
  type: 'desktop' | 'mobile';
  display_order: number;
  is_active: boolean;
  is_legacy: boolean;
  created_at: string | null;
}

// â”€â”€â”€ Banner service (public) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const bannerService = {
  /**
   * Returns up to 4 active homepage slot banners ordered by position.
   */
  getHomepage: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get<{ data: Banner[] }>('/v1/banners/homepage');
    return data.data;
  },

  /**
   * Returns the hero banner for a given collection (category) id, or null.
   */
  getCollectionHero: async (collectionId?: number | null): Promise<Banner | null> => {
    // If no collectionId provided, call /v1/banners/collection/ to get the global hero
    const url = collectionId ? `/v1/banners/collection/${collectionId}` : `/v1/banners/collection`;
    const { data } = await apiClient.get<{ data: Banner | null }>(url);
    return data.data;
  },
};

// â”€â”€â”€ Admin banner service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const adminBannerService = {
  list: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get<{ data: Banner[] }>('/v1/admin/banners');
    return data.data;
  },

  store: async (formData: FormData): Promise<Banner> => {
    const { data } = await apiClient.post<{ data: Banner }>('/v1/admin/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (id: number, formData: FormData): Promise<Banner> => {
    const { data } = await apiClient.put<{ data: Banner }>(`/v1/admin/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/banners/${id}`);
  },
};

// ─── Admin video service ──────────────────────────────────────────────────────

export const adminVideoService = {
  list: async (): Promise<HeroVideo[]> => {
    const { data } = await apiClient.get<{ data: HeroVideo[] }>('/v1/admin/videos');
    return data.data;
  },

  store: async (formData: FormData): Promise<HeroVideo> => {
    const { data } = await apiClient.post<{ data: HeroVideo }>('/v1/admin/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (
    id: number,
    payload: { display_order?: number; is_active?: boolean; type?: 'desktop' | 'mobile' },
  ): Promise<HeroVideo> => {
    const { data } = await apiClient.patch<{ data: HeroVideo }>(`/v1/admin/videos/${id}`, payload);
    return data.data;
  },

  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/videos/${id}`);
  },
};

// â”€â”€â”€ Admin Profile Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const adminProfileService = {
  getProfile: async (): Promise<any> => {
    // Request deduplication: prevent multiple simultaneous API calls
    if (!adminProfileService._profilePromise) {
      adminProfileService._profilePromise = apiClient
        .get('/v1/admin/profile')
        .then((response) => {
          adminProfileService._profilePromise = null;
          return response.data.data;
        })
        .catch((error) => {
          adminProfileService._profilePromise = null;
          throw error;
        });
    }
    return adminProfileService._profilePromise;
  },
  _profilePromise: null as Promise<any> | null,
  updateProfile: async (formData: FormData): Promise<any> => {
    // Use raw axios (NOT apiClient) to avoid the default Content-Type: application/json
    // which prevents the browser from setting multipart/form-data with the required boundary.
    // Without the correct boundary, PHP $_FILES is empty and $request->hasFile() returns false.
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const { data } = await axios.post(`${baseURL}/v1/admin/profile`, formData, {
      headers: {
        'Accept': 'application/json',
        // No Content-Type — browser sets multipart/form-data with boundary automatically
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    });
    
    return data;
  },
  changePassword: async (payload: any): Promise<any> => {
    const { data } = await apiClient.put('/v1/admin/profile/password', payload);
    return data;
  }
};

export default apiClient;

// ─── Public Store Info ──────────────────────────────────────────────────────
export const storeService = {
  getContact: async (): Promise<{ email: string | null; phone: string | null }> => {
    const { data } = await apiClient.get<{ data: { email: string | null; phone: string | null } }>('/v1/store/contact');
    return data.data;
  },

  submitContact: async (payload: { name: string; phone: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>('/v1/store/contact-submit', payload);
    return data;
  },
};

export interface AdminOrderMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Product item in order - includes product details and primary image
 */
export interface AdminOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;  // Calculated: unit_price * quantity (NOT total_price)
  size_label?: string;
  product: {
    id: number;
    name: string;
    slug: string;
    image_url?: string;  // Primary image URL from backend
    images?: Array<{
      url: string;
      alt?: string;
      is_primary: boolean;
      sort_order: number;
    }>;
  };
}

/**
 * Full order with complete details including items and images
 */
export interface AdminOrderFull {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  status: string;
  items_count: number;
  customer_total_orders?: number;
  customer_total_spent?: number;
  customer_total_items?: number;
  created_at: string;
  items: AdminOrderItem[];
  shipping_method?: { id: number; name: string };
  coupon?: { id: number; code: string; type?: string } | null;
  status_histories?: Array<{
    status: string;
    label: string;
    location?: string;
    created_at: string;
  }>;
}

/**
 * Minimal order for list views (backward compatible)
 */
export interface AdminOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: string;
  items_count: number;
  created_at: string;
  items?: AdminOrderItem[]; // Optional for backward compatibility
}

export interface AdminOrderStats {
  total: { count: number; trend: number; };
  confirmed: { count: number; trend: number; };
  delivered: { count: number; trend: number; };
}

export const adminOrderService = {
  list: async (params?: Record<string, unknown>): Promise<{ data: AdminOrder[]; meta: AdminOrderMeta }> => {
    const { data } = await apiClient.get<{ data: AdminOrder[]; meta: AdminOrderMeta }>('/v1/admin/orders', { params });
    return data;
  },
  /**
   * Fetch full order details including items, shipping, coupon, and status history
   * Backend loads: items.product, statusHistories, shippingMethod, coupon
   */
  get: async (orderId: number): Promise<AdminOrderFull> => {
    const { data } = await apiClient.get<{ data: AdminOrderFull }>(`/v1/admin/orders/${orderId}`);
    return data.data;
  },
  stats: async (): Promise<AdminOrderStats> => {
    const { data } = await apiClient.get<AdminOrderStats>('/v1/admin/orders/stats');
    return data;
  },
  updateStatus: async (orderId: number, status: string): Promise<void> => {
    await apiClient.patch(`/v1/admin/orders/${orderId}/status`, { status });
  }
};

// ─── Admin Review types ───────────────────────────────────────────────────────

export interface AdminReview {
  id: number;
  reviewer_name: string;
  rating: number;
  body: string | null;
  is_approved: boolean;
  approved_at: string | null;
  order_number: string | null;
  product: { id: number; name: string; slug: string } | null;
  images: { image_url: string }[];
  created_at: string;
}

export interface AdminReviewStats {
  average_rating: number;
  total: number;
  pending: number;
  distribution: Record<number, { count: number; percentage: number }>;
  most_reviewed: {
    product_name: string;
    product_image: string | null;
    count: number;
  } | null;
}

// ─── Admin Review service ─────────────────────────────────────────────────────

export const adminReviewService = {
  list: async (params?: Record<string, unknown>): Promise<{ data: AdminReview[]; meta: AdminProductMeta }> => {
    const { data } = await apiClient.get<{ data: AdminReview[]; meta: AdminProductMeta }>('/v1/admin/reviews', { params });
    return data;
  },
  stats: async (): Promise<AdminReviewStats> => {
    const { data } = await apiClient.get<AdminReviewStats>('/v1/admin/reviews/stats');
    return data;
  },
  create: async (payload: FormData | { reviewer_name: string; rating: number; body?: string | null; product_id?: number | null; date?: string }): Promise<AdminReview> => {
    const isFormData = payload instanceof FormData;
    const { data } = await apiClient.post<{ data: AdminReview }>(
      '/v1/admin/reviews',
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined,
    );
    return data.data;
  },
  update: async (id: number, payload: { reviewer_name?: string; rating?: number; body?: string | null; product_id?: number | null }): Promise<AdminReview> => {
    const { data } = await apiClient.patch<{ data: AdminReview }>(`/v1/admin/reviews/${id}`, payload);
    return data.data;
  },
  approve: async (id: number): Promise<void> => {
    await apiClient.patch(`/v1/admin/reviews/${id}/approve`);
  },
  reject: async (id: number): Promise<void> => {
    await apiClient.patch(`/v1/admin/reviews/${id}/reject`);
  },
  traiter: async (id: number): Promise<void> => {
    await apiClient.patch(`/v1/admin/reviews/${id}/traiter`);
  },
  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/reviews/${id}`);
  },
};


