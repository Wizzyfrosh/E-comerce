"use server";

/**
 * Wishlist server actions. Supabase-first with graceful fallback:
 *  - `getWishlistSlugs` returns `[]` for guests / DB failures.
 *  - `toggleWishlistItem` returns `{ wishlisted: false }` for guests /
 *    DB failures so client UI never crashes without a live project.
 * The client zustand store (`digitaz-wishlist-v1`) remains the local
 * mirror; these actions persist the same selection server-side.
 */
import { createClient } from "@/lib/supabase/server";

/** Product slugs in the logged-in user's wishlist (empty fallback). */
export async function getWishlistSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("wishlists")
      .select("product:products(slug)")
      .eq("user_id", user.id);
    if (error) throw error;

    return (data ?? [])
      .map((row) => {
        const product = row.product as unknown as { slug: string } | null;
        return product?.slug ?? null;
      })
      .filter((slug): slug is string => Boolean(slug));
  } catch {
    return [];
  }
}

/** Toggle a product in the user's wishlist; returns the next state. */
export async function toggleWishlistItem(
  productId: string
): Promise<{ wishlisted: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { wishlisted: false };

    const { data: existing, error: selectError } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    if (selectError) throw selectError;

    if (existing) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", existing.id);
      if (error) throw error;
      return { wishlisted: false };
    }

    const { error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, product_id: productId });
    if (error) throw error;
    return { wishlisted: true };
  } catch {
    return { wishlisted: false };
  }
}
