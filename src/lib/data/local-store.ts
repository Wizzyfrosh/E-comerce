/**
 * Client-side localStorage fallback helpers (Phase 3 buying flow).
 *
 * Supabase-first everywhere server-side; when no live DB / anon session is
 * available the account UI keeps working from these browser keys. This module
 * intentionally has NO server-only imports (no supabase/server, no "use
 * server") so it can be imported by client components safely.
 *
 * Keys (versioned so future schema changes can migrate cleanly):
 *   digitaz-orders-v1     OrderRecord[]            — guest/customer order history
 *   digitaz-addresses-v1  LocalAddress[]           — saved shipping addresses
 *   digitaz-wishlist-v1   string[]                 — product ids in the wishlist
 */
import type { OrderRecord, OrderAddress } from "@/types/commerce";

export const LOCAL_KEYS = {
  orders: "digitaz-orders-v1",
  addresses: "digitaz-addresses-v1",
  wishlist: "digitaz-wishlist-v1",
} as const;

/** A stored address row — OrderAddress fields plus a client-local id/default flag. */
export interface LocalAddress extends OrderAddress {
  id: string;
  is_default: boolean;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted / unavailable storage — fall back silently.
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded / private mode — non-fatal for the demo flow.
  }
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export function readLocalOrders(): OrderRecord[] {
  const list = readJson<OrderRecord[] | null>(LOCAL_KEYS.orders, null);
  if (!Array.isArray(list)) return [];
  return list.filter(
    (o): o is OrderRecord =>
      !!o && typeof o.orderNumber === "string" && Array.isArray(o.lines)
  );
}

/** Persist one order, replacing any earlier record with the same order number. */
export function saveLocalOrder(order: OrderRecord): OrderRecord[] {
  const rest = readLocalOrders().filter((o) => o.orderNumber !== order.orderNumber);
  const next = [order, ...rest];
  writeJson(LOCAL_KEYS.orders, next);
  return next;
}

/* ------------------------------------------------------------------ */
/* Addresses                                                           */
/* ------------------------------------------------------------------ */

export function readLocalAddresses(): LocalAddress[] {
  const list = readJson<LocalAddress[] | null>(LOCAL_KEYS.addresses, null);
  if (!Array.isArray(list)) return [];
  return list.filter((a) => !!a && typeof a.id === "string" && typeof a.line1 === "string");
}

export function writeLocalAddresses(list: LocalAddress[]): void {
  writeJson(LOCAL_KEYS.addresses, list);
}

/* ------------------------------------------------------------------ */
/* Wishlist product ids                                                */
/* ------------------------------------------------------------------ */

export function readLocalWishlist(): string[] {
  const list = readJson<string[] | null>(LOCAL_KEYS.wishlist, null);
  if (!Array.isArray(list)) return [];
  return list.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function writeLocalWishlist(productIds: string[]): void {
  writeJson(LOCAL_KEYS.wishlist, productIds);
}
