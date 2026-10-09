import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/theme.css';

// Under Vitest the mode is 'test' and VITE_A11Y_THEME ('dark' or 'light')
// picks the theme for the whole run, set on the document. That matters for
// content React Aria portals into <body> (popovers, listboxes, dialogs): it
// inherits the document theme, so it is checked in the theme under test.
// check-a11y.mjs runs the stories once per theme. In the workbench the toolbar
// picks the theme.
const testTheme = import.meta.env.VITE_A11Y_THEME === 'light' ? 'light' : 'dark';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
  initialGlobals: import.meta.env.MODE === 'test' ? { theme: testTheme } : {},
  decorators: [
    withThemeByDataAttribute({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
    }),
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};
export default preview;
