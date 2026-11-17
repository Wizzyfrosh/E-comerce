import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { Heart, MapPin, Package, User } from "lucide-react";
import type { Profile } from "@/types/database";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Try to load the profile; gracefully fall back to email-only if the
  // profiles table / DB is not yet provisioned.
  let profile: Pick<Profile, "full_name"> | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle<Pick<Profile, "full_name">>();
    profile = data;
  } catch {
    // DB not available — show email only.
  }

  const displayName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Customer";

  const links = [
    { href: "#", label: "My Orders", icon: Package, desc: "Track and manage orders" },
    { href: "#", label: "Addresses", icon: MapPin, desc: "Saved shipping addresses" },
    { href: "#", label: "Wishlist", icon: Heart, desc: "Saved items you love" },
  ];

  return (
    <div className="container-store py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {links.map(({ href, label, icon: Icon, desc }) => (
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
