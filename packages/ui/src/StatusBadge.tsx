import type { ReactNode } from 'react';

export type StatusTone = 'ok' | 'warn' | 'danger' | 'info';

export type StatusBadgeProps = {
  /** Severity level. */
  tone?: StatusTone;
  /** Whether resources are actively suppressing. true = filled dot; false = hollow ring. */
  suppressing?: boolean;
  /** Replaces the default word (Nominal / Caution / Critical / Notice). */
  children?: ReactNode;
  /** Drop the wash ground for dense contexts (table cells, toolbars). */
  bare?: boolean;
  className?: string;
};

const TONES: readonly StatusTone[] = ['ok', 'warn', 'danger', 'info'];

const DEFAULT_WORDS: Record<StatusTone, string> = {
  ok: 'Nominal',
  warn: 'Caution',
  danger: 'Critical',
  info: 'Notice',
};

// Wash tokens exist for ok/warn/danger. info has no wash token: it renders
// flat (dot + word on the surrounding surface) whether bare or not.
const WASH: Partial<Record<StatusTone, string>> = {
  ok: 'bg-status-ok-wash',
  warn: 'bg-status-warn-wash',
  danger: 'bg-status-danger-wash',
};

const isTone = (t: unknown): t is StatusTone =>
  typeof t === 'string' && (TONES as readonly string[]).includes(t);

export function StatusBadge({ tone, suppressing = true, children, bare = false, className }: StatusBadgeProps) {
  const key: StatusTone = isTone(tone) ? tone : 'ok';
  const wash = !bare ? (WASH[key] ?? '') : '';
  // Dot: 8 px circle. Filled when suppressing, hollow ring otherwise. Both channels always
  // carry a word, so the fill is a second channel, never the only one.
  const dot = suppressing
    ? `size-2 rounded-full bg-status-${key}`
    : `size-2 rounded-full border-2 border-status-${key}`;
  return (
    <span
      data-tone={key}
      className={`${className ?? ''} caption inline-flex items-center gap-1.5 text-ink${wash ? ` rounded-sm ${wash} px-2 py-0.5` : ''}`}
    >
      <span aria-hidden className={`inline-block shrink-0 ${dot}`} />
      <span>{children ?? DEFAULT_WORDS[key]}</span>
    </span>
  );
}
