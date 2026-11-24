/**
 * Stripe Checkout webhook (Phase 3 buying flow).
 *
 * Security / correctness rules:
 *  - Raw request body via `req.text()` — JSON parsing breaks the signature.
 *  - `STRIPE_WEBHOOK_SECRET` missing → HTTP 503 `webhook_unconfigured` (no
 *    silent acceptance). Signature mismatch → HTTP 400.
 *  - Events are looked up by `metadata.order_number`; the handler is IDEMPOTENT:
 *    an order already `paid` is skipped, so retries / duplicate deliveries never
 *    double-decrement stock or double-increment sales.
 *  - On `checkout.session.completed`: order → `paid` / `processing`, then
 *    per line: decrement the matched `product_variants.stock_quantity` and
 *    increment `products.sold_count`. Every DB write is best-effort try/catch;
 *    the webhook still returns 200 so Stripe does not retry a poisoned queue.
 *  - Unknown event types receive a 200 acknowledgment (Stripe best practice).
 */
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getOrderByNumber } from "@/lib/actions/orders";

export const dynamic = "force-dynamic";

type DbClient = Awaited<ReturnType<typeof serverClient>>;

async function serverClient() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

/** Prefer the service-role key for writes; otherwise fall back to the cookie client. */
async function writeClient(): Promise<DbClient | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (serviceKey && url) {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  try {
    return await serverClient();
  } catch {
    return null;
  }
}

/**
 * Best-effort inventory adjustment for one paid line:
 * match a variant by its human label, decrement its stock (floored at 0), and
 * add the quantity to the product's sold_count.
 */
async function adjustInventory(
  supabase: DbClient,
  line: { productId: string; variantLabel: string | null; qty: number }
): Promise<void> {
  try {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, option_value, stock_quantity")
      .eq("product_id", line.productId);

    if (variants && variants.length > 0) {
      const tokens = (line.variantLabel ?? "")
        .split("·")
        .map((token) => token.trim())
        .filter(Boolean);
      const match = variants.find((v) => tokens.some((token) => token === v.option_value));
      if (match) {
        const nextStock = Math.max(0, (match.stock_quantity ?? 0) - line.qty);
        await supabase.from("product_variants").update({ stock_quantity: nextStock }).eq("id", match.id);
      }
    }

    const { data: product } = await supabase
      .from("products")
      .select("sold_count")
      .eq("id", line.productId)
      .maybeSingle();
    if (product) {
      await supabase
        .from("products")
        .update({ sold_count: (product.sold_count ?? 0) + line.qty })
        .eq("id", line.productId);
    }
  } catch (error) {
    console.warn("[stripe-webhook] inventory adjust skipped:", error);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook_unconfigured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // Raw body — required by Stripe's signature scheme.
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    const mod = await import("stripe");
    event = mod.default.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.warn("[stripe-webhook] signature verification failed:", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderNumber = session.metadata?.order_number;

    if (orderNumber) {
      const order = await getOrderByNumber(orderNumber);

      // Idempotency guard — already paid: acknowledge and stop.
      if (order && order.paymentStatus === "paid") {
        return NextResponse.json({ received: true, duplicate: true });
      }

      const supabase = await writeClient();
      if (supabase && order) {
        try {
          await supabase
            .from("orders")
            .update({ payment_status: "paid", status: "processing" })
            .eq("order_number", orderNumber);

          for (const line of order.lines) {
            await adjustInventory(supabase, line);
          }
        } catch (error) {
          console.warn("[stripe-webhook] order post-payment update skipped:", error);
        }
      }
    }
  }

  // Unknown / unhandled events: acknowledge so Stripe stops retrying.
  return NextResponse.json({ received: true });
}
