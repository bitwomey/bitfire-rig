import type { StorybookConfig } from '@storybook/react-vite';

// A11Y_PROOF=1 swaps the story set for the deliberately broken proof story.
// The workbench itself never sets it, so the proof stays out of the sidebar.
const proof = process.env.A11Y_PROOF === '1';

const config: StorybookConfig = {
  stories: proof ? ['../proof/**/*.stories.@(ts|tsx)'] : ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest', '@storybook/addon-themes'],
  framework: '@storybook/react-vite',
};
export default config;
