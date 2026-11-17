import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  /** 0–5, supports fractional values (e.g. 4.7). */
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}

/**
 * Five-star rating with fractional fill via a clipped overlay star.
 * Screen readers get a plain-text label; the stars are decorative.
 */
export function RatingStars({
  rating,
  count,
  size = 14,
  className,
}: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5${
        typeof count === "number" ? `, ${count.toLocaleString()} reviews` : ""
      }`}
    >
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((position) => {
          const fill = Math.max(0, Math.min(1, clamped - position));
          return (
            <span
              key={position}
              className="relative inline-block shrink-0"
              style={{ width: size, height: size }}
            >
              <Star
                size={size}
                strokeWidth={0}
                className="absolute inset-0 text-gray-300"
                fill="currentColor"
                aria-hidden="true"
              />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
                aria-hidden="true"
              >
                <Star
                  size={size}
                  strokeWidth={0}
                  className="text-brand-hot"
                  fill="currentColor"
                />
              </span>
            </span>
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
