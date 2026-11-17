/**
 * Banner data access. Maps the DB `Banner` row shape to the UI shapes
 * HeroSlide / PromoBanner. Supabase-first with seed fallback.
 */
import { createClient } from "@/lib/supabase/server";
import type { Banner } from "@/types/database";
import type { HeroSlide, PromoBanner } from "@/types";
import { seedFooterBanner, seedHeroSlides, seedPromoBanners } from "./seed-data";

const PROMO_VARIANTS: NonNullable<PromoBanner["variant"]>[] = [
  "blue",
  "dark",
  "light",
];

function bannerToHero(b: Banner): HeroSlide {
  return {
    id: b.id,
    eyebrow: b.description ?? null,
    title: b.title,
    subtitle: b.subtitle,
    priceLabel: null,
    ctaText: b.cta_text,
    ctaLink: b.cta_link,
    image_url: b.image_url ?? b.mobile_image_url ?? "",
    badge: b.badge,
  };
}

function bannerToPromo(b: Banner, index: number): PromoBanner {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    ctaText: b.cta_text,
    ctaLink: b.cta_link,
    image_url: b.image_url ?? b.mobile_image_url,
    badge: b.badge,
    variant: PROMO_VARIANTS[index % PROMO_VARIANTS.length],
  };
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("type", "hero")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return seedHeroSlides.slice();
    return (data as Banner[]).map(bannerToHero);
  } catch {
    return seedHeroSlides.slice();
  }
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("type", "promo")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return seedPromoBanners.slice();
    return (data as Banner[]).map(bannerToPromo);
  } catch {
    return seedPromoBanners.slice();
  }
}

export async function getFooterBanner(): Promise<PromoBanner | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("type", "footer")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return seedFooterBanner;
    const promo = bannerToPromo(data as Banner, 0);
    return { ...promo, variant: "dark" };
  } catch {
    return seedFooterBanner;
  }
}
