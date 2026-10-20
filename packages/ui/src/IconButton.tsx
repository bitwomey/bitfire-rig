import type { ReactNode } from 'react';
import { Button as RACButton, composeRenderProps } from 'react-aria-components';

export type IconButtonProps = {
  /** Required accessible name — becomes aria-label and the tooltip. There is no visible label. */
  label: string;
  /** The icon to render. Pass any ReactNode (e.g. a Phosphor icon element). */
  glyph: ReactNode;
  /** Add a visible border — use when the button sits on canvas or over a map. */
  bordered?: boolean;
  /** Toggle state. Renders the signal-wash ground and sets aria-pressed. */
  on?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

const focusRing =
  'outline-none data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring';

export function IconButton({ label, glyph, bordered = false, on = false, disabled, onClick, className }: IconButtonProps) {
  return (
    <RACButton
      aria-label={label}
      aria-pressed={on}
      title={label}
      isDisabled={disabled}
      onPress={onClick as unknown as () => void}
      className={composeRenderProps(
        className,
        (c) =>
          `${c ?? ''} inline-flex h-9 w-9 items-center justify-center rounded-md cursor-default ${focusRing} data-[disabled]:opacity-(--opacity-disabled) data-[disabled]:cursor-not-allowed ${on ? 'bg-signal-wash' : 'data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-inset'} ${bordered ? 'border border-border' : ''}`.trim(),
      )}
    >
      <span aria-hidden className="flex items-center justify-center size-5 text-ink">
        {glyph}
      </span>
    </RACButton>
  );
}
