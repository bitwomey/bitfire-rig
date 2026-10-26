import type { CSSProperties, ReactNode } from 'react';
import type { FireDangerRating } from './FireDangerBadge';

export type HazardFillProps = {
  rating: FireDangerRating;
  children?: ReactNode;
  className?: string;
};

type Pitch = 'sparse' | 'dense';
type Hatch = { pitch: Pitch; arms: 1 | 2 } | null;

// The non-colour channel for a fire danger band. Structure, not just density,
// separates Moderate (one sparse arm) from Extreme (two sparse arms), the pair
// that is hardest to tell apart under protanopia.
const BANDS: Record<FireDangerRating, { fill: string; ink: string; hatch: Hatch }> = {
  'no-rating':    { fill: 'fdr-no-rating',    ink: 'ink-on-warm', hatch: null },
  'moderate':     { fill: 'fdr-moderate',     ink: 'ink-on-warm', hatch: { pitch: 'sparse', arms: 1 } },
  'high':         { fill: 'fdr-high',         ink: 'ink-on-warm', hatch: { pitch: 'dense', arms: 1 } },
  'extreme':      { fill: 'fdr-extreme',      ink: 'ink-on-warm', hatch: { pitch: 'sparse', arms: 2 } },
  'catastrophic': { fill: 'fdr-catastrophic', ink: 'ink-on-deep', hatch: { pitch: 'dense', arms: 2 } },
};

const arm = (angle: number, ink: string, pitch: Pitch) =>
  `repeating-linear-gradient(${angle}deg, var(--${ink}) 0, var(--${ink}) var(--stroke-hair), transparent calc(var(--stroke-hair) + 1px), transparent var(--hatch-pitch-${pitch}))`;

/** The fill colour and hatching for a band, as inline style, for use on any element or SVG-free surface. */
export function hazardFillStyle(rating: FireDangerRating): CSSProperties {
  const { fill, ink, hatch } = BANDS[rating];
  const style: CSSProperties = { backgroundColor: `var(--${fill})` };
  if (hatch) {
    // -45deg draws "/" and 45deg draws "\": a linear gradient's stripes run perpendicular to its angle.
    const layers = [arm(-45, ink, hatch.pitch)];
    if (hatch.arms === 2) layers.push(arm(45, ink, hatch.pitch));
    style.backgroundImage = layers.join(', ');
  }
  return style;
}

/** A map-style fill for one fire danger band: the band colour plus its hatching, with the required `border` edge. */
export function HazardFill({ rating, children, className }: HazardFillProps) {
  if (!(rating in BANDS)) {
    console.error(`HazardFill: unknown rating "${rating}" — must be one of: ${Object.keys(BANDS).join(', ')}`);
    return null;
  }
  return (
    <div className={`${className ?? ''} border border-border`.trim()} style={hazardFillStyle(rating)}>
      {children}
    </div>
  );
}
