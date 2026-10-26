import type { CSSProperties } from 'react';

export type LegendRampSwatch = {
  /** CSS custom property name without leading '--', e.g. 'sev-0'. Resolves to var(--sev-0). */
  token?: string;
  /** Raw CSS colour fallback when token is absent. */
  color?: string;
  label: string;
};

export type LegendRampProps = {
  swatches: LegendRampSwatch[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function LegendRamp({ swatches, orientation = 'vertical', className }: LegendRampProps) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <dl
      className={`${className ?? ''} flex ${isHorizontal ? 'flex-row flex-wrap gap-x-4 gap-y-1' : 'flex-col gap-1'}`.trim()}
    >
      {swatches.map(({ token, color, label }) => {
        const bg: CSSProperties = token
          ? { backgroundColor: `var(--${token})` }
          : { backgroundColor: color };
        return (
          <div key={label} className="flex items-center gap-2">
            <dt
              style={bg}
              className="inline-block size-3 shrink-0 rounded-sm border border-border"
              aria-hidden
            />
            <dd className="caption text-ink-muted">{label}</dd>
          </div>
        );
      })}
    </dl>
  );
}
