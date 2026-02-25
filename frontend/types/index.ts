// ─── Re-export all domain types from the single source of truth ───────────────
// Do NOT duplicate type declarations here — reference services/api.ts directly.
export type {
  Product,
  ProductSize,
  ProductImage,
  ReviewItem,
  Brand,
  Category,
  ShippingMethod,
  CouponValidateResult,
  PlaceOrderPayload,
  OrderTrackResult,
  ApiValidationError,
  AdminLoginPayload,
  AdminLoginResponse,
  PaginatedResponse,
} from '@/services/api';

// ─── API error shape ──────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
