"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * Quantity stepper: minus button / numeric input / plus button.
 * Clamps between 1 and `max` (available stock). Buttons disable at bounds.
 */
export function QuantitySelector({
  value,
  max,
  onChange,
  disabled,
}: QuantitySelectorProps) {
  const clamp = (next: number) => {
    const bounded = Math.max(1, Math.min(max, Math.floor(next) || 1));
    onChange(bounded);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-white",
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => clamp(value - 1)}
        className="flex h-10 w-10 items-center justify-center text-foreground transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => clamp(Number(event.target.value))}
        className="h-10 w-12 border-x border-border bg-transparent text-center text-sm font-medium text-foreground focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => clamp(value + 1)}
        className="flex h-10 w-10 items-center justify-center text-foreground transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
