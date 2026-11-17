/**
 * Static seed data — the universal fallback for every data-access function.
 *
 * CORE RULE: every function in src/lib/data tries Supabase first and falls
 * back to the exports below on ANY error / missing env / empty result.
 * This guarantees `next build` passes and the storefront renders with no DB.
 *
 * Compat helpers (toProductCardData / toCategoryNavItem / COLOR_HEX /
 * seedBrands / seedCategories as Category[]) are preserved so parallel
 * workers' existing imports keep resolving.
 */
import type {
  Brand,
  Category,
  Product,
  ProductImage,
  ProductSpec,
  ProductVariant,
  Review,
} from "@/types/database";
import type {
  CategoryNavItem,
  HeroSlide,
  ProductCardData,
  ProductWithRelations,
  PromoBanner,
} from "@/types";

const img = (seed: string, w = 600, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const NOW = "2026-11-17T00:00:00Z";

type Badge = "HOT" | "SALE" | "NEW";
type CatKey =
  | "laptops"
  | "smartphones"
  | "tvs"
  | "smartwatches"
  | "gaming"
  | "headphones"
  | "cameras"
  | "accessories";
type BrandKey =
  | "digitaz"
  | "novatech"
  | "sonicmax"
  | "chrono"
  | "zephyr"
  | "aura"
  | "cinemax"
  | "pixelview";

const CATEGORIES: Record<CatKey, { id: string; name: string; slug: string; sort_order: number }> = {
  laptops: { id: "cat-laptops", name: "Laptops", slug: "laptops", sort_order: 1 },
  smartphones: { id: "cat-smartphones", name: "Smartphones", slug: "smartphones", sort_order: 2 },
  tvs: { id: "cat-tvs", name: "TVs & Home Theater", slug: "tvs", sort_order: 3 },
  smartwatches: { id: "cat-smartwatches", name: "Smartwatches", slug: "smartwatches", sort_order: 4 },
  gaming: { id: "cat-gaming", name: "Gaming", slug: "gaming", sort_order: 5 },
  headphones: { id: "cat-headphones", name: "Headphones & Audio", slug: "headphones", sort_order: 6 },
  cameras: { id: "cat-cameras", name: "Cameras", slug: "cameras", sort_order: 7 },
  accessories: { id: "cat-accessories", name: "Accessories", slug: "accessories", sort_order: 8 },
};

const BRANDS: Record<BrandKey, { id: string; name: string; slug: string }> = {
  digitaz: { id: "brand-digitaz", name: "Digitaz", slug: "digitaz" },
  novatech: { id: "brand-novatech", name: "NovaTech", slug: "novatech" },
  sonicmax: { id: "brand-sonicmax", name: "SonicMax", slug: "sonicmax" },
  chrono: { id: "brand-chrono", name: "Chrono", slug: "chrono" },
  zephyr: { id: "brand-zephyr", name: "Zephyr", slug: "zephyr" },
  aura: { id: "brand-aura", name: "Aura", slug: "aura" },
  cinemax: { id: "brand-cinemax", name: "CineMax", slug: "cinemax" },
  pixelview: { id: "brand-pixelview", name: "PixelView", slug: "pixelview" },
};

/** Color names must exist in COLOR_HEX so swatch UI renders a real color. */
const COLOR_PALETTE = ["Midnight Black", "Silver", "Ocean Blue", "Rose Gold", "Sage Green", "Product Red"];

interface RawSeed {
  slug: string;
  name: string;
  cat: CatKey;
  brand: BrandKey;
  base: number;
  sale: number;
  rating: number;
  rcount: number;
  sold: number;
  stock: number;
  badge?: Badge;
  featured?: boolean;
  specs: [string, string][];
}

const RAW_PRODUCTS: RawSeed[] = [
  // ── Laptops (5) ───────────────────────────────────────────────────
  { slug: "zephyr-blade14-rtx4070", name: "Zephyr Blade 14 Gaming Laptop RTX 4070", cat: "laptops", brand: "zephyr", base: 1499, sale: 1249, rating: 4.9, rcount: 356, sold: 720, stock: 20, badge: "HOT", featured: true, specs: [["Processor", "AMD Ryzen 9 7940HS"], ["Graphics", "NVIDIA RTX 4070 8GB"], ["Display", '14" QHD 165Hz'], ["RAM", "32GB DDR5"], ["Battery", "73Wh, ~10h"]] },
  { slug: "novatech-ultrabook-air13", name: "NovaTech UltraBook Air 13", cat: "laptops", brand: "novatech", base: 1099, sale: 949, rating: 4.8, rcount: 1543, sold: 3800, stock: 70, badge: "SALE", featured: true, specs: [["Processor", "Intel Core Ultra 7"], ["Display", '13.5" 2.8K OLED'], ["RAM", "16GB LPDDR5X"], ["Storage", "1TB NVMe"], ["Weight", "1.1 kg"]] },
  { slug: "digitaz-probook-14-oled", name: "Digitaz ProBook 14 OLED", cat: "laptops", brand: "digitaz", base: 1299, sale: 1149, rating: 4.6, rcount: 892, sold: 2100, stock: 32, badge: "HOT", specs: [["Display", '14" 2.8K OLED 90Hz'], ["Processor", "Intel Core Ultra 7"], ["RAM", "32GB DDR5"], ["Storage", "1TB SSD"], ["Battery", "Up to 18 hrs"]] },
  { slug: "digitaz-studiobook-16-pro", name: "Digitaz StudioBook 16 Pro", cat: "laptops", brand: "digitaz", base: 1799, sale: 1599, rating: 4.7, rcount: 421, sold: 980, stock: 12, featured: true, specs: [["Display", '16" 4K Mini-LED'], ["Processor", "Intel Core i9-14900H"], ["Graphics", "RTX 4070 8GB"], ["RAM", "32GB DDR5"], ["Storage", "2TB SSD"]] },
  { slug: "digitaz-chromago-14", name: "Digitaz ChromaGo 14", cat: "laptops", brand: "digitaz", base: 649, sale: 549, rating: 4.2, rcount: 1204, sold: 4300, stock: 140, badge: "NEW", specs: [["Display", '14" FHD IPS'], ["Processor", "Intel Core i3-N305"], ["RAM", "8GB LPDDR5"], ["Storage", "256GB SSD"], ["OS", "ChromeOS"]] },

  // ── Smartphones (5) ───────────────────────────────────────────────
  { slug: "auraphone-pro-max", name: "AuraPhone Pro Max 5G", cat: "smartphones", brand: "aura", base: 1199, sale: 999, rating: 4.7, rcount: 3402, sold: 12400, stock: 120, badge: "HOT", featured: true, specs: [["Display", '6.9" LTPO OLED 120Hz'], ["Chipset", "Aura Bionic A18 Pro"], ["Rear Camera", "200MP quad"], ["Battery", "4800mAh, 45W"], ["Water Resistance", "IP68"]] },
  { slug: "pixelview-6-pro", name: "PixelView 6 Pro Smartphone", cat: "smartphones", brand: "pixelview", base: 899, sale: 749, rating: 4.6, rcount: 1120, sold: 4500, stock: 90, badge: "SALE", specs: [["Display", '6.7" OLED 120Hz'], ["Chipset", "Tensor G4"], ["Rear Camera", "50MP triple"], ["Battery", "5050mAh"], ["OS", "7yr updates"]] },
  { slug: "novatech-nova-10", name: "NovaTech Nova 10", cat: "smartphones", brand: "novatech", base: 799, sale: 699, rating: 4.5, rcount: 2180, sold: 8600, stock: 320, specs: [["Display", '6.5" AMOLED 120Hz'], ["Chipset", "Nova X1 3nm"], ["Rear Camera", "108MP + 12MP"], ["Battery", "4800 mAh"], ["Storage", "256GB"]] },
  { slug: "novatech-lite-5g", name: "NovaTech Lite 5G", cat: "smartphones", brand: "novatech", base: 399, sale: 329, rating: 4.1, rcount: 1876, sold: 6700, stock: 410, badge: "SALE", specs: [["Display", '6.4" LCD 90Hz'], ["Chipset", "Snapdragon 4 Gen 2"], ["Rear Camera", "50MP + 2MP"], ["Battery", "5000 mAh"], ["5G", "Dual SIM"]] },
  { slug: "auraphone-fold-x", name: "AuraPhone Fold X", cat: "smartphones", brand: "aura", base: 1799, sale: 1599, rating: 4.4, rcount: 534, sold: 1450, stock: 18, badge: "NEW", featured: true, specs: [["Display", '7.8" Foldable LTPO'], ["Chipset", "Aura Bionic A18 Pro"], ["Rear Camera", "50MP triple"], ["Battery", "4400 mAh"], ["Storage", "1TB"]] },

  // ── TVs (5) ───────────────────────────────────────────────────────
  { slug: "cinemax-65-oled", name: 'CineMax 65" OLED 4K Smart TV', cat: "tvs", brand: "cinemax", base: 1599, sale: 1299, rating: 4.8, rcount: 487, sold: 900, stock: 15, badge: "SALE", featured: true, specs: [["Panel", "OLED evo 4K"], ["Refresh Rate", "120Hz, VRR"], ["HDR", "Dolby Vision IQ"], ["Audio", "70W 3.1 channel"], ["HDMI", "4× HDMI 2.1"]] },
  { slug: "cinemax-55-qled-4k", name: 'CineMax 55" QLED 4K TV', cat: "tvs", brand: "cinemax", base: 799, sale: 599, rating: 4.7, rcount: 512, sold: 1100, stock: 22, badge: "HOT", specs: [["Screen Size", '55"'], ["Resolution", "4K UHD"], ["Panel", "QLED Quantum Dot"], ["HDR", "HDR10+"], ["Smart OS", "CineOS 9"]] },
  { slug: "cinemax-43-4k-smart", name: 'CineMax 43" 4K Smart TV', cat: "tvs", brand: "cinemax", base: 399, sale: 329, rating: 4.4, rcount: 756, sold: 2100, stock: 60, specs: [["Screen Size", '43"'], ["Resolution", "4K UHD"], ["Panel", "VA LED"], ["HDR", "HDR10"], ["Smart OS", "CineOS 9"]] },
  { slug: "cinemax-75-miniled", name: 'CineMax 75" Mini-LED TV', cat: "tvs", brand: "cinemax", base: 2199, sale: 1899, rating: 4.7, rcount: 198, sold: 420, stock: 7, badge: "NEW", specs: [["Screen Size", '75"'], ["Resolution", "4K UHD"], ["Panel", "Mini-LED QLED"], ["Dimming Zones", "1152"], ["Refresh Rate", "144Hz"]] },
  { slug: "cinemax-32-hd", name: 'CineMax 32" HD Ready TV', cat: "tvs", brand: "cinemax", base: 199, sale: 159, rating: 4.0, rcount: 1034, sold: 5200, stock: 220, badge: "SALE", specs: [["Screen Size", '32"'], ["Resolution", "HD Ready 720p"], ["Panel", "LED"], ["Tuner", "DVB-T2/S2"], ["HDMI", "2× HDMI"]] },

  // ── Smartwatches (5) ──────────────────────────────────────────────
  { slug: "chronofit-series-9", name: "ChronoFit Series 9 Smartwatch", cat: "smartwatches", brand: "chrono", base: 399, sale: 299, rating: 4.6, rcount: 2103, sold: 5600, stock: 200, badge: "HOT", featured: true, specs: [["Display", "Always-on LTPO Retina"], ["Battery", "36h, 72h low-power"], ["Water Resistance", "100m"], ["Sensors", "ECG, SpO2, Temp"], ["Connectivity", "GPS + Cellular"]] },
  { slug: "chrono-active-lite", name: "Chrono Active Lite", cat: "smartwatches", brand: "chrono", base: 149, sale: 99, rating: 4.2, rcount: 1876, sold: 6700, stock: 150, badge: "SALE", specs: [["Display", "1.6\" AMOLED"], ["Battery", "Up to 10 days"], ["Water Resistance", "5 ATM"], ["Sensors", "HR + SpO2"], ["GPS", "Built-in"]] },
  { slug: "chrono-ultra-titanium", name: "Chrono Ultra Titanium", cat: "smartwatches", brand: "chrono", base: 799, sale: 699, rating: 4.8, rcount: 342, sold: 890, stock: 22, badge: "NEW", specs: [["Case", "Grade-5 Titanium"], ["Display", "2.0\" LTPO 3000 nits"], ["Battery", "Up to 72 hrs"], ["Water Resistance", "100m"], ["Sensors", "Depth + ECG + SpO2"]] },
  { slug: "chrono-classic-42", name: "Chrono Classic 42mm", cat: "smartwatches", brand: "chrono", base: 249, sale: 199, rating: 4.3, rcount: 611, sold: 1900, stock: 75, specs: [["Display", "1.7\" Retina LTPO"], ["Battery", "Up to 24 hrs"], ["Water Resistance", "50m"], ["Case", "Stainless steel"], ["Band", "Sport strap"]] },
  { slug: "chrono-kids-band", name: "Chrono Kids Band", cat: "smartwatches", brand: "chrono", base: 79, sale: 59, rating: 4.1, rcount: 489, sold: 2300, stock: 180, specs: [["Display", "1.2\" IPS"], ["Battery", "Up to 7 days"], ["GPS", "Live location"], ["SOS", "One-button SOS"], ["Water Resistance", "IP68"]] },

  // ── Gaming (5) ────────────────────────────────────────────────────
  { slug: "zephyr-core-x", name: "Zephyr Core X Gaming Console", cat: "gaming", brand: "zephyr", base: 599, sale: 499, rating: 4.7, rcount: 892, sold: 3100, stock: 35, badge: "NEW", featured: true, specs: [["GPU", "Custom RDNA 3, 12 TFLOPS"], ["CPU", "8-core Zen 4"], ["Storage", "2TB NVMe SSD"], ["Resolution", "4K up to 120fps"], ["Controller", "Haptic feedback"]] },
  { slug: "zephyr-pro-controller", name: "Zephyr Pro Wireless Controller", cat: "gaming", brand: "zephyr", base: 89, sale: 69, rating: 4.6, rcount: 2890, sold: 9800, stock: 340, badge: "HOT", specs: [["Platform", "PC / PS5 / Switch"], ["Connectivity", "2.4GHz + BT + USB-C"], ["Battery", "Up to 40 hrs"], ["Haptics", "HD rumble + adaptive triggers"], ["Weight", "260 g"]] },
  { slug: "zephyr-gaming-headset-71", name: "Zephyr Gaming Headset 7.1", cat: "gaming", brand: "zephyr", base: 149, sale: 119, rating: 4.5, rcount: 1567, sold: 4300, stock: 95, badge: "SALE", specs: [["Drivers", "50mm neodymium"], ["Surround", "7.1 spatial audio"], ["Connectivity", "Wireless 2.4GHz"], ["Battery", "Up to 30 hrs"], ["Mic", "Detachable noise-cancelling"]] },
  { slug: "zephyr-mech-keyboard-rgb", name: "Zephyr Mechanical Keyboard RGB", cat: "gaming", brand: "zephyr", base: 129, sale: 99, rating: 4.4, rcount: 1123, sold: 3600, stock: 130, specs: [["Switches", "Hot-swap linear red"], ["Layout", "75% TKL"], ["Connectivity", "Tri-mode BT/2.4G/USB"], ["RGB", "Per-key south-facing"], ["Battery", "4000 mAh"]] },
  { slug: "zephyr-4k-monitor-27", name: 'Zephyr 27" 4K Gaming Monitor', cat: "gaming", brand: "zephyr", base: 549, sale: 449, rating: 4.7, rcount: 678, sold: 1800, stock: 40, badge: "HOT", specs: [["Panel", '27" IPS 4K'], ["Refresh Rate", "160Hz OC"], ["Response", "1ms GtG"], ["HDR", "DisplayHDR 600"], ["Ports", "2× HDMI 2.1 + DP 1.4"]] },

  // ── Headphones & Audio (5) ────────────────────────────────────────
  { slug: "sonicmax-overear-pro", name: "SonicMax Over-Ear Pro Headphones", cat: "headphones", brand: "sonicmax", base: 399, sale: 299, rating: 4.8, rcount: 2210, sold: 8900, stock: 80, badge: "HOT", featured: true, specs: [["Drivers", "40mm beryllium-coated"], ["ANC", "Adaptive hybrid"], ["Battery", "40h (ANC on)"], ["Codec", "LDAC, aptX Lossless"], ["Weight", "254g"]] },
  { slug: "aurabuds-pro", name: "AuraBuds Pro Wireless Earbuds", cat: "headphones", brand: "aura", base: 199, sale: 129, rating: 4.7, rcount: 1284, sold: 3200, stock: 45, badge: "SALE", featured: true, specs: [["Drivers", "11mm dynamic"], ["ANC", "Adaptive with transparency"], ["Battery", "8h earbuds, 30h case"], ["Codec", "AAC, LC3"], ["Water Resistance", "IPX5"]] },
  { slug: "sonicmax-buds-pro", name: "SonicMax Buds Pro", cat: "headphones", brand: "sonicmax", base: 199, sale: 149, rating: 4.5, rcount: 1890, sold: 7200, stock: 210, badge: "SALE", specs: [["Drivers", "11mm dynamic"], ["ANC", "Hybrid -42dB"], ["Battery", "8 hrs + 30 hrs case"], ["Codec", "LDAC / AAC"], ["Water", "IPX5"]] },
  { slug: "sonicmax-sport-earhooks", name: "SonicMax Sport Earhooks", cat: "headphones", brand: "sonicmax", base: 89, sale: 69, rating: 4.2, rcount: 745, sold: 2800, stock: 160, badge: "NEW", specs: [["Fit", "Over-ear hook"], ["ANC", "ENC mics"], ["Battery", "12 hrs + 24 hrs case"], ["Water", "IPX7"], ["Codec", "AAC / SBC"]] },
  { slug: "sonicmax-soundbar-21", name: "SonicMax Soundbar 2.1", cat: "headphones", brand: "sonicmax", base: 299, sale: 249, rating: 4.4, rcount: 412, sold: 1300, stock: 55, specs: [["Channels", "2.1 with wireless sub"], ["Power", "240W RMS"], ["Audio", "Dolby Digital + DTS"], ["Connectivity", "HDMI eARC / BT 5.3"], ["Wall Mount", "Included"]] },

  // ── Cameras (5) ───────────────────────────────────────────────────
  { slug: "pixelview-mirrorless-4k", name: "PixelView Mirrorless 4K Camera", cat: "cameras", brand: "pixelview", base: 2199, sale: 1899, rating: 4.9, rcount: 203, sold: 410, stock: 12, badge: "NEW", featured: true, specs: [["Sensor", "33MP full-frame BSI"], ["Video", "8K30, 4K120 10-bit"], ["Stabilization", "5-axis IBIS, 8 stops"], ["AF", "AI subject tracking"], ["Viewfinder", "5.76M-dot OLED EVF"]] },
  { slug: "novaview-4k-action-cam", name: "NovaView 4K Action Camera", cat: "cameras", brand: "novatech", base: 349, sale: 279, rating: 4.5, rcount: 642, sold: 1800, stock: 22, badge: "SALE", specs: [["Video", "5.3K60, 4K120"], ["Photo", "27MP"], ["Stabilization", "HyperSmooth 6.0"], ["Waterproof", "10m without housing"], ["Battery", "1720mAh"]] },
  { slug: "pixelview-compact-vlog", name: "PixelView Compact Vlog Camera", cat: "cameras", brand: "pixelview", base: 549, sale: 449, rating: 4.4, rcount: 378, sold: 1100, stock: 30, badge: "NEW", specs: [["Sensor", '1" Type 20MP'], ["Video", "4K30 face tracking"], ["Screen", "Vari-angle touch LCD"], ["Mic", "3-capsule directional"], ["Streaming", "USB-C UVC"]] },
  { slug: "pixelview-360-camera", name: "PixelView 360° Camera", cat: "cameras", brand: "pixelview", base: 429, sale: 359, rating: 4.3, rcount: 198, sold: 540, stock: 18, specs: [["Video", "5.7K30 360°"], ["Sensors", "Dual 1/2\""], ["Stabilization", "FlowState"], ["Editing", "AI reframe in app"], ["Water", "10m bare"]] },
  { slug: "pixelview-telephoto-lens", name: "PixelView 55-210mm Telephoto Lens", cat: "cameras", brand: "pixelview", base: 299, sale: 249, rating: 4.6, rcount: 156, sold: 430, stock: 25, specs: [["Focal", "55-210mm f/4.5-6.3"], ["Mount", "PixelView X"], ["Stabilization", "OSS in-lens"], ["Weight", "345 g"], ["Filter", "49mm"]] },

  // ── Accessories (5) ───────────────────────────────────────────────
  { slug: "digitaz-hub-7in1", name: "Digitaz 7-in-1 USB-C Hub", cat: "accessories", brand: "digitaz", base: 79, sale: 49, rating: 4.5, rcount: 934, sold: 4100, stock: 300, badge: "HOT", featured: true, specs: [["Ports", "HDMI 4K60, 3xUSB-A, SD, GbE, PD"], ["Power Delivery", "100W pass-through"], ["Material", "Anodized aluminum"], ["HDMI", "4K@60Hz HDR"], ["Ethernet", "Gigabit"]] },
  { slug: "aura-charge-wireless-pad-15w", name: "AuraCharge Wireless Pad 15W", cat: "accessories", brand: "aura", base: 59, sale: 39, rating: 4.5, rcount: 934, sold: 4100, stock: 300, badge: "HOT", specs: [["Output", "15W Qi2 / MagSafe"], ["Input", "USB-C PD 20W"], ["Coils", "Dual coil alignment"], ["Case Friendly", "Up to 5mm"], ["Cable", "1.5m braided"]] },
  { slug: "aura-power-bank-20000", name: "Aura Power Bank 20000mAh", cat: "accessories", brand: "aura", base: 79, sale: 59, rating: 4.3, rcount: 1245, sold: 5600, stock: 420, badge: "SALE", specs: [["Capacity", "20000 mAh"], ["Output", "2× USB-C 65W PD"], ["Ports", "2× USB-C + 1× USB-A"], ["Display", "Digital % readout"], ["Charging", "65W in ~90 min"]] },
  { slug: "aura-studiomic-xlr", name: "Aura StudioMic XLR Condenser", cat: "accessories", brand: "aura", base: 179, sale: 129, rating: 4.6, rcount: 412, sold: 1300, stock: 28, featured: true, specs: [["Type", "Large-diaphragm condenser"], ["Pattern", "Cardioid"], ["SPL", "Max 144dB"], ["Connector", "XLR 3-pin"], ["Mount", "Shock mount + pop filter"]] },
  { slug: "aura-smart-home-hub", name: "Aura Smart Home Hub", cat: "accessories", brand: "aura", base: 129, sale: 99, rating: 4.2, rcount: 289, sold: 980, stock: 75, badge: "NEW", specs: [["Protocols", "Matter / Thread / Zigbee 3.0"], ["Voice", "Built-in assistant"], ["Range", "Thread border router"], ["Privacy", "Local processing"], ["Ports", "USB-C + Ethernet"]] },
];

const BADGE_BY_SLUG = new Map<string, Badge>(
  RAW_PRODUCTS.filter((r) => r.badge).map((r) => [r.slug, r.badge as Badge])
);

function buildProduct(raw: RawSeed, index: number): ProductWithRelations {
  const cat = CATEGORIES[raw.cat];
  const brand = BRANDS[raw.brand];
  const id = `p-${raw.slug}`;
  const created = new Date(Date.UTC(2026, 0, 1) + index * 3 * 86400000).toISOString();

  const colorOffset = (index * 2) % COLOR_PALETTE.length;
  const colors = [0, 1, 2].map((i) => COLOR_PALETTE[(colorOffset + i) % COLOR_PALETTE.length]);

  const variants: ProductVariant[] = colors.map((color, i) => ({
    id: `${id}-var-${i}`,
    product_id: id,
    option_name: "Color",
    option_value: color,
    sku: `SKU-${raw.slug.toUpperCase()}-${i}`,
    price_adjustment: color === "Rose Gold" ? 20 : 0,
    stock_quantity: Math.max(1, Math.round(raw.stock / colors.length)),
    image_url: img(`${raw.slug}-${color.toLowerCase().replace(/\s+/g, "-")}`),
    created_at: created,
    updated_at: NOW,
  }));

  const images: ProductImage[] = [0, 1, 2, 3].map((i) => ({
    id: `${id}-img-${i}`,
    product_id: id,
    variant_id: i === 0 ? variants[0].id : null,
    image_url: i === 0 ? img(raw.slug) : img(`${raw.slug}-view-${i + 1}`),
    alt_text: `${raw.name} view ${i + 1}`,
    sort_order: i,
    created_at: created,
  }));

  const specs: ProductSpec[] = raw.specs.map(([key, value], i) => ({
    id: `${id}-spec-${i}`,
    product_id: id,
    key,
    value,
    sort_order: i,
    created_at: created,
  }));

  const product: Product = {
    id,
    name: raw.name,
    slug: raw.slug,
    description: `${raw.name} by ${brand.name}. Premium ${cat.name.toLowerCase()} with manufacturer warranty and free delivery over $50.`,
    category_id: cat.id,
    brand_id: brand.id,
    base_price: raw.base,
    sale_price: raw.sale,
    sku: `DZ-${raw.cat.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    stock_quantity: raw.stock,
    is_active: true,
    is_featured: raw.featured ?? (raw.badge === "HOT" || raw.badge === "SALE"),
    rating_avg: raw.rating,
    rating_count: raw.rcount,
    sold_count: raw.sold,
    meta_title: `${raw.name} | Digitaz`,
    meta_description: `Shop ${raw.name} at Digitaz. Best price, fast shipping, 1-year warranty.`,
    created_at: created,
    updated_at: NOW,
  };

  return {
    ...product,
    category: { id: cat.id, name: cat.name, slug: cat.slug },
    brand: { id: brand.id, name: brand.name, slug: brand.slug },
    variants,
    images,
    specs,
  };
}

/** Full relation list (40 products) — single source of truth for fallbacks. */
export const seedProductsFull: ProductWithRelations[] = RAW_PRODUCTS.map(buildProduct);

/** Card-shaped list (40 products) consumed by grids / ProductCard. */
export const seedProducts: ProductCardData[] = seedProductsFull.map(toProductCardData);

/** PDP fallback: full detail keyed by slug. */
export const seedProductsDetail: Record<string, ProductWithRelations> = Object.fromEntries(
  seedProductsFull.map((p) => [p.slug, p])
);

export const seedBrands: Brand[] = (Object.keys(BRANDS) as BrandKey[]).map((k) => {
  const b = BRANDS[k];
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: img(`brand-${b.slug}`, 300, 300),
    description: `${b.name} — official brand store at Digitaz.`,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: NOW,
  };
});

/** Full Category rows (kept as Category[] — structurally assignable to CategoryNavItem[]). */
export const seedCategories: Category[] = (Object.keys(CATEGORIES) as CatKey[])
  .map((k) => {
    const c = CATEGORIES[k];
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: `Shop the latest ${c.name.toLowerCase()} at Digitaz.`,
      image_url: img(`cat-${c.slug}`),
      parent_id: null,
      sort_order: c.sort_order,
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: NOW,
    } satisfies Category;
  })
  .sort((a, b) => a.sort_order - b.sort_order);

export function toCategoryNavItem(c: Category): CategoryNavItem {
  return { id: c.id, name: c.name, slug: c.slug, image_url: c.image_url };
}

export function toProductCardData(p: ProductWithRelations): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryLabel: p.category?.name ?? null,
    base_price: p.base_price,
    sale_price: p.sale_price,
    rating_avg: p.rating_avg,
    rating_count: p.rating_count,
    sold_count: p.sold_count,
    stock_quantity: p.stock_quantity,
    image_url: p.images?.[0]?.image_url ?? img(p.slug),
    badge: BADGE_BY_SLUG.get(p.slug) ?? null,
    variants: (p.variants ?? [])
      .filter((v) => v.option_name === "Color")
      .map((v) => ({ option_value: v.option_value, image_url: v.image_url })),
  };
}

/** Flat color→hex used by swatch UI. Keys kept in sync with COLOR_PALETTE + variant values. */
export const COLOR_HEX: Record<string, string> = {
  "midnight black": "#111827",
  black: "#111827",
  obsidian: "#0f172a",
  silver: "#9ca3af",
  "mercury silver": "#c0c6cf",
  "ocean blue": "#3b82f6",
  blue: "#3b82f6",
  "rose gold": "#f59e0b",
  gold: "#f59e0b",
  "desert gold": "#d4a373",
  "natural titanium": "#8a8a8a",
  porcelain: "#f5f5f4",
  mint: "#84cc16",
  "sage green": "#84cc16",
  white: "#f9fafb",
  "sky blue": "#38bdf8",
  midnight: "#1e293b",
  starlight: "#f1e9d2",
  "product red": "#dc2626",
  red: "#ef4444",
  "arctic white": "#f8fafc",
  "matte black": "#1f2937",
  "space gray": "#4b5563",
};

export const seedHeroSlides: HeroSlide[] = [
  {
    id: "h1",
    eyebrow: "Exclusive Wireless Controllers",
    title: "Bring Gaming Worlds To Life",
    subtitle: "Zephyr Pro Controller & Elite Series in stock",
    priceLabel: "Starting at $69",
    ctaText: "Shop Now",
    ctaLink: "/category/gaming",
    image_url: img("hero-controllers"),
    badge: "NEW",
  },
  {
    id: "h2",
    eyebrow: "Flagship Smartphone Week",
    title: "Capture Every Moment In 8K",
    subtitle: "AuraPhone Pro Max — trade-in bonus $200",
    priceLabel: "From $999",
    ctaText: "Shop Smartphones",
    ctaLink: "/category/smartphones",
    image_url: img("hero-phones"),
    badge: "HOT",
  },
  {
    id: "h3",
    eyebrow: "Home Cinema Upgrade",
    title: "OLED TVs From $599",
    subtitle: '65" 4K 120Hz with Dolby Vision',
    priceLabel: "Up to 35% OFF",
    ctaText: "Shop TVs",
    ctaLink: "/category/tvs",
    image_url: img("hero-tv"),
    badge: "SALE",
  },
];

export const seedPromoBanners: PromoBanner[] = [
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
    title: "SonicMax Buds Pro",
    subtitle: "Pro wireless earbuds — $149",
    ctaText: "Buy Now",
    ctaLink: "/category/headphones",
    image_url: img("promo-earbuds"),
    badge: "NEW",
    variant: "dark",
  },
  {
    id: "p3",
    title: "Beauty on Your Wrist",
    subtitle: "Smartwatches from $99",
    ctaText: "Explore",
    ctaLink: "/category/smartwatches",
    image_url: img("promo-watch"),
    badge: "HOT",
    variant: "light",
  },
];

export const seedFooterBanner: PromoBanner = {
  id: "footer",
  title: "Up to 30% Off Instant Discount",
  subtitle: "Across laptops, TVs and wearables",
  ctaText: "Claim Discount",
  ctaLink: "/deals",
  image_url: img("footer-devices"),
  variant: "dark",
};

export const seedReviews: Review[] = [
  { id: "rev-1", user_id: "user-jane", product_id: "p-sonicmax-overear-pro", rating: 5, title: "Best ANC I've tried", comment: "The noise cancellation is incredible on flights. Battery lasts forever.", is_verified: true, is_approved: true, created_at: "2026-10-02T09:12:00Z", updated_at: "2026-10-02T09:12:00Z" },
  { id: "rev-2", user_id: "user-mark", product_id: "p-sonicmax-overear-pro", rating: 4, title: "Great sound, slightly tight clamp", comment: "Audio quality is superb. Wish the headband padding were a bit softer.", is_verified: true, is_approved: true, created_at: "2026-10-14T18:40:00Z", updated_at: "2026-10-14T18:40:00Z" },
  { id: "rev-3", user_id: "user-ada", product_id: "p-auraphone-pro-max", rating: 5, title: "Camera is a beast", comment: "Low-light photos are stunning. The 5x zoom actually holds up.", is_verified: true, is_approved: true, created_at: "2026-09-21T11:05:00Z", updated_at: "2026-09-21T11:05:00Z" },
  { id: "rev-4", user_id: "user-leo", product_id: "p-zephyr-blade14-rtx4070", rating: 5, title: "Runs everything maxed", comment: "Cyberpunk 2077 at 1440p ultra with DLSS is buttery. Cooling is quiet too.", is_verified: true, is_approved: true, created_at: "2026-10-30T20:15:00Z", updated_at: "2026-10-30T20:15:00Z" },
  { id: "rev-5", user_id: "user-nina", product_id: "p-chronofit-series-9", rating: 4, title: "Solid fitness companion", comment: "GPS accuracy is great and sleep tracking improved. Battery could be better.", is_verified: true, is_approved: true, created_at: "2026-11-01T08:30:00Z", updated_at: "2026-11-01T08:30:00Z" },
  { id: "rev-6", user_id: "user-omar", product_id: "p-cinemax-65-oled", rating: 5, title: "Picture quality blew me away", comment: "Inky blacks and perfect motion. Next-day delivery was a nice surprise.", is_verified: true, is_approved: true, created_at: "2026-11-08T16:22:00Z", updated_at: "2026-11-08T16:22:00Z" },
];
