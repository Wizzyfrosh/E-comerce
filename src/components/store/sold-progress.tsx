import { cn } from "@/lib/utils";

interface SoldProgressProps {
  sold: number;
  /** total = sold + remaining stock. */
  total: number;
  className?: string;
}

/**
 * Scarcity progress bar. Fill turns red when fewer than 20 units remain.
 * Renders nothing when total <= 0.
 */
export function SoldProgress({ sold, total, className }: SoldProgressProps) {
  if (total <= 0) return null;

  const left = Math.max(0, total - sold);
  const percent = Math.min(100, Math.round((sold / total) * 100));
  const urgent = left < 20;

  return (
    <div className={cn("w-full", className)}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${sold.toLocaleString()} sold, ${left} left`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            urgent ? "bg-brand-sale" : "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {sold.toLocaleString()} sold · {left} left
      </p>
    </div>
  );
}
