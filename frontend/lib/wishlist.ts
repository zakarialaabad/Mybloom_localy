import Cookies from 'js-cookie';

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME  = 'bloom_wishlist';
const EXPIRY_DAYS  = 30;
const MAX_ITEMS    = 50;

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires : EXPIRY_DAYS,
  path    : '/',
  sameSite: 'Lax',
  secure  : process.env.NODE_ENV === 'production',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the current wishlist as an array of integer product IDs.
 * Corrupt or non-integer values are silently discarded.
 */
export function getWishlist(): number[] {
  try {
    const raw = Cookies.get(COOKIE_NAME);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

/**
 * Adds a product ID to the wishlist cookie.
 * No-op if the ID is already present or the 50-item cap is reached.
 */
export function addToWishlist(productId: number): void {
  const current = getWishlist();
  if (current.includes(productId)) return;
  if (current.length >= MAX_ITEMS) return;
  Cookies.set(COOKIE_NAME, JSON.stringify([...current, productId]), COOKIE_OPTIONS);
}

/**
 * Removes a product ID from the wishlist cookie.
 * Removes the cookie entirely when the list reaches 0 items.
 */
export function removeFromWishlist(productId: number): void {
  const updated = getWishlist().filter(id => id !== productId);
  if (updated.length === 0) {
    Cookies.remove(COOKIE_NAME, { path: '/' });
    return;
  }
  Cookies.set(COOKIE_NAME, JSON.stringify(updated), COOKIE_OPTIONS);
}

/**
 * Returns true if the product ID is present in the wishlist cookie.
 */
export function isInWishlist(productId: number): boolean {
  return getWishlist().includes(productId);
}

/**
 * Toggles a product ID in the wishlist — adds if absent, removes if present.
 * Returns true if the product is now in the wishlist.
 */
export function toggleWishlist(productId: number): boolean {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  } else {
    addToWishlist(productId);
    return true;
  }
}

/**
 * Removes the wishlist cookie entirely.
 */
export function clearWishlist(): void {
  Cookies.remove(COOKIE_NAME, { path: '/' });
}
