import type { ReactNode } from 'react';
import { Toolbar as RACToolbar } from 'react-aria-components';

export type ToolbarVariant = 'docked' | 'overlay';

export type ToolbarProps = {
  children: ReactNode;
  /** 'docked': full-width bar with bottom border (default). 'overlay': floating card with shadow. */
  variant?: ToolbarVariant;
  /** Accessible label for the toolbar region. */
  label?: string;
  className?: string;
};

export function Toolbar({ children, variant = 'docked', label, className }: ToolbarProps) {
  const shell =
    variant === 'overlay'
      ? 'bg-surface-raised shadow-panel rounded-lg z-[var(--z-map-overlay)] p-1'
      : 'bg-surface-raised border-b border-hairline px-2 py-1';

  return (
    <RACToolbar
      aria-label={label}
      className={`${className ?? ''} ${shell} flex items-center gap-1`.trim()}
    >
      {children}
    </RACToolbar>
  );
}

/** Place after a group of Toolbar children to push subsequent children to the trailing end. */
export function ToolbarSpacer() {
  return <span className="flex-1" aria-hidden />;
}
