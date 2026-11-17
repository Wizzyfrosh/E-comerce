/**
 * Shared helpers for storefront URL state (category filters / sort / page).
 *
 * Canonical query schema:
 *   ?brand=slug1,slug2&minPrice=0&maxPrice=1000&rating=4&inStock=1
 *    &sort=price-asc&page=2&attr_<key>=val1,val2
 *
 * `brand` and each `attr_<key>` value are comma-separated lists.
 * `sort` omits itself when equal to "relevance"; `page` omits itself when 1.
 */

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "top-rated", label: "Top Rated" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const SORT_KEYS: ReadonlySet<string> = new Set(SORT_OPTIONS.map((o) => o.value));

/** Parsed filter state produced from URL searchParams. */
export interface ParsedFilters {
  brandSlugs: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly: boolean;
  sort: SortKey;
  page: number;
  /** attribute key -> selected values (from `attr_<key>` query params) */
  attributeFilters: Record<string, string[]>;
}

/** Serializable bag used to (re)build a query string. */
export interface UrlFilterParams {
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: SortKey;
  page?: number;
  attributes?: Record<string, string[]>;
}

type SearchParamsInput = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function asCsvArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .flatMap((s) => s.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
}

function toNumber(v: string | undefined): number | undefined {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function parseCategorySearchParams(sp: SearchParamsInput): ParsedFilters {
  const brandSlugs = asCsvArray(sp.brand);
  const minPrice = toNumber(first(sp.minPrice));
  const maxPrice = toNumber(first(sp.maxPrice));
  const minRating = toNumber(first(sp.rating));
  const inStockOnly = first(sp.inStock) === "1";
  const sortRaw = first(sp.sort);
  const sort: SortKey =
    sortRaw && SORT_KEYS.has(sortRaw) ? (sortRaw as SortKey) : "relevance";
  const page = Math.max(1, Math.floor(toNumber(first(sp.page)) ?? 1));

  const attributeFilters: Record<string, string[]> = {};
  for (const key of Object.keys(sp)) {
    if (key.startsWith("attr_")) {
      const attrKey = decodeURIComponent(key.slice(5));
      const values = asCsvArray(sp[key]);
      if (values.length) attributeFilters[attrKey] = values;
    }
  }

  return {
    brandSlugs,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sort,
    page,
    attributeFilters,
  };
}

/** Build a `?k=v&...` string (empty string when no params). Omits defaults. */
export function buildSearchString(p: UrlFilterParams): string {
  const params = new URLSearchParams();
  if (p.brand && p.brand.length) params.set("brand", p.brand.join(","));
  if (p.minPrice != null) params.set("minPrice", String(p.minPrice));
  if (p.maxPrice != null) params.set("maxPrice", String(p.maxPrice));
  if (p.rating != null) params.set("rating", String(p.rating));
  if (p.inStock) params.set("inStock", "1");
  if (p.sort && p.sort !== "relevance") params.set("sort", p.sort);
  if (p.page && p.page > 1) params.set("page", String(p.page));
  if (p.attributes) {
    for (const [key, values] of Object.entries(p.attributes)) {
      if (values.length) params.set(`attr_${encodeURIComponent(key)}`, values.join(","));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Convert parsed filters (plus overrides) into a UrlFilterParams for building. */
export function filtersToUrlParams(
  f: ParsedFilters,
  override: Partial<UrlFilterParams> = {}
): UrlFilterParams {
  return {
    brand: f.brandSlugs.length ? [...f.brandSlugs] : undefined,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    rating: f.minRating,
    inStock: f.inStockOnly || undefined,
    sort: f.sort,
    page: f.page,
    attributes: Object.keys(f.attributeFilters).length
      ? Object.fromEntries(
          Object.entries(f.attributeFilters).map(([k, v]) => [k, [...v]])
        )
      : undefined,
    ...override,
  };
}

/** True when any user-facing filter is active (used for "Clear all" / chips). */
export function hasActiveFilters(f: ParsedFilters): boolean {
  return (
    f.brandSlugs.length > 0 ||
    f.minPrice != null ||
    f.maxPrice != null ||
    f.minRating != null ||
    f.inStockOnly ||
    Object.keys(f.attributeFilters).length > 0
  );
}
