import type { OrderStatus, PaymentStatus } from "./database";

/**
 * Phase 3 (Buying flow) shared commerce types — client cart lines, server
 * order records, coupon results, and checkout state. Kept framework-agnostic
 * so both the zustand client store and server actions can consume them.
 */

/** A single line in the (guest/logged-in) shopping cart. */
export interface CartLine {
  /** Stable identity: productId + sorted variant ids. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image_url: string;
  sku: string;
  /** Selected variant ids (color/storage/etc). Empty when no variants. */
  variantIds: string[];
  /** Human labels, e.g. "Rose Gold · 512GB". */
  optionLabels: string;
  /** Client price snapshot — the SERVER recomputes the authoritative price. */
  unitPrice: number;
  qty: number;
}

/** Authoritative cart totals recomputed server-side. */
export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  /** Human reason when a coupon could not be applied. */
  couponReason: string | null;
}

export type CouponKind = "percent" | "fixed";

export interface CouponResult {
  valid: boolean;
  code: string;
  kind: CouponKind | null;
  /** Discount currency amount after applying rules (0 when invalid). */
  discount: number;
  reason: string | null;
  minSpend: number | null;
  expiresAt: string | null;
}

export interface OrderLineRecord {
  productId: string;
  name: string;
  sku: string;
  variantLabel: string | null;
  qty: number;
  unitPrice: number;
  total: number;
  image_url: string;
}

export interface OrderAddress {
  full_name: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
}

export type ShippingMethodId = "free" | "standard" | "express";

export interface OrderRecord {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  email: string;
  fullName: string;
  phone?: string | null;
  shippingAddress: OrderAddress;
  shippingMethod: ShippingMethodId;
  lines: OrderLineRecord[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  trackingNumber?: string | null;
  createdAt: string;
}

/** Checkout contact step payload. */
export interface CheckoutContact {
  email: string;
  phone?: string;
}

/** Server-recomputed pricing input. */
export interface PricingInput {
  lines: Array<Pick<CartLine, "productId" | "slug" | "variantIds" | "qty">>;
  couponCode?: string | null;
  shippingMethod?: ShippingMethodId;
  country?: string;
}
