-- ============================================================================
-- Digitaz E-Commerce — Phase 1 Foundation
-- Migration 0002: Functions & Triggers
--   - public.is_admin()  (security definer, used by RLS policies)
--   - public.handle_updated_at() + triggers on every table with updated_at
--   - public.handle_new_user() + after insert on auth.users -> profiles
-- ============================================================================

-- ---------------------------------------------------------------------------
-- is_admin(): used in RLS policies to grant admin-only write access.
-- Security definer so it bypasses RLS on profiles when checking role.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- handle_updated_at(): generic trigger to set updated_at = now()
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Apply updated_at trigger to every table that has an updated_at column.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','addresses','categories','brands','products',
    'product_variants','carts','cart_items','coupons','orders',
    'reviews','banners'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.handle_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- handle_new_user(): auto-create profile row on auth.users insert.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'user',
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
