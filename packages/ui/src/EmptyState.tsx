import type { ReactNode } from 'react';

export type EmptyStateProps = {
  /** Decorative icon (hidden from assistive tech). Use currentColor. */
  icon?: ReactNode;
  heading: string;
  description?: ReactNode;
  /** Optional call to action, usually a Button. */
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  compact?: boolean;
  className?: string;
};

// Static content, not a live region: nothing here is announced on its own.
export function EmptyState({ icon, heading, description, action, headingLevel = 2, compact, className }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as 'h2';
  return (
    <div className={`${className ?? ''} flex flex-col items-center text-center ${compact ? 'gap-2 p-4' : 'gap-3 p-10'}`}>
      {icon && (
        <span aria-hidden className={`text-ink-muted ${compact ? 'size-6' : 'size-10'} [&>svg]:size-full`}>
          {icon}
        </span>
      )}
      <Heading className={`m-0 text-ink ${compact ? 'body-lg' : 'display-md'}`}>{heading}</Heading>
      {description && <p className="body m-0 max-w-prose text-ink-muted">{description}</p>}
      {action && <div className={compact ? 'pt-1' : 'pt-2'}>{action}</div>}
    </div>
  );
}
