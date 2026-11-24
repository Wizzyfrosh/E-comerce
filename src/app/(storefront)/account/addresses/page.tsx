import { listAddresses } from "@/lib/data/addresses";
import { SectionHeader } from "@/components/store/section-header";
import { AddressesManager } from "./addresses-manager";

export default async function AddressesPage() {
  // Supabase-first; [] when DB unavailable — the client manager merges
  // localStorage fallback addresses on mount.
  const addresses = await listAddresses();

  return (
    <div className="container-store py-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeader title="Addresses" viewAllHref="/account" />
        <AddressesManager initialAddresses={addresses} />
      </div>
    </div>
  );
}
