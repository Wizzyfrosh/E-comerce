# Phase 3 — Buying Flow (Plan)

Goal: cart + wishlist, checkout (Stripe-ready, demo fallback), accounts
(profile/addresses/orders/wishlist), transactional emails. Build stays green
with no live DB / Stripe / Resend keys via the Supabase-first + fallback pattern.

## Architecture

- **Client state** (`components/store/cart-store.ts`, zustand `persist`):
  `lines: CartLine[]`, `wishlist: string[]` (slugs), `drawerOpen`.
  Guest cart/wishlist persisted to localStorage; merged server-side on login.
- **Server truth**: prices, stock, coupons, totals recomputed in server actions
  from the data layer; client snapshots are display-only.
- **Coupons** (`lib/data/coupons.ts`): Supabase `coupons` first; seed fallback
  (WELCOME10 10% min $50; SAVE25 $25 min $100; BLACKFRIDAY30 30% min $200;
  SUMMER20 expired). Validated: active, date window, min spend, usage limit;
  percent discount capped at max_discount.
- **Checkout pricing** (`lib/checkout/pricing.ts`): free shipping ≥$50,
  standard $9.99, express $18.99; tax 8% on (subtotal − discount), shipping
  excluded (documented demo rate).
- **Stripe** (`lib/stripe.ts`, `actions/checkout.ts`, `api/stripe/webhook`):
  guarded by `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`; absent keys →
  demo order path. Webhook verifies signature, idempotent on
  `checkout.session.completed`, decrements variant stock, increments sold_count.
- **Orders** (`actions/orders.ts`, `lib/data/orders.ts`): `orders`/`order_items`
  Supabase-first; device fallback record for confirmation page when no DB.
- **Accounts** (`data/addresses.ts`, `data/orders.ts`, `actions/account.ts`):
  profile update, addresses CRUD, order history; Supabase-first + localStorage
  fallback.
- **Email** (`lib/email/*`): Resend guarded by `RESEND_API_KEY`; console/JSON
  fallback. Triggers: welcome (signup), password reset, order confirmation,
  shipped.

## Route map

| Route | Owner | Purpose |
|---|---|---|
| `/cart` | A | Full cart: lines, qty, coupon, totals, checkout CTA |
| Cart drawer | A | Slide-in from header |
| `/account/wishlist` | A | Saved items, move to cart |
| `/checkout` | B | Steps: contact → address → method → payment → review |
| `/checkout/success` | B | Confirmation, order number, clear cart |
| `POST /api/stripe/webhook` | B | Signature-verified payment events |
| `/account` | C | Profile card + nav to subpages |
| `/account/orders` | C | Order history + status/tracking |
| `/account/addresses` | C | Addresses CRUD + default |

## Boundaries (explicit gaps)

No admin dashboard, no review write-path moderation, no coupon admin UI,
no ISR/SSG migration. Stripe Elements in-page payment deferred (hosted
Stripe Checkout used).
