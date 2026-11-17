import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Package, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import type { Profile } from "@/types/database";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin role. Fail closed: if the DB is unavailable or the role is
  // not "admin", redirect to the customer account page.
  let isAdmin = false;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<Pick<Profile, "role">>();
    isAdmin = data?.role === "admin";
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    redirect("/account");
  }

  const sections = [
    { href: "#", label: "Products", icon: Package, desc: "Catalog, inventory and pricing" },
    { href: "#", label: "Orders", icon: ShoppingCart, desc: "Manage and fulfill orders" },
    { href: "#", label: "Users", icon: Users, desc: "Customers and admin accounts" },
  ];

  return (
    <div className="container-store py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Phase 2 — catalog, orders and user management
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Signed in as <span className="font-semibold">{user.email}</span> —
          admin access verified.
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <Icon className="h-5 w-5 text-brand-navy" />
              <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary">
                {label}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Full admin panel arrives in Phase 2.{" "}
          <Link href="/" className="text-primary hover:underline">
            Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
