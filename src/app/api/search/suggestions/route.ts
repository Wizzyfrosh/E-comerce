import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";
import type { ProductCardData } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Lightweight suggestion endpoint for the header search dropdown.
 * Returns up to 6 matching products as card data.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ products: [] as ProductCardData[] });
  }
  try {
    const products = await searchProducts(q, { limit: 6 });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] as ProductCardData[] });
  }
}
