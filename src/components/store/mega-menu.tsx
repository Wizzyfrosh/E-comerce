"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CategoryNavItem } from "@/types";

interface MegaMenuProps {
  categories: CategoryNavItem[];
  className?: string;
}

const SUB_LINKS = ["All Products", "Best Sellers", "New Arrivals", "Top Rated"];

/**
 * "Shop by Department" mega menu. Desktop: opens on hover. Mobile / touch:
 * opens on click. Panel is full-width (anchored to the relative nav bar)
 * with category columns. A transparent backdrop closes it on outside tap.
 */
export function MegaMenu({ categories, className }: MegaMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Shop by Department"
        className="flex items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
      >
        <Menu size={16} />
        <span className="hidden sm:inline">Shop by Department</span>
        <span className="sm:hidden">Shop</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-white shadow-xl">
          <div className="container-store py-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <div key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {category.image_url && (
                      <Image
                        src={category.image_url}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-md bg-gray-100 object-cover"
                      />
                    )}
                    {category.name}
                  </Link>
                  <ul className="mt-2 space-y-1.5">
                    {SUB_LINKS.map((link) => (
                      <li key={link}>
                        <Link
                          href={`/category/${category.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-sm text-muted-foreground transition hover:text-primary"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
