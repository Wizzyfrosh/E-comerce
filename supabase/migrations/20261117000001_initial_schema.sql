-- ============================================================================
-- Digitaz E-Commerce — Phase 1 Foundation Schema
-- Migration 0001: Enums, Tables, Indexes, Constraints
-- Matches src/types/database.ts exactly.
-- ============================================================================

-- Native gen_random_uuid() is available in PostgreSQL 13+ (Supabase runs PG15+).
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percent', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type banner_type as enum ('hero', 'promo', 'footer');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        user_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  full_name    text not null,
  phone        text,
  line1        text not null,
  line2        text,
  city         text not null,
  state        text,
  postal_code  text not null,
  country      text not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_addresses_user_id on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- categories (self-referencing parent_id)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null,
  description  text,
  image_url    text,
  parent_id    uuid references public.categories (id) on delete set null,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index if not exists idx_categories_slug on public.categories (slug);
create index if not exists idx_categories_parent_id on public.categories (parent_id);
create index if not exists idx_categories_is_active on public.categories (is_active);

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null,
  logo_url     text,
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index if not exists idx_brands_slug on public.brands (slug);
create index if not exists idx_brands_is_active on public.brands (is_active);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null,
  description       text,
  category_id       uuid not null references public.categories (id) on delete restrict,
  brand_id          uuid not null references public.brands (id) on delete restrict,
  base_price        numeric(12, 2) not null,           -- compare-at / old price
  sale_price        numeric(12, 2) not null,           -- current selling price
  sku               text not null,
  stock_quantity    integer not null default 0,
  is_active         boolean not null default true,
  is_featured       boolean not null default false,
  rating_avg        numeric(3, 2) not null default 0,
  rating_count      integer not null default 0,
  sold_count        integer not null default 0,
  meta_title        text,
  meta_description  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint chk_products_price_nonneg check (base_price >= 0 and sale_price >= 0),
  constraint chk_products_stock_nonneg check (stock_quantity >= 0),
  constraint chk_products_rating check (rating_avg >= 0 and rating_avg <= 5)
);
create unique index if not exists idx_products_slug on public.products (slug);
create unique index if not exists idx_products_sku on public.products (sku);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_brand_id on public.products (brand_id);
create index if not exists idx_products_is_active on public.products (is_active);
create index if not exists idx_products_is_featured on public.products (is_featured);
create index if not exists idx_products_sold_count on public.products (sold_count desc);

-- ---------------------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------------------
create table if not exists public.product_variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  option_name       text not null,                     -- e.g. "Color" or "Storage"
  option_value      text not null,                     -- e.g. "Midnight Black" or "512GB"
  sku               text not null,
  price_adjustment  numeric(12, 2) not null default 0, -- added to product.sale_price
  stock_quantity    integer not null default 0,
  image_url         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint chk_variants_stock_nonneg check (stock_quantity >= 0)
);
create unique index if not exists idx_product_variants_sku on public.product_variants (sku);
create index if not exists idx_product_variants_product_id on public.product_variants (product_id);

-- ---------------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  variant_id  uuid references public.product_variants (id) on delete set null,
  image_url   text not null,
  alt_text    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_product_images_product_id on public.product_images (product_id);
create index if not exists idx_product_images_variant_id on public.product_images (variant_id);

-- ---------------------------------------------------------------------------
-- product_specs (ProductSpec in types)
-- ---------------------------------------------------------------------------
create table if not exists public.product_specs (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  key         text not null,
  value       text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_product_specs_product_id on public.product_specs (product_id);

-- ---------------------------------------------------------------------------
-- carts (supports guest carts via session_id)
-- ---------------------------------------------------------------------------
create table if not exists public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,
  session_id  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_carts_user_id on public.carts (user_id);
create index if not exists idx_carts_session_id on public.carts (session_id);

-- ---------------------------------------------------------------------------
-- cart_items
-- ---------------------------------------------------------------------------
create table if not exists public.cart_items (
  id            uuid primary key default gen_random_uuid(),
  cart_id       uuid not null references public.carts (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  variant_id    uuid references public.product_variants (id) on delete set null,
  quantity      integer not null default 1,
  price_at_add  numeric(12, 2) not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint chk_cart_items_qty check (quantity > 0)
);
create index if not exists idx_cart_items_cart_id on public.cart_items (cart_id);
create index if not exists idx_cart_items_product_id on public.cart_items (product_id);
create index if not exists idx_cart_items_variant_id on public.cart_items (variant_id);

-- ---------------------------------------------------------------------------
-- wishlists
-- ---------------------------------------------------------------------------
create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint uq_wishlists_user_product unique (user_id, product_id)
);
create index if not exists idx_wishlists_user_id on public.wishlists (user_id);
create index if not exists idx_wishlists_product_id on public.wishlists (product_id);

-- ---------------------------------------------------------------------------
-- coupons
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null,
  type             coupon_type not null,
  value            numeric(12, 2) not null,
  min_order_value  numeric(12, 2) not null default 0,
  max_discount     numeric(12, 2),
  usage_limit      integer,
  used_count       integer not null default 0,
  starts_at        timestamptz,
  expires_at       timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint chk_coupons_value_positive check (value > 0)
);
create unique index if not exists idx_coupons_code on public.coupons (code);
create index if not exists idx_coupons_is_active on public.coupons (is_active);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users (id) on delete set null,
  order_number       text not null,
  status             order_status not null default 'pending',
  subtotal           numeric(12, 2) not null default 0,
  discount_total     numeric(12, 2) not null default 0,
  shipping_total     numeric(12, 2) not null default 0,
  tax_total          numeric(12, 2) not null default 0,
  total              numeric(12, 2) not null default 0,
  coupon_id          uuid references public.coupons (id) on delete set null,
  shipping_address   jsonb,
  billing_address    jsonb,
  email              text not null,
  phone              text,
  payment_method     text,
  payment_status     payment_status not null default 'unpaid',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create unique index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_coupon_id on public.orders (coupon_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete restrict,
  variant_id    uuid references public.product_variants (id) on delete set null,
  product_name  text not null,
  variant_name  text,
  sku           text not null,
  quantity      integer not null default 1,
  unit_price    numeric(12, 2) not null,
  total         numeric(12, 2) not null,
  created_at    timestamptz not null default now(),
  constraint chk_order_items_qty check (quantity > 0)
);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);
create index if not exists idx_order_items_variant_id on public.order_items (variant_id);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  product_id   uuid not null references public.products (id) on delete cascade,
  rating       integer not null,
  title        text,
  comment      text,
  is_verified  boolean not null default false,
  is_approved  boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint uq_reviews_user_product unique (user_id, product_id),
  constraint chk_reviews_rating check (rating >= 1 and rating <= 5)
);
create index if not exists idx_reviews_user_id on public.reviews (user_id);
create index if not exists idx_reviews_product_id on public.reviews (product_id);
create index if not exists idx_reviews_is_approved on public.reviews (is_approved);

-- ---------------------------------------------------------------------------
-- banners
-- ---------------------------------------------------------------------------
create table if not exists public.banners (
  id                uuid primary key default gen_random_uuid(),
  type              banner_type not null,
  title             text not null,
  subtitle          text,
  description       text,
  image_url         text,
  mobile_image_url  text,
  cta_text          text,
  cta_link          text,
  badge             text,
  sort_order        integer not null default 0,
  is_active         boolean not null default true,
  starts_at         timestamptz,
  expires_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_banners_type on public.banners (type);
create index if not exists idx_banners_is_active on public.banners (is_active);
