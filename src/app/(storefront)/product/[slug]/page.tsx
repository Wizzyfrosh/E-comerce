import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
  getReviewsByProduct,
} from "@/lib/data";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeader } from "@/components/store/section-header";
import { ProductPdpClient } from "@/components/store/product-pdp-client";
import { ProductTabs } from "@/components/store/product-tabs";
import { RecentlyViewed } from "@/components/store/recently-viewed";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found | Digitaz" };
  }
  const description =
    product.meta_description ??
    product.description?.slice(0, 160) ??
    `Buy ${product.name} at Digitaz.`;
  const firstImage = product.images?.[0]?.image_url;
  return {
    title: `${product.name} | Digitaz`,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | Digitaz`,
      description,
      type: "website",
      url: `/product/${product.slug}`,
      images: firstImage
        ? [{ url: firstImage, width: 800, height: 800, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Digitaz`,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getReviewsByProduct(product.id),
    getRelatedProducts(product.id, 4),
  ]);

  const inStock = product.stock_quantity > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: (product.images ?? []).map((i) => i.image_url),
    description: product.meta_description ?? product.description ?? "",
    sku: product.sku,
    mpn: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `/product/${product.slug}`,
      price: product.sale_price.toFixed(2),
      priceCurrency: "USD",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: "2027-12-31",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating_avg.toFixed(1),
      reviewCount: product.rating_count,
    },
    review: reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
      },
      author: { "@type": "Person", name: "Verified Buyer" },
      reviewBody: review.comment ?? "",
      datePublished: review.created_at.slice(0, 10),
    })),
  };

  return (
    <div className="container-store py-6 md:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="transition hover:text-primary">
          Home
        </Link>
        <ChevronRight size={12} />
        {product.category ? (
          <>
            <Link
              href={`/category/${product.category.slug}`}
              className="transition hover:text-primary"
            >
              {product.category.name}
            </Link>
            <ChevronRight size={12} />
          </>
        ) : null}
        <span className="font-medium text-foreground" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* Gallery + buy box (client: variant/price/quantity state) */}
      <ProductPdpClient product={product} />

      {/* Description / Specs / Reviews */}
      <div className="mt-12">
        <ProductTabs product={product} reviews={reviews} />
      </div>

      {/* Recently viewed (localStorage, client) */}
      <RecentlyViewed currentSlug={product.slug} />

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            title="You May Also Like"
            viewAllHref={
              product.category ? `/category/${product.category.slug}` : "/"
            }
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
