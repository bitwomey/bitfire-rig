import type { StorybookConfig } from '@storybook/react-vite';

// A11Y_PROOF=<file stem> swaps the story set for one deliberately broken proof
// story in ../proof/<stem>.stories.tsx. The workbench never sets it, so the
// proofs stay out of the sidebar.
const proof = process.env.A11Y_PROOF;
if (proof && !/^[a-z0-9-]+$/.test(proof)) throw new Error(`A11Y_PROOF must be a proof file stem, got "${proof}"`);

const config: StorybookConfig = {
  stories: proof ? [`../proof/${proof}.stories.tsx`] : ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest', '@storybook/addon-themes'],
  framework: '@storybook/react-vite',
};
export default config;
