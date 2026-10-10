import type { ReactNode } from 'react';
import { FieldError, Label, ListBoxItem, Text, type ListBoxItemProps } from 'react-aria-components';

// Shared internals for the form controls: one field look (label above, control,
// description or error beneath), one focus ring, one popover. Class strings live
// here once; the components compose them.

// Tailwind 4: outline-none sets the style to none, so the ring needs outline-solid.
export const focusRing =
  'outline-none data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring';
// Same ring, drawn on a child indicator from the parent label's state (checkbox, radio, switch).
export const groupRing =
  'group-data-[focus-visible]:outline-solid group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-focus-ring';
export const dim = 'data-[disabled]:opacity-(--opacity-disabled) data-[disabled]:cursor-not-allowed';
// `group` lets the control read root-level state (invalid, readonly) it does not get itself.
export const fieldCls = 'group flex flex-col gap-1';
// ink-muted, not ink-subtle: ink-subtle on the inset fill is 4.44:1 in light (axe), below 4.5.
// Invalid is the danger border at double width, so colour is not the only carrier.
export const controlCls = `body box-border h-10 w-full rounded-sm border border-border bg-surface-inset px-3 text-ink placeholder:text-ink-muted data-[hovered]:bg-surface-hover group-data-[invalid]:border-2 group-data-[invalid]:border-status-danger group-data-[readonly]:border-dashed group-data-[readonly]:bg-surface ${dim} ${focusRing}`;

export type FieldText = { label: ReactNode; description?: ReactNode; error?: string; className?: string };

export function FieldParts({ label, description, error, children }: Omit<FieldText, 'className'> & { children: ReactNode }) {
  return (
    <>
      <Label className="label text-ink group-data-[disabled]:opacity-(--opacity-disabled)">{label}</Label>
      {children}
      {description && (
        <Text slot="description" className="body-sm text-ink-muted">
          {description}
        </Text>
      )}
      <FieldError className="body-sm text-status-danger">{error}</FieldError>
    </>
  );
}

export const popoverCls =
  'z-(--z-dropdown) w-(--trigger-width) rounded-md border border-border bg-surface-raised shadow-[var(--shadow-md)]';
export const listBoxCls = 'max-h-64 overflow-auto py-1 outline-none';

export function Caret() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 6 8 10.5 12.5 6" />
    </svg>
  );
}

export function CheckMark() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

export function Option({ children, ...p }: Omit<ListBoxItemProps, 'children'> & { children: string }) {
  return (
    <ListBoxItem
      {...p}
      textValue={children}
      className="body flex cursor-default items-center justify-between gap-2 px-3 py-2 text-ink outline-none data-[focused]:bg-signal-wash data-[hovered]:bg-surface-hover"
    >
      {({ isSelected }) => (
        <>
          {children}
          {isSelected && <CheckMark />}
        </>
      )}
    </ListBoxItem>
  );
}
