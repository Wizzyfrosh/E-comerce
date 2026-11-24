/**
 * Client-side bridges between the checkout UI and the (still-evolving) cart
 * store. The zustand store may expose `lines` / `clearCart()` in a later phase;
 * this adapter reads them when present and otherwise falls back to a small
 * localStorage cart key, so the buying flow compiles and works against either
 * store shape. It never rewrites the store.
 */
"use client";

import { useCartStore } from "./cart-store";
import type { CartLine, OrderRecord } from "@/types/commerce";

export const CART_STORAGE_KEY = "digitaz-cart-v1";
export const LOCAL_ORDERS_KEY = "digitaz-orders-v1";

function safeParse<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Read cart lines: store `lines` first, then localStorage fallback. */
export function readCartLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const state = useCartStore.getState() as unknown as Record<string, unknown>;
    const storeLines = state.lines;
    if (Array.isArray(storeLines) && storeLines.length > 0) {
      return storeLines as CartLine[];
    }
  } catch {
    // Store unavailable — fall through to localStorage.
  }
  return safeParse<CartLine>(window.localStorage.getItem(CART_STORAGE_KEY));
}

/** Clear the cart: store `clearCart()` when present, plus the local fallback. */
export function clearCartClient(): void {
  try {
    const state = useCartStore.getState() as unknown as Record<string, unknown>;
    const clear = state.clearCart;
    if (typeof clear === "function") {
      (clear as () => void)();
    }
  } catch {
    // Ignore — localStorage cleanup below still runs.
  }
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Private mode etc.
  }
}

/** Read locally cached guest orders (confirmation-page fallback). */
export function readLocalOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse<OrderRecord>(window.localStorage.getItem(LOCAL_ORDERS_KEY));
}

/** Persist a demo order into the local guest-order cache (newest first). */
export function saveLocalOrder(order: OrderRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readLocalOrders().filter((o) => o.orderNumber !== order.orderNumber);
    const next = [order, ...existing].slice(0, 20);
    window.localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / storage errors.
  }
}
