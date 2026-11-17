"use client";

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface CarouselProps {
  items: ReactNode[];
  autoplay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  arrowClassName?: string;
  dotClassName?: string;
  activeDotClassName?: string;
  ariaLabel?: string;
}

/**
 * Generic slide carousel with autoplay, pause-on-hover, side arrows, dot
 * indicators, and arrow-key navigation. Fully managed client state.
 */
export function Carousel({
  items,
  autoplay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
  className,
  arrowClassName,
  dotClassName,
  activeDotClassName,
  ariaLabel = "Carousel",
}: CarouselProps) {
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!autoplay || paused || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, paused, interval, count]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  if (count === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${count}`}
              aria-hidden={i !== index}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className={cn(
              "absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow transition hover:bg-white",
              arrowClassName
            )}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className={cn(
              "absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow transition hover:bg-white",
              arrowClassName
            )}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div
          className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5"
          role="tablist"
          aria-label="Slide navigation"
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index
                  ? cn("w-6 bg-white", activeDotClassName)
                  : cn("w-2 bg-white/50 hover:bg-white/80", dotClassName)
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
