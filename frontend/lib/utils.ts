/**
 * Centralized Constants & Helper Functions
 * Used across all admin pages to ensure consistency
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * PAGINATION DEFAULTS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 25,
  PER_PAGE_OPTIONS: [10, 25, 50, 100] as const,
  MAX_VISIBLE_PAGES: 7,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION RULES & PATTERNS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  URL_PATTERN: /^(https?|ftp):\/\/[^\s]+$/,
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  COUPON_CODE_PATTERN: /^[A-Z0-9]+(?:[_-][A-Z0-9]+)*$/,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  DESCRIPTION_MAX_LENGTH: 5000,
  TITLE_MAX_LENGTH: 200,
  SLUG_MAX_LENGTH: 100,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT STOCK SETTINGS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const PRODUCT_CONFIG = {
  LOW_STOCK_THRESHOLD: 10,
  DISCOUNT_MIN: 0,
  DISCOUNT_MAX: 100,
  PRICE_MIN: 0,
  PRICE_MAX: 999999.99,
  MAX_PRODUCT_IMAGES: 5,
  MAX_PRODUCT_VARIANTS: 50,
  IMAGE_MAX_SIZE_MB: 10,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * COUPON SETTINGS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const COUPON_CONFIG = {
  CODE_MIN_LENGTH: 3,
  CODE_MAX_LENGTH: 50,
  DISCOUNT_TYPES: ['percentage', 'fixed_amount'] as const,
  DISCOUNT_MIN: 0,
  DISCOUNT_MAX: 999999.99,
  MIN_USAGE_LIMIT: 1,
  MAX_USAGE_LIMIT: 999999,
  MAX_TOTAL_USES: 999999,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * DATE & TIME FORMATTING
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DATE_FORMAT = {
  LOCALE: 'en-US',
  SHORT: { month: 'short', day: 'numeric', year: 'numeric' } as const,
  LONG: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' } as const,
  WITH_TIME: {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  } as const,
  ISO: 'ISO', // Use ISO format with custom parsing
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * FORMATTING UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Format date to readable string
 * @param iso ISO date string
 * @param style 'short' | 'long' | 'with-time'
 */
export function formatDate(
  iso: string | null | undefined,
  style: 'short' | 'long' | 'with-time' = 'short'
): string {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '—';

    const formats = {
      short: DATE_FORMAT.SHORT,
      long: DATE_FORMAT.LONG,
      'with-time': DATE_FORMAT.WITH_TIME,
    };

    return date.toLocaleDateString(DATE_FORMAT.LOCALE, formats[style] as any);
  } catch {
    return '—';
  }
}

/**
 * Format currency value
 * @param value Number to format
 * @param currency Currency code (default: 'MAD')
 */
export function formatCurrency(value: number | null | undefined, currency = 'MAD'): string {
  if (value === null || value === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  } catch {
    return '—';
  }
}

/**
 * Format percentage
 * @param value Number between 0-100
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
}

/**
 * Get user initials from name
 * @param name Full name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}

/**
 * Capitalize first letter
 * @param str String to capitalize
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format trend percentage
 * @param trend Trend number positive or negative
 */
export function formatTrend(trend: number): string {
  if (trend > 0) return `+${trend}%`;
  if (trend < 0) return `${trend}%`;
  return '0%';
}

/**
 * Convert to slug format
 * @param text Text to slugify
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert to URL-safe slug
 * @param text Text to encode
 */
export function encodeSlug(text: string): string {
  return encodeURIComponent(slugify(text));
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delayMs);
  };
}

/**
 * Check if date is expired
 */
export function isDateExpired(iso: string | null | undefined): boolean {
  if (!iso) return false;
  try {
    return new Date(iso) < new Date();
  } catch {
    return false;
  }
}

/**
 * Check if date is within days
 */
export function isWithinDays(iso: string | null | undefined, days: number): boolean {
  if (!iso) return false;
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= days;
  } catch {
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ERROR & SUCCESS MESSAGE TEMPLATES
 * ═══════════════════════════════════════════════════════════════════════════ */

export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Successfully created',
    UPDATED: 'Successfully updated',
    DELETED: 'Successfully deleted',
    SAVED: 'Changes saved',
  },
  ERROR: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Invalid phone number',
    INVALID_URL: 'Invalid URL',
    INVALID_SLUG: 'Invalid slug format',
    INVALID_CODE: 'Invalid code format',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    NETWORK_ERROR: 'Network error. Please try again.',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized. Please log in again.',
    FORBIDDEN: 'You do not have permission to perform this action',
    SERVER_ERROR: 'Server error. Please try again later.',
    DUPLICATE: 'This value already exists',
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * IMAGE UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════ */

export const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

/**
 * Sanitize an image URL: strip newlines only.
 * Do NOT percent-encode — the browser handles encoding from a raw src attribute.
 * Encoding here causes double-encoding (%20 → %2520) which breaks image loads.
 * 
 * @param url The image URL to sanitize
 * @returns Sanitized URL, or fallback if invalid
 */
export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return FALLBACK_IMG;
  // Strip embedded newline / carriage-return / tab chars (seeder data issue)
  const cleaned = url.replace(/[\r\n\t]+/g, '').trim();
  if (!cleaned) return FALLBACK_IMG;
  // SECURITY: Only allow http, https, and relative paths — block javascript:, data:, etc.
  if (/^(https?:\/\/|\/)/i.test(cleaned)) return cleaned;
  return FALLBACK_IMG;
}
