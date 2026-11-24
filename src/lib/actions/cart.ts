"use server";

/**
 * Cart server actions. The server is authoritative: it re-fetches live
 * prices and stock, clamps quantities, drops invalid lines, and computes
 * totals (subtotal / discount / shipping / tax / total). Client store data
 * is a display-only snapshot. Every DB path is wrapped in try/catch so the
 * site works with no live Supabase project configured.
 */
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/data/products";
import { validateCoupon } from "@/lib/data/coupons";
import { couponSchema } from "@/lib/validations";
import { FREE_SHIPPING_MIN, SHIPPING_RATES, TAX_RATE, round2 } from "@/lib/checkout/pricing";
import type {
  ServerCartLine,
  RecomputeCartResult,
} from "@/lib/checkout/cart-types";
import type { CartLine, CartTotals, CouponResult } from "@/types/commerce";

/**
 * Recompute the cart server-side. Missing products and out-of-stock lines
 * are dropped; in-stock quantities are clamped to available stock.
 */
export async function recomputeCart(
  lines: CartLine[],
  couponCode?: string | null
): Promise<RecomputeCartResult> {
  const serverLines: ServerCartLine[] = [];

  for (const line of lines) {
    const product = await getProductBySlug(line.slug);
    if (!product) continue; // dropped: unavailable / delisted

    const variants = product.variants ?? [];
    const selected = variants.filter((variant) =>
      line.variantIds.includes(variant.id)
    );
    const adjustment = selected.reduce(
      (sum, variant) => sum + (variant.price_adjustment ?? 0),
      0
    );
    const unitPrice = round2(product.sale_price + adjustment);

    const variantStock =
      selected.length > 0
        ? Math.min(...selected.map((variant) => variant.stock_quantity))
        : product.stock_quantity;
    const stock = Math.max(0, Math.min(variantStock, product.stock_quantity));
    if (stock <= 0) continue; // dropped: out of stock

    const qty = Math.max(1, Math.min(stock, Math.floor(line.qty) || 1));
    const lineTotal = round2(unitPrice * qty);

    serverLines.push({
      ...line,
      unitPrice,
      valid: true,
      stock,
      lineTotal,
    });
  }

  const subtotal = round2(
    serverLines.reduce((sum, line) => sum + line.lineTotal, 0)
  );

  let discount = 0;
  let appliedCode: string | null = null;
  let couponReason: string | null = null;

  if (couponCode && couponCode.trim()) {
    const coupon: CouponResult = await validateCoupon(couponCode, subtotal);
    if (coupon.valid) {
      discount = coupon.discount;
      appliedCode = coupon.code;
    } else {
      couponReason = coupon.reason;
    }
  }

  const net = round2(subtotal - discount);
  const shipping =
    net >= FREE_SHIPPING_MIN ? SHIPPING_RATES.free : SHIPPING_RATES.standard;
  const tax = round2(TAX_RATE * net);
  const total = round2(net + shipping + tax);

  const totals: CartTotals = {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    couponCode: appliedCode,
    couponReason,
  };

  return { lines: serverLines, totals };
}

/**
 * Validate a coupon against the given merchandise subtotal. Input passes
 * the Zod `couponSchema` first; schema failures produce an invalid result
 * without touching the database.
 */
export async function applyCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const parsed = couponSchema.safeParse({ code });
  if (!parsed.success) {
    const reason = parsed.error.issues[0]?.message ?? "Invalid coupon code.";
    return {
      valid: false,
      code: code.trim().toUpperCase(),
      kind: null,
      discount: 0,
      reason,
      minSpend: null,
      expiresAt: null,
    };
  }
  return validateCoupon(parsed.data.code, subtotal);
}

/**
 * Persist a guest/local cart to the logged-in user's `carts` row.
 * Best-effort: any DB failure resolves to `{ merged: 0 }` and never throws
 * into the client.
 */
export async function mergeGuestCart(
  lines: CartLine[]
): Promise<{ merged: number }> {
  try {
    if (!lines || lines.length === 0) return { merged: 0 };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { merged: 0 };

    const { data: existingCart, error: cartQueryError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (cartQueryError) throw cartQueryError;

    let cartId: string | null = existingCart?.id ?? null;
    if (!cartId) {
      const { data: newCart, error: cartInsertError } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .maybeSingle();
      if (cartInsertError) throw cartInsertError;
      cartId = newCart?.id ?? null;
    }
    if (!cartId) return { merged: 0 };

    let merged = 0;
    for (const line of lines) {
      const variantId = line.variantIds[0] ?? null;
      const { data: existingItem, error: itemQueryError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", line.productId)
        .is("variant_id", variantId)
        .maybeSingle();
      if (itemQueryError) continue;

      if (existingItem) {
        const { error } = await supabase
          .from("cart_items")
          .update({
            quantity: (existingItem.quantity as number) + line.qty,
            price_at_add: line.unitPrice,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);
        if (!error) merged += 1;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          product_id: line.productId,
          variant_id: variantId,
          quantity: line.qty,
          price_at_add: line.unitPrice,
        });
        if (!error) merged += 1;
      }
    }
    return { merged };
  } catch {
    return { merged: 0 };
  }
}
