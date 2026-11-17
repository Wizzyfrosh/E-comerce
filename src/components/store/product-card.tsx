"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { Heart, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/types";
import { CornerBadge } from "./corner-badge";
import { PriceTag } from "./price-tag";
import { RatingStars } from "./rating-stars";
import { SoldProgress } from "./sold-progress";
import { useCartStore } from "./cart-store";

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

/**
 * Compact product card. The whole card links to the PDP; the wishlist heart
 * and Add-to-Cart button stop propagation so they don't trigger navigation.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const addWishlist = useCartStore((state) => state.addWishlist);
  const removeWishlist = useCartStore((state) => state.removeWishlist);

  const totalUnits = product.sold_count + product.stock_quantity;
  const showProgress = product.sold_count > 0 && product.stock_quantity < 100;

  const toggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    if (next) addWishlist();
    else removeWishlist();
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart();
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group relative block rounded-lg border border-border bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && <CornerBadge type={product.badge} />}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-pressed={wishlisted}
          aria-label={
            wishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              wishlisted
                ? "fill-brand-sale text-brand-sale"
                : "text-gray-500"
            )}
          />
        </button>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {product.categoryLabel && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.categoryLabel}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>
        <PriceTag
          basePrice={product.base_price}
          salePrice={product.sale_price}
        />
        <RatingStars
          rating={product.rating_avg}
          count={product.rating_count}
        />
        {showProgress && (
          <SoldProgress sold={product.sold_count} total={totalUnits} />
        )}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <ShoppingCart size={12} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
