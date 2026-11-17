import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}

/**
 * Section heading with optional "View All" link and circular prev/next
 * arrow buttons (rendered only when both handlers are provided).
 */
export function SectionHeader({
  title,
  viewAllHref,
  onPrev,
  onNext,
  className,
}: SectionHeaderProps) {
  const hasArrows =
    typeof onPrev === "function" && typeof onNext === "function";

  return (
    <div className={cn("mb-4 flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </div>

      {hasArrows && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
