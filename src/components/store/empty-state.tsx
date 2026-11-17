import Link from "next/link";
import type { ReactNode } from "react";
import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateSuggestion {
  label: string;
  href: string;
}

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  suggestions?: EmptyStateSuggestion[];
  icon?: ReactNode;
  className?: string;
}

/**
 * Reusable empty / no-results block. Renders an illustration-style icon,
 * title + subtitle, and an optional row of suggested category links.
 */
export function EmptyState({
  title,
  subtitle,
  suggestions,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-panel px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm">
        {icon ?? <PackageSearch size={28} />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {subtitle && (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{subtitle}</p>
      )}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
