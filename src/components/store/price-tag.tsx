import { cn, discountPercent, formatPrice } from "@/lib/utils";

interface PriceTagProps {
  basePrice: number;
  salePrice: number;
  className?: string;
}

/**
 * Sale price in brand red, struck-through base price in muted gray,
 * and a red "-XX%" badge when a discount exists.
 */
export function PriceTag({ basePrice, salePrice, className }: PriceTagProps) {
  const discount = discountPercent(basePrice, salePrice);
  const hasDiscount = discount > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="text-base font-bold text-brand-sale">
        {formatPrice(salePrice)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(basePrice)}
          </span>
          <span className="rounded bg-brand-sale px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
