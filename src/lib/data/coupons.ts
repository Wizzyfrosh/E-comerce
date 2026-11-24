/**
 * Coupon data access + validation.
 * Supabase-first: query the `coupons` table; on ANY error / missing env /
 * empty result fall back to `seedCoupons` so the storefront works with no DB.
 *
 * Validation rules (evaluated in order):
 *  1. `is_active = true`
 *  2. current time within [starts_at, expires_at)
 *  3. `subtotal >= min_order_value`
 *  4. `used_count < usage_limit` (when usage_limit is set)
 * Discount:
 *  - percent: round(subtotal * value / 100), capped at `max_discount`
 *  - fixed:   min(value, subtotal)
 * Invalid coupons always return `discount: 0` plus a human `reason`.
 */
import { createClient } from "@/lib/supabase/server";
import type { CouponType } from "@/types/database";
import type { CouponKind, CouponResult } from "@/types/commerce";
import { formatPrice } from "@/lib/utils";

/** Seed row shape (mirrors public.coupons; id/timestamps omitted). */
export interface SeedCoupon {
  code: string;
  type: CouponType;
  value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export const seedCoupons: SeedCoupon[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    min_order_value: 50,
    max_discount: 20,
    usage_limit: null,
    used_count: 0,
    starts_at: null,
    expires_at: null,
    is_active: true,
  },
  {
    code: "SAVE25",
    type: "fixed",
    value: 25,
    min_order_value: 100,
    max_discount: null,
    usage_limit: null,
    used_count: 0,
    starts_at: null,
    expires_at: null,
    is_active: true,
  },
  {
    code: "BLACKFRIDAY30",
    type: "percent",
    value: 30,
    min_order_value: 200,
    max_discount: null,
    usage_limit: null,
    used_count: 0,
    starts_at: null,
    expires_at: null,
    is_active: true,
  },
  {
    // Expired + inactive summer promo — always invalid.
    code: "SUMMER20",
    type: "percent",
    value: 20,
    min_order_value: 0,
    max_discount: null,
    usage_limit: null,
    used_count: 0,
    starts_at: null,
    expires_at: "2026-06-30T23:59:59Z",
    is_active: false,
  },
];

type EvaluableCoupon = SeedCoupon;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

function invalidResult(
  code: string,
  reason: string,
  extra?: Partial<CouponResult>
): CouponResult {
  return {
    valid: false,
    code,
    kind: null,
    discount: 0,
    reason,
    minSpend: null,
    expiresAt: null,
    ...extra,
  };
}

function evaluateCoupon(
  coupon: EvaluableCoupon,
  subtotal: number,
  now: Date
): CouponResult {
  const base = {
    code: coupon.code,
    kind: coupon.type as CouponKind,
    minSpend: coupon.min_order_value,
    expiresAt: coupon.expires_at,
  };

  if (!coupon.is_active) {
    return invalidResult(coupon.code, "This coupon code is unavailable.", base);
  }
  if (coupon.starts_at && now < new Date(coupon.starts_at)) {
    return invalidResult(coupon.code, "This coupon code is not active yet.", base);
  }
  if (coupon.expires_at && now > new Date(coupon.expires_at)) {
    return invalidResult(coupon.code, "This coupon code has expired.", base);
  }
  if (
    typeof coupon.usage_limit === "number" &&
    coupon.used_count >= coupon.usage_limit
  ) {
    return invalidResult(
      coupon.code,
      "This coupon has reached its usage limit.",
      base
    );
  }
  if (subtotal < coupon.min_order_value) {
    const shortfall = roundMoney(coupon.min_order_value - subtotal);
    return invalidResult(
      coupon.code,
      `Add ${formatPrice(shortfall)} more to unlock this coupon.`,
      base
    );
  }

  let discount: number;
  if (coupon.type === "percent") {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.max_discount != null) {
      discount = Math.min(discount, coupon.max_discount);
    }
  } else {
    discount = Math.min(coupon.value, subtotal);
  }
  discount = Math.max(0, roundMoney(discount));

  return { ...base, valid: true, discount, reason: null };
}

/**
 * Validate a coupon code against the live `coupons` table (Supabase-first),
 * falling back to the seed list. `subtotal` is the pre-discount merchandise
 * subtotal used for min-spend and percentage math.
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return invalidResult("", "Please enter a coupon code.");
  }

  let coupon: EvaluableCoupon | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select(
        "code,type,value,min_order_value,max_discount,usage_limit,used_count,starts_at,expires_at,is_active"
      )
      .eq("code", normalized)
      .maybeSingle();
    if (error) throw error;
    if (data) coupon = data as unknown as EvaluableCoupon;
  } catch {
    coupon = null;
  }

  if (!coupon) {
    coupon = seedCoupons.find((c) => c.code === normalized) ?? null;
  }
  if (!coupon) {
    return invalidResult(normalized, "This coupon code is unavailable.");
  }

  return evaluateCoupon(coupon, subtotal, new Date());
}
