# Digitaz — Bring Tech Worlds To Life

A modern e-commerce storefront for laptops, smartphones, TVs, smartwatches,
gaming gear, headphones and accessories. Built with **Next.js 16 (App
Router) + TypeScript + Tailwind CSS v4 + shadcn/ui** and powered by
**Supabase** (Auth + Postgres + RLS).

---

## Phase 1 — Foundation (completed)

Phase 1 establishes the project skeleton, design system, data model and
authentication. The storefront homepage renders from typed preview data.

- [x] Next.js 16 App Router, TypeScript (strict), Tailwind v4, shadcn/ui components
- [x] Design system tokens (brand blue `#1e4fd8`, typography, spacing, radius)
- [x] Supabase schema types (`src/types/database.ts`) — profiles, products,
      variants, cart, orders, coupons, reviews, banners
- [x] Supabase Auth wired end-to-end:
  - Browser + server + middleware Supabase clients (`src/lib/supabase/`)
  - Route protection via `src/middleware.ts` (`/account/*`, `/admin/*`)
  - Auth pages: `/auth/login`, `/auth/signup`, `/auth/reset`, `/auth/callback`
  - Email/password + Google OAuth (toggle via `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`)
  - `/account` (customer dashboard placeholder) and `/admin` (role-gated placeholder)
- [x] Zod validation schemas (`src/lib/validations.ts`)
- [x] Preview homepage with hero, categories, product grid, promo banners

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 2 | Server-only, bypasses RLS |
| `DATABASE_URL` | ✅ (migrations/seed) | Direct Postgres connection for `psql` |
| `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` | optional | `"true"` to show Google sign-in |
| `NEXT_PUBLIC_SITE_URL` | ✅ | OAuth / email redirect origin |
| `STRIPE_SECRET_KEY` | Phase 2 | Payments (server-side) |
| `STRIPE_WEBHOOK_SECRET` | Phase 2 | Webhook verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Phase 2 | Stripe.js (browser) |
| `RESEND_API_KEY` | Phase 2 | Transactional email |

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# edit .env.local with your Supabase + other keys

# 3. Apply database migrations (creates tables + RLS policies)
psql $DATABASE_URL -f supabase/migrations/*.sql

# 4. Seed the database (categories, brands, products, banners, admin user)
psql $DATABASE_URL -f supabase/seed.sql

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Alternatively, if you have the Supabase CLI installed and a linked project,
> you can run `supabase db push` and `supabase db seed` instead of `psql`.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Project structure

```
src/
├── app/
│   ├── (storefront)/          # Public storefront route group
│   │   ├── auth/              # login, signup, reset, OAuth callback
│   │   ├── account/           # Customer dashboard (auth-protected)
│   │   ├── layout.tsx         # Storefront chrome (header/footer)
│   │   └── page.tsx           # Preview homepage
│   ├── admin/                 # Admin dashboard (role-gated)
│   └── layout.tsx             # Root layout (Inter font, metadata)
├── components/ui/             # shadcn/ui primitives (Button, Input, …)
├── lib/
│   ├── supabase/              # client.ts, server.ts, middleware.ts
│   ├── validations.ts         # Zod schemas + inferred types
│   └── utils.ts               # cn, formatPrice, discountPercent, slugify
├── types/                     # Database row types + derived UI types
└── data/preview.ts            # Static preview data (Phase 1 homepage)
```

---

## Phase 2 — Commerce (coming next)

- Product catalog with search, category filters, sorting and pagination
- Product detail pages (PDP) with variants, specs, image gallery and reviews
- Shopping cart (persistent, synced to DB for logged-in users)
- Checkout flow with Stripe payment + webhook confirmation
- Admin panel: product/order/user management, analytics
- Customer reviews & ratings
- Wishlist sync to Supabase
- Order tracking and order history
- Transactional email (order confirmations, shipping updates) via Resend

---

## License

Private — Digitaz internal project.
