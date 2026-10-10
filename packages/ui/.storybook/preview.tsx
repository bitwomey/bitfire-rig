import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/theme.css';
// Self-hosted IBM Plex, latin subset, only the weights tokens.json uses (sans
// 200/300/400/500, mono 200/300/400, condensed 500, serif 400). Imported here
// and nowhere else: @bitfire/ui ships no font files. Without them text falls
// back to the OS font stack and screenshots differ between machines.
import '@fontsource/ibm-plex-sans/latin-200.css';
import '@fontsource/ibm-plex-sans/latin-300.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-200.css';
import '@fontsource/ibm-plex-mono/latin-300.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-sans-condensed/latin-500.css';
import '@fontsource/ibm-plex-serif/latin-400.css';

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
