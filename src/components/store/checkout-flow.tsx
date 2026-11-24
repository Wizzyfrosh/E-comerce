"use client";

/**
 * Five-step checkout flow: Contact → Shipping → Delivery → Payment → Review.
 *
 * Rules enforced here:
 *  - Every form step is zod-validated before advancing.
 *  - Prices come from `getCheckoutQuote` (server recompute); client cart prices
 *    are never displayed as authoritative totals.
 *  - Payment: when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` exists the primary CTA
 *    redirects to a Stripe Checkout Session; otherwise (and as fallback) the
 *    demo `placeOrder` action creates the order, clears the cart, and routes to
 *    the confirmation page.
 *  - Empty cart guards with a back-to-cart message.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import {
  contactSchema,
  checkoutAddressSchema,
  shippingMethodSchema,
} from "@/lib/validations";
import { createStripeCheckout, getCheckoutQuote } from "@/lib/actions/checkout";
import { placeOrder } from "@/lib/actions/orders";
import {
  SHIPPING_METHOD_ETA,
  SHIPPING_METHOD_LABELS,
  SHIPPING_RATES,
  FREE_SHIPPING_MIN,
} from "@/lib/checkout/rates";
import type {
  CartLine,
  CartTotals,
  OrderLineRecord,
  ShippingMethodId,
} from "@/types/commerce";
import {
  clearCartClient,
  readCartLines,
  saveLocalOrder,
} from "./checkout-client-utils";

const STEPS = ["Contact", "Shipping", "Delivery", "Payment", "Review"] as const;

const STRIPE_READY = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface AddressState {
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const EMPTY_ADDRESS: AddressState = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
};

function extractFieldErrors(issues: ReadonlyArray<{ path: readonly unknown[]; message: string }>) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export function CheckoutFlow() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<CartLine[]>(() => readCartLines());
  const refreshLines = () => setLines(readCartLines());
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressState>(EMPTY_ADDRESS);
  const [method, setMethod] = useState<ShippingMethodId>("standard");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const [quote, setQuote] = useState<{ totals: CartTotals; lines: OrderLineRecord[] } | null>(null);

  // Authoritative server quote whenever inputs change.
  useEffect(() => {
    if (lines.length === 0) return;
    let cancelled = false;
    getCheckoutQuote({ lines, couponCode: appliedCoupon ?? undefined, method })
      .then((result) => {
        if (cancelled) return;
        setQuote(result);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lines, method, appliedCoupon]);

  const totals = quote?.totals ?? null;

  const validateStep = (target: number): boolean => {
    setErrors({});
    if (target === 0) {
      const result = contactSchema.safeParse({ email, phone: phone || undefined });
      if (!result.success) {
        setErrors(extractFieldErrors(result.error.issues));
        return false;
      }
    }
    if (target === 1) {
      const result = checkoutAddressSchema.safeParse({
        ...address,
        phone: address.phone || undefined,
        line2: address.line2 || undefined,
        state: address.state || undefined,
      });
      if (!result.success) {
        setErrors(extractFieldErrors(result.error.issues));
        return false;
      }
    }
    if (target === 2) {
      const result = shippingMethodSchema.safeParse({ method });
      if (!result.success) {
        setErrors(extractFieldErrors(result.error.issues));
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    refreshLines();
    if (!validateStep(step)) return;
    setServerError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => {
    refreshLines();
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    setAppliedCoupon(code || null);
    setCouponInput("");
  };

  const submitDemoOrder = async () => {
    const currentLines = readCartLines();
    setLines(currentLines);
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setStep((firstInvalid(0)));
      return;
    }
    if (!termsAccepted) {
      setTermsError(true);
      setStep(4);
      return;
    }
    setBusy(true);
    setServerError(null);
    try {
      const result = await placeOrder({
        contact: { email, phone: phone || undefined },
        address: {
          full_name: address.full_name,
          phone: address.phone || undefined,
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          state: address.state || undefined,
          postal_code: address.postal_code,
          country: address.country,
        },
        method,
        lines: currentLines,
        couponCode: appliedCoupon ?? undefined,
      });
      saveLocalOrder(result.order);
      clearCartClient();
      router.push(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}`);
    } catch (error) {
      setServerError(
        error instanceof Error && error.message === "empty_cart"
          ? "Your cart is empty — add items before checking out."
          : "We could not place your order. Please review your details and try again."
      );
      setBusy(false);
    }
  };

  const submitStripe = async () => {
    const currentLines = readCartLines();
    setLines(currentLines);
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;
    setBusy(true);
    setServerError(null);
    const result = await createStripeCheckout({
      lines: currentLines,
      email,
      couponCode: appliedCoupon ?? undefined,
    });
    if (result.url) {
      window.location.href = result.url;
      return;
    }
    setServerError(
      result.error === "stripe_unavailable"
        ? "Stripe payment is not configured here — continue with demo payment."
        : "Could not start the Stripe checkout. Please try demo payment."
    );
    setBusy(false);
  };

  const firstInvalid = (from: number): number => {
    for (let i = from; i <= 2; i += 1) {
      if (!validateStep(i)) return i;
    }
    return from;
  };

  if (lines.length === 0) {
    return (
      <div className="container-store py-16">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add products before proceeding to checkout.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link href="/cart">View cart</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const methodOptions: ShippingMethodId[] = ["free", "standard", "express"];

  return (
    <div className="container-store py-8">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Checkout</h1>

      {/* Progress stepper */}
      <ol className="mt-6 flex flex-wrap items-center gap-2 md:gap-4">
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                  done && "border-brand-success bg-brand-success text-white",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="hidden h-px w-6 bg-border md:inline-block" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: step panels */}
        <div className="rounded-xl border border-border bg-card p-6">
          {step === 0 && (
            <section aria-label="Contact information">
              <header className="mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Contact information</h2>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Phone (optional)
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Order and delivery updates are sent to this email.
              </p>
            </section>
          )}

          {step === 1 && (
            <section aria-label="Shipping address">
              <header className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Shipping address</h2>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Full name</label>
                  <Input
                    value={address.full_name}
                    onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.full_name}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <Input
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Country</label>
                  <Input
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    placeholder="United States"
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs text-destructive">{errors.country}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Address line 1</label>
                  <Input
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    placeholder="Street, building, apartment"
                  />
                  {errors.line1 && <p className="mt-1 text-xs text-destructive">{errors.line1}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Address line 2 (optional)</label>
                  <Input
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    placeholder="Suite, floor, etc."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">City</label>
                  <Input
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                  />
                  {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">State / Region</label>
                  <Input
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Postal code</label>
                  <Input
                    value={address.postal_code}
                    onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                    placeholder="ZIP / postal code"
                  />
                  {errors.postal_code && (
                    <p className="mt-1 text-xs text-destructive">{errors.postal_code}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-label="Delivery method">
              <header className="mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Delivery method</h2>
              </header>
              <div className="space-y-3">
                {methodOptions.map((id) => {
                  const freeBelowMin =
                    id === "free" && (totals?.subtotal ?? 0) < FREE_SHIPPING_MIN;
                  return (
                    <label
                      key={id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition",
                        method === id ? "border-primary bg-accent/40" : "border-border bg-background"
                      )}
                    >
                      <input
                        type="radio"
                        name="shipping-method"
                        className="mt-1 accent-[#1e4fd8]"
                        checked={method === id}
                        onChange={() => setMethod(id)}
                      />
                      <span className="flex-1">
                        <span className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {SHIPPING_METHOD_LABELS[id]}
                          </span>
                          <span className="font-semibold text-foreground">
                            {id === "free" ? "Free" : formatPrice(SHIPPING_RATES[id])}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {SHIPPING_METHOD_ETA[id]}
                          {freeBelowMin &&
                            ` · Free kicks in at ${formatPrice(FREE_SHIPPING_MIN)}; standard rate applies below that.`}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.method && <p className="mt-2 text-xs text-destructive">{errors.method}</p>}
            </section>
          )}

          {step === 3 && (
            <section aria-label="Payment">
              <header className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Payment</h2>
              </header>
              <div className="space-y-4">
                {STRIPE_READY ? (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-foreground">Card payment (Stripe)</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      You will be redirected to Stripe to complete payment securely. Your card
                      details never touch our server.
                    </p>
                    <Button
                      className="mt-4 w-full"
                      size="lg"
                      disabled={busy}
                      onClick={submitStripe}
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      Pay with Card (Stripe)
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
                    <p className="text-sm font-medium text-foreground">Demo payment mode</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No Stripe keys are configured in this environment. The button below records
                      a pending order without charging a card; production builds use Stripe when
                      keys are present.
                    </p>
                    <Button
                      className="mt-4 w-full"
                      size="lg"
                      disabled={busy}
                      onClick={submitDemoOrder}
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                      Place Order (Demo Payment)
                    </Button>
                  </div>
                )}

                {STRIPE_READY && (
                  <div className="rounded-lg border border-dashed border-border p-4">
                    <p className="text-sm font-medium text-foreground">Demo payment (offline)</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Records a pending order without charging — useful for testing the confirmation
                      flow.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      disabled={busy}
                      onClick={submitDemoOrder}
                    >
                      Place Order (Demo Payment)
                    </Button>
                  </div>
                )}

                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-brand-success" />
                  1-year warranty · 30-day free returns · Orders confirmed by email.
                </p>
              </div>
            </section>
          )}

          {step === 4 && (
            <section aria-label="Review order">
              <header className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Review &amp; confirm</h2>
              </header>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd className="text-right font-medium">
                    {email}
                    {phone ? ` · ${phone}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="text-right font-medium">
                    {address.full_name}, {address.line1}
                    {address.city ? `, ${address.city}` : ""} {address.postal_code}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="text-right font-medium">
                    {SHIPPING_METHOD_LABELS[method]} · {SHIPPING_METHOD_ETA[method]}
                  </dd>
                </div>
              </dl>

              <label className="mt-4 flex items-start gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#1e4fd8]"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setTermsError(false);
                  }}
                />
                <span>
                  I confirm the order details above and agree to the store terms and return policy.
                </span>
              </label>
              {termsError && (
                <p className="mt-1 text-xs text-destructive">
                  Please accept the terms before placing the order.
                </p>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {STRIPE_READY && (
                  <Button size="lg" disabled={busy} onClick={submitStripe} className="flex-1">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Pay with Card (Stripe)
                  </Button>
                )}
                <Button
                  size="lg"
                  variant={STRIPE_READY ? "outline" : "default"}
                  disabled={busy}
                  onClick={submitDemoOrder}
                  className="flex-1"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                  Place Order (Demo Payment)
                </Button>
              </div>
            </section>
          )}

          {serverError && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button variant="ghost" onClick={goBack} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={goNext}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="outline" onClick={() => setStep(4)}>
                Review order <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {step === 4 && (
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-6">
          <h2 className="text-base font-semibold">Order summary</h2>

          <ul className="mt-4 space-y-3">
            {(quote?.lines ?? []).map((line) => (
              <li key={`${line.productId}-${line.variantLabel ?? "base"}`} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={line.image_url}
                  alt={line.name}
                  className="h-14 w-14 rounded-md border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
                  {line.variantLabel && (
                    <p className="text-xs text-muted-foreground">{line.variantLabel}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Qty: {line.qty}</p>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatPrice(line.total)}
                </div>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <div className="mt-4 flex gap-2">
            <Input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon code"
              className="uppercase"
            />
            <Button variant="outline" onClick={applyCoupon} type="button">
              Apply
            </Button>
          </div>
          {appliedCoupon && totals?.couponReason && (
            <p className="mt-1 text-xs text-destructive">{totals.couponReason}</p>
          )}
          {appliedCoupon && totals?.couponCode && (
            <p className="mt-1 text-xs text-brand-success">
              Code {totals.couponCode} applied.
            </p>
          )}

          <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{totals ? formatPrice(totals.subtotal) : "—"}</dd>
            </div>
            {totals && totals.discount > 0 && (
              <div className="flex justify-between text-brand-sale">
                <dt>Discount{totals.couponCode ? ` (${totals.couponCode})` : ""}</dt>
                <dd>−{formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>
                {totals ? (totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax (8%)</dt>
              <dd>{totals ? formatPrice(totals.tax) : "—"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{totals ? formatPrice(totals.total) : "—"}</dd>
            </div>
          </dl>

          {STRIPE_READY && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary">Secure</Badge> Payments processed by Stripe.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
