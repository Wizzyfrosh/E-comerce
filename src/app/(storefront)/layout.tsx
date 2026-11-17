import type { ReactNode } from "react";

import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";

/**
 * Storefront route-group layout. Wraps every storefront page with the
 * site header (utility bar + main header + mega-menu nav) and footer.
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
