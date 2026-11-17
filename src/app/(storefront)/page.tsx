import {
  previewFeaturedProducts,
  previewFooterBanner,
  previewHeroSlides,
  previewPromoBanners,
  previewTrendingProducts,
} from "@/data/preview";
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
];

/**
 * Phase 1 preview homepage. Composes the design system with static preview
 * data. Phase 2 will replace these imports with live Supabase queries.
 */
export default function StorefrontHomePage() {
  return (
    <>
      {/* Hero slider */}
      <section className="container-store pt-6">
        <HeroSlider slides={previewHeroSlides} />
      </section>

      {/* Category icon row */}
      <section className="container-store py-6" aria-label="Shop by category">
        <CategoryIconRow />
      </section>

      {/* Promo banner row — 3 up */}
      <section className="container-store" aria-label="Promotions">
        <div className="grid gap-4 md:grid-cols-3">
          {previewPromoBanners.map((banner) => (
            <PromoBannerCard key={banner.id} banner={banner} />
          ))}
        </div>
      </section>

      {/* Today's Featured Deals — 6 compact cards */}
      <section className="container-store mt-10" aria-label="Today's featured deals">
        <SectionHeader title="Today's Featured Deals" viewAllHref="/deals" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {previewFeaturedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Second promo banner row */}
      <section className="container-store mt-10" aria-label="More promotions">
        <div className="grid gap-4 md:grid-cols-3">
          {previewPromoBanners.map((banner) => (
            <PromoBannerCard key={`row2-${banner.id}`} banner={banner} />
          ))}
        </div>
      </section>

      {/* Trending This Week — tabs + featured + card grid */}
      <section className="container-store mt-10" aria-label="Trending this week">
        <SectionHeader title="Trending This Week" viewAllHref="/trending" />
        <TrendingTabs tabs={TRENDING_TABS} products={previewTrendingProducts} />
      </section>

      {/* Footer discount banner (renders its own container) */}
      <FooterDiscountBanner banner={previewFooterBanner} />
    </>
  );
}
