"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { ShoppingBag, Truck, X } from "lucide-react";

import { useCartStore } from "./cart-store";
import { CartLineItem } from "./cart-line-item";
import { cn, formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 50;

/**
 * Slide-in cart drawer (right side). Shows the local client snapshot;
 * authoritative prices/totals live on the /cart page via recomputeCart.
 */
export function CartDrawer() {
  const open = useCartStore((state) => state.drawerOpen);
  const setOpen = useCartStore((state) => state.setDrawerOpen);
  const lines = useCartStore((state) => state.lines);
  const setQty = useCartStore((state) => state.setQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const itemCount = lines.reduce((total, line) => total + line.qty, 0);
  const subtotal = lines.reduce(
    (total, line) => total + line.unitPrice * line.qty,
    0
  );
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl focus:outline-none"
        >
          <Dialog.Title className="sr-only">Shopping cart</Dialog.Title>

          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <ShoppingBag size={18} />
              Your Cart ({itemCount})
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close cart"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-gray-100 hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-panel text-muted-foreground">
                <ShoppingBag size={28} />
              </div>
              <p className="text-base font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground">
                Browse our products and add items you love.
              </p>
              <Link
                href="/"
                onClick={close}
                className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {lines.map((line) => (
                  <CartLineItem
                    key={line.key}
                    line={line}
                    compact
                    onQtyChange={setQty}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              <div className="border-t border-border px-4 py-4">
                <div className="mb-3 rounded-md bg-brand-panel p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Truck size={14} className="text-brand-success" />
                    {remaining > 0 ? (
                      <span>
                        Add {formatPrice(remaining)} more for{" "}
                        <span className="font-semibold">free shipping</span>
                      </span>
                    ) : (
                      <span className="text-brand-success">
                        You&apos;ve unlocked free shipping!
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        remaining > 0 ? "bg-primary" : "bg-brand-success"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/cart"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-md border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
