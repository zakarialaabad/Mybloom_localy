/**
 * Centralized Status Configuration
 * Single source of truth for all status colors, labels, and styles
 * Used across Orders, Products, Reviews, Coupons, and Dashboard pages
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * ORDER STATUSES
 * ═══════════════════════════════════════════════════════════════════════════ */

export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
    description: 'Awaiting confirmation',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    description: 'Order confirmed and validated',
  },
  preparing: {
    label: 'Preparing',
    badge: 'bg-orange-50 text-orange-700 border border-orange-200',
    dot: 'bg-orange-500',
    description: 'Being prepared for shipment',
  },
  shipped: {
    label: 'Shipped',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200',
    dot: 'bg-purple-500',
    description: 'In transit',
  },
  delivered: {
    label: 'Delivered',
    badge: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    description: 'Successfully delivered',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    description: 'Order cancelled',
  },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_CONFIG;

/**
 * Order Status Timeline Ranking
 * Used in sidebars to determine which steps are completed
 * -1 = no steps, 0 = step 1, 1 = steps 1-2, 2 = steps 1-3, 3 = all steps
 */
export const ORDER_STATUS_RANK: Record<OrderStatus | 'dispatched', number> = {
  pending: -1,
  confirmed: 0,
  preparing: 1,
  shipped: 2,
  dispatched: 2,
  delivered: 3,
  cancelled: -1,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * REVIEW STATUSES
 * ═══════════════════════════════════════════════════════════════════════════ */

export const REVIEW_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-500',
    description: 'Awaiting moderation',
  },
  approved: {
    label: 'Approved',
    badge: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    description: 'Published and visible',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    description: 'Rejected from publication',
  },
} as const;

export type ReviewStatus = keyof typeof REVIEW_STATUS_CONFIG;

/* ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT STOCK STATUSES
 * ═══════════════════════════════════════════════════════════════════════════ */

export const PRODUCT_STOCK_STATUS_CONFIG = {
  active: {
    label: 'Active',
    badge: 'bg-green-50 text-green-600 border border-green-200',
    dot: 'bg-green-500',
    description: 'In stock',
  },
  low_stock: {
    label: 'Low Stock',
    badge: 'bg-orange-50 text-orange-600 border border-orange-200',
    dot: 'bg-orange-400',
    description: 'Low inventory',
  },
  inactive: {
    label: 'Inactive',
    badge: 'bg-gray-50 text-gray-500 border border-gray-200',
    dot: 'bg-gray-400',
    description: 'Out of stock',
  },
} as const;

export type ProductStockStatus = keyof typeof PRODUCT_STOCK_STATUS_CONFIG;

/* ═══════════════════════════════════════════════════════════════════════════
 * COUPON STATUSES
 * ═══════════════════════════════════════════════════════════════════════════ */

export const COUPON_STATUS_CONFIG = {
  active: {
    label: 'Active',
    badge: 'bg-green-50 text-green-600 border border-green-200',
    dot: 'bg-green-500',
    description: 'Valid and usable',
  },
  expired: {
    label: 'Expired',
    badge: 'bg-red-50 text-red-600 border border-red-200',
    dot: 'bg-red-500',
    description: 'Expiry date passed',
  },
  exhausted: {
    label: 'Exhausted',
    badge: 'bg-gray-50 text-gray-600 border border-gray-200',
    dot: 'bg-gray-400',
    description: 'Usage limit reached',
  },
  archived: {
    label: 'Archived',
    badge: 'bg-slate-50 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
    description: 'Archived coupon',
  },
} as const;

export type CouponStatus = keyof typeof COUPON_STATUS_CONFIG;

/* ═══════════════════════════════════════════════════════════════════════════
 * GENERAL STATUS UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get status config by status key and type
 * @param status - Status identifier
 * @param type - Status category (order, review, product, coupon)
 */
export function getStatusConfig(
  status: string,
  type: 'order' | 'review' | 'product' | 'coupon'
) {
  const configs = {
    order: ORDER_STATUS_CONFIG,
    review: REVIEW_STATUS_CONFIG,
    product: PRODUCT_STOCK_STATUS_CONFIG,
    coupon: COUPON_STATUS_CONFIG,
  };

  const config = configs[type] as Record<string, any>;
  return config[status.toLowerCase()] || config.pending;
}

/**
 * Get status badge CSS class
 */
export function getStatusBadge(status: string, type: 'order' | 'review' | 'product' | 'coupon') {
  return getStatusConfig(status, type).badge;
}

/**
 * Get status dot color CSS class
 */
export function getStatusDot(status: string, type: 'order' | 'review' | 'product' | 'coupon') {
  return getStatusConfig(status, type).dot;
}

/**
 * Get status label
 */
export function getStatusLabel(status: string, type: 'order' | 'review' | 'product' | 'coupon') {
  return getStatusConfig(status, type).label;
}

/**
 * Get status description
 */
export function getStatusDescription(
  status: string,
  type: 'order' | 'review' | 'product' | 'coupon'
) {
  return getStatusConfig(status, type).description;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD STATUS STYLES (for dashboard overview)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DASHBOARD_STATUS_STYLE = {
  shipped: 'bg-green-100 text-green-600',
  pending: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-blue-100 text-blue-600',
  cancelled: 'bg-red-100 text-red-600',
  default: 'bg-gray-100 text-gray-500',
} as const;

export const DASHBOARD_STATUS_DOT = {
  shipped: 'bg-green-500',
  pending: 'bg-yellow-400',
  delivered: 'bg-blue-500',
  cancelled: 'bg-red-400',
  default: 'bg-gray-400',
} as const;
