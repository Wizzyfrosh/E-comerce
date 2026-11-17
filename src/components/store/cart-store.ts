import { create } from "zustand";

/**
 * Tiny Phase-1 client store for header badge counts.
 * Phase 2 will replace with a full cart line-items store backed by Supabase.
 */
interface CartStoreState {
  cartCount: number;
  wishlistCount: number;
  addToCart: () => void;
  addWishlist: () => void;
  removeWishlist: () => void;
}

export const useCartStore = create<CartStoreState>((set) => ({
  cartCount: 2,
  wishlistCount: 3,
  addToCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  addWishlist: () =>
    set((state) => ({ wishlistCount: state.wishlistCount + 1 })),
  removeWishlist: () =>
    set((state) => ({
      wishlistCount: Math.max(0, state.wishlistCount - 1),
    })),
}));
