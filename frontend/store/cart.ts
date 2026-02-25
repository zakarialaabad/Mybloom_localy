import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId  : number;
  productName: string;
  slug       : string;
  sizeLabel  : string | null;
  quantity   : number;
  unitPrice  : number;
  imageUrl   : string;
}

interface CartStore {
  items      : CartItem[];
  addItem    : (item: CartItem) => void;
  removeItem : (productId: number, sizeLabel: string | null) => void;
  updateQty  : (productId: number, sizeLabel: string | null, qty: number) => void;
  clearCart  : () => void;
  itemCount  : () => number;
  subtotal   : () => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Cart is in-memory only. Never persisted to backend.
// Contents are consumed at checkout as the `items[]` payload of POST /api/v1/orders.
// Server always re-resolves prices from DB — unitPrice here is for display only.

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (incoming) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === incoming.productId && i.sizeLabel === incoming.sizeLabel,
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + incoming.quantity,
        };
        return { items: updated };
      }

      return { items: [...state.items, incoming] };
    });
  },

  removeItem: (productId, sizeLabel) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.productId === productId && i.sizeLabel === sizeLabel),
      ),
    }));
  },

  updateQty: (productId, sizeLabel, qty) => {
    if (qty <= 0) {
      get().removeItem(productId, sizeLabel);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId && i.sizeLabel === sizeLabel ? { ...i, quantity: qty } : i,
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
}));

export default useCartStore;
