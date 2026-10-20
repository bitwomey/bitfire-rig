const RATINGS = ['no-rating', 'moderate', 'high', 'extreme', 'catastrophic'] as const;
export type FireDangerRating = (typeof RATINGS)[number];

export type FireDangerBadgeProps = {
  rating: FireDangerRating | string;
  size?: 'md' | 'lg';
  /** Override the displayed label for localisation only — never to relabel a band. */
  children?: string;
  className?: string;
};

const CONFIG: Record<FireDangerRating, { label: string; bg: string; text: string }> = {
  'no-rating':    { label: 'No Rating',    bg: 'bg-fdr-no-rating',    text: 'text-ink-on-warm' },
  'moderate':     { label: 'Moderate',     bg: 'bg-fdr-moderate',     text: 'text-ink-on-warm' },
  'high':         { label: 'High',         bg: 'bg-fdr-high',         text: 'text-ink-on-warm' },
  'extreme':      { label: 'Extreme',      bg: 'bg-fdr-extreme',      text: 'text-ink-on-warm' },
  'catastrophic': { label: 'Catastrophic', bg: 'bg-fdr-catastrophic', text: 'text-ink-on-deep' },
};

export function FireDangerBadge({ rating, size = 'md', children, className }: FireDangerBadgeProps) {
  if (!RATINGS.includes(rating as FireDangerRating)) {
    console.error(`FireDangerBadge: unknown rating "${rating}" — must be one of: ${RATINGS.join(', ')}`);
    return null;
  }
  const { label, bg, text } = CONFIG[rating as FireDangerRating];
  const sizeClass = size === 'lg' ? 'px-3 py-1.5 label' : 'px-2 py-0.5 control-sm';
  return (
    <span
      className={`${className ?? ''} ${bg} ${text} ${sizeClass} inline-flex items-center rounded-sm border border-border font-medium`.trim()}
      aria-label={`Fire danger: ${children ?? label}`}
    >
      {children ?? label}
    </span>
  );
}
