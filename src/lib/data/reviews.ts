/**
 * Review data access. Supabase-first with seed fallback.
 */
import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/types/database";
import { seedReviews } from "./seed-data";

export async function getReviewsByProduct(
  productId: string
): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) {
      return seedReviews
        .filter((r) => r.product_id === productId && r.is_approved)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    }
    return data as Review[];
  } catch {
    return seedReviews
      .filter((r) => r.product_id === productId && r.is_approved)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
}
