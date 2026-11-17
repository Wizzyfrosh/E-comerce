import type { ProductCardData, HeroSlide, PromoBanner, CategoryNavItem } from "@/types";

/**
 * Phase 1 static preview data.
 * Used by the placeholder homepage to render the design system.
 * Phase 2 will replace these imports with live Supabase queries.
 * Full seed data (40+ products) lives in scripts/seed.ts / supabase/seed.sql.
 */

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

export const previewCategories: CategoryNavItem[] = [
  { id: "c1", name: "Laptops", slug: "laptops", image_url: img("cat-laptop") },
  { id: "c2", name: "Smartphones", slug: "smartphones", image_url: img("cat-phone") },
  { id: "c3", name: "TVs & Home Theater", slug: "tvs", image_url: img("cat-tv") },
  { id: "c4", name: "Smartwatches", slug: "smartwatches", image_url: img("cat-watch") },
  { id: "c5", name: "Gaming", slug: "gaming", image_url: img("cat-gaming") },
  { id: "c6", name: "Headphones & Audio", slug: "headphones", image_url: img("cat-audio") },
  { id: "c7", name: "Cameras", slug: "cameras", image_url: img("cat-camera") },
  { id: "c8", name: "Accessories", slug: "accessories", image_url: img("cat-accessory") },
];

export const previewHeroSlides: HeroSlide[] = [
  {
    id: "h1",
    eyebrow: "Exclusive Wireless Controllers",
    title: "Bring Gaming Worlds To Life",
    subtitle: "DualSense Edge & Xbox Elite Series 2 in stock",
    priceLabel: "Starting at $149.99",
    ctaText: "Shop Now",
    ctaLink: "/category/gaming",
    image_url: img("hero-controllers"),
    badge: "NEW",
  },
  {
    id: "h2",
    eyebrow: "Flagship Smartphone Week",
    title: "Capture Every Moment In 8K",
    subtitle: "Galaxy S25 Ultra + iPhone 16 Pro Max",
    priceLabel: "From $999 — Trade-in bonus $200",
    ctaText: "Shop Smartphones",
    ctaLink: "/category/smartphones",
    image_url: img("hero-phones"),
    badge: "HOT",
  },
  {
    id: "h3",
    eyebrow: "Home Cinema Upgrade",
    title: "OLED TVs From $799",
    subtitle: "65\" 4K 120Hz with Dolby Vision",
    priceLabel: "Up to 35% OFF",
    ctaText: "Shop TVs",
    ctaLink: "/category/tvs",
    image_url: img("hero-tv"),
    badge: "SALE",
  },
];

export const previewPromoBanners: PromoBanner[] = [
  {
    id: "p1",
    title: "Sweep Up 15% OFF",
    subtitle: "On all smartphones this week",
    ctaText: "Shop Phones",
    ctaLink: "/category/smartphones",
    image_url: img("promo-phone"),
    badge: "15% OFF",
    variant: "blue",
  },
  {
    id: "p2",
    title: "RAO Display E8 3.0",
    subtitle: "Pro wireless earbuds — $129",
    ctaText: "Buy Now",
    ctaLink: "/category/headphones",
    image_url: img("promo-earbuds"),
    badge: "NEW",
    variant: "dark",
  },
  {
    id: "p3",
    title: "Beauty on Your Wrist",
    subtitle: "Smartwatches from $199",
    ctaText: "Explore",
    ctaLink: "/category/smartwatches",
    image_url: img("promo-watch"),
    badge: "HOT",
    variant: "light",
  },
];

export const previewFooterBanner: PromoBanner = {
  id: "footer",
  title: "Up to 30% Off Instant Discount",
  subtitle: "Across laptops, tablets and wearables",
  ctaText: "Claim Discount",
  ctaLink: "/deals",
  image_url: img("footer-devices"),
  variant: "dark",
};

export const previewFeaturedProducts: ProductCardData[] = [
  {
    id: "fp1", name: "AuraBuds Pro Wireless Earbuds", slug: "aurabuds-pro",
    categoryLabel: "Headphones", base_price: 199.99, sale_price: 129.99,
    rating_avg: 4.7, rating_count: 1284, sold_count: 3200, stock_quantity: 45,
    image_url: img("fp-earbuds"), badge: "SALE",
  },
  {
    id: "fp2", name: "NovaView 4K Action Camera", slug: "novaview-4k-cam",
    categoryLabel: "Cameras", base_price: 349.99, sale_price: 279.99,
    rating_avg: 4.5, rating_count: 642, sold_count: 1800, stock_quantity: 22,
    image_url: img("fp-camera"), badge: "HOT",
  },
  {
    id: "fp3", name: "PulseTab S11 11-inch Tablet", slug: "pulsetab-s11",
    categoryLabel: "Accessories", base_price: 599.0, sale_price: 449.0,
    rating_avg: 4.6, rating_count: 911, sold_count: 2400, stock_quantity: 60,
    image_url: img("fp-tablet"), badge: "SALE",
  },
  {
    id: "fp4", name: "ChronoFit Smartwatch Series 9", slug: "chronofit-s9",
    categoryLabel: "Smartwatches", base_price: 329.0, sale_price: 249.0,
    rating_avg: 4.4, rating_count: 2103, sold_count: 5600, stock_quantity: 120,
    image_url: img("fp-watch"), badge: "HOT",
  },
  {
    id: "fp5", name: "CineMax 55\" QLED Smart TV", slug: "cinemax-55-qled",
    categoryLabel: "TVs", base_price: 799.99, sale_price: 599.99,
    rating_avg: 4.8, rating_count: 487, sold_count: 900, stock_quantity: 15,
    image_url: img("fp-tv"), badge: "SALE",
  },
  {
    id: "fp6", name: "Zephyr Gaming Laptop RTX 4070", slug: "zephyr-rtx4070",
    categoryLabel: "Laptops", base_price: 1499.0, sale_price: 1249.0,
    rating_avg: 4.9, rating_count: 356, sold_count: 720, stock_quantity: 8,
    image_url: img("fp-laptop"), badge: "NEW",
  },
];

export const previewTrendingProducts: ProductCardData[] = [
  {
    id: "tp1", name: "SonicMax Over-Ear Headphones", slug: "sonicmax-overear",
    categoryLabel: "Headphones", base_price: 399.0, sale_price: 299.0,
    rating_avg: 4.8, rating_count: 2210, sold_count: 8900, stock_quantity: 80,
    image_url: img("tp-headphones"), badge: "HOT",
    variants: [
      { option_value: "Rose Pink", image_url: img("tp-hp-pink") },
      { option_value: "Midnight Black", image_url: img("tp-hp-black") },
      { option_value: "Silver", image_url: img("tp-hp-silver") },
      { option_value: "Sage Green", image_url: img("tp-hp-green") },
    ],
  },
  {
    id: "tp2", name: "GalaxyNote 24 Ultra 512GB", slug: "galaxynote-24u",
    categoryLabel: "Smartphones", base_price: 1199.0, sale_price: 999.0,
    rating_avg: 4.7, rating_count: 3402, sold_count: 12400, stock_quantity: 200,
    image_url: img("tp-phone1"), badge: "SALE",
  },
  {
    id: "tp3", name: "RetroGame Handheld Console", slug: "retrogame-handheld",
    categoryLabel: "Gaming", base_price: 199.0, sale_price: 149.0,
    rating_avg: 4.3, rating_count: 567, sold_count: 2100, stock_quantity: 35,
    image_url: img("tp-handheld"), badge: "NEW",
  },
  {
    id: "tp4", name: "FitBand Pro Activity Tracker", slug: "fitband-pro",
    categoryLabel: "Smartwatches", base_price: 149.0, sale_price: 99.0,
    rating_avg: 4.2, rating_count: 1876, sold_count: 6700, stock_quantity: 150,
    image_url: img("tp-band"), badge: "SALE",
  },
  {
    id: "tp5", name: "AirCharge Wireless Pad 15W", slug: "aircharge-15w",
    categoryLabel: "Accessories", base_price: 59.99, sale_price: 39.99,
    rating_avg: 4.5, rating_count: 934, sold_count: 4100, stock_quantity: 300,
    image_url: img("tp-charger"), badge: "HOT",
  },
  {
    id: "tp6", name: "StudioMic XLR Condenser", slug: "studiomic-xlr",
    categoryLabel: "Accessories", base_price: 179.0, sale_price: 129.0,
    rating_avg: 4.6, rating_count: 412, sold_count: 1300, stock_quantity: 28,
    image_url: img("tp-mic"), badge: "NEW",
  },
  {
    id: "tp7", name: "UltraBook Air 13\" M3 Chip", slug: "ultrabook-air-m3",
    categoryLabel: "Laptops", base_price: 1099.0, sale_price: 949.0,
    rating_avg: 4.8, rating_count: 1543, sold_count: 3800, stock_quantity: 55,
    image_url: img("tp-laptop"), badge: "SALE",
  },
  {
    id: "tp8", name: "PixelView Pro Smartphone 256GB", slug: "pixelview-pro",
    categoryLabel: "Smartphones", base_price: 899.0, sale_price: 749.0,
    rating_avg: 4.6, rating_count: 1120, sold_count: 4500, stock_quantity: 90,
    image_url: img("tp-phone2"), badge: "HOT",
  },
];
