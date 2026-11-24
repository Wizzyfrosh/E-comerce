import { CheckoutFlow } from "@/components/store/checkout-flow";

export const metadata = {
  title: "Checkout | Digitaz",
  description: "Complete your Digitaz order securely.",
};

/**
 * Server shell for the checkout flow. All interactivity lives in the client
 * `CheckoutFlow` (stepper, zod forms, Stripe/demo payment, server actions).
 */
export default function CheckoutPage() {
  return <CheckoutFlow />;
}
