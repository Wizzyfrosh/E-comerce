import { getWishlistSlugs } from "@/lib/actions/wishlist";
import { getAllProductCards } from "@/lib/data/products";
import { WishlistGrid } from "./wishlist-grid";

export const metadata = {
  title: "Wishlist | Digitaz",
  description: "Products you saved to your wishlist.",
};

/**
 * Server shell: loads logged-in wishlist slugs and the full product card
 * catalog. The client grid merges the local (localStorage) wishlist so
 * guests see their saved items too.
 */
export default async function WishlistPage() {
  const [serverSlugs, products] = await Promise.all([
    getWishlistSlugs(),
    getAllProductCards(),
  ]);

  return (
    <div className="container-store py-12">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Your Wishlist</h1>
      <WishlistGrid serverSlugs={serverSlugs} products={products} />
    </div>
  );
}
