"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildSearchString,
  filtersToUrlParams,
  hasActiveFilters,
  type ParsedFilters,
} from "@/lib/store-url";

/** Shape returned by getProductFilters(categorySlug). */
export interface ProductFiltersData {
  brands: { slug: string; name: string; count: number }[];
  priceRange: { min: number; max: number };
  attributes: { key: string; values: string[] }[];
}

const RATING_OPTIONS = [
  { value: 4, label: "4 stars & up" },
  { value: 3, label: "3 stars & up" },
  { value: 2, label: "2 stars & up" },
  { value: 1, label: "1 star & up" },
];

/** Stable key (excludes `page`) used to detect external URL changes. */
function filtersKey(f: ParsedFilters): string {
  return JSON.stringify({
    b: f.brandSlugs,
    min: f.minPrice,
    max: f.maxPrice,
    r: f.minRating,
    s: f.inStockOnly,
    sort: f.sort,
    a: f.attributeFilters,
  });
}

interface FilterPanelProps {
  initialFilters: ParsedFilters;
  filtersData: ProductFiltersData;
  basePath: string;
  onNavigate?: () => void;
}

/**
 * The actual filter controls. Kept in local state; every change rebuilds the
 * query string and router.push()es (shallow, no full reload). Syncs back to
 * `initialFilters` when the URL changes externally (active chips / sort / page).
 */
function FilterPanel({
  initialFilters,
  filtersData,
  basePath,
  onNavigate,
}: FilterPanelProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ParsedFilters>(initialFilters);
  const [minDraft, setMinDraft] = useState(
    initialFilters.minPrice != null ? String(initialFilters.minPrice) : ""
  );
  const [maxDraft, setMaxDraft] = useState(
    initialFilters.maxPrice != null ? String(initialFilters.maxPrice) : ""
  );
  const lastPushedKey = useRef(filtersKey(initialFilters));
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  });

  // Sync when URL changed by something other than this panel (chips, sort, page).
  useEffect(() => {
    const key = filtersKey(initialFilters);
    if (key !== lastPushedKey.current) {
      lastPushedKey.current = key;
      setFilters(initialFilters);
      setMinDraft(initialFilters.minPrice != null ? String(initialFilters.minPrice) : "");
      setMaxDraft(initialFilters.maxPrice != null ? String(initialFilters.maxPrice) : "");
    }
  }, [initialFilters]);

  const pushFilters = (next: ParsedFilters) => {
    const withPageOne: ParsedFilters = { ...next, page: 1 };
    lastPushedKey.current = filtersKey(withPageOne);
    setFilters(withPageOne);
    onNavigate?.();
    router.push(basePath + buildSearchString(filtersToUrlParams(withPageOne, { page: undefined })));
  };

  const toggleBrand = (slug: string) => {
    const has = filters.brandSlugs.includes(slug);
    const brandSlugs = has
      ? filters.brandSlugs.filter((b) => b !== slug)
      : [...filters.brandSlugs, slug];
    pushFilters({ ...filters, brandSlugs });
  };

  const setRating = (value: number | undefined) => {
    pushFilters({ ...filters, minRating: value });
  };

  const toggleInStock = () => {
    pushFilters({ ...filters, inStockOnly: !filters.inStockOnly });
  };

  const toggleAttribute = (key: string, value: string) => {
    const current = filters.attributeFilters[key] ?? [];
    const has = current.includes(value);
    const nextValues = has
      ? current.filter((v) => v !== value)
      : [...current, value];
    const attributeFilters = { ...filters.attributeFilters };
    if (nextValues.length) attributeFilters[key] = nextValues;
    else delete attributeFilters[key];
    pushFilters({ ...filters, attributeFilters });
  };

  const clearAll = () => {
    const cleared: ParsedFilters = {
      brandSlugs: [],
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStockOnly: false,
      sort: filters.sort,
      page: 1,
      attributeFilters: {},
    };
    setMinDraft("");
    setMaxDraft("");
    pushFilters(cleared);
  };

  // Debounced price apply (400ms after typing stops).
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = filtersRef.current;
      const min = minDraft.trim() === "" ? undefined : Number(minDraft);
      const max = maxDraft.trim() === "" ? undefined : Number(maxDraft);
      const nextMin = Number.isFinite(min as number) ? min : undefined;
      const nextMax = Number.isFinite(max as number) ? max : undefined;
      if (nextMin === current.minPrice && nextMax === current.maxPrice) return;
      pushFilters({ ...current, minPrice: nextMin, maxPrice: nextMax });
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDraft, maxDraft]);

  const sectionTitle = "text-xs font-semibold uppercase tracking-wider text-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Filters</h2>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price range */}
      <section>
        <h3 className={sectionTitle}>Price</h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              $
            </span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={minDraft}
              onChange={(e) => setMinDraft(e.target.value)}
              placeholder={String(filtersData.priceRange.min ?? 0)}
              aria-label="Minimum price"
              className="h-9 w-full rounded-md border border-border bg-white pl-6 pr-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs text-muted-foreground">to</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              $
            </span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
              placeholder={String(filtersData.priceRange.max ?? 1000)}
              aria-label="Maximum price"
              className="h-9 w-full rounded-md border border-border bg-white pl-6 pr-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      {/* Brands */}
      {filtersData.brands.length > 0 && (
        <section>
          <h3 className={sectionTitle}>Brand</h3>
          <ul className="mt-2 space-y-1.5">
            {filtersData.brands.map((brand) => {
              const checked = filters.brandSlugs.includes(brand.slug);
              return (
                <li key={brand.slug}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm text-foreground transition hover:bg-brand-panel">
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                        checked
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white"
                      )}
                    >
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleBrand(brand.slug)}
                    />
                    <span className="flex-1">{brand.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {brand.count}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Rating */}
      <section>
        <h3 className={sectionTitle}>Customer Rating</h3>
        <ul className="mt-2 space-y-1.5">
          <li>
            <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm text-foreground transition hover:bg-brand-panel">
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border transition",
                  filters.minRating == null
                    ? "border-primary bg-primary ring-2 ring-primary/30"
                    : "border-border bg-white"
                )}
              />
              <input
                type="radio"
                name="rating-filter"
                className="sr-only"
                checked={filters.minRating == null}
                onChange={() => setRating(undefined)}
              />
              <span>Any rating</span>
            </label>
          </li>
          {RATING_OPTIONS.map((opt) => {
            const checked = filters.minRating === opt.value;
            return (
              <li key={opt.value}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm text-foreground transition hover:bg-brand-panel">
                  <span
                    className={cn(
                      "h-4 w-4 shrink-0 rounded-full border transition",
                        checked
                          ? "border-primary bg-primary ring-2 ring-primary/30"
                          : "border-border bg-white"
                    )}
                  />
                  <input
                    type="radio"
                    name="rating-filter"
                    className="sr-only"
                    checked={checked}
                    onChange={() => setRating(opt.value)}
                  />
                  <span>
                    <span className="text-brand-hot">
                      {"★".repeat(opt.value)}
                    </span>
                    <span className="text-muted-foreground">
                      {"★".repeat(5 - opt.value)}
                    </span>{" "}
                    & up
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* In stock toggle */}
      <section>
        <h3 className={sectionTitle}>Availability</h3>
        <label className="mt-2 flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm text-foreground">
          <button
            type="button"
            role="switch"
            aria-checked={filters.inStockOnly}
            onClick={toggleInStock}
            className={cn(
              "relative h-5 w-9 shrink-0 rounded-full transition",
              filters.inStockOnly ? "bg-primary" : "bg-border"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                filters.inStockOnly ? "left-[18px]" : "left-0.5"
              )}
            />
          </button>
          In stock only
        </label>
      </section>

      {/* Category-specific attributes */}
      {filtersData.attributes.map((attr) => (
        <section key={attr.key}>
          <h3 className={sectionTitle}>{attr.key}</h3>
          <ul className="mt-2 space-y-1.5">
            {attr.values.map((value) => {
              const checked = (filters.attributeFilters[attr.key] ?? []).includes(value);
              return (
                <li key={value}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm text-foreground transition hover:bg-brand-panel">
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                        checked
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white"
                      )}
                    >
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleAttribute(attr.key, value)}
                    />
                    <span className="flex-1">{value}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

interface FilterSidebarProps extends FilterPanelProps {
  className?: string;
}

/** Desktop sticky sidebar wrapper. Hide on mobile (drawer handles that). */
export function FilterSidebar({ className, ...panelProps }: FilterSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:block lg:sticky lg:top-32 lg:self-start",
        className
      )}
    >
      <div className="rounded-lg border border-border bg-white p-4">
        <FilterPanel {...panelProps} />
      </div>
    </aside>
  );
}

type MobileFilterDrawerProps = FilterPanelProps;

/** Mobile "Filters" button that opens the panel in a slide-over drawer. */
export function MobileFilterDrawer(props: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground transition hover:border-primary"
      >
        <SlidersHorizontal size={15} />
        Filters
        {hasActiveFilters(props.initialFilters) && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {props.initialFilters.brandSlugs.length +
              (props.initialFilters.minPrice != null || props.initialFilters.maxPrice != null ? 1 : 0) +
              (props.initialFilters.minRating != null ? 1 : 0) +
              (props.initialFilters.inStockOnly ? 1 : 0) +
              Object.values(props.initialFilters.attributeFilters).reduce(
                (n, v) => n + v.length,
                0
              )}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-brand-panel"
              >
                <X size={18} />
              </button>
            </div>
            <FilterPanel {...props} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
