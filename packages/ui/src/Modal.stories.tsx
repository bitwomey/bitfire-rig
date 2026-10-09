import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, Label, TextField } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './Button';
import { DialogTrigger, Modal } from './Modal';

const meta = { title: 'Modal', component: Modal } satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

// The dialog is portalled to <body>, outside the story canvas.
const body = () => within(document.body);
const trigger = async (canvasElement: HTMLElement) => within(canvasElement).getAllByRole('button', { name: /open/i })[0];
const openIt = async (canvasElement: HTMLElement) => {
  const t = await trigger(canvasElement);
  await userEvent.click(t);
  return { t, dialog: await body().findByRole('dialog') };
};

const field = (
  <TextField className="flex flex-col gap-1">
    <Label className="label text-ink">Region name</Label>
    {/* autoFocus: initial focus goes to this input, deliberately, not to the dialog container. */}
    <Input autoFocus className="body h-10 w-full rounded-sm border border-border bg-surface-inset px-3 text-ink outline-none data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring" />
  </TextField>
);

const render = (modal: () => React.ReactElement): Story['render'] => () => (
  <DialogTrigger>
    <Button>Open dialog</Button>
    {modal()}
  </DialogTrigger>
);

const closeBtn = (autoFocus = false) => (
  <Button variant="secondary" slot="close" autoFocus={autoFocus}>Cancel</Button>
);

const Basic = () => (
  <Modal title="Archive this run" description="The run stays in the history and can be restored later." actions={<>{closeBtn(true)}<Button slot="close">Archive</Button></>}>
    <p className="body text-ink">Archived runs are hidden from the default view.</p>
  </Modal>
);
const WithForm = () => (
  <Modal title="Rename region" actions={<>{closeBtn()}<Button slot="close">Save</Button></>}>
    {field}
  </Modal>
);
const Confirm = () => (
  <Modal title="Delete this run" description="This cannot be undone." actions={<>{closeBtn(true)}<Button slot="close" className="bg-status-danger! border-status-danger! text-canvas!">Confirm delete</Button></>} />
);

// Closed: only the trigger is rendered, no dialog.
export const Closed: Story = {
  render: render(Basic),
  play: async ({ canvasElement }) => {
    await expect(body().queryByRole('dialog')).toBeNull();
    await expect(await trigger(canvasElement)).toBeVisible();
  },
};

// Open: initial focus lands on the Cancel button (autoFocus), a control, not the container.
// The dialog is left open so axe checks it; the background must be hidden from the a11y tree.
export const Open: Story = {
  render: render(Basic),
  play: async ({ canvasElement }) => {
    const { t, dialog } = await openIt(canvasElement);
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' })));
    await expect(document.activeElement).not.toBe(dialog);
    // The description is tied to the dialog, so assistive technology reads it on open.
    await expect(dialog).toHaveAccessibleDescription('The run stays in the history and can be restored later.');
    // Background inert: React Aria 1.22 marks everything outside the dialog `inert` (not aria-hidden),
    // so testing-library's role queries still see the trigger; assert the attribute itself.
    await waitFor(() => expect(t.closest('[inert]')).not.toBeNull());
    await expect(dialog.closest('[inert]')).toBeNull();
    // The scrim paints (the scrim token, not transparent).
    const overlay = dialog.closest('[class*="bg-scrim"]') as HTMLElement;
    await expect(getComputedStyle(overlay).backgroundColor).not.toMatch(/, 0\)$/); // not fully transparent
  },
};

// OpenWithForm: initial focus goes to the labelled input, via autoFocus on it.
export const OpenWithForm: Story = {
  render: render(WithForm),
  play: async ({ canvasElement }) => {
    const { dialog } = await openIt(canvasElement);
    const input = within(dialog).getByRole('textbox', { name: 'Region name' });
    await waitFor(() => expect(document.activeElement).toBe(input));
    // The focus ring paints on the input.
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect(getComputedStyle(input).outlineStyle).not.toBe('none');
    await expect(getComputedStyle(input).outlineWidth).not.toBe('0px');
  },
};

export const Confirm_: Story = {
  name: 'Confirm',
  render: render(Confirm),
  play: async ({ canvasElement }) => {
    const { dialog } = await openIt(canvasElement);
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' })));
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Confirm delete' })).toBeVisible());
  },
};

// Tab and Shift+Tab never leave the dialog, in both directions, more times than there are controls.
export const FocusStaysInside: Story = {
  render: render(WithForm),
  play: async ({ canvasElement }) => {
    const { dialog } = await openIt(canvasElement);
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await userEvent.tab({ shift: true });
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }
  },
};

export const EscapeCloses: Story = {
  render: render(Basic),
  play: async ({ canvasElement }) => {
    const { t } = await openIt(canvasElement);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(t)); // focus returns to the opener
  },
};

export const CancelCloses: Story = {
  render: render(Confirm),
  play: async ({ canvasElement }) => {
    const { t, dialog } = await openIt(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(t));
    // Background is live again.
    await expect(body().getAllByRole('button', { name: /open dialog/i }).length).toBeGreaterThan(0);
  },
};
