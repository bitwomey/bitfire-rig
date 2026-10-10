import type { ReactNode } from 'react';
import { Switch as RACSwitch, type SwitchProps } from 'react-aria-components';
import { dim, groupRing } from './field';

export type BitSwitchProps = Omit<SwitchProps, 'className' | 'children'> & { children: ReactNode; className?: string };

export function Switch({ children, className, ...props }: BitSwitchProps) {
  return (
    <RACSwitch {...props} className={`group flex items-center gap-2 ${dim} ${className ?? ''}`}>
      <span
        data-indicator
        className={`flex h-6 w-10 shrink-0 items-center rounded-full border border-border bg-surface-inset px-0.5 group-data-[selected]:border-signal group-data-[selected]:bg-signal-wash group-data-[hovered]:bg-surface-hover ${groupRing}`}
      >
        {/* The knob moves as well as changes colour, so state is not carried by colour alone. */}
        <span className="size-4 rounded-full bg-ink-muted transition-transform group-data-[selected]:translate-x-4 group-data-[selected]:bg-signal" />
      </span>
      <span className="body text-ink">{children}</span>
    </RACSwitch>
  );
}
