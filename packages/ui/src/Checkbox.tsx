import { useId, type ReactNode } from 'react';
import { Checkbox as RACCheckbox, type CheckboxProps } from 'react-aria-components';
import { CheckMark, dim, groupRing } from './field';

export type BitCheckboxProps = Omit<CheckboxProps, 'className' | 'children'> & { children: ReactNode; error?: string; className?: string };

export function Checkbox({ children, error, className, ...props }: BitCheckboxProps) {
  const errorId = useId();
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <RACCheckbox
        {...props}
        isInvalid={props.isInvalid || !!error}
        aria-describedby={[props['aria-describedby'], error && errorId].filter(Boolean).join(' ') || undefined}
        className={`group flex items-center gap-2 ${dim}`}
      >
        {({ isSelected, isIndeterminate }) => (
          <>
            <span
              data-indicator
              className={`flex size-5 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-inset group-data-[invalid]:border-2 group-data-[invalid]:border-status-danger group-data-[selected]:border-signal group-data-[selected]:bg-signal group-data-[selected]:text-on-signal group-data-[indeterminate]:border-signal group-data-[indeterminate]:bg-signal group-data-[indeterminate]:text-on-signal group-data-[hovered]:bg-surface-hover ${groupRing}`}
            >
              {isIndeterminate ? <span className="h-0.5 w-2.5 rounded-full bg-current" /> : isSelected && <CheckMark />}
            </span>
            <span className="body text-ink">{children}</span>
          </>
        )}
      </RACCheckbox>
      {error && (
        <p id={errorId} className="body-sm text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
}
