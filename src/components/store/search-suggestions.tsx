"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { CategoryNavItem, ProductCardData } from "@/types";

interface SearchSuggestionsProps {
  initialValue?: string;
  categories?: CategoryNavItem[];
  className?: string;
}

/**
 * Header search bar with debounced (300ms) product suggestions.
 * Preserves the Phase 1 layout: category select (left) + input + search button.
 * - Enter / search button / "View all" -> /search?q=...
 * - Product click -> /product/<slug>
 */
export function SearchSuggestions({
  initialValue = "",
  categories,
  className,
}: SearchSuggestionsProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductCardData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Debounced fetch (300ms).
  useEffect(() => {
    const q = value.trim();
    if (!q) {
      queueMicrotask(() => {
        setResults([]);
        setLoading(false);
      });
      return;
    }
    queueMicrotask(() => setLoading(true));
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(q)}`
        );
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as { products: ProductCardData[] };
        if (!cancelled) {
          setResults(data.products ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  const goToSearch = () => {
    const q = value.trim();
    setOpen(false);
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const showDropdown = open && value.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative flex-1", className)}>
      <div className="flex items-center overflow-hidden rounded-full bg-gray-100 focus-within:ring-2 focus-within:ring-primary/30">
        <select
          aria-label="Search in category"
          defaultValue="all"
          className="h-10 cursor-pointer border-r border-border bg-transparent pl-4 pr-2 text-sm text-foreground outline-none"
        >
          <option value="all">All Categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="relative flex flex-1 items-center">
          <input
            type="search"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToSearch();
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Search products, brands and more…"
            aria-label="Search products"
            className="h-10 w-full rounded-none border-0 bg-transparent pl-3 pr-9 text-sm text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setResults([]);
              }}
              aria-label="Clear search"
              className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-gray-200 hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={goToSearch}
          aria-label="Search"
          className="mx-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
        >
          <Search size={15} />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-xl">
          {loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
          )}

          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No matching products. Press Enter to see all results.
            </p>
          )}

          <ul>
            {results.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/product/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-brand-panel"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {p.name}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(p.sale_price)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={`/search?q=${encodeURIComponent(value.trim())}`}
            onClick={() => setOpen(false)}
            className="block border-t border-border bg-brand-panel px-4 py-2.5 text-center text-sm font-medium text-primary transition hover:bg-accent"
          >
            View all results for &ldquo;{value.trim()}&rdquo;
          </Link>
        </div>
      )}
    </div>
  );
}
