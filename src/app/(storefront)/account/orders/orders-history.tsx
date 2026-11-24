"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/store/empty-state";
import { readLocalOrders } from "@/lib/data/local-store";
import { formatPrice } from "@/lib/utils";
import type { OrderRecord } from "@/types/commerce";
import type { OrderStatus } from "@/types/database";
import { Package, Truck } from "lucide-react";

/** Order status → badge label + color map (Phase 3 buying flow). */
const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
  paid: { label: "Paid", className: "border-blue-200 bg-blue-50 text-blue-700" },
  processing: { label: "Processing", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  shipped: { label: "Shipped", className: "border-emerald-200 bg-emerald-50 text-brand-success" },
  delivered: { label: "Delivered", className: "border-green-200 bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", className: "border-border bg-muted text-muted-foreground" },
  refunded: { label: "Refunded", className: "border-gray-200 bg-gray-100 text-gray-500" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function lineCount(order: OrderRecord): number {
  return order.lines.reduce((sum, line) => sum + line.qty, 0);
}

export function OrdersHistory({ initialOrders }: { initialOrders: OrderRecord[] }) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);

  // Merge localStorage fallback orders once on mount (client-only data).
  useEffect(() => {
    queueMicrotask(() => {
      const local = readLocalOrders();
      setOrders((prev) => {
        const known = new Set(prev.map((o) => o.orderNumber));
        const merged = [
          ...prev,
          ...local.filter((o) => !known.has(o.orderNumber)),
        ];
        return merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      });
    });
  }, []);

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        subtitle="When you place your first order it will appear here with tracking and status updates."
        suggestions={[
          { label: "Browse products", href: "/" },
          { label: "Back to account", href: "/account" },
        ]}
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const meta = STATUS_META[order.status] ?? STATUS_META.pending;
        const shownLines = order.lines.slice(0, 3);
        const hiddenCount = order.lines.length - shownLines.length;

        return (
          <article
            key={order.orderNumber}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  Order {order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.createdAt)} · {lineCount(order)} items
                </p>
              </div>
              <Badge className={meta.className}>{meta.label}</Badge>
            </header>

            <ul className="mt-4 divide-y divide-border">
              {shownLines.map((line) => (
                <li key={`${line.productId}-${line.sku}`} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-panel text-muted-foreground">
                    {line.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.image_url}
                        alt={line.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {line.name}
                      {line.variantLabel && (
                        <span className="text-muted-foreground"> · {line.variantLabel}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {line.qty} × {formatPrice(line.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatPrice(line.total)}
                  </p>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                + {hiddenCount} more product{hiddenCount === 1 ? "" : "s"}
              </p>
            )}

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              {order.trackingNumber ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  Tracking:{" "}
                  <span className="font-medium text-foreground">
                    {order.trackingNumber}
                  </span>
                </p>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {order.email}
                </span>
              )}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-base font-bold text-foreground">
                  {formatPrice(order.total)}
                </p>
              </div>
            </footer>
          </article>
        );
      })}

      <div className="pt-2 text-center">
        <Link
          href="/account"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to account
        </Link>
      </div>
    </div>
  );
}
