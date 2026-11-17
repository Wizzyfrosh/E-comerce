"use client";

import { useState, type MouseEvent } from "react";
import { Heart, ShieldCheck, ShoppingCart, Truck } from "lucide-react";

import { cn, discountPercent } from "@/lib/utils";
import type { ProductCardData } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CornerBadge } from "./corner-badge";
import { PriceTag } from "./price-tag";
import { RatingStars } from "./rating-stars";
import { ProductCard } from "./product-card";
import { useCartStore } from "./cart-store";

interface TrendingTabsProps {
  tabs: { key: string; label: string }[];
  products: ProductCardData[];
}

const COLOR_HEX: Record<string, string> = {
  "rose pink": "#ec4899",
  "midnight black": "#111827",
  silver: "#9ca3af",
  "sage green": "#84cc16",
  white: "#f9fafb",
  black: "#111827",
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
  gold: "#f59e0b",
  purple: "#a855f7",
};

function colorHex(name: string): string {
  return COLOR_HEX[name.trim().toLowerCase()] ?? "#9ca3af";
}

function orderProducts(
  products: ProductCardData[],
  key: string
): ProductCardData[] {
  const copy = [...products];
  switch (key) {
    case "best-seller":
      return copy.sort((a, b) => b.sold_count - a.sold_count);
    case "sales":
      return copy.sort(
        (a, b) =>
          discountPercent(b.base_price, b.sale_price) -
          discountPercent(a.base_price, a.sale_price)
      );
    case "new":
      return copy.sort(
        (a, b) =>
          (b.badge === "NEW" ? 1 : 0) - (a.badge === "NEW" ? 1 : 0)
      );
    default:
      return copy;
  }
}

/** Large featured product panel with clickable color-swatch variants. */
function FeaturedProductPanel({ product }: { product: ProductCardData }) {
  const variants = product.variants ?? [];
  const [activeVariant, setActiveVariant] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const addWishlist = useCartStore((state) => state.addWishlist);
  const removeWishlist = useCartStore((state) => state.removeWishlist);

  const activeImage =
    variants[activeVariant]?.image_url ?? product.image_url;
  const activeColorName = variants[activeVariant]?.option_value;

  const toggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const next = !wishlisted;
    setWishlisted(next);
    if (next) addWishlist();
    else removeWishlist();
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-white p-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={activeImage}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        {product.badge && <CornerBadge type={product.badge} />}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-pressed={wishlisted}
          aria-label={
            wishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
        >
          <Heart
            size={16}
            className={cn(
              wishlisted ? "fill-brand-sale text-brand-sale" : "text-gray-500"
            )}
          />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col space-y-2.5">
        {product.categoryLabel && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.categoryLabel}
          </p>
        )}
        <h3 className="text-base font-bold leading-snug text-foreground">
          {product.name}
        </h3>
        <RatingStars rating={product.rating_avg} count={product.rating_count} />
        <PriceTag basePrice={product.base_price} salePrice={product.sale_price} />

        <ul className="space-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Truck size={13} className="text-brand-success" /> Free delivery
            over $50
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-brand-success" /> 1-year
            warranty included
          </li>
        </ul>

        {variants.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-foreground">
              Color:{" "}
              <span className="font-normal text-muted-foreground">
                {activeColorName ?? "Select"}
              </span>
            </p>
            <div className="flex items-center gap-2">
              {variants.map((variant, i) => (
                <button
                  key={variant.option_value}
                  type="button"
                  onClick={() => setActiveVariant(i)}
                  aria-label={variant.option_value}
                  aria-pressed={i === activeVariant}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition",
                    i === activeVariant
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-gray-200 hover:border-gray-400"
                  )}
                  style={{ backgroundColor: colorHex(variant.option_value) }}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => addToCart()}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/**
 * Trending tabs (Best Seller / Sales / Featured / New). Each tab reorders
 * the product set: first item renders as the large featured panel, the rest
 * as a grid of compact ProductCards.
 */
export function TrendingTabs({ tabs, products }: TrendingTabsProps) {
  const defaultValue = tabs[0]?.key ?? "featured";

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const ordered = orderProducts(products, tab.key);
        const featured = ordered[0];
        const rest = ordered.slice(1);
        if (!featured) return null;
        return (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <FeaturedProductPanel product={featured} />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-3">
                {rest.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
