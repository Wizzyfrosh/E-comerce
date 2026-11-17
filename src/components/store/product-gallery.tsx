"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  /** Optional external override of the main image (e.g. selected color variant). */
  mainImageOverride?: string | null;
}

/**
 * PDP gallery: large main image with hover zoom, plus a horizontal thumbnail
 * strip. Clicking a thumbnail swaps the main image; selected thumbnail gets a
 * primary ring. Uses next/image with `fill` inside fixed-aspect containers.
 */
export function ProductGallery({ images, mainImageOverride }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length > 0 ? images : [{ url: "", alt: "Product image" }];
  const mainUrl =
    mainImageOverride ?? safeImages[Math.min(activeIndex, safeImages.length - 1)]?.url;
  const mainAlt =
    safeImages[Math.min(activeIndex, safeImages.length - 1)]?.alt ?? "Product image";

  return (
    <div className="space-y-3">
      <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-gray-100">
        {mainUrl ? (
          <Image
            src={mainUrl}
            alt={mainAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === activeIndex && !mainImageOverride}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-gray-100 transition",
                index === activeIndex && !mainImageOverride
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
