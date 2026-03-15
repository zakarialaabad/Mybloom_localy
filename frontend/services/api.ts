import axios, { AxiosError, AxiosResponse } from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiValidationError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  admin: { id: number; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
}

// ─── Axios instance ───────────────────────────────────────────────────────────
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

// ─── Request interceptor ──────────────────────────────────────────────────────
// Reads the admin_token cookie (non-HttpOnly, so JS can access it) and injects
// it as Authorization: Bearer on every request. This replaces the fragile
// server-side InjectAdminTokenFromCookie middleware that crashed PHP on Windows.

apiClient.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
    if (match) {
      const token = decodeURIComponent(match[1]);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────
// 401 → redirect to /admin/login. No retry. No token refresh.

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiValidationError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear the frontend-domain cookie before redirecting
        document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error.response?.data ?? error);
  },
);

// ─── Admin auth service ───────────────────────────────────────────────────────

export const adminAuthService = {
  login: async (payload: AdminLoginPayload): Promise<AdminLoginResponse> => {
    const { data } = await apiClient.post<AdminLoginResponse>('/v1/admin/auth/login', payload);
    // Set the token as a cookie on the frontend domain (localhost) so
    // Next.js Edge middleware can read it for route protection.
    if (typeof document !== 'undefined' && data.token) {
      const maxAge = 60 * 60 * 24; // 24 h
      document.cookie = `admin_token=${encodeURIComponent(data.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/v1/admin/auth/logout');
    // Remove the frontend-domain cookie too
    if (typeof document !== 'undefined') {
      document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
    }
  },

  me: async (): Promise<{ id: number; email: string }> => {
    const { data } = await apiClient.get<{ data: { id: number; email: string } }>('/v1/admin/auth/me');
    return data.data;
  },
};

// ─── Generic resource helpers ─────────────────────────────────────────────────

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

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface ProductSize {
  id: number;
  volume_ml: number;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  sku: string;
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
  primary_image: string;
  images?: ProductImage[];
  sizes?: ProductSize[];
  reviews?: ReviewItem[];
  faqs?: { id: number; question: string; answer: string }[];
  avg_rating: number;
  review_count: number;
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

export interface ShippingMethod {
  id: number;
  name: string;
  label: string;
  price: number;
  free_above: number | null;
}

export interface CouponValidateResult {
  valid: boolean;
  discount_type: 'flat' | 'percent';
  discount_value: number;
  savings_amount: number;
  message: string;
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
  status_histories: { status: string; note: string | null; changed_at: string }[];
  items: { product_name: string; product_size_label: string; quantity: number; image_url?: string; product_id: number; unit_price: number }[];
  shipping_address: { city: string };
  subtotal: number;
  shipping_cost: number;
  coupon_discount: number;
  total: number;
}

// ─── Product service ──────────────────────────────────────────────────────────

export const productService = {
  list: async (params?: Record<string, unknown>, signal?: AbortSignal) => {
    const { data } = await apiClient.get<{ data: Product[]; meta?: unknown }>('/v1/products', { params, signal });
    return data;
  },

  show: async (slug: string) => {
    const { data } = await apiClient.get<{ data: Product }>(`/v1/products/${slug}`);
    return data.data;
  },
  // Aggregates for price histogram and min/max
  aggregates: async () => {
    const { data } = await apiClient.get<{ data: { min_price: number; max_price: number; buckets: number[] } }>('/v1/products/aggregates');
    return data.data;
  },
};

// ─── Brand service ────────────────────────────────────────────────────────────

export const brandService = {
  list: async () => {
    const { data } = await apiClient.get<{ data: Brand[] }>('/v1/brands');
    return data.data;
  },
};

// ─── Category service ─────────────────────────────────────────────────────────

export const categoryService = {
  list: async () => {
    const { data } = await apiClient.get<{ data: Category[] }>('/v1/categories');
    return data.data;
  },
};

// ─── Shipping service ─────────────────────────────────────────────────────────

export const shippingService = {
  list: async () => {
    const { data } = await apiClient.get<{ data: ShippingMethod[] }>('/v1/shipping-methods');
    return data.data;
  },
};

// ─── Coupon service ───────────────────────────────────────────────────────────

export const couponService = {
  validate: async (code: string, order_total: number): Promise<CouponValidateResult> => {
    const { data } = await apiClient.post<{ data: CouponValidateResult }>('/v1/coupons/validate', { code, order_total });
    return data.data;
  },
};

// ─── Order service ────────────────────────────────────────────────────────────

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

// ─── Review service ───────────────────────────────────────────────────────────

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

    console.log('[reviewService.submit] POST /v1/reviews — product_id:', payload.product_id, 'rating:', payload.rating, 'images:', images.length);

    try {
      const { data } = await apiClient.post<{ data: ReviewItem }>('/v1/reviews', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('[reviewService.submit] Success — response:', data);
      return data.data;
    } catch (err) {
      console.error('[reviewService.submit] Request failed — error:', err);
      throw err;
    }
  },
};

// ─── Dashboard service ───────────────────────────────────────────────────────

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
  product: string;
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

// ─── Admin product types ──────────────────────────────────────────────────────

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  deleted_at: string | null;
  primary_image: string | null;
  category: { id: number; name: string; slug: string } | null;
  brand: { id: number; name: string; slug: string } | null;
  product_type: { id: number; name: string; slug: string } | null;
  created_at: string;
}

export interface AdminProductDetail {
  id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  gender: string;
  price: number;
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
  sizes: { id: number; label: string; price_modifier: number; stock_quantity: number }[];
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
  list: async (params?: Record<string, unknown>): Promise<{ data: AdminProduct[]; meta: AdminProductMeta }> => {
    const { data } = await apiClient.get<{ data: AdminProduct[]; meta: AdminProductMeta }>('/v1/admin/products', { params });
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

// ─── Admin category service ───────────────────────────────────────────────────

export const adminCategoryService = {
  list: async (): Promise<{ id: number; name: string; slug: string }[]> => {
    const { data } = await apiClient.get<{ data: { id: number; name: string; slug: string }[] }>('/v1/admin/categories');
    return data.data;
  },
};

export const adminProductTypeService = {
  list: async (): Promise<{ id: number; name: string; slug: string }[]> => {
    const { data } = await apiClient.get<{ data: { id: number; name: string; slug: string }[] }>('/v1/admin/product-types');
    return data.data;
  },
};

export default apiClient;
