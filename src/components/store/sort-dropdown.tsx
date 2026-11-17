"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/lib/store-url";
import { cn } from "@/lib/utils";

interface SortDropdownProps {
  /** Pathname without query, e.g. "/category/laptops". */
  basePath: string;
  /** Current full query string including leading "?" (may be empty). */
  currentSearch: string;
  currentSort: SortKey;
  className?: string;
}

/**
 * Native <select> sort control. On change, preserves all other query params,
 * sets ?sort=, and resets ?page= (a new sort order always starts at page 1).
 */
export function SortDropdown({
  basePath,
  currentSearch,
  currentSort,
  className,
}: SortDropdownProps) {
  const router = useRouter();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(currentSearch);
    if (value === "relevance") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label
        htmlFor="sort-select"
        className="hidden text-sm text-muted-foreground sm:block"
      >
        Sort by
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Sort products"
          className="h-9 cursor-pointer appearance-none rounded-md border border-border bg-white pl-3 pr-8 text-sm font-medium text-foreground outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}
