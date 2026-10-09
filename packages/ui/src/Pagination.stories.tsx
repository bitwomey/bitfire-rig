import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Pagination, type PaginationProps } from './Pagination';

// Controlled wrapper so the stories behave like a real page; the spy sees every change.
function Controlled({ page: initial, onChange, ...rest }: PaginationProps) {
  const [page, setPage] = useState(initial);
  return (
    <Pagination
      {...rest}
      page={page}
      onChange={(p) => {
        setPage(p);
        onChange(p);
      }}
    />
  );
}

const meta = {
  title: 'Pagination',
  component: Pagination,
  render: (args) => <Controlled {...args} />,
  args: { page: 1, pageCount: 40, onChange: fn() },
} satisfies Meta<typeof Pagination>;
export default meta;

type Story = StoryObj<typeof meta>;

const nav = (el: HTMLElement) => within(el).getAllByRole('navigation', { name: 'Pagination' })[0];

export const FirstPage: Story = {
  args: { page: 1 },
  play: async ({ canvasElement }) => {
    const n = within(nav(canvasElement));
    await expect(n.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await expect(n.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  },
};

export const MiddlePage: Story = {
  args: { page: 10 },
  play: async ({ canvasElement }) => {
    const n = within(nav(canvasElement));
    await expect(n.getByRole('button', { name: 'Page 10' })).toHaveAttribute('aria-current', 'page');
    await expect(n.queryByRole('button', { name: 'Page 5' })).toBeNull();
    await expect(n.getAllByText('…')).toHaveLength(2); // ellipsis both sides
    // Current page is distinguishable by more than colour: it is underlined.
    await expect(getComputedStyle(n.getByRole('button', { name: 'Page 10' })).textDecorationLine).toBe('underline');
    await expect(getComputedStyle(n.getByRole('button', { name: 'Page 9' })).textDecorationLine).toBe('none');
  },
};

export const LastPage: Story = {
  args: { page: 40 },
  play: async ({ canvasElement }) => {
    await expect(within(nav(canvasElement)).getByRole('button', { name: 'Next' })).toBeDisabled();
  },
};

export const FewPages: Story = {
  args: { page: 3, pageCount: 5 },
  play: async ({ canvasElement }) => {
    const n = within(nav(canvasElement));
    await expect(n.getAllByRole('button')).toHaveLength(7); // Previous, 5 pages, Next
    await expect(n.queryByText('…')).toBeNull();
  },
};

export const FocusVisible: Story = {
  args: { page: 3, pageCount: 5 },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const focused = document.activeElement as HTMLElement;
    await expect(nav(canvasElement).contains(focused)).toBe(true);
    const { outlineStyle, outlineWidth } = getComputedStyle(focused);
    await expect(outlineStyle).not.toBe('none');
    await expect(outlineWidth).not.toBe('0px');
  },
};

// Pressing Next into the last page (or Previous into the first) disables the pressed
// button. Keyboard focus must move to the current page, not fall to <body>.
export const FocusSurvivesLastPage: Story = {
  args: { page: 4, pageCount: 5 },
  play: async ({ canvasElement }) => {
    const n = within(nav(canvasElement));
    n.getByRole('button', { name: 'Next' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(n.getByRole('button', { name: 'Page 5' })));
  },
};

export const FocusSurvivesFirstPage: Story = {
  args: { page: 2, pageCount: 5 },
  play: async ({ canvasElement }) => {
    const n = within(nav(canvasElement));
    n.getByRole('button', { name: 'Previous' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(n.getByRole('button', { name: 'Page 1' })));
  },
};

export const KeyboardNavigation: Story = {
  args: { page: 1, pageCount: 5 },
  play: async ({ canvasElement, args }) => {
    // Previous is disabled, so the first stop is the current page, the second is page 2.
    await userEvent.tab();
    await userEvent.tab();
    await expect(document.activeElement).toBe(within(nav(canvasElement)).getByRole('button', { name: 'Page 2' }));
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith(2);
    await expect(within(nav(canvasElement)).getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  },
};

