"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Tag, Truck, X } from "lucide-react";

import { useCartStore } from "@/components/store/cart-store";
import { CartLineItem } from "@/components/store/cart-line-item";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recomputeCart, applyCoupon } from "@/lib/actions/cart";
import type { RecomputeCartResult } from "@/lib/checkout/cart-types";
import { SHIPPING_RATES, TAX_RATE } from "@/lib/checkout/rates";
import { formatPrice } from "@/lib/utils";

/**
 * Full cart page. Local store lines are the editing surface; every change
 * (qty, removal, coupon) triggers `recomputeCart` so prices, stock and
 * totals shown here are server-authoritative.
 */
export default function CartPage() {
  const lines = useCartStore((state) => state.lines);
  const setQty = useCartStore((state) => state.setQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const [result, setResult] = useState<RecomputeCartResult | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [country, setCountry] = useState("");

  const [isRecomputing, startRecompute] = useTransition();
  const [isApplyingCoupon, startApplyCoupon] = useTransition();

  const localSubtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0),
    [lines]
  );

  // Recompute authoritative server totals whenever lines or coupon change.
  useEffect(() => {
    let cancelled = false;
    startRecompute(() => {
      void recomputeCart(lines, appliedCode).then((res) => {
        if (cancelled) return;
        queueMicrotask(() => setResult(res));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [lines, appliedCode, startRecompute]);

  const totals = result?.totals ?? null;
  const droppedCount = result ? Math.max(0, lines.length - result.lines.length) : 0;

  const handleApplyCoupon = () => {
    const subtotal = totals?.subtotal ?? localSubtotal;
    startApplyCoupon(() => {
      void applyCoupon(couponInput.trim(), subtotal).then((res) => {
        queueMicrotask(() => {
          if (res.valid) {
            setAppliedCode(res.code);
            setCouponMessage({
              ok: true,
              text: `Code ${res.code} applied — you save ${formatPrice(res.discount)}.`,
            });
          } else {
            setAppliedCode(null);
            setCouponMessage({
              ok: false,
              text: res.reason ?? "This coupon could not be applied.",
            });
          }
        });
      });
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setCouponMessage(null);
    setCouponInput("");
  };

  if (lines.length === 0) {
    return (
      <div className="container-store py-12">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Shopping Cart</h1>
        <EmptyState
          title="Your cart is empty"
          subtitle="Looks like you haven't added anything yet. Explore our latest deals and best sellers."
          suggestions={[{ label: "Browse products", href: "/" }]}
        />
      </div>
    );
  }

  return (
    <div className="container-store py-12">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Shopping Cart</h1>

      {droppedCount > 0 && (
        <p className="mb-4 rounded-md bg-brand-panel px-4 py-2.5 text-sm text-muted-foreground">
          {droppedCount} item{droppedCount === 1 ? "" : "s"} removed because{" "}
          {droppedCount === 1 ? "it is" : "they are"} unavailable or out of stock.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lines */}
        <div className="space-y-3 lg:col-span-2">
          {result && result.lines.length === 0 ? (
            <EmptyState
              title="No available items"
              subtitle="Your cart items are currently unavailable. Please browse other products."
              suggestions={[{ label: "Browse products", href: "/" }]}
            />
          ) : result && result.lines.length > 0 ? (
            result.lines.map((line) => (
              <CartLineItem
                key={line.key}
                line={line}
                server={{
                  valid: line.valid,
                  stock: line.stock,
                  lineTotal: line.lineTotal,
                }}
                onQtyChange={setQty}
                onRemove={removeItem}
              />
            ))
          ) : (
            lines.map((line) => (
              <CartLineItem
                key={line.key}
                line={line}
                onQtyChange={setQty}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {/* Summary sidebar */}
        <aside className="space-y-4">
          {/* Coupon */}
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Tag size={15} /> Coupon code
            </h2>
            {appliedCode ? (
              <div className="flex items-center justify-between rounded-md bg-brand-success/10 px-3 py-2">
                <span className="text-sm font-medium text-brand-success">
                  {appliedCode} applied
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  aria-label="Remove coupon"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-brand-success transition hover:bg-brand-success/15"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Enter code"
                  aria-label="Coupon code"
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponInput.trim()}
                >
                  {isApplyingCoupon ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            )}
            {couponMessage && (
              <p
                className={
                  couponMessage.ok
                    ? "mt-2 text-xs font-medium text-brand-success"
                    : "mt-2 text-xs font-medium text-brand-sale"
                }
              >
                {couponMessage.text}
              </p>
            )}
            {totals?.couponReason && !appliedCode && (
              <p className="mt-2 text-xs text-brand-sale">{totals.couponReason}</p>
            )}
          </div>

          {/* Shipping estimate */}
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Truck size={15} /> Shipping estimate
            </h2>
            <Input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="Country (optional)"
              aria-label="Country"
            />
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li>Free delivery on orders over $50</li>
              <li>Standard shipping {formatPrice(SHIPPING_RATES.standard)} · 2–5 business days</li>
            </ul>
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">
                  {formatPrice(totals?.subtotal ?? localSubtotal)}
                </dd>
              </div>
              {totals && totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="font-medium text-brand-success">
                    −{formatPrice(totals.discount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium">
                  {totals == null
                    ? "Calculated at checkout"
                    : totals.shipping === 0
                      ? "Free"
                      : formatPrice(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Tax ({Math.round(TAX_RATE * 100)}%)
                </dt>
                <dd className="font-medium">
                  {formatPrice(totals?.tax ?? 0)}
                </dd>
              </div>
              <div className="my-2 border-t border-border" />
              <div className="flex items-baseline justify-between">
                <dt className="font-semibold text-foreground">Total</dt>
                <dd className="text-lg font-bold text-foreground">
                  {formatPrice(totals?.total ?? localSubtotal)}
                </dd>
              </div>
            </dl>

            <Button asChild className="mt-4 w-full" size="lg">
              <Link href="/checkout">
                {isRecomputing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                Proceed to Checkout
              </Link>
            </Button>
            <Link
              href="/"
              className="mt-3 block text-center text-xs font-medium text-primary hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
