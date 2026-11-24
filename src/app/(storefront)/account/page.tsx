import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { ProfileForm } from "./profile-form";
import { SectionHeader } from "@/components/store/section-header";
import {
  Heart,
  MapPin,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import type { Profile } from "@/types/database";

const NAV_CARDS = [
  {
    href: "/account/orders",
    label: "My Orders",
    icon: Package,
    desc: "Track recent purchases and shipping status",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
    desc: "Manage saved shipping addresses",
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    icon: Heart,
    desc: "Products you saved for later",
  },
  {
    href: "/cart",
    label: "Cart",
    icon: ShoppingCart,
    desc: "Review items ready for checkout",
  },
] as const;

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Load the profile row; gracefully fall back to auth metadata when the
  // profiles table / DB is not provisioned.
  let profile: Pick<Profile, "full_name" | "phone"> | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle<Pick<Profile, "full_name" | "phone">>();
    profile = data;
  } catch {
    // DB unavailable — show email-only identity.
  }

  const metadataName = user.user_metadata?.full_name as string | undefined;
  const displayName =
    profile?.full_name ?? metadataName ?? user.email?.split("@")[0] ?? "Customer";
  const displayPhone = profile?.phone ?? "";

  return (
    <div className="container-store py-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeader title="My Account" />

        {/* Profile summary + editable details */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {displayPhone && (
                <p className="text-sm text-muted-foreground">{displayPhone}</p>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Profile details
            </h2>
            <ProfileForm
              initialFullName={profile?.full_name ?? metadataName ?? ""}
              initialPhone={displayPhone}
            />
          </div>
        </div>

        {/* Quick navigation */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {NAV_CARDS.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary">
                {label}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 max-w-xs">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
