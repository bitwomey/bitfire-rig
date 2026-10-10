import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const meta = {
  title: 'Tabs',
  component: Tabs,
  args: { 'aria-label': 'Run details' },
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Run details">
        <Tab id="overview">Overview</Tab>
        <Tab id="inputs" isDisabled={args.disabledKeys?.includes('inputs')}>Inputs</Tab>
        <Tab id="outputs">Outputs</Tab>
      </TabList>
      <TabPanel id="overview">Run overview and status.</TabPanel>
      <TabPanel id="inputs">Weather and fuel inputs.</TabPanel>
      <TabPanel id="outputs">Spread and arrival outputs.</TabPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

const tabs = (el: HTMLElement) => within(el).getAllByRole('tab');
// The production build renders the collection a tick after the story mounts, so wait for the tabs and the selection before any sync query.
const ready = (el: HTMLElement) => waitFor(() => { expect(tabs(el).length).toBe(3); expect(selected(el).length).toBe(1); });
const selected = (el: HTMLElement) => tabs(el).filter((t) => t.getAttribute('aria-selected') === 'true');

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    await expect(selected(canvasElement)[0]).toHaveTextContent('Overview');
    // Not colour only: the selected tab has a 2px (stroke-mark) bottom border, the others none visible.
    const s = getComputedStyle(selected(canvasElement)[0]);
    await expect(s.borderBottomWidth).toBe('2px');
    await expect(s.borderBottomStyle).not.toBe('none');
  },
};

export const SecondSelected: Story = {
  args: { defaultSelectedKey: 'inputs' },
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    await expect(selected(canvasElement)[0]).toHaveTextContent('Inputs');
    await expect(within(canvasElement).getAllByRole('tabpanel')[0]).toHaveTextContent('Weather and fuel inputs.');
  },
};

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    await userEvent.tab();
    const t = selected(canvasElement)[0];
    await expect(document.activeElement).toBe(t);
    await expect(getComputedStyle(t).outlineStyle).not.toBe('none');
    await expect(getComputedStyle(t).outlineWidth).not.toBe('0px');
  },
};

export const DisabledTab: Story = {
  args: { disabledKeys: ['inputs'] },
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    const t = tabs(canvasElement).find((x) => x.textContent === 'Inputs')!;
    await expect(t).toHaveAttribute('aria-disabled', 'true');
    await expect(Number(getComputedStyle(t).opacity)).toBeLessThan(1);
  },
};

export const KeyboardArrow: Story = {
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    // Automatic activation: arrow moves both focus and selection.
    await waitFor(() => expect(selected(canvasElement)[0]).toHaveTextContent('Inputs'));
    await expect(document.activeElement).toHaveTextContent('Inputs');
  },
};
