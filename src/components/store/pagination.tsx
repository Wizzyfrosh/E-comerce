"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Pathname without query, e.g. "/category/laptops". */
  basePath: string;
  /** Current full query string including leading "?" (may be empty). */
  currentSearch: string;
}

/** Sliding window of up to `size` numbered pages around the current page. */
function pageWindow(current: number, total: number, size = 5): number[] {
  let start = Math.max(1, current - Math.floor(size / 2));
  const end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

/**
 * Prev / Next + numbered page buttons (window of 5). Preserves all other
 * query params and only changes ?page=. Disabled at both ends.
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  currentSearch,
}: PaginationProps) {
  const router = useRouter();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(currentSearch);
    if (page === 1) params.delete("page");
    else params.set("page", String(page));
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const pages = pageWindow(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const baseBtn =
    "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition";

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
        className={cn(
          baseBtn,
          "border-border bg-white text-foreground hover:border-primary hover:text-primary",
          isFirst && "cursor-not-allowed opacity-40 hover:border-border hover:text-foreground"
        )}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {pages.map((p) => {
        const active = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            aria-current={active ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              baseBtn,
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
            )}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={isLast}
        aria-label="Next page"
        className={cn(
          baseBtn,
          "border-border bg-white text-foreground hover:border-primary hover:text-primary",
          isLast && "cursor-not-allowed opacity-40 hover:border-border hover:text-foreground"
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
