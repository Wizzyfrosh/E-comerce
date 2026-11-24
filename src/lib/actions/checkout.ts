/**
 * Checkout server actions (Phase 3 buying flow).
 *
 *  - `getCheckoutQuote` recomputes authoritative totals for the review sidebar
 *    (server-only pricing; the client never totals its own cart).
 *  - `createStripeCheckout` builds a Stripe Checkout Session when
 *    `STRIPE_SECRET_KEY` is configured; otherwise it returns
 *    `{ url: null, error: "stripe_unavailable" }` so the UI falls back to the
 *    demo `placeOrder` path.
 *  - A pending guest order row is persisted before the redirect so the webhook
 *    can match `metadata.order_number`; persistence failures are non-fatal.
 */
"use server";

import { getStripe } from "@/lib/stripe";
import { computeTotals } from "@/lib/checkout/pricing";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import { persistOrderRecord } from "./orders";
import { contactSchema } from "@/lib/validations";
import type {
  CartLine,
  CartTotals,
  OrderAddress,
  OrderRecord,
  ShippingMethodId,
} from "@/types/commerce";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface CheckoutQuoteResult {
  totals: CartTotals;
  /** Re-priced lines (authoritative, stock-clamped). */
  lines: Awaited<ReturnType<typeof computeTotals>>["lines"];
}

/** Recompute totals + reprice lines for the review sidebar / payment step. */
export async function getCheckoutQuote(payload: {
  lines: CartLine[];
  couponCode?: string;
  method?: ShippingMethodId;
}): Promise<CheckoutQuoteResult> {
  const { lines, totals } = await computeTotals({
    lines: payload.lines.map((l) => ({
      productId: l.productId,
      slug: l.slug,
      variantIds: l.variantIds,
      qty: l.qty,
    })),
    couponCode: payload.couponCode,
    shippingMethod: payload.method ?? "standard",
  });
  return { totals, lines };
}

export interface StripeCheckoutResult {
  url: string | null;
  error?: string;
}

export async function createStripeCheckout(payload: {
  lines: CartLine[];
  email: string;
  couponCode?: string;
}): Promise<StripeCheckoutResult> {
  const contact = contactSchema.safeParse({ email: payload.email });
  if (!contact.success) {
    return { url: null, error: "invalid_email" };
  }

  const stripe = await getStripe();
  if (!stripe) {
    return { url: null, error: "stripe_unavailable" };
  }

  try {
    const { lines, totals } = await computeTotals({
      lines: payload.lines.map((l) => ({
        productId: l.productId,
        slug: l.slug,
        variantIds: l.variantIds,
        qty: l.qty,
      })),
      couponCode: payload.couponCode,
      shippingMethod: "standard",
    });

    if (lines.length === 0) {
      return { url: null, error: "empty_cart" };
    }

    // Provisional pending order so the webhook can reconcile payment → order.
    const orderNumber = generateOrderNumber();
    const pendingAddress: OrderAddress = {
      full_name: "",
      line1: "",
      city: "",
      postal_code: "",
      country: "",
    };
    const pendingOrder: OrderRecord = {
      orderNumber,
      status: "pending",
      paymentStatus: "unpaid",
      email: contact.data.email,
      fullName: "",
      shippingAddress: pendingAddress,
      shippingMethod: "standard",
      lines,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      couponCode: totals.couponCode,
      createdAt: new Date().toISOString(),
    };
    await persistOrderRecord(pendingOrder, "stripe");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "usd",
      line_items: lines.map((line) => ({
        quantity: line.qty,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(line.unitPrice * 100),
          product_data: {
            name: line.name,
            description: line.variantLabel ?? undefined,
            images: line.image_url ? [line.image_url] : undefined,
          },
        },
      })),
      metadata: {
        order_number: orderNumber,
        email: contact.data.email,
      },
      success_url: `${SITE_URL}/checkout/success?order=${encodeURIComponent(
        orderNumber
      )}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout`,
    });

    if (!session.url) {
      return { url: null, error: "checkout_failed" };
    }
    return { url: session.url };
  } catch (error) {
    console.error("[checkout] stripe session failed:", error);
    return { url: null, error: "checkout_failed" };
  }
}
