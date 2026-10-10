import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Breadcrumbs, Link, Nav } from './Navigation';

const meta = { title: 'Navigation', component: Link, args: { href: '#runs', children: 'All runs' } } satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

const link = (el: HTMLElement) => within(el).getAllByRole('link')[0];

export const LinkDefault: Story = {};
export const LinkHovered: Story = {
  play: async ({ canvasElement }) => {
    // On a slow CI runner a single simulated hover is sometimes not picked up by
    // React Aria, even after waiting a second. Re-issue it (leave, then enter)
    // until the attribute appears, rather than waiting on one attempt.
    await waitFor(
      async () => {
        await userEvent.unhover(link(canvasElement));
        await userEvent.hover(link(canvasElement));
        await expect(link(canvasElement)).toHaveAttribute('data-hovered', 'true');
      },
      { timeout: 8000, interval: 250 },
    );
    await waitFor(() => expect(getComputedStyle(link(canvasElement)).textDecorationThickness).toBe('2px'));
  },
};
export const LinkFocusVisible: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(getComputedStyle(link(canvasElement)).outlineStyle).not.toBe('none');
    await expect(getComputedStyle(link(canvasElement)).outlineWidth).not.toBe('0px');
  },
};
export const LinkCurrent: Story = {
  args: { 'aria-current': 'page' },
  play: async ({ canvasElement }) => {
    await expect(link(canvasElement)).toHaveAttribute('aria-current', 'page');
    // Current is not signalled by colour alone: the underline is removed.
    await expect(getComputedStyle(link(canvasElement)).textDecorationLine).toBe('none');
  },
};
export const LinkDisabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(link(canvasElement)).toHaveAttribute('aria-disabled', 'true');
    await expect(Number(getComputedStyle(link(canvasElement)).opacity)).toBeLessThan(1);
  },
};

export const BreadcrumbsDefault: Story = {
  render: () => <Breadcrumbs aria-label="Breadcrumb" items={[{ label: 'Runs', href: '#runs' }, { label: 'Region 12', href: '#r12' }, { label: 'Spread output' }]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getAllByRole('link').length).toBe(2)); // the current crumb is not a link; waits for the collection (production build)
    const cur = c.getByText('Spread output');
    await expect(cur).toHaveAttribute('aria-current', 'page');
    await expect(cur.closest('a')).toBeNull();
  },
};

const items = [
  { label: 'Runs', href: '#runs', current: true },
  { label: 'Regions', href: '#regions' },
  { label: 'Settings', href: '#settings' },
];
export const NavHorizontal: Story = {
  render: () => <Nav label="Primary" items={items} />,
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getAllByRole('navigation')[0];
    await expect(within(nav).getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page').length).toBe(1);
  },
};
export const NavStacked: Story = {
  render: () => <Nav label="Primary" orientation="stacked" items={items} />,
  play: async ({ canvasElement }) => {
    const links = within(within(canvasElement).getAllByRole('navigation')[0]).getAllByRole('link');
    await expect(links[1].getBoundingClientRect().top).toBeGreaterThan(links[0].getBoundingClientRect().top);
  },
};
