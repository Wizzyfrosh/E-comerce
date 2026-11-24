"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";

import type { ProductCardData } from "@/types";
import { useCartStore } from "@/components/store/cart-store";
import { toggleWishlistItem } from "@/lib/actions/wishlist";
import { PriceTag } from "@/components/store/price-tag";
import { EmptyState } from "@/components/store/empty-state";

interface WishlistGridProps {
  /** Slugs persisted server-side for the logged-in user. */
  serverSlugs: string[];
  /** Full product card catalog used to resolve saved slugs. */
  products: ProductCardData[];
}

/**
 * Merges server wishlist slugs with the local zustand wishlist mirror and
 * renders a product grid. Each item offers Move to Cart (adds the line and
 * removes the wishlist entry) and Remove (removes both local + server).
 */
export function WishlistGrid({ serverSlugs, products }: WishlistGridProps) {
  const localSlugs = useCartStore((state) => state.wishlist);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);

  const slugs = useMemo(
    () => Array.from(new Set([...serverSlugs, ...localSlugs])),
    [serverSlugs, localSlugs]
  );

  const items = useMemo(
    () => products.filter((product) => slugs.includes(product.slug)),
    [products, slugs]
  );

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        subtitle="Tap the heart on any product to save it here for later."
        suggestions={[{ label: "Browse products", href: "/" }]}
      />
    );
  }

  const handleMoveToCart = (product: ProductCardData) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image_url: product.image_url,
      sku: product.id,
      variantIds: [],
      optionLabels: "",
      unitPrice: product.sale_price,
      qty: 1,
    });
    toggleWishlist(product.slug);
    void toggleWishlistItem(product.id).catch(() => undefined);
  };

  const handleRemove = (product: ProductCardData) => {
    toggleWishlist(product.slug);
    void toggleWishlistItem(product.id).catch(() => undefined);
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <div
          key={product.id}
          className="group relative rounded-lg border border-border bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Link
            href={`/product/${product.slug}`}
            className="block"
            aria-label={product.name}
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          <div className="mt-2.5 space-y-1.5">
            {product.categoryLabel && (
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {product.categoryLabel}
              </p>
            )}
            <Link href={`/product/${product.slug}`}>
              <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                {product.name}
              </h3>
            </Link>
            <PriceTag basePrice={product.base_price} salePrice={product.sale_price} />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleMoveToCart(product)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <ShoppingCart size={12} />
                Move to Cart
              </button>
              <button
                type="button"
                onClick={() => handleRemove(product)}
                aria-label={`Remove ${product.name} from wishlist`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-brand-sale hover:text-brand-sale"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
