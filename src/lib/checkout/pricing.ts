/**
 * Authoritive checkout pricing (Phase 3 buying flow).
 *
 * RULES (server-only; the client never trusts its own prices):
 *  - Every line price is recomputed from the live product record via
 *    `getProductBySlug(slug)`: unit_price = sale_price + Σ matched variant
 *    price_adjustment. Client-supplied `unitPrice` snapshots are ignored.
 *  - Quantity is clamped to available stock (product stock ∩ matched variant
 *    stock). Lines that cannot be resolved (unknown slug, zero stock) are
 *    skipped rather than priced.
 *  - Discounts resolve against the coupons table when available; otherwise a
 *    small inline demo rule set applies (percent / fixed, min spend, expiry).
 *  - Shipping rates are demo flat rates below. "free" requires the discounted
 *    subtotal to meet FREE_SHIPPING_MIN; below that it falls back to standard.
 *  - TAX_RATE applies to (subtotal − discount) only; shipping is excluded from
 *    the taxable base (documented demo assumption — adjust for real nexus).
 *  - All money is rounded to whole cents before summing.
 */
import { getProductBySlug } from "@/lib/data";
import { validateCoupon } from "@/lib/data/coupons";
import type {
  CartTotals,
  OrderLineRecord,
  PricingInput,
  ShippingMethodId,
} from "@/types/commerce";

/* ------------------------------------------------------------------ */
/* Rates + money helpers                                               */
/* Live in the browser-safe ./rates.ts (no server imports); imported  */
/* here for local use and re-exported so existing server importers    */
/* keep the same public surface.                                       */
/* ------------------------------------------------------------------ */
import {
  SHIPPING_RATES,
  FREE_SHIPPING_MIN,
  TAX_RATE,
  SHIPPING_METHOD_LABELS,
  SHIPPING_METHOD_ETA,
  round2,
} from "./rates";

export {
  SHIPPING_RATES,
  FREE_SHIPPING_MIN,
  TAX_RATE,
  SHIPPING_METHOD_LABELS,
  SHIPPING_METHOD_ETA,
  round2,
};

/* ------------------------------------------------------------------ */
/* Coupons — delegated to @/lib/data/coupons (Supabase-first + seeds)  */
/* ------------------------------------------------------------------ */

interface ResolvedCoupon {
  valid: boolean;
  code: string;
  discount: number;
  reason: string | null;
}

async function resolveCoupon(
  code: string | undefined | null,
  subtotal: number
): Promise<ResolvedCoupon | null> {
  if (!code || !code.trim()) return null;
  try {
    const result = await validateCoupon(code, subtotal);
    return {
      valid: result.valid,
      code: result.code,
      discount: round2(result.discount),
      reason: result.reason,
    };
  } catch {
    return { valid: false, code: code.trim().toUpperCase(), discount: 0, reason: "Coupon unavailable" };
  }
}

/* ------------------------------------------------------------------ */
/* Core pricing                                                        */
/* ------------------------------------------------------------------ */

export interface ComputeTotalsResult {
  lines: OrderLineRecord[];
  totals: CartTotals;
}

const EMPTY_TOTALS: CartTotals = {
  subtotal: 0,
  discount: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  couponCode: null,
  couponReason: null,
};

/**
 * Recompute authoritative totals from raw cart lines.
 * Server-only: must be called from server actions / route handlers, never
 * imported into client components.
 */
export async function computeTotals(input: PricingInput): Promise<ComputeTotalsResult> {
  const lines: OrderLineRecord[] = [];

  for (const item of input.lines) {
    if (!item?.slug || !item.productId) continue;
    const product = await getProductBySlug(item.slug);
    if (!product) continue;

    const variants = product.variants ?? [];
    const matched = variants.filter((v) => item.variantIds.includes(v.id));

    // Authoritative unit price: sale price + matched variant adjustments.
    const adjustment = matched.reduce((sum, v) => sum + (v.price_adjustment ?? 0), 0);
    const unitPrice = round2(product.sale_price + adjustment);

    // Stock clamp: product stock and every matched variant stock.
    const variantStock = matched.map((v) => v.stock_quantity);
    const stock =
      variantStock.length > 0
        ? Math.min(product.stock_quantity, ...variantStock)
        : product.stock_quantity;
    const qty = Math.max(0, Math.min(Math.floor(item.qty ?? 0), Math.floor(stock)));
    if (qty <= 0) continue;

    const variantLabel =
      matched.length > 0 ? matched.map((v) => v.option_value).join(" · ") : null;
    const image_url =
      product.images?.[0]?.image_url ??
      `https://picsum.photos/seed/${product.slug}/600/600`;

    lines.push({
      productId: product.id,
      name: product.name,
      sku: matched[0]?.sku ?? product.sku,
      variantLabel,
      qty,
      unitPrice,
      total: round2(unitPrice * qty),
      image_url,
    });
  }

  const subtotal = round2(lines.reduce((sum, l) => sum + l.total, 0));

  const coupon = await resolveCoupon(input.couponCode, subtotal);
  const discount = coupon?.valid ? coupon.discount : 0;
  const discountedSubtotal = round2(Math.max(0, subtotal - discount));

  // Shipping: free gated by the discounted subtotal; standard/express flat.
  let shipping = 0;
  if (lines.length > 0) {
    shipping = shippingForMethod(input.shippingMethod ?? "standard", discountedSubtotal);
  }

  // Tax on (subtotal − discount); shipping excluded from the taxable base.
  const tax = round2(discountedSubtotal * TAX_RATE);
  const total = round2(discountedSubtotal + shipping + tax);

  const totals: CartTotals = {
    ...EMPTY_TOTALS,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    couponCode: coupon?.valid ? coupon.code : null,
    couponReason: coupon && !coupon.valid ? coupon.reason : null,
  };

  return { lines, totals };
}

/**
 * Resolve the effective shipping charge for a method. The "free" method only
 * applies above the threshold; under it the order falls back to standard.
 */
export function shippingForMethod(
  method: ShippingMethodId,
  discountedSubtotal: number
): number {
  if (method === "free") {
    return discountedSubtotal >= FREE_SHIPPING_MIN ? SHIPPING_RATES.free : SHIPPING_RATES.standard;
  }
  return SHIPPING_RATES[method] ?? SHIPPING_RATES.standard;
}
