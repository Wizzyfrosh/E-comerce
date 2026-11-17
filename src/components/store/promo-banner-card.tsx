import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PromoBanner } from "@/types";

interface PromoBannerCardProps {
  banner: PromoBanner;
  className?: string;
}

const variantStyles: Record<NonNullable<PromoBanner["variant"]>, string> = {
  blue: "bg-brand-blue text-white",
  dark: "bg-brand-navy text-white",
  light: "border border-border bg-brand-panel text-foreground",
};

/**
 * Compact promotional banner card. Three variants: blue, dark, light.
 * Title + subtitle left, product image right.
 */
export function PromoBannerCard({ banner, className }: PromoBannerCardProps) {
  const variant = banner.variant ?? "light";
  const isDark = variant !== "light";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 overflow-hidden rounded-xl p-6",
        variantStyles[variant],
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {banner.badge && (
          <span
            className={cn(
              "inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              isDark ? "bg-white/20 text-white" : "bg-brand-sale text-white"
            )}
          >
            {banner.badge}
          </span>
        )}
        <h3 className="text-lg font-bold leading-snug">{banner.title}</h3>
        {banner.subtitle && (
          <p
            className={cn(
              "text-sm",
              isDark ? "text-white/75" : "text-muted-foreground"
            )}
          >
            {banner.subtitle}
          </p>
        )}
        <Link
          href={banner.ctaLink ?? "#"}
          className={cn(
            "inline-flex items-center gap-1 text-sm font-semibold transition hover:gap-2",
            isDark ? "text-white" : "text-primary"
          )}
        >
          {banner.ctaText ?? "Shop Now"}
          <ArrowRight size={14} />
        </Link>
      </div>

      {banner.image_url && (
        <Image
          src={banner.image_url}
          alt=""
          aria-hidden="true"
          width={96}
          height={96}
          className="h-20 w-20 shrink-0 rounded-lg object-cover md:h-24 md:w-24"
        />
      )}
    </div>
  );
}
