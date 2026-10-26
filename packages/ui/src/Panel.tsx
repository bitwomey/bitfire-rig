import type { ReactNode } from 'react';

export type PanelProps = {
  children: ReactNode;
  /** Header eyebrow text (small label above the title). */
  eyebrow?: string;
  /** Header title. */
  title?: ReactNode;
  /** Header trailing actions (right side of header). */
  actions?: ReactNode;
  /** Footer provenance/credit line. */
  footer?: ReactNode;
  /** Remove rounded corners and shadow — use when Panel tiles flush against container edges. */
  flush?: boolean;
  /** Remove body padding — use when body content provides its own padding (e.g. a table). */
  bodyFlush?: boolean;
  className?: string;
};

export function Panel({
  children,
  eyebrow,
  title,
  actions,
  footer,
  flush = false,
  bodyFlush = false,
  className,
}: PanelProps) {
  const hasHeader = eyebrow || title || actions;
  const shell = flush
    ? 'bg-surface-raised'
    : 'bg-surface-raised rounded-lg shadow-[var(--shadow-panel)]';

  return (
    <div className={`${className ?? ''} ${shell} flex flex-col`.trim()}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 border-b border-border-hairline px-4 py-3">
          <div className="flex flex-col gap-0.5">
            {eyebrow && <p className="eyebrow text-ink-muted uppercase tracking-wide">{eyebrow}</p>}
            {title && <h3 className="body font-medium text-ink">{title}</h3>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={bodyFlush ? 'flex-1' : 'flex-1 p-4'}>{children}</div>
      {footer && (
        <div className="border-t border-border-hairline px-4 py-2">
          <div className="caption text-ink-muted">{footer}</div>
        </div>
      )}
    </div>
  );
}
