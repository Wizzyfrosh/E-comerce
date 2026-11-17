"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "./social-icons";

const CUSTOMER_SERVICE = [
  "Help Center",
  "Track Order",
  "Returns & Refunds",
  "Shipping Info",
  "Contact Us",
];

const MY_ACCOUNT = ["Sign In", "My Orders", "Wishlist", "Shopping Cart", "Address Book"];

const INFORMATION = [
  "About Digitaz",
  "Careers",
  "Press",
  "Sustainability",
  "Affiliate Program",
];

const PAYMENT_METHODS = [
  { label: "VISA", className: "text-blue-700" },
  { label: "MC", className: "text-red-600" },
  { label: "AMEX", className: "text-sky-600" },
  { label: "PAYPAL", className: "text-indigo-700" },
];

function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <Link
              href="#"
              className="text-sm text-muted-foreground transition hover:text-primary"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="mt-12 border-t border-border bg-brand-panel">
      <div className="container-store py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <LinkColumn title="Customer Service" links={CUSTOMER_SERVICE} />
          <LinkColumn title="My Account" links={MY_ACCOUNT} />
          <LinkColumn title="Information" links={INFORMATION} />

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                12 Tech Avenue, Port Harcourt, Nigeria
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="shrink-0 text-primary" />
                <a href="mailto:support@digitaz.com" className="hover:text-primary">
                  support@digitaz.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-primary" />
                <a href="tel:+2348001234567" className="hover:text-primary">
                  +234 800 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <h3 className="text-base font-bold text-foreground">
              Subscribe &amp; save 10%
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Get exclusive deals and new product alerts in your inbox.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex items-center gap-2"
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="rounded-full"
              />
              <Button type="submit" className="shrink-0 rounded-full">
                Subscribe
              </Button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs font-medium text-brand-success">
                Thanks for subscribing! Check your inbox.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {[
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: XIcon, label: "X (Twitter)" },
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: YoutubeIcon, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-primary hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method.label}
                  className={`rounded border border-border bg-white px-2 py-1 text-[10px] font-extrabold tracking-widest shadow-sm ${method.className}`}
                >
                  {method.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-navy text-white/60">
        <div className="container-store flex flex-col items-center justify-between gap-2 py-4 text-xs sm:flex-row">
          <p>© 2026 Digitaz. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="#" className="transition hover:text-white">Terms of Service</Link>
            <Link href="#" className="transition hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
