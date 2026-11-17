/**
 * Database row types — single source of truth matching supabase/migrations/*.sql
 * Phase 1: these types drive the seed data, design-system components, and preview home.
 * Phase 2 will replace static usage with live Supabase queries.
 */

export type UserRole = "user" | "admin";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";
export type CouponType = "percent" | "fixed";
export type BannerType = "hero" | "promo" | "footer";

export interface Profile {
  id: string; // uuid, references auth.users
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  brand_id: string;
  base_price: number; // compare-at / old price
  sale_price: number; // current selling price
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  option_name: string; // e.g. "Color" or "Storage"
  option_value: string; // e.g. "Midnight Black" or "512GB"
  sku: string;
  price_adjustment: number; // added to product.sale_price
  stock_quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  key: string;
  value: string;
  sort_order: number;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_add: number;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  coupon_id: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  email: string;
  phone: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number; // 1-5
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  type: BannerType;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
