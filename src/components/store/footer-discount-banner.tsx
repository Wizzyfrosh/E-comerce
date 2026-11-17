import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PromoBanner } from "@/types";
import { previewFooterBanner } from "@/data/preview";

/**
 * Full-width dark gradient discount banner placed just above the footer.
 */
export function FooterDiscountBanner({
  banner = previewFooterBanner,
}: {
  banner?: PromoBanner;
}) {
  return (
    <section className="container-store mt-12">
      <div className="flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl bg-gradient-to-r from-brand-navy via-slate-800 to-brand-blue p-8 md:flex-row md:p-10">
        <div className="max-w-xl space-y-3">
          <h2 className="text-2xl font-bold leading-tight text-white md:text-4xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="text-sm text-white/75 md:text-base">
              {banner.subtitle}
            </p>
          )}
          <Link
            href={banner.ctaLink ?? "#"}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-lg transition hover:bg-gray-100"
          >
            {banner.ctaText ?? "Shop Now"}
            <ArrowRight size={15} />
          </Link>
        </div>

        {banner.image_url && (
          <img
            src={banner.image_url}
            alt=""
            aria-hidden="true"
            className="max-h-36 w-auto rounded-lg object-contain shadow-2xl md:max-h-44"
          />
        )}
      </div>
    </section>
  );
}
