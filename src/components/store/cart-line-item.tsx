"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, TriangleAlert } from "lucide-react";
import type { CartLine } from "@/types/commerce";
import { cn, formatPrice } from "@/lib/utils";
import { PriceTag } from "./price-tag";

/** Authoritative server fields attached to a client cart line. */
export interface CartLineServerInfo {
  valid: boolean;
  stock: number;
  lineTotal: number;
}

interface CartLineItemProps {
  line: CartLine;
  /** Server-recomputed fields; absent in the guest drawer (display-only). */
  server?: CartLineServerInfo | null;
  onQtyChange?: (key: string, qty: number) => void;
  onRemove?: (key: string) => void;
  compact?: boolean;
}

/**
 * Shared cart row used by both the slide-in drawer and the full /cart page.
 * Unit price renders through `PriceTag`; totals on the /cart page come from
 * the server (`server.lineTotal`), the drawer falls back to the client
 * snapshot.
 */
export function CartLineItem({
  line,
  server,
  onQtyChange,
  onRemove,
  compact = false,
}: CartLineItemProps) {
  const invalid = server ? !server.valid : false;
  const unitPrice = server
    ? server.lineTotal / Math.max(1, line.qty)
    : line.unitPrice;
  const lineTotal = server ? server.lineTotal : line.unitPrice * line.qty;
  const maxQty = server ? Math.max(1, server.stock) : 99;

  const changeQty = (next: number) => {
    const clamped = Math.max(1, Math.min(maxQty, Math.floor(next) || 1));
    onQtyChange?.(line.key, clamped);
  };

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-border bg-white",
        compact ? "p-2.5" : "p-4"
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:h-20 sm:w-20">
        <Image
          src={line.image_url}
          alt={line.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
              {line.name}
            </p>
            {line.optionLabels && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {line.optionLabels}
              </p>
            )}
            {line.sku && (
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                SKU: {line.sku}
              </p>
            )}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(line.key)}
              aria-label="Remove item"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-red-50 hover:text-brand-sale"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          {!invalid ? (
            <div className="inline-flex items-center rounded-md border border-border bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={line.qty <= 1}
                onClick={() => changeQty(line.qty - 1)}
                className="flex h-8 w-8 items-center justify-center text-foreground transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={13} />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {line.qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={line.qty >= maxQty}
                onClick={() => changeQty(line.qty + 1)}
                className="flex h-8 w-8 items-center justify-center text-foreground transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-1 text-xs font-medium text-brand-sale">
              <TriangleAlert size={13} /> Currently unavailable
            </p>
          )}

          <div className="flex flex-col items-end gap-0.5">
            <PriceTag
              basePrice={unitPrice}
              salePrice={unitPrice}
              className="text-xs"
            />
            {!compact && (
              <p className="text-sm font-bold text-foreground">
                {formatPrice(lineTotal)} total
              </p>
            )}
            {compact && (
              <p className="text-xs font-semibold text-foreground">
                {formatPrice(lineTotal)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
