/**
 * Product data access.
 * CORE RULE: try Supabase (server client) first; on ANY error / missing env /
 * empty result, fall back to static seed data. The site must render with no DB.
 */
import { createClient } from "@/lib/supabase/server";
import { discountPercent } from "@/lib/utils";
import type { ProductCardData, ProductWithRelations } from "@/types";
import {
  seedProducts,
  seedProductsDetail,
  seedProductsFull,
  toProductCardData,
} from "./seed-data";

export type ProductSort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "best-selling"
  | "top-rated";

export interface GetProductsOptions {
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  attributeFilters?: Record<string, string[]>;
}

export interface GetProductsResult {
  products: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/* Fallback implementations (operate on seed data)                     */
/* ------------------------------------------------------------------ */

function fullToCard(p: ProductWithRelations): ProductCardData {
  return toProductCardData(p);
}

function fallbackFiltered(opts: GetProductsOptions): ProductWithRelations[] {
  let list = seedProductsFull.slice();

  if (opts.categorySlug) {
    list = list.filter((p) => p.category?.slug === opts.categorySlug);
  }
  if (opts.brandSlugs && opts.brandSlugs.length > 0) {
    list = list.filter((p) => p.brand && opts.brandSlugs!.includes(p.brand.slug));
  }
  if (typeof opts.minPrice === "number") {
    list = list.filter((p) => p.sale_price >= opts.minPrice!);
  }
  if (typeof opts.maxPrice === "number") {
    list = list.filter((p) => p.sale_price <= opts.maxPrice!);
  }
  if (typeof opts.minRating === "number") {
    list = list.filter((p) => p.rating_avg >= opts.minRating!);
  }
  if (opts.inStockOnly) {
    list = list.filter((p) => p.stock_quantity > 0);
  }
  if (opts.attributeFilters) {
    const entries = Object.entries(opts.attributeFilters).filter(
      ([, vals]) => vals.length > 0
    );
    if (entries.length > 0) {
      list = list.filter((p) =>
        entries.every(([key, vals]) =>
          (p.specs ?? []).some(
            (s) => s.key.toLowerCase() === key.toLowerCase() && vals.includes(s.value)
          )
        )
      );
    }
  }

  switch (opts.sort) {
    case "price-asc":
      list.sort((a, b) => a.sale_price - b.sale_price);
      break;
    case "price-desc":
      list.sort((a, b) => b.sale_price - a.sale_price);
      break;
    case "newest":
      list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      break;
    case "best-selling":
      list.sort((a, b) => b.sold_count - a.sold_count);
      break;
    case "top-rated":
      list.sort((a, b) => b.rating_avg - a.rating_avg);
      break;
    case "relevance":
    default:
      // featured first, then best-selling
      list.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          b.sold_count - a.sold_count
      );
      break;
  }

  return list;
}

function fallbackGetProducts(opts: GetProductsOptions): GetProductsResult {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.max(1, opts.pageSize ?? 12);
  const filtered = fallbackFiltered(opts);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const products = filtered.slice(start, start + pageSize).map(fullToCard);
  return { products, total, page, pageSize, totalPages };
}

/* ------------------------------------------------------------------ */
/* Supabase row → card mapper                                          */
/* ------------------------------------------------------------------ */

interface SupabaseProductRow {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  stock_quantity: number;
  is_featured?: boolean;
  created_at?: string;
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
  product_variants?: { option_value: string; image_url: string | null }[];
  product_images?: { image_url: string }[];
}

function rowToCard(row: SupabaseProductRow): ProductCardData {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryLabel: row.category?.name ?? null,
    base_price: row.base_price,
    sale_price: row.sale_price,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    sold_count: row.sold_count,
    stock_quantity: row.stock_quantity,
    image_url:
      row.product_images?.[0]?.image_url ??
      `https://picsum.photos/seed/${row.slug}/600/600`,
    badge: null,
    variants: (row.product_variants ?? [])
      .filter((v) => v.option_value)
      .map((v) => ({ option_value: v.option_value, image_url: v.image_url })),
  };
}

const SUPABASE_ORDER: Record<ProductSort, { column: string; ascending: boolean }> = {
  relevance: { column: "sold_count", ascending: false },
  "price-asc": { column: "sale_price", ascending: true },
  "price-desc": { column: "sale_price", ascending: false },
  newest: { column: "created_at", ascending: false },
  "best-selling": { column: "sold_count", ascending: false },
  "top-rated": { column: "rating_avg", ascending: false },
};

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function getProducts(
  opts: GetProductsOptions = {}
): Promise<GetProductsResult> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.max(1, opts.pageSize ?? 12);
  const sort: ProductSort = opts.sort ?? "relevance";

  try {
    const supabase = await createClient();
    let q = supabase
      .from("products")
      .select(
        "id,name,slug,base_price,sale_price,rating_avg,rating_count,sold_count,stock_quantity,created_at,category:categories(id,name,slug),brand:brands(id,name,slug),product_variants(option_value,image_url),product_images(image_url)",
        { count: "exact" }
      )
      .eq("is_active", true)
      .order(SUPABASE_ORDER[sort].column, {
        ascending: SUPABASE_ORDER[sort].ascending,
      });

    if (opts.categorySlug) {
      q = q.eq("category.slug", opts.categorySlug);
    }
    if (opts.brandSlugs && opts.brandSlugs.length > 0) {
      q = q.in("brand.slug", opts.brandSlugs);
    }
    if (typeof opts.minPrice === "number") q = q.gte("sale_price", opts.minPrice);
    if (typeof opts.maxPrice === "number") q = q.lte("sale_price", opts.maxPrice);
    if (typeof opts.minRating === "number") q = q.gte("rating_avg", opts.minRating);
    if (opts.inStockOnly) q = q.gt("stock_quantity", 0);

    const from = (page - 1) * pageSize;
    const { data, error, count } = await q.range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) return fallbackGetProducts(opts);

    const total = count ?? data.length;
    return {
      products: (data as unknown as SupabaseProductRow[]).map(rowToCard),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch {
    return fallbackGetProducts(opts);
  }
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "*,category:categories(id,name,slug),brand:brands(id,name,slug),product_variants(*),product_images(*),product_specs(*)"
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return seedProductsDetail[slug] ?? null;
    return data as unknown as ProductWithRelations;
  } catch {
    return seedProductsDetail[slug] ?? null;
  }
}

export async function getProductById(
  id: string
): Promise<ProductWithRelations | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "*,category:categories(id,name,slug),brand:brands(id,name,slug),product_variants(*),product_images(*),product_specs(*)"
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return seedProductsFull.find((p) => p.id === id) ?? null;
    }
    return data as unknown as ProductWithRelations;
  } catch {
    return seedProductsFull.find((p) => p.id === id) ?? null;
  }
}

export async function getFeaturedProducts(limit = 6): Promise<ProductCardData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,slug,base_price,sale_price,rating_avg,rating_count,sold_count,stock_quantity,category:categories(id,name,slug),product_variants(option_value,image_url),product_images(image_url)"
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sold_count", { ascending: false })
      .limit(limit);
    if (error) throw error;
    if (!data || data.length === 0) return fallbackFeatured(limit);
    return (data as unknown as SupabaseProductRow[]).map(rowToCard);
  } catch {
    return fallbackFeatured(limit);
  }
}

function fallbackFeatured(limit: number): ProductCardData[] {
  return seedProductsFull
    .filter((p) => p.is_featured)
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, limit)
    .map(fullToCard);
}

export type TrendingTab = "best-seller" | "sales" | "featured" | "new";

export async function getTrendingProducts(
  tab: TrendingTab,
  limit = 8
): Promise<ProductCardData[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("products")
      .select(
        "id,name,slug,base_price,sale_price,rating_avg,rating_count,sold_count,stock_quantity,is_featured,created_at,category:categories(id,name,slug),product_variants(option_value,image_url),product_images(image_url)"
      )
      .eq("is_active", true);

    if (tab === "featured") q = q.eq("is_featured", true);
    if (tab === "best-seller") q = q.order("sold_count", { ascending: false });
    else if (tab === "new") q = q.order("created_at", { ascending: false });
    else q = q.order("sold_count", { ascending: false });

    const { data, error } = await q.limit(limit);
    if (error) throw error;
    if (!data || data.length === 0) return fallbackTrending(tab, limit);
    return (data as unknown as SupabaseProductRow[]).map(rowToCard);
  } catch {
    return fallbackTrending(tab, limit);
  }
}

function fallbackTrending(tab: TrendingTab, limit: number): ProductCardData[] {
  const list = seedProductsFull.slice();
  switch (tab) {
    case "best-seller":
      list.sort((a, b) => b.sold_count - a.sold_count);
      break;
    case "sales":
      list.sort(
        (a, b) =>
          discountPercent(b.base_price, b.sale_price) -
          discountPercent(a.base_price, a.sale_price) ||
          a.sale_price - b.sale_price
      );
      break;
    case "featured":
      list.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          b.sold_count - a.sold_count
      );
      break;
    case "new":
      list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      break;
  }
  return list.slice(0, limit).map(fullToCard);
}

export async function getRelatedProducts(
  productId: string,
  limit = 4
): Promise<ProductCardData[]> {
  try {
    const supabase = await createClient();
    const current = seedProductsFull.find((p) => p.id === productId);
    const categoryId = current?.category_id;
    let q = supabase
      .from("products")
      .select(
        "id,name,slug,base_price,sale_price,rating_avg,rating_count,sold_count,stock_quantity,category:categories(id,name,slug),product_variants(option_value,image_url),product_images(image_url)"
      )
      .eq("is_active", true)
      .neq("id", productId);
    if (categoryId) q = q.eq("category_id", categoryId);
    const { data, error } = await q
      .order("sold_count", { ascending: false })
      .limit(limit);
    if (error) throw error;
    if (!data || data.length === 0) return fallbackRelated(productId, limit);
    return (data as unknown as SupabaseProductRow[]).map(rowToCard);
  } catch {
    return fallbackRelated(productId, limit);
  }
}

function fallbackRelated(productId: string, limit: number): ProductCardData[] {
  const current = seedProductsFull.find((p) => p.id === productId);
  if (!current) return seedProducts.slice(0, limit);
  const sameCat = seedProductsFull.filter(
    (p) => p.id !== productId && p.category_id === current.category_id
  );
  const others = seedProductsFull.filter(
    (p) => p.id !== productId && p.category_id !== current.category_id
  );
  return [...sameCat, ...others]
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, limit)
    .map(fullToCard);
}

export async function searchProducts(
  query: string,
  opts: { limit?: number } = {}
): Promise<ProductCardData[]> {
  const limit = opts.limit ?? 12;
  const q = query.trim().toLowerCase();
  if (!q) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,slug,base_price,sale_price,rating_avg,rating_count,sold_count,stock_quantity,category:categories(id,name,slug),product_variants(option_value,image_url),product_images(image_url)"
      )
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .order("sold_count", { ascending: false })
      .limit(limit);
    if (error) throw error;
    if (!data || data.length === 0) return fallbackSearch(q, limit);
    return (data as unknown as SupabaseProductRow[]).map(rowToCard);
  } catch {
    return fallbackSearch(q, limit);
  }
}

function fallbackSearch(q: string, limit: number): ProductCardData[] {
  return seedProductsFull
    .filter((p) => {
      const haystack = [
        p.name,
        p.description ?? "",
        p.category?.name ?? "",
        p.brand?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => haystack.includes(term));
    })
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, limit)
    .map(fullToCard);
}

export interface ProductFilters {
  brands: { slug: string; name: string; count: number }[];
  priceRange: { min: number; max: number };
  attributes: { key: string; values: string[] }[];
}

export async function getProductFilters(
  categorySlug?: string
): Promise<ProductFilters> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "sale_price,brand:brands(id,name,slug),product_specs(key,value),category:categories(slug)"
      )
      .eq("is_active", true);
    if (error) throw error;
    if (!data || data.length === 0) return fallbackFilters(categorySlug);
    // Basic aggregation from rows; attribute aggregation is best-effort.
    const rows = data as unknown as {
      sale_price: number;
      brand: { id: string; name: string; slug: string } | null;
      product_specs: { key: string; value: string }[];
      category: { slug: string } | null;
    }[];
    const scoped = categorySlug
      ? rows.filter((r) => r.category?.slug === categorySlug)
      : rows;
    const brandCounts = new Map<string, { name: string; count: number }>();
    let min = Infinity;
    let max = 0;
    const attrMap = new Map<string, Set<string>>();
    for (const r of scoped) {
      if (r.sale_price < min) min = r.sale_price;
      if (r.sale_price > max) max = r.sale_price;
      if (r.brand) {
        const entry = brandCounts.get(r.brand.slug) ?? { name: r.brand.name, count: 0 };
        entry.count += 1;
        brandCounts.set(r.brand.slug, entry);
      }
      for (const s of r.product_specs ?? []) {
        const set = attrMap.get(s.key) ?? new Set<string>();
        set.add(s.value);
        attrMap.set(s.key, set);
      }
    }
    return {
      brands: [...brandCounts.entries()].map(([slug, v]) => ({
        slug,
        name: v.name,
        count: v.count,
      })),
      priceRange: { min: min === Infinity ? 0 : min, max },
      attributes: [...attrMap.entries()].map(([key, set]) => ({
        key,
        values: [...set].sort(),
      })),
    };
  } catch {
    return fallbackFilters(categorySlug);
  }
}

function fallbackFilters(categorySlug?: string): ProductFilters {
  const scoped = categorySlug
    ? seedProductsFull.filter((p) => p.category?.slug === categorySlug)
    : seedProductsFull;

  const brandCounts = new Map<string, { name: string; count: number }>();
  let min = Infinity;
  let max = 0;
  const attrMap = new Map<string, Set<string>>();

  for (const p of scoped) {
    if (p.sale_price < min) min = p.sale_price;
    if (p.sale_price > max) max = p.sale_price;
    if (p.brand) {
      const entry = brandCounts.get(p.brand.slug) ?? { name: p.brand.name, count: 0 };
      entry.count += 1;
      brandCounts.set(p.brand.slug, entry);
    }
    for (const s of p.specs ?? []) {
      const set = attrMap.get(s.key) ?? new Set<string>();
      set.add(s.value);
      attrMap.set(s.key, set);
    }
  }

  return {
    brands: [...brandCounts.entries()]
      .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count),
    priceRange: { min: min === Infinity ? 0 : Math.floor(min), max: Math.ceil(max) },
    attributes: [...attrMap.entries()]
      .map(([key, set]) => ({ key, values: [...set].sort() }))
      .sort((a, b) => a.key.localeCompare(b.key)),
  };
}

/** All product cards — used by sitemap / RecentlyViewed fallback. */
export async function getAllProductCards(): Promise<ProductCardData[]> {
  return seedProducts.slice();
}

/** All product slugs — used by generateStaticParams / sitemap. */
export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  return seedProducts.map((p) => ({ slug: p.slug }));
}
