import { Button as RACButton, composeRenderProps, type ButtonProps } from 'react-aria-components';

export type BitButtonProps = ButtonProps & { variant?: 'primary' | 'secondary' };

const focusRing =
  'outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring';

const variants = {
  primary: 'bg-signal text-on-signal border-signal data-[hovered]:bg-signal-hover data-[pressed]:bg-signal-hover',
  secondary: 'bg-surface-raised text-ink border-border data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-inset',
};

function Spinner() {
  return <span aria-hidden className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function Button({ variant = 'primary', className, children, ...props }: BitButtonProps) {
  return (
    <RACButton
      {...props}
      aria-busy={props.isPending ? true : undefined}
      className={composeRenderProps(
        className,
        (c) =>
          `${c ?? ''} body-sm inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 font-normal! cursor-default ${variants[variant]} data-[pressed]:translate-y-px ${focusRing} data-[disabled]:opacity-(--opacity-disabled) data-[disabled]:cursor-not-allowed data-[pending]:cursor-progress`,
      )}
    >
      {composeRenderProps(children, (c, { isPending }) => (
        <>
          {isPending && <Spinner />}
          {c}
        </>
      ))}
    </RACButton>
  );
}
