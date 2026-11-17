-- ============================================================================
-- Digitaz E-Commerce — Phase 1 Foundation
-- Migration 0003: Row Level Security — enable on every table + explicit policies
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on every table.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','addresses','categories','brands','products',
    'product_variants','product_images','product_specs','carts',
    'cart_items','wishlists','coupons','orders','order_items',
    'reviews','banners'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Grants (RLS policies still gate actual access).
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- ===========================================================================
-- Helper: drop + recreate policy (keeps migrations idempotent).
-- ===========================================================================
-- We use explicit drop policy if exists / create policy pairs below.

-- ===========================================================================
-- 1. profiles — users read/update own; admins all; admin-only delete.
-- ===========================================================================
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles for delete
  using (public.is_admin());

-- ===========================================================================
-- 2. addresses — users manage own; admins read/delete.
-- ===========================================================================
drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses for insert
  with check (user_id = auth.uid());

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses for delete
  using (user_id = auth.uid() or public.is_admin());

-- ===========================================================================
-- 3. categories — public read on is_active; admin-only writes.
-- ===========================================================================
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories for select
  using (is_active = true or public.is_admin());

drop policy if exists "categories_insert_admin" on public.categories;
create policy "categories_insert_admin" on public.categories for insert
  with check (public.is_admin());

drop policy if exists "categories_update_admin" on public.categories;
create policy "categories_update_admin" on public.categories for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories_delete_admin" on public.categories;
create policy "categories_delete_admin" on public.categories for delete
  using (public.is_admin());

-- ===========================================================================
-- 4. brands — public read on is_active; admin-only writes.
-- ===========================================================================
drop policy if exists "brands_select_public" on public.brands;
create policy "brands_select_public" on public.brands for select
  using (is_active = true or public.is_admin());

drop policy if exists "brands_insert_admin" on public.brands;
create policy "brands_insert_admin" on public.brands for insert
  with check (public.is_admin());

drop policy if exists "brands_update_admin" on public.brands;
create policy "brands_update_admin" on public.brands for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands_delete_admin" on public.brands;
create policy "brands_delete_admin" on public.brands for delete
  using (public.is_admin());

-- ===========================================================================
-- 5. products — public read on is_active; admin-only writes.
-- ===========================================================================
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products for select
  using (is_active = true or public.is_admin());

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products for insert
  with check (public.is_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products for delete
  using (public.is_admin());

-- ===========================================================================
-- 6. product_variants — public read when parent product is active; admin writes.
-- ===========================================================================
drop policy if exists "variants_select_public" on public.product_variants;
create policy "variants_select_public" on public.product_variants for select
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.is_active = true or public.is_admin())
  ));

drop policy if exists "variants_insert_admin" on public.product_variants;
create policy "variants_insert_admin" on public.product_variants for insert
  with check (public.is_admin());

drop policy if exists "variants_update_admin" on public.product_variants;
create policy "variants_update_admin" on public.product_variants for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants_delete_admin" on public.product_variants;
create policy "variants_delete_admin" on public.product_variants for delete
  using (public.is_admin());

-- ===========================================================================
-- 7. product_images — public read when parent product is active; admin writes.
-- ===========================================================================
drop policy if exists "images_select_public" on public.product_images;
create policy "images_select_public" on public.product_images for select
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.is_active = true or public.is_admin())
  ));

drop policy if exists "images_insert_admin" on public.product_images;
create policy "images_insert_admin" on public.product_images for insert
  with check (public.is_admin());

drop policy if exists "images_update_admin" on public.product_images;
create policy "images_update_admin" on public.product_images for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "images_delete_admin" on public.product_images;
create policy "images_delete_admin" on public.product_images for delete
  using (public.is_admin());

-- ===========================================================================
-- 8. product_specs — public read when parent product is active; admin writes.
-- ===========================================================================
drop policy if exists "specs_select_public" on public.product_specs;
create policy "specs_select_public" on public.product_specs for select
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.is_active = true or public.is_admin())
  ));

drop policy if exists "specs_insert_admin" on public.product_specs;
create policy "specs_insert_admin" on public.product_specs for insert
  with check (public.is_admin());

drop policy if exists "specs_update_admin" on public.product_specs;
create policy "specs_update_admin" on public.product_specs for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "specs_delete_admin" on public.product_specs;
create policy "specs_delete_admin" on public.product_specs for delete
  using (public.is_admin());

-- ===========================================================================
-- 9. carts — users manage own; guest (anon) may create session-based carts.
--    Guest cart read/update/delete must use the service role (no auth.uid()).
-- ===========================================================================
drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own" on public.carts for select
  using (user_id = auth.uid());

drop policy if exists "carts_insert_own_or_guest" on public.carts;
create policy "carts_insert_own_or_guest" on public.carts for insert
  with check (
    user_id = auth.uid()
    or (auth.uid() is null and session_id is not null and user_id is null)
  );

drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own" on public.carts for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own" on public.carts for delete
  using (user_id = auth.uid());

-- ===========================================================================
-- 10. cart_items — users manage items in their own cart.
-- ===========================================================================
drop policy if exists "cart_items_select_own" on public.cart_items;
create policy "cart_items_select_own" on public.cart_items for select
  using (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  ));

drop policy if exists "cart_items_insert_own" on public.cart_items;
create policy "cart_items_insert_own" on public.cart_items for insert
  with check (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  ));

drop policy if exists "cart_items_update_own" on public.cart_items;
create policy "cart_items_update_own" on public.cart_items for update
  using (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  ));

drop policy if exists "cart_items_delete_own" on public.cart_items;
create policy "cart_items_delete_own" on public.cart_items for delete
  using (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  ));

-- ===========================================================================
-- 11. wishlists — users manage own.
-- ===========================================================================
drop policy if exists "wishlists_select_own" on public.wishlists;
create policy "wishlists_select_own" on public.wishlists for select
  using (user_id = auth.uid());

drop policy if exists "wishlists_insert_own" on public.wishlists;
create policy "wishlists_insert_own" on public.wishlists for insert
  with check (user_id = auth.uid());

drop policy if exists "wishlists_update_own" on public.wishlists;
create policy "wishlists_update_own" on public.wishlists for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "wishlists_delete_own" on public.wishlists;
create policy "wishlists_delete_own" on public.wishlists for delete
  using (user_id = auth.uid());

-- ===========================================================================
-- 12. coupons — public read on is_active; admin-only writes.
-- ===========================================================================
drop policy if exists "coupons_select_public" on public.coupons;
create policy "coupons_select_public" on public.coupons for select
  using (is_active = true or public.is_admin());

drop policy if exists "coupons_insert_admin" on public.coupons;
create policy "coupons_insert_admin" on public.coupons for insert
  with check (public.is_admin());

drop policy if exists "coupons_update_admin" on public.coupons;
create policy "coupons_update_admin" on public.coupons for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "coupons_delete_admin" on public.coupons;
create policy "coupons_delete_admin" on public.coupons for delete
  using (public.is_admin());

-- ===========================================================================
-- 13. orders — users read/update own; guests may create (user_id null);
--     admins all; admin-only delete.
-- ===========================================================================
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_insert_own_or_guest" on public.orders;
create policy "orders_insert_own_or_guest" on public.orders for insert
  with check (
    user_id = auth.uid()
    or (auth.uid() is null and user_id is null)
  );

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own" on public.orders for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin" on public.orders for delete
  using (public.is_admin());

-- ===========================================================================
-- 14. order_items — readable via owning order; insert with owning order;
--     update/delete admin-only (line items are immutable after checkout).
-- ===========================================================================
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items for insert
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin() or o.user_id is null)
  ));

drop policy if exists "order_items_update_admin" on public.order_items;
create policy "order_items_update_admin" on public.order_items for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_delete_admin" on public.order_items;
create policy "order_items_delete_admin" on public.order_items for delete
  using (public.is_admin());

-- ===========================================================================
-- 15. reviews — public read on is_approved; users manage own; admins all.
-- ===========================================================================
drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public" on public.reviews for select
  using (is_approved = true or user_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert
  with check (user_id = auth.uid());

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

-- ===========================================================================
-- 16. banners — public read on is_active; admin-only writes.
-- ===========================================================================
drop policy if exists "banners_select_public" on public.banners;
create policy "banners_select_public" on public.banners for select
  using (is_active = true or public.is_admin());

drop policy if exists "banners_insert_admin" on public.banners;
create policy "banners_insert_admin" on public.banners for insert
  with check (public.is_admin());

drop policy if exists "banners_update_admin" on public.banners;
create policy "banners_update_admin" on public.banners for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "banners_delete_admin" on public.banners;
create policy "banners_delete_admin" on public.banners for delete
  using (public.is_admin());
