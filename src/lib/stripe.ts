/**
 * Guarded Stripe server client (Phase 3).
 *
 * RULES:
 *  - The SDK is imported lazily inside `getStripe()` — there is NO top-level
 *    instantiation, so `next build` / static analysis never require a key.
 *  - `getStripe()` resolves to `null` when `STRIPE_SECRET_KEY` is absent or
 *    empty. Callers must treat `null` as "Stripe unavailable" and fall back to
 *    the demo payment flow.
 *  - Only the secret key lives here; the publishable key is read directly from
 *    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in client components.
 */
import type Stripe from "stripe";

let clientPromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return Promise.resolve(null);

  if (!clientPromise) {
    clientPromise = (async () => {
      const mod = await import("stripe");
      const StripeCtor = mod.default;
      return new StripeCtor(secretKey);
    })().catch((error) => {
      console.error("[stripe] client init failed", error);
      return null;
    });
  }
  return clientPromise;
}

/** True when a usable secret key is configured (server-side only). */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
