import { Suspense } from "react";
import {
  getFeaturedProducts,
  getFooterBanner,
  getHeroSlides,
  getCategories,
  getPromoBanners,
  getTrendingProducts,
} from "@/lib/data";
import { CategoryIconRow } from "@/components/store/category-icon-row";
import { FooterDiscountBanner } from "@/components/store/footer-discount-banner";
import { HeroSlider } from "@/components/store/hero-slider";
import { ProductCard } from "@/components/store/product-card";
import { PromoBannerCard } from "@/components/store/promo-banner-card";
import { SectionHeader } from "@/components/store/section-header";
import { TrendingTabs } from "@/components/store/trending-tabs";

const TRENDING_TABS = [
  { key: "best-seller", label: "Best Seller" },
  { key: "sales", label: "Sales" },
  { key: "featured", label: "Featured" },
  { key: "new", label: "New" },
] as const;

/** Async trending fetch — suspended independently so the rest of the page paints first. */
async function TrendingProducts() {
  const products = await getTrendingProducts("best-seller", 8);
  return <TrendingTabs tabs={[...TRENDING_TABS]} products={products} />;
}

function TrendingSkeleton() {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-4" aria-hidden="true">
      <div className="h-80 animate-pulse rounded-xl border border-border bg-gray-100 lg:col-span-1" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-lg border border-border bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Phase 2 data-driven homepage. All sections are fed by the data-access
 * layer (Supabase-first, static seed fallback). Layout matches Phase 1.
 */
export default async function StorefrontHomePage() {
  const [heroSlides, categories, promoBanners, featuredProducts, footerBanner] =
    await Promise.all([
      getHeroSlides(),
      getCategories(),
      getPromoBanners(),
      getFeaturedProducts(6),
      getFooterBanner(),
    ]);

  return (
    <>
      {/* Hero slider */}
      <section className="container-store pt-6">
        <HeroSlider slides={heroSlides} />
      </section>

      {/* Category icon row */}
      <section className="container-store py-6" aria-label="Shop by category">
        <CategoryIconRow categories={categories} />
      </section>

      {/* Promo banner row — 3 up */}
      <section className="container-store" aria-label="Promotions">
        <div className="grid gap-4 md:grid-cols-3">
          {promoBanners.map((banner) => (
            <PromoBannerCard key={banner.id} banner={banner} />
          ))}
        </div>
      </section>

      {/* Today's Featured Deals — 6 compact cards */}
      <section
        className="container-store mt-10"
        aria-label="Today's featured deals"
      >
        <SectionHeader title="Today's Featured Deals" viewAllHref="/deals" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Second promo banner row */}
      <section className="container-store mt-10" aria-label="More promotions">
        <div className="grid gap-4 md:grid-cols-3">
          {promoBanners.map((banner) => (
            <PromoBannerCard key={`row2-${banner.id}`} banner={banner} />
          ))}
        </div>
      </section>

      {/* Trending This Week — tabs + featured + card grid (suspended) */}
      <section className="container-store mt-10" aria-label="Trending this week">
        <SectionHeader title="Trending This Week" viewAllHref="/trending" />
        <Suspense fallback={<TrendingSkeleton />}>
          <TrendingProducts />
        </Suspense>
      </section>

      {/* Footer discount banner (renders its own container) */}
      <FooterDiscountBanner banner={footerBanner ?? undefined} />
    </>
  );
}
