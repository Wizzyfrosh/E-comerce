/**
 * Pure shipping/tax rates and money helpers for the buying flow.
 *
 * This module has ZERO server-side imports: no Supabase, no `next/headers`,
 * no server actions. It may be imported safely by both Server Components
 * and `"use client"` components (e.g. the cart page and checkout UI).
 * Server-authoritative pricing lives in `./pricing.ts`, which imports the
 * data layer and must only be used server-side.
 */
import type { ShippingMethodId } from "@/types/commerce";

/** Flat demo shipping rates (USD). `free` carries a minimum-subtotal gate. */
export const SHIPPING_RATES: Record<ShippingMethodId, number> = {
  free: 0,
  standard: 9.99,
  express: 18.99,
};

/** Minimum discounted subtotal for the free shipping method. */
export const FREE_SHIPPING_MIN = 50;

/** Demo sales tax: 8% on (subtotal − discount). Shipping excluded. */
export const TAX_RATE = 0.08;

export const SHIPPING_METHOD_LABELS: Record<ShippingMethodId, string> = {
  free: "Free Shipping",
  standard: "Standard Delivery",
  express: "Express Delivery",
};

export const SHIPPING_METHOD_ETA: Record<ShippingMethodId, string> = {
  free: "5–7 business days",
  standard: "3–5 business days",
  express: "1–2 business days",
};

/** Round to whole cents. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
