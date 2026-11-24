import { Suspense } from "react";
import { OrderConfirmation } from "@/components/store/order-confirmation";

export const metadata = {
  title: "Order Confirmed | Digitaz",
  description: "Your Digitaz order confirmation.",
};

/**
 * Server shell: `useSearchParams` in the client confirmation component requires
 * a Suspense boundary during prerendering.
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-store py-16 text-center text-sm text-muted-foreground">
          Loading your order confirmation…
        </div>
      }
    >
      <OrderConfirmation />
    </Suspense>
  );
}
