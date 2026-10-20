import type { ReactNode } from 'react';
import { Button } from 'react-aria-components';

export type AlertTone = 'ok' | 'warn' | 'danger' | 'info';

export type AlertBannerProps = {
  tone?: AlertTone;
  /** Short title line. */
  title?: ReactNode;
  /** Unicode glyph or emoji placed before the text. */
  glyph?: string;
  /**
   * Supply to render a dismiss control.
   * Omit for anything safety-critical — a Catastrophic declaration stays
   * until it lapses.
   */
  onDismiss?: () => void;
  children?: ReactNode;
  className?: string;
};

const TONES: readonly AlertTone[] = ['ok', 'warn', 'danger', 'info'];
const isTone = (t: unknown): t is AlertTone =>
  typeof t === 'string' && (TONES as readonly string[]).includes(t);

// danger = assertive live region; warn/ok = polite; info = none (not actionable).
const ROLE: Record<AlertTone, 'alert' | 'status' | undefined> = {
  danger: 'alert',
  warn: 'status',
  ok: 'status',
  info: undefined,
};

export function AlertBanner({ tone, title, glyph, onDismiss, children, className }: AlertBannerProps) {
  const key: AlertTone = isTone(tone) ? tone : 'ok';
  return (
    <div
      role={ROLE[key]}
      className={`${className ?? ''} flex w-full items-start gap-3 bg-surface-raised px-4 py-3 text-ink`}
      style={{
        borderLeftWidth: 'var(--stroke-heavy)',
        borderLeftStyle: 'solid',
        borderLeftColor: `var(--status-${key})`,
      }}
    >
      {glyph && (
        <span aria-hidden className="mt-0.5 shrink-0 text-lg leading-none">{glyph}</span>
      )}
      <div className="min-w-0 flex-1">
        {title && <p className="label">{title}</p>}
        {children && <p className="body-sm text-ink-muted">{children}</p>}
      </div>
      {onDismiss && (
        <Button
          aria-label="Dismiss"
          onPress={onDismiss}
          className="mt-0.5 shrink-0 rounded-sm px-1 text-ink-muted outline-none hover:text-ink data-[focus-visible]:outline-2 data-[focus-visible]:outline-solid data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring"
        >
          ×
        </Button>
      )}
    </div>
  );
}
