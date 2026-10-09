import { cn } from "cn";
import type { Band } from "@/data";

// Fill + border edge + the band word. Text colour is a token, never the fdr-* fill.
const FILL: Record<Band, string> = {
  "No rating": "bg-fdr-no-rating text-ink-on-warm",
  Moderate: "bg-fdr-moderate text-ink-on-warm",
  High: "bg-fdr-high text-ink-on-warm",
  Extreme: "bg-fdr-extreme text-ink-on-warm",
  Catastrophic: "bg-fdr-catastrophic text-ink-on-deep",
};

export function DangerChip({ band }: { band: Band }) {
  return (
    <span className={cn("inline-block rounded-sm border border-border px-2 py-0.5 text-sm font-medium", FILL[band])}>
      {band}
    </span>
  );
}
