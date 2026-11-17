"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/database";
import { COLOR_HEX } from "@/lib/data/seed-data";

interface VariantSelectorProps {
  variants: ProductVariant[];
  /** option_name → selected variant id (controlled by parent). */
  selectedIds: Record<string, string | null>;
  onSelect: (variant: ProductVariant) => void;
}

function colorHex(name: string): string {
  return COLOR_HEX[name.trim().toLowerCase()] ?? "#9ca3af";
}

/**
 * Grouped variant picker. "Color" renders circular swatches (image thumbnail
 * when the variant has one, otherwise a solid color chip). Every other option
 * (Storage, Size, Bundle…) renders pill buttons. Zero-stock variants are
 * disabled and marked "Out of stock".
 */
export function VariantSelector({
  variants,
  selectedIds,
  onSelect,
}: VariantSelectorProps) {
  // Preserve first-seen order of option groups.
  const groupNames: string[] = [];
  const groups = new Map<string, ProductVariant[]>();
  for (const variant of variants) {
    if (!groups.has(variant.option_name)) {
      groups.set(variant.option_name, []);
      groupNames.push(variant.option_name);
    }
    groups.get(variant.option_name)!.push(variant);
  }

  if (groupNames.length === 0) return null;

  return (
    <div className="space-y-4">
      {groupNames.map((groupName) => {
        const groupVariants = groups.get(groupName)!;
        const isColor = groupName.toLowerCase().includes("color");
        const selectedId = selectedIds[groupName] ?? null;
        const selectedVariant = groupVariants.find((v) => v.id === selectedId);

        return (
          <div key={groupName}>
            <p className="mb-2 text-sm font-medium text-foreground">
              {groupName}:{" "}
              <span className="font-normal text-muted-foreground">
                {selectedVariant?.option_value ?? "Select"}
              </span>
            </p>

            {isColor ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {groupVariants.map((variant) => {
                  const active = variant.id === selectedId;
                  const disabled = variant.stock_quantity <= 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(variant)}
                      aria-label={`${variant.option_value}${disabled ? " (Out of stock)" : ""}`}
                      aria-pressed={active}
                      title={
                        disabled
                          ? `${variant.option_value} — Out of stock`
                          : variant.option_value
                      }
                      className={cn(
                        "relative h-8 w-8 rounded-full border-2 transition",
                        active
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-gray-200 hover:border-gray-400",
                        disabled && "cursor-not-allowed opacity-40"
                      )}
                      style={
                        variant.image_url
                          ? undefined
                          : { backgroundColor: colorHex(variant.option_value) }
                      }
                    >
                      {variant.image_url && (
                        <Image
                          src={variant.image_url}
                          alt={variant.option_value}
                          fill
                          sizes="32px"
                          className="rounded-full object-cover"
                        />
                      )}
                      {disabled && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-[2px] w-6 rotate-45 bg-red-500" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {groupVariants.map((variant) => {
                  const active = variant.id === selectedId;
                  const disabled = variant.stock_quantity <= 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(variant)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-md border px-3.5 py-1.5 text-sm font-medium transition",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-white text-foreground hover:border-primary/50",
                        disabled && "cursor-not-allowed opacity-40 line-through"
                      )}
                    >
                      {variant.option_value}
                      {variant.price_adjustment > 0 && (
                        <span
                          className={cn(
                            "ml-1 text-xs",
                            active ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          +${variant.price_adjustment}
                        </span>
                      )}
                      {disabled && (
                        <span className="ml-1.5 text-[10px] font-normal text-red-500">
                          Out of stock
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
