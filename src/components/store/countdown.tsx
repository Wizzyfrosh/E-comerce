"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface CountdownProps {
  /** ISO date string, e.g. "2026-12-31T23:59:59Z". */
  endDate: string;
  className?: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getRemaining(endDate: string): Remaining | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Ticking countdown. Shows Days:H:M when > 24h remain, HH:MM:SS otherwise.
 * Recomputes on every render; a 1s interval forces a re-render.
 */
export function Countdown({ endDate, className }: CountdownProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const remaining = getRemaining(endDate);

  if (!remaining) {
    return (
      <span className={cn("text-muted-foreground", className)}>Ended</span>
    );
  }

  if (remaining.days > 0) {
    return (
      <span className={className} aria-live="off">
        {remaining.days}d : {pad(remaining.hours)}h : {pad(remaining.minutes)}m
      </span>
    );
  }

  return (
    <span className={className} aria-live="off">
      {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
    </span>
  );
}
