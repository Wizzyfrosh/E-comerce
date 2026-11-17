import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, X } from "lucide-react";
import {
  getCategories,
  getCategoryBySlug,
  getProductFilters,
  getProducts,
} from "@/lib/data";
import { ProductCard } from "@/components/store/product-card";
import {
  FilterSidebar,
  MobileFilterDrawer,
  type ProductFiltersData,
} from "@/components/store/filter-sidebar";
import { SortDropdown } from "@/components/store/sort-dropdown";
import { Pagination } from "@/components/store/pagination";
import { EmptyState } from "@/components/store/empty-state";
import {
  buildSearchString,
  filtersToUrlParams,
  hasActiveFilters,
  parseCategorySearchParams,
  type ParsedFilters,
} from "@/lib/store-url";
import type { CategoryNavItem } from "@/types";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/** Flatten category tree (including children) into slugs for static generation. */
function collectSlugs(items: CategoryNavItem[], acc: Set<string>) {
  for (const item of items) {
    acc.add(item.slug);
    if (item.children?.length) collectSlugs(item.children, acc);
  }
}

export async function generateStaticParams() {
  const categories = await getCategories();
  const slugs = new Set<string>();
  collectSlugs(categories, slugs);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: "Category not found | Digitaz" };
  }
  const canonicalPath = `/category/${slug}`;
  return {
    title: `${category.name} | Digitaz`,
    description:
      category.description ??
      `Shop ${category.name} at Digitaz — great prices, fast delivery.`,
    alternates: {
      canonical: SITE_ORIGIN ? `${SITE_ORIGIN}${canonicalPath}` : canonicalPath,
    },
  };
}

interface ActiveChip {
  label: string;
  href: string;
}

function buildActiveChips(
  f: ParsedFilters,
  filtersData: ProductFiltersData,
  basePath: string
): ActiveChip[] {
  const chips: ActiveChip[] = [];

  for (const slug of f.brandSlugs) {
    const brand = filtersData.brands.find((b) => b.slug === slug);
    chips.push({
      label: brand?.name ?? slug,
      href:
        basePath +
        buildSearchString(
          filtersToUrlParams(f, {
            brand: f.brandSlugs.filter((b) => b !== slug),
            page: undefined,
          })
        ),
    });
  }

  if (f.minPrice != null || f.maxPrice != null) {
    const label = `$${f.minPrice ?? 0} – $${f.maxPrice ?? "any"}`;
    chips.push({
      label,
      href:
        basePath +
        buildSearchString(
          filtersToUrlParams(f, { minPrice: undefined, maxPrice: undefined, page: undefined })
        ),
    });
  }

  if (f.minRating != null) {
    chips.push({
      label: `${f.minRating}★ & up`,
      href:
        basePath +
        buildSearchString(filtersToUrlParams(f, { rating: undefined, page: undefined })),
    });
  }

  if (f.inStockOnly) {
    chips.push({
      label: "In stock",
      href:
        basePath +
        buildSearchString(filtersToUrlParams(f, { inStock: false, page: undefined })),
    });
  }

  for (const [key, values] of Object.entries(f.attributeFilters)) {
    for (const value of values) {
      const nextValues = values.filter((v) => v !== value);
      const attributes = { ...f.attributeFilters };
      if (nextValues.length) attributes[key] = nextValues;
      else delete attributes[key];
      chips.push({
        label: `${key}: ${value}`,
        href:
          basePath +
          buildSearchString(
            filtersToUrlParams(f, { attributes, page: undefined })
          ),
      });
    }
  }

  return chips;
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const filters = parseCategorySearchParams(sp);
  const basePath = `/category/${slug}`;

  const [category, filtersData, result, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getProductFilters(slug),
    getProducts({
      categorySlug: slug,
      brandSlugs: filters.brandSlugs.length ? filters.brandSlugs : undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      inStockOnly: filters.inStockOnly || undefined,
      sort: filters.sort,
      page: filters.page,
      pageSize: 12,
      attributeFilters: Object.keys(filters.attributeFilters).length
        ? filters.attributeFilters
        : undefined,
    }),
    getCategories(),
  ]);

  if (!category) notFound();

  const currentSearch = buildSearchString(filtersToUrlParams(filters));
  const chips = buildActiveChips(filters, filtersData, basePath);
  const suggestions = categories.slice(0, 6).map((c) => ({
    label: c.name,
    href: `/category/${c.slug}`,
  }));

  return (
    <div className="container-store py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-primary">
          Home
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      {/* Title + count */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <FilterSidebar
          initialFilters={filters}
          filtersData={filtersData}
          basePath={basePath}
        />

        <div className="min-w-0">
          {/* Toolbar: mobile filters + sort */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <MobileFilterDrawer
              initialFilters={filters}
              filtersData={filtersData}
              basePath={basePath}
            />
            <SortDropdown
              basePath={basePath}
              currentSearch={currentSearch}
              currentSort={filters.sort}
            />
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {hasActiveFilters(filters) && (
                <Link
                  href={basePath}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white transition hover:bg-primary/90"
                >
                  Clear all
                  <X size={12} />
                </Link>
              )}
              {chips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  {chip.label}
                  <X size={12} />
                </Link>
              ))}
            </div>
          )}

          {/* Product grid */}
          {result.products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {result.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
                basePath={basePath}
                currentSearch={currentSearch}
              />
            </>
          ) : (
            <EmptyState
              title="No products found"
              subtitle="Try adjusting your filters or browse another category."
              suggestions={suggestions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
