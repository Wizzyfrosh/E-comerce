"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types";
import type { ProductVariant } from "@/types/database";
import { PriceTag } from "./price-tag";
import { RatingStars } from "./rating-stars";
import { ProductGallery } from "./product-gallery";
import { VariantSelector } from "./variant-selector";
import { QuantitySelector } from "./quantity-selector";
import { useCartStore } from "./cart-store";

interface ProductPdpClientProps {
  product: ProductWithRelations;
}

type StockLevel = "in" | "low" | "out";

function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= 10) return "low";
  return "in";
}

const STOCK_STYLES: Record<StockLevel, { dot: string; text: string; label: string }> = {
  in: { dot: "bg-brand-success", text: "text-brand-success", label: "In Stock" },
  low: { dot: "bg-brand-hot", text: "text-brand-hot", label: "Low Stock" },
  out: { dot: "bg-brand-sale", text: "text-brand-sale", label: "Out of Stock" },
};

/**
 * Client-side interactive half of the PDP: gallery + buy box share state so
 * selecting a color variant can swap the main image, and storage/color
 * adjustments update the displayed price and available stock.
 */
export function ProductPdpClient({ product }: ProductPdpClientProps) {
  const variants = product.variants ?? [];
  const addToCart = useCartStore((state) => state.addToCart);
  const addWishlist = useCartStore((state) => state.addWishlist);
  const removeWishlist = useCartStore((state) => state.removeWishlist);
  const [wishlisted, setWishlisted] = useState(false);

  // Group variants by option_name and pre-select the first in-stock of each.
  const initialSelected = useMemo(() => {
    const selected: Record<string, string | null> = {};
    const seen = new Set<string>();
    for (const variant of variants) {
      if (seen.has(variant.option_name)) continue;
      seen.add(variant.option_name);
      const firstInStock = variants.find(
        (v) => v.option_name === variant.option_name && v.stock_quantity > 0
      );
      selected[variant.option_name] = firstInStock?.id ?? null;
    }
    return selected;
  }, [variants]);

  const [selectedIds, setSelectedIds] =
    useState<Record<string, string | null>>(initialSelected);
  const [quantity, setQuantity] = useState(1);

  const selectedVariants = useMemo(
    () =>
      Object.values(selectedIds)
        .map((id) => variants.find((v) => v.id === id))
        .filter((v): v is ProductVariant => Boolean(v)),
    [selectedIds, variants]
  );

  const totalAdjustment = selectedVariants.reduce(
    (sum, v) => sum + (v.price_adjustment ?? 0),
    0
  );
  const effectiveSale = product.sale_price + totalAdjustment;
  const effectiveBase = product.base_price + totalAdjustment;

  const variantStocks = selectedVariants.map((v) => v.stock_quantity);
  const effectiveStock =
    variantStocks.length > 0
      ? Math.min(...variantStocks, product.stock_quantity)
      : product.stock_quantity;
  const level = stockLevel(effectiveStock);
  const stockStyle = STOCK_STYLES[level];
  const outOfStock = level === "out";

  const selectedColorVariant = selectedVariants.find(
    (v) => v.option_name.toLowerCase().includes("color")
  );
  const mainImageOverride = selectedColorVariant?.image_url ?? null;

  const galleryImages = (product.images ?? []).map((image) => ({
    url: image.image_url,
    alt: image.alt_text ?? product.name,
  }));

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedIds((prev) => ({ ...prev, [variant.option_name]: variant.id }));
    setQuantity(1);
  };

  const toggleWishlist = () => {
    const next = !wishlisted;
    setWishlisted(next);
    if (next) addWishlist();
    else removeWishlist();
  };

  const sku = selectedVariants.find((v) => v.sku)?.sku ?? product.sku;
  const maxQuantity = Math.max(1, effectiveStock);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <ProductGallery images={galleryImages} mainImageOverride={mainImageOverride} />

      <div className="space-y-5">
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="inline-block text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            {product.category.name}
          </Link>
        )}

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
          {product.name}
        </h1>

        <div className="flex items-center gap-3">
          <RatingStars rating={product.rating_avg} count={product.rating_count} />
          <span className="text-xs text-muted-foreground">
            {product.rating_count.toLocaleString()} reviews
          </span>
        </div>

        <PriceTag basePrice={effectiveBase} salePrice={effectiveSale} />

        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("h-2.5 w-2.5 rounded-full", stockStyle.dot)} />
          <span className={stockStyle.text}>
            {stockStyle.label}
            {level === "low" && ` — only ${effectiveStock} left`}
          </span>
        </div>

        {variants.length > 0 && (
          <VariantSelector
            variants={variants}
            selectedIds={selectedIds}
            onSelect={handleVariantSelect}
          />
        )}

        <div className="flex flex-wrap items-center gap-4 border-y border-border py-4">
          <QuantitySelector
            value={quantity}
            max={maxQuantity}
            onChange={setQuantity}
            disabled={outOfStock}
          />
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addToCart()}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 min-w-[180px]"
          >
            <ShoppingCart size={16} />
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={toggleWishlist}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border transition",
              wishlisted
                ? "border-brand-sale bg-brand-sale/10 text-brand-sale"
                : "border-border bg-white text-foreground hover:border-gray-400"
            )}
          >
            <Heart
              size={18}
              className={cn(wishlisted && "fill-brand-sale text-brand-sale")}
            />
          </button>
        </div>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Truck size={15} className="shrink-0 text-brand-success" />
            Free delivery on orders over $50 · 2–5 business days
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck size={15} className="shrink-0 text-brand-success" />
            1-year manufacturer warranty · 30-day free returns
          </li>
        </ul>

        <p className="text-xs text-muted-foreground">
          SKU: <span className="font-mono text-foreground">{sku}</span>
          {product.brand && (
            <>
              {" · "}Brand: <span className="font-medium text-foreground">{product.brand.name}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
