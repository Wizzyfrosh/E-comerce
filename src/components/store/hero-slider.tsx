import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { HeroSlide } from "@/types";
import { previewHeroSlides } from "@/data/preview";
import { Carousel } from "./carousel";

function HeroSlideCard({ slide }: { slide: HeroSlide }) {
  return (
    <div className="grid min-h-[280px] items-center gap-6 bg-gradient-to-r from-brand-bright to-blue-800 p-8 md:min-h-[320px] md:grid-cols-2 md:p-12">
      <div className="space-y-4">
        {slide.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {slide.eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="max-w-md text-sm text-white/80 md:text-base">
            {slide.subtitle}
          </p>
        )}
        {slide.priceLabel && (
          <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
            {slide.priceLabel}
          </span>
        )}
        <div>
          <Link
            href={slide.ctaLink ?? "#"}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-lg transition hover:bg-gray-100"
          >
            {slide.ctaText ?? "Shop Now"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="relative hidden items-center justify-center md:flex">
        <div className="absolute h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <img
          src={slide.image_url}
          alt={slide.title}
          className="relative max-h-72 w-auto rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

/** Full-width hero slider with autoplay, arrows and dot indicators. */
export function HeroSlider({ slides = previewHeroSlides }: { slides?: HeroSlide[] }) {
  return (
    <Carousel
      ariaLabel="Featured promotions"
      items={slides.map((slide) => (
        <HeroSlideCard key={slide.id} slide={slide} />
      ))}
    />
  );
}
