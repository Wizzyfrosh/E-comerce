"use client";

/**
 * Order confirmation / success page.
 *
 * Data merge rule: the server action `getOrderByNumber` wins when present;
 * otherwise the local guest-order cache (`digitaz-orders-v1`) is consulted so
 * demo (offline) orders still render a receipt. When a matching order is found
 * the client cart is cleared.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, Home, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { getOrderByNumber } from "@/lib/actions/orders";
import type { OrderRecord } from "@/types/commerce";
import type { OrderStatus, PaymentStatus } from "@/types/database";
import { clearCartClient, readLocalOrders } from "./checkout-client-utils";

const STATUS_BADGE: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "success" | "outline" | "destructive" }> = {
  pending: { label: "Pending", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  processing: { label: "Processing", variant: "default" },
  shipped: { label: "Shipped", variant: "success" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  refunded: { label: "Refunded", variant: "outline" },
};

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  unpaid: "Awaiting payment",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Payment failed",
};

export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!orderNumber) {
        setLoading(false);
        return;
      }
      const serverOrder = await getOrderByNumber(orderNumber).catch(() => null);
      if (cancelled) return;
      if (serverOrder) {
        setOrder(serverOrder);
        clearCartClient();
        setLoading(false);
        return;
      }
      const local = readLocalOrders().find((o) => o.orderNumber === orderNumber) ?? null;
      setOrder(local);
      if (local) clearCartClient();
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container-store py-16 text-center text-sm text-muted-foreground">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-store py-16">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn’t find order{" "}
            <span className="font-mono">{orderNumber || "(no number provided)"}</span>. It may
            still be processing, or the link was copied incorrectly.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4" /> Continue shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account/orders">View my orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
  const itemCount = order.lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <div className="container-store py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-10 w-10 shrink-0 text-brand-success" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order confirmed</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Thank you{order.fullName ? `, ${order.fullName}` : ""}. A confirmation email was
                sent to <span className="font-medium text-foreground">{order.email}</span>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <Badge variant="outline">{PAYMENT_BADGE[order.paymentStatus]}</Badge>
                <span className="font-mono text-sm text-muted-foreground">{order.orderNumber}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Truck className="h-4 w-4 text-primary" /> Delivery estimate
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">2–5 business days</p>
              <p className="mt-3 text-sm text-foreground">
                {order.shippingAddress.full_name}
                {order.shippingAddress.line1 ? ` · ${order.shippingAddress.line1}` : ""}
                {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}{" "}
                {order.shippingAddress.postal_code}
                {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ""}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold">Order details</h2>
              <dl className="mt-1 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Items</dt>
                  <dd>{itemCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Order date</dt>
                  <dd>{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Method</dt>
                  <dd>{order.shippingMethod}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Items */}
          <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
            {order.lines.map((line) => (
              <li key={`${line.productId}-${line.variantLabel ?? "base"}`} className="flex gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={line.image_url || "/placeholder.svg"}
                  alt={line.name}
                  className={cn("h-16 w-16 rounded-md border border-border object-cover", !line.image_url && "bg-muted")}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{line.name}</p>
                  {line.variantLabel && (
                    <p className="text-xs text-muted-foreground">{line.variantLabel}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    SKU: {line.sku} · Qty {line.qty}
                  </p>
                </div>
                <div className="text-sm font-medium">{formatPrice(line.total)}</div>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <dl className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-sale">
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4" /> Continue shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account/orders">
                <Eye className="h-4 w-4" /> View orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
