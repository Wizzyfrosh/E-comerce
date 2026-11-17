export * from "./database";

import type {
  Product,
  ProductVariant,
  ProductImage,
  ProductSpec,
  Category,
  Brand,
} from "./database";

/** Derived UI type — a product with its relations joined, used by cards/PDP. */
export interface ProductWithRelations extends Product {
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  brand?: Pick<Brand, "id" | "name" | "slug"> | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  specs?: ProductSpec[];
}

/** Minimal shape consumed by ProductCard / grids. */
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  categoryLabel?: string | null;
  base_price: number;
  sale_price: number;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  stock_quantity: number;
  image_url: string;
  badge?: "HOT" | "SALE" | "NEW" | null;
  variants?: { option_value: string; image_url: string | null }[];
}

export interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  children?: CategoryNavItem[];
}

export interface HeroSlide {
  id: string;
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  priceLabel?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  image_url: string;
  badge?: string | null;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  image_url?: string | null;
  badge?: string | null;
  variant?: "blue" | "dark" | "light";
}
