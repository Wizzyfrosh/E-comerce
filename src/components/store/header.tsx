"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  DollarSign,
  Globe,
  Heart,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { previewCategories } from "@/data/preview";
import { MegaMenu } from "./mega-menu";
import { useCartStore } from "./cart-store";

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
  const cartCount = useCartStore((state) => state.cartCount);
  const wishlistCount = useCartStore((state) => state.wishlistCount);
  const [query, setQuery] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Phase 1: static preview. Phase 2 routes to /search?q=...
  };

  return (
    <div className="border-b border-border bg-white">
      <div className="container-store flex items-center gap-4 py-4">
        <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight">
          <span className="text-brand-navy">digit</span>
          <span className="text-primary">az</span>
        </Link>

        <form
          onSubmit={handleSearch}
          role="search"
          className="flex flex-1 items-center overflow-hidden rounded-full bg-gray-100 focus-within:ring-2 focus-within:ring-primary/30"
        >
          <select
            aria-label="Search in category"
            className="h-10 cursor-pointer border-r border-border bg-transparent pl-4 pr-2 text-sm text-foreground outline-none"
            defaultValue="all"
          >
            <option value="all">All Categories</option>
            {previewCategories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, brands and more…"
            aria-label="Search products"
            className="h-10 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            type="submit"
            aria-label="Search"
            className="mx-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
          >
            <Search size={15} />
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="#"
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
          <Link
            href="#"
            aria-label={`Cart, ${cartCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-gray-100"
          >
            <ShoppingCart size={20} />
            <CountBadge count={cartCount} />
          </Link>
        </div>
      </div>
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
