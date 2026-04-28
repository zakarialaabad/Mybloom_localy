import { create } from 'zustand';
import Cookies from 'js-cookie';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId     : number;
  productName   : string;
  slug          : string;
  productType  ?: string;
  sizeId        : number;
  sizeLabel     : string | null;
  quantity      : number;
  unitPrice     : number;
  originalPrice ?: number;
  imageUrl      : string;
}

export interface AppliedCoupon {
  code           : string;
  savingsAmount  : number;
  message        : string;
}

interface CartStore {
  items         : CartItem[];
  appliedCoupon : AppliedCoupon | null;
  addItem       : (item: CartItem) => void;
  removeItem    : (productId: number, sizeLabel: string | null) => void;
  updateQty     : (productId: number, sizeLabel: string | null, qty: number) => void;
  clearCart     : () => void;
  itemCount     : () => number;
  subtotal      : () => number;
  setCoupon     : (coupon: AppliedCoupon | null) => void;
  clearCoupon   : () => void;
}

// ─── Cookie persistence (same pattern as wishlist) ────────────────────────────

const CART_COOKIE   = 'bloom_cart';
const EXPIRY_DAYS   = 30;

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires : EXPIRY_DAYS,
  path    : '/',
  sameSite: 'Lax',
  secure  : process.env.NODE_ENV === 'production',
};

function loadCartFromCookie(): CartItem[] {
  try {
    const raw = Cookies.get(CART_COOKIE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToCookie(items: CartItem[]): void {
  if (items.length === 0) {
    Cookies.remove(CART_COOKIE, { path: '/' });
  } else {
    Cookies.set(CART_COOKIE, JSON.stringify(items), COOKIE_OPTIONS);
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Cart items are persisted in a cookie for 30 days (same as wishlist).
// Coupon is session-only — not persisted (coupons are single-use & time-sensitive).
// Server always re-resolves prices from DB — unitPrice here is for display only.

const useCartStore = create<CartStore>((set, get) => ({
  items: loadCartFromCookie(),
  appliedCoupon: null,

  addItem: (incoming) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === incoming.productId && i.sizeLabel === incoming.sizeLabel,
      );

      let updated: CartItem[];
      if (existingIndex >= 0) {
        updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + incoming.quantity,
        };
      } else {
        updated = [...state.items, incoming];
      }

      saveCartToCookie(updated);
      return { items: updated };
    });
  },

  removeItem: (productId, sizeLabel) => {
    set((state) => {
      const updated = state.items.filter(
        (i) => !(i.productId === productId && i.sizeLabel === sizeLabel),
      );
      saveCartToCookie(updated);
      return { items: updated };
    });
  },

  updateQty: (productId, sizeLabel, qty) => {
    if (qty <= 0) {
      get().removeItem(productId, sizeLabel);
      return;
    }
    set((state) => {
      const updated = state.items.map((i) =>
        i.productId === productId && i.sizeLabel === sizeLabel ? { ...i, quantity: qty } : i,
      );
      saveCartToCookie(updated);
      return { items: updated };
    });
  },

  clearCart: () => {
    saveCartToCookie([]);
    set({ items: [], appliedCoupon: null });
  },

  itemCount: () => get().items.length,

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

  setCoupon: (coupon) => set({ appliedCoupon: coupon }),

  clearCoupon: () => set({ appliedCoupon: null }),
}));

export default useCartStore;
