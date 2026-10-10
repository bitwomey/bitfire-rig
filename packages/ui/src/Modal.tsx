import { useId, type ReactNode } from 'react';
import { Dialog, DialogTrigger, Heading, Modal as RACModal, ModalOverlay, type ModalOverlayProps } from 'react-aria-components';

export { DialogTrigger };

export type BitModalProps = Omit<ModalOverlayProps, 'children'> & {
  title: ReactNode;
  description?: ReactNode;
  /** Footer actions, usually Buttons. Use `slot="close"` on a Button to close the dialog. */
  actions: ReactNode;
  children?: ReactNode;
};

// Initial focus: React Aria focuses the Dialog container unless a child has
// autoFocus. Callers put `autoFocus` on the control that should receive it
// (an input in the body, or the safe action in the footer).
export function Modal({ title, description, actions, children, className, ...props }: BitModalProps) {
  const descriptionId = useId();
  return (
    <ModalOverlay
      {...props}
      className={`fixed inset-0 z-(--z-modal) flex items-center justify-center bg-scrim p-4 ${className ?? ''}`}
    >
      <RACModal className="w-full max-w-md rounded-lg border border-border-hairline bg-surface-raised shadow-[var(--shadow-lg)]">
        <Dialog aria-describedby={description ? descriptionId : undefined} className="flex flex-col gap-4 p-6 outline-none">
          <Heading slot="title" className="body-lg m-0 font-normal! text-ink">
            {title}
          </Heading>
          {description && <p id={descriptionId} className="body m-0 text-ink-muted">{description}</p>}
          {children}
          <div className="flex justify-end gap-2">{actions}</div>
        </Dialog>
      </RACModal>
    </ModalOverlay>
  );
}
