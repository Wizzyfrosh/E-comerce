import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getCategories, searchProducts } from "@/lib/data";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/store/empty-state";

export const metadata: Metadata = {
  title: "Search | Digitaz",
  description: "Search products, brands and categories on Digitaz.",
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const rawQ = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (rawQ ?? "").trim();

  const categories = await getCategories();
  const popularCategories = categories.slice(0, 6).map((c) => ({
    label: c.name,
    href: `/category/${c.slug}`,
  }));

  // No query → empty state with popular categories.
  if (!q) {
    return (
      <div className="container-store py-10">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-foreground">Search</span>
        </nav>
        <EmptyState
          title="Search Digitaz"
          subtitle="Type a keyword in the search bar above to find products, brands and more."
          suggestions={popularCategories}
        />
      </div>
    );
  }

  const products = await searchProducts(q, { limit: 24 });

  return (
    <div className="container-store py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-foreground">Search</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Results for &ldquo;{q}&rdquo;
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"} found
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No results for "${q}"`}
          subtitle="Check your spelling, try a more general keyword, or browse a popular category below."
          suggestions={popularCategories}
        />
      )}
    </div>
  );
}
