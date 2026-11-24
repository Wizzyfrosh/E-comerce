/**
 * Shared types for cart recompute results. Kept in a plain (non-"use server")
 * module so client components can import the types without pulling server
 * action runtime into the browser bundle.
 */
import type { CartLine, CartTotals } from "@/types/commerce";

/** A client cart line enriched with authoritative server pricing/stock. */
export interface ServerCartLine extends CartLine {
  valid: boolean;
  stock: number;
  lineTotal: number;
}

export interface RecomputeCartResult {
  lines: ServerCartLine[];
  totals: CartTotals;
}
