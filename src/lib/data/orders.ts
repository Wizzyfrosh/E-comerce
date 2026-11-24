/**
 * Order history data access (Phase 3). Supabase-first: orders joined with
 * order_items, mapped into the shared `OrderRecord` shape. On any DB error
 * (no live DB / no session) it returns [] and the client layer merges
 * localStorage orders from ./local-store.
 *
 * Server-only. Keep client-only imports (local-store helpers) out of this
 * file — the orders page component owns that merge.
 */
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/types/database";
import type {
  OrderRecord,
  OrderLineRecord,
  OrderAddress,
  ShippingMethodId,
} from "@/types/commerce";

export interface OrderRowWithItems extends Order {
  order_items?: OrderItem[] | null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toShippingAddress(raw: Record<string, unknown> | null | undefined): OrderAddress {
  return {
    full_name: asString(raw?.full_name) ?? "Customer",
    phone: asString(raw?.phone),
    line1: asString(raw?.line1) ?? "",
    line2: asString(raw?.line2),
    city: asString(raw?.city) ?? "",
    state: asString(raw?.state),
    postal_code: asString(raw?.postal_code) ?? "",
    country: asString(raw?.country) ?? "",
  };
}

function toLine(item: OrderItem): OrderLineRecord {
  return {
    productId: item.product_id,
    name: item.product_name,
    sku: item.sku,
    variantLabel: item.variant_name,
    qty: item.quantity,
    unitPrice: Number(item.unit_price ?? 0),
    total: Number(item.total ?? 0),
    // order_items has no image column; the UI falls back to a thumbnail icon.
    image_url: "",
  };
}

/** Map a Supabase orders row (+ joined items) to the shared OrderRecord. */
export function mapOrderRow(row: OrderRowWithItems): OrderRecord {
  const shippingAddress = toShippingAddress(
    (row.shipping_address as Record<string, unknown> | null) ?? null
  );
  const fullName =
    shippingAddress.full_name && shippingAddress.full_name !== "Customer"
      ? shippingAddress.full_name
      : row.email?.split("@")[0] ?? "Customer";

  return {
    orderNumber: row.order_number,
    status: row.status,
    paymentStatus: row.payment_status,
    email: row.email,
    fullName,
    phone: row.phone,
    shippingAddress,
    shippingMethod: "standard" as ShippingMethodId,
    lines: (row.order_items ?? []).map(toLine),
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount_total ?? 0),
    shipping: Number(row.shipping_total ?? 0),
    tax: Number(row.tax_total ?? 0),
    total: Number(row.total ?? 0),
    couponCode: null,
    trackingNumber: null,
    createdAt: row.created_at,
  };
}

/** Signed-in user's orders, newest first. [] when the DB is unavailable. */
export async function getSupabaseOrders(): Promise<OrderRecord[]> {
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
    return (data ?? []).map((row) => mapOrderRow(row as unknown as OrderRowWithItems));
  } catch {
    return [];
  }
}
