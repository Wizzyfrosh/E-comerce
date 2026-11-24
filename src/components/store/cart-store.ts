import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types/commerce";

/**
 * Phase 3 client cart + wishlist store (zustand, persisted to localStorage).
 *
 * Persistence keys (two separate zustand persist middlewares):
 *  - `digitaz-cart-v1`     → `lines` only
 *  - `digitaz-wishlist-v1` → `wishlist` only
 * `drawerOpen` is UI state and is intentionally NOT persisted.
 *
 * The client cart holds a price snapshot (`unitPrice`) for display only.
 * Authoritative prices, stock and totals are recomputed server-side by
 * `recomputeCart` in `@/lib/actions/cart`.
 */

export interface AddItemInput {
  productId: string;
  slug: string;
  name: string;
  image_url: string;
  sku: string;
  /** Selected variant ids (empty array when the product has no variants). */
  variantIds: string[];
  /** Human labels, e.g. "Rose Gold · 512GB". */
  optionLabels: string;
  /** Client price snapshot — server recomputes the real price. */
  unitPrice: number;
  qty?: number;
}

interface CartStoreState {
  lines: CartLine[];
  /** Wishlist product slugs (client/local mirror of the Supabase wishlists table). */
  wishlist: string[];
  drawerOpen: boolean;
  addItem: (input: AddItemInput) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
  toggleWishlist: (slug: string) => void;
  inWishlist: (slug: string) => boolean;
}

export const MAX_LINE_QTY = 99;

/** Stable cart-line identity: productId + sorted variant ids. */
export function cartLineKey(productId: string, variantIds: string[]): string {
  return `${productId}::${[...variantIds].sort().join("-")}`;
}

const clampQty = (qty: number): number =>
  Math.max(1, Math.min(MAX_LINE_QTY, Math.floor(qty) || 1));

export const useCartStore = create<CartStoreState>()(
  persist(
    persist(
      (set, get) => ({
        lines: [],
        wishlist: [],
        drawerOpen: false,

        addItem: (input) => {
          const qty = clampQty(input.qty ?? 1);
          const key = cartLineKey(input.productId, input.variantIds);
          set((state) => {
            const existing = state.lines.find((line) => line.key === key);
            if (existing) {
              return {
                lines: state.lines.map((line) =>
                  line.key === key
                    ? {
                        ...line,
                        // Refresh the client snapshot; server remains authoritative.
                        unitPrice: input.unitPrice,
                        qty: Math.min(MAX_LINE_QTY, line.qty + qty),
                      }
                    : line
                ),
              };
            }
            const line: CartLine = {
              key,
              productId: input.productId,
              slug: input.slug,
              name: input.name,
              image_url: input.image_url,
              sku: input.sku,
              variantIds: [...input.variantIds],
              optionLabels: input.optionLabels,
              unitPrice: input.unitPrice,
              qty,
            };
            return { lines: [...state.lines, line] };
          });
        },

        removeItem: (key) =>
          set((state) => ({
            lines: state.lines.filter((line) => line.key !== key),
          })),

        setQty: (key, qty) =>
          set((state) => ({
            lines: state.lines.map((line) =>
              line.key === key ? { ...line, qty: clampQty(qty) } : line
            ),
          })),

        clearCart: () => set({ lines: [] }),

        setDrawerOpen: (open) => set({ drawerOpen: open }),

        toggleWishlist: (slug) =>
          set((state) => ({
            wishlist: state.wishlist.includes(slug)
              ? state.wishlist.filter((item) => item !== slug)
              : [...state.wishlist, slug],
          })),

        inWishlist: (slug) => get().wishlist.includes(slug),
      }),
      {
        name: "digitaz-cart-v1",
        partialize: (state) => ({ lines: state.lines }),
      }
    ),
    {
      name: "digitaz-wishlist-v1",
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
);

/** Derived total unit count for header badges / drawer titles. */
export const selectCartCount = (lines: CartLine[]): number =>
  lines.reduce((total, line) => total + line.qty, 0);
