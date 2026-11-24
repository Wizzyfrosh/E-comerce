/**
 * Server actions for order persistence (Phase 3 buying flow).
 *
 * RULES:
 *  - Supabase-first: every insert/select tries the live DB; failures are
 *    swallowed (no throw) so the demo flow keeps working with no database.
 *  - Prices are recomputed by `computeTotals` before an order is built; client
 *    line snapshots are never persisted as authoritative prices.
 *  - `triggerOrderConfirmation` fires after the order record exists; email
 *    transport itself has a console fallback.
 *  - Guest orders are allowed: `user_id` / `session_id` stay null.
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { computeTotals, round2 } from "@/lib/checkout/pricing";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import { triggerOrderConfirmation } from "./emails";
import {
  contactSchema,
  checkoutAddressSchema,
  shippingMethodSchema,
} from "@/lib/validations";
import type {
  CartLine,
  CartTotals,
  OrderAddress,
  OrderLineRecord,
  OrderRecord,
  ShippingMethodId,
} from "@/types/commerce";
import type { OrderStatus, PaymentStatus } from "@/types/database";

/* ------------------------------------------------------------------ */
/* Row mapping helpers                                                  */
/* ------------------------------------------------------------------ */

function toOrderAddress(raw: Record<string, unknown> | null): OrderAddress {
  return {
    full_name: String(raw?.full_name ?? ""),
    phone: raw?.phone ? String(raw.phone) : null,
    line1: String(raw?.line1 ?? ""),
    line2: raw?.line2 ? String(raw.line2) : null,
    city: String(raw?.city ?? ""),
    state: raw?.state ? String(raw.state) : null,
    postal_code: String(raw?.postal_code ?? ""),
    country: String(raw?.country ?? ""),
  };
}

/* ------------------------------------------------------------------ */
/* Persistence (Supabase-first, never throws)                          */
/* ------------------------------------------------------------------ */

export interface PersistResult {
  id: string | null;
}

/**
 * Insert an order + its line items. Any DB failure (missing env, RLS, missing
 * table) resolves to `{ id: null }` — the in-memory/guest flow continues.
 */
export async function persistOrderRecord(
  order: OrderRecord,
  paymentMethod: string
): Promise<PersistResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        order_number: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        discount_total: order.discount,
        shipping_total: order.shipping,
        tax_total: order.tax,
        total: order.total,
        coupon_id: null,
        shipping_address: order.shippingAddress as unknown as Record<string, unknown>,
        email: order.email,
        phone: order.phone ?? null,
        payment_method: paymentMethod,
        payment_status: "pending",
      })
      .select("id")
      .maybeSingle();

    if (error) throw error;
    const orderId = data?.id ?? null;
    if (!orderId) return { id: null };

    const items = order.lines.map((line) => ({
      order_id: orderId,
      product_id: line.productId,
      variant_id: null,
      product_name: line.name,
      variant_name: line.variantLabel,
      sku: line.sku,
      quantity: line.qty,
      unit_price: line.unitPrice,
      total: line.total,
    }));
    const { error: itemsError } = await supabase.from("order_items").insert(items);
    if (itemsError) throw itemsError;

    return { id: orderId };
  } catch (error) {
    console.warn("[orders] persist skipped (no DB / unavailable):", error);
    return { id: null };
  }
}

/* ------------------------------------------------------------------ */
/* placeOrder — demo payment path (no Stripe session)                 */
/* ------------------------------------------------------------------ */

export interface PlaceOrderPayload {
  contact: { email: string; phone?: string };
  address: {
    full_name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  method: ShippingMethodId;
  lines: CartLine[];
  couponCode?: string;
}

export interface PlaceOrderResult {
  orderNumber: string;
  totals: CartTotals;
  order: OrderRecord;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
  // 1. Zod-validate every user-supplied input before pricing.
  const contact = contactSchema.parse(payload.contact);
  const address = checkoutAddressSchema.parse(payload.address);
  const { method } = shippingMethodSchema.parse({ method: payload.method });

  // 2. Server-recompute authoritative prices (client prices ignored).
  const { lines, totals } = await computeTotals({
    lines: payload.lines.map((l) => ({
      productId: l.productId,
      slug: l.slug,
      variantIds: l.variantIds,
      qty: l.qty,
    })),
    couponCode: payload.couponCode,
    shippingMethod: method,
  });

  if (lines.length === 0) {
    throw new Error("empty_cart");
  }

  // 3. Build the order record.
  const orderNumber = generateOrderNumber();
  const shippingAddress: OrderAddress = {
    full_name: address.full_name,
    phone: address.phone ?? contact.phone ?? null,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    state: address.state ?? null,
    postal_code: address.postal_code,
    country: address.country,
  };

  const order: OrderRecord = {
    orderNumber,
    status: "pending",
    paymentStatus: "unpaid",
    email: contact.email,
    fullName: address.full_name,
    phone: contact.phone ?? address.phone ?? null,
    shippingAddress,
    shippingMethod: method,
    lines,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    couponCode: totals.couponCode,
    createdAt: new Date().toISOString(),
  };

  // 4. Persist (never throws) then fire the confirmation email (never throws).
  await persistOrderRecord(order, "demo");
  await triggerOrderConfirmation(order);

  return { orderNumber, totals, order };
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  email: string;
  phone: string | null;
  shipping_address: Record<string, unknown> | null;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  payment_method: string | null;
  created_at: string;
  order_items: Array<{
    product_id: string;
    product_name: string;
    variant_name: string | null;
    sku: string;
    quantity: number;
    unit_price: number;
    total: number;
  }> | null;
}

function mapOrderRow(row: OrderRow): OrderRecord {
  const address = toOrderAddress(row.shipping_address);
  const lines: OrderLineRecord[] = (row.order_items ?? []).map((item) => ({
    productId: item.product_id,
    name: item.product_name,
    sku: item.sku,
    variantLabel: item.variant_name,
    qty: item.quantity,
    unitPrice: round2(item.unit_price),
    total: round2(item.total),
    image_url: "",
  }));

  return {
    orderNumber: row.order_number,
    status: row.status,
    paymentStatus: (row.payment_status as PaymentStatus) ?? "unpaid",
    email: row.email,
    fullName: address.full_name,
    phone: row.phone,
    shippingAddress: address,
    shippingMethod: "standard",
    lines,
    subtotal: round2(row.subtotal),
    discount: round2(row.discount_total),
    shipping: round2(row.shipping_total),
    tax: round2(row.tax_total),
    total: round2(row.total),
    couponCode: null,
    createdAt: row.created_at,
  };
}

/**
 * Load an order by its public order number. Supabase-first; returns `null`
 * when the DB is unavailable or the order does not exist (client then falls
 * back to its local order cache).
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderRecord | null> {
  if (!orderNumber) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapOrderRow(data as unknown as OrderRow);
  } catch (error) {
    console.warn("[orders] getOrderByNumber fallback null:", error);
    return null;
  }
}

/** Current user's orders, newest first. Supabase-first; `[]` when unavailable. */
export async function getUserOrders(): Promise<OrderRecord[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return [];
    return (data as unknown as OrderRow[]).map(mapOrderRow);
  } catch (error) {
    console.warn("[orders] getUserOrders fallback []:", error);
    return [];
  }
}
