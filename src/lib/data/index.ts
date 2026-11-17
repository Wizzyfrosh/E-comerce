/**
 * Data layer barrel — single import surface for all storefront data access.
 * Every function is Supabase-first with static seed fallback, so the site
 * builds and renders with no live DB.
 */
export * from "./seed-data";
export * from "./products";
export * from "./categories";
export * from "./banners";
export * from "./reviews";
