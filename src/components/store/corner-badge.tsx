import { cn } from "@/lib/utils";

export type CornerBadgeType = "HOT" | "SALE" | "NEW";

interface CornerBadgeProps {
  type: CornerBadgeType;
  className?: string;
}

const badgeStyles: Record<CornerBadgeType, string> = {
  HOT: "bg-brand-hot text-white",
  SALE: "bg-brand-sale text-white",
  NEW: "bg-brand-success text-white",
};

/**
 * Absolute-positioned corner badge (top-left). Place inside a `relative`
 * container such as a product card image area.
 */
export function CornerBadge({ type, className }: CornerBadgeProps) {
  return (
    <span
      className={cn(
        "absolute left-2 top-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        badgeStyles[type],
        className
      )}
    >
      {type}
    </span>
  );
}
