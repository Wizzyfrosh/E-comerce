"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { seedProductsFull, toProductCardData } from "@/lib/data/seed-data";

const STORAGE_KEY = "recently_viewed";
const MAX_ITEMS = 8;

const CARD_MAP = new Map(seedProductsFull.map((p) => [p.slug, toProductCardData(p)]));

interface RecentlyViewedProps {
  currentSlug: string;
}

/**
 * Recently viewed products, persisted in localStorage. On mount the current
 * slug is prepended (deduplicated, max 8). Renders a horizontal scroll of
 * mini product cards; the current product itself is hidden from the list.
 */
export function RecentlyViewed({ currentSlug }: RecentlyViewedProps) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const stored: string[] = raw ? JSON.parse(raw) : [];
      const next = [
        currentSlug,
        ...stored.filter((slug) => slug !== currentSlug),
      ].slice(0, MAX_ITEMS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      queueMicrotask(() => setSlugs(next));
    } catch {
      queueMicrotask(() => setSlugs([currentSlug]));
    }
  }, [currentSlug]);

  const visible = slugs
    .filter((slug) => slug !== currentSlug)
    .map((slug) => CARD_MAP.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (visible.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
        Recently Viewed
      </h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {visible.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group w-36 shrink-0 rounded-lg border border-border bg-white p-2 transition hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="144px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="mt-2 line-clamp-1 text-xs font-medium text-foreground">
              {product.name}
            </p>
            <p className="mt-0.5 text-sm font-bold text-brand-sale">
              {formatPrice(product.sale_price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
