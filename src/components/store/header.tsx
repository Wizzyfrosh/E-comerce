"use client";

import Link from "next/link";
import {
  DollarSign,
  Globe,
  Heart,
  MapPin,
  Package,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { previewCategories } from "@/data/preview";
import { MegaMenu } from "./mega-menu";
import { SearchSuggestions } from "./search-suggestions";
import { useCartStore, selectCartCount } from "./cart-store";
import { CartDrawer } from "./cart-drawer";

const NAV_LINKS = [
  { label: "Today's Deals", href: "#" },
  { label: "New Arrivals", href: "#" },
  { label: "Best Sellers", href: "#" },
  { label: "Brands", href: "#" },
  { label: "Gift Cards", href: "#" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-sale px-1 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function TopUtilityBar() {
  return (
    <div className="bg-brand-navy text-white/70">
      <div className="container-store flex h-8 items-center justify-between text-xs">
        <p className="flex items-center gap-1.5">
          <Truck size={13} className="text-white/50" />
          Free delivery on orders over $50
        </p>
        <nav className="flex items-center gap-4" aria-label="Utility">
          <Link href="#" className="flex items-center gap-1 transition hover:text-white">
            <MapPin size={12} /> Store Locator
          </Link>
          <Link href="#" className="flex items-center gap-1 transition hover:text-white">
            <Package size={12} /> Track Order
          </Link>
          <button type="button" className="flex items-center gap-1 transition hover:text-white">
            <DollarSign size={12} /> USD
          </button>
          <button type="button" className="flex items-center gap-1 transition hover:text-white">
            <Globe size={12} /> EN
          </button>
        </nav>
      </div>
    </div>
  );
}

function MainHeader() {
  const lines = useCartStore((state) => state.lines);
  const wishlist = useCartStore((state) => state.wishlist);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const cartCount = selectCartCount(lines);
  const wishlistCount = wishlist.length;

  return (
    <div className="border-b border-border bg-white">
      <div className="container-store flex items-center gap-4 py-4">
        <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight">
          <span className="text-brand-navy">digit</span>
          <span className="text-primary">az</span>
        </Link>

        <SearchSuggestions categories={previewCategories} />

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/account/wishlist"
            aria-label={`Wishlist, ${wishlistCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-gray-100"
          >
            <Heart size={20} />
            <CountBadge count={wishlistCount} />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-gray-100"
          >
            <User size={20} />
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Cart, ${cartCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-gray-100"
          >
            <ShoppingCart size={20} />
            <CountBadge count={cartCount} />
          </button>
        </div>
      </div>

      <CartDrawer />
    </div>
  );
}

function NavBar() {
  return (
    <nav className="relative bg-primary" aria-label="Primary">
      <div className="container-store flex h-11 items-center gap-1 overflow-visible">
        <MegaMenu categories={previewCategories} />
        <ul className="hidden items-center md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={cn(
                  "block px-3 py-2 text-sm font-medium text-white/85 transition hover:text-white"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 shadow-sm">
      <TopUtilityBar />
      <MainHeader />
      <NavBar />
    </header>
  );
}
