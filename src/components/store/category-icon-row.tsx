import Link from "next/link";

import type { CategoryNavItem } from "@/types";
import { previewCategories } from "@/data/preview";

/**
 * Horizontally scrolling row of circular category icons.
 * Scrollbar hidden via the `.no-scrollbar` utility in globals.css.
 */
export function CategoryIconRow({
  categories = previewCategories,
}: {
  categories?: CategoryNavItem[];
}) {
  return (
    <div className="no-scrollbar flex gap-5 overflow-x-auto py-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group flex w-20 shrink-0 flex-col items-center gap-2"
        >
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-border transition group-hover:ring-2 group-hover:ring-primary">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-lg font-bold text-primary">
                {category.name.charAt(0)}
              </span>
            )}
          </span>
          <span className="text-center text-xs font-medium leading-tight text-foreground transition group-hover:text-primary">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
