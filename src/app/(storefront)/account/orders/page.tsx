import { getSupabaseOrders } from "@/lib/data/orders";
import { SectionHeader } from "@/components/store/section-header";
import { OrdersHistory } from "./orders-history";

export default async function OrdersPage() {
  // Supabase-first; [] when DB unavailable — the client component merges
  // localStorage fallback orders on mount.
  const orders = await getSupabaseOrders();

  return (
    <div className="container-store py-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeader title="Order History" viewAllHref="/account" />
        <OrdersHistory initialOrders={orders} />
      </div>
    </div>
  );
}
