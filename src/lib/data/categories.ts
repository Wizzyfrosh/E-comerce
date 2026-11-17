/**
 * Category data access. Supabase-first with seed fallback.
 */
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";
import type { CategoryNavItem } from "@/types";
import { seedCategories, toCategoryNavItem } from "./seed-data";

export async function getCategories(): Promise<CategoryNavItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) {
      return seedCategories.filter((c) => c.is_active).map(toCategoryNavItem);
    }
    return (data as Category[]).map(toCategoryNavItem);
  } catch {
    return seedCategories.filter((c) => c.is_active).map(toCategoryNavItem);
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return seedCategories.find((c) => c.slug === slug) ?? null;
    return data as Category;
  } catch {
    return seedCategories.find((c) => c.slug === slug) ?? null;
  }
}
