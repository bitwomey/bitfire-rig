import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/theme.css';

// Under Vitest the mode is 'test'; there every story renders in both themes at
// once so one axe run covers both. In the workbench the toolbar picks one theme
// (or add ?globals=bothThemes:true to the URL to see both).
const bothThemes = import.meta.env.MODE === 'test';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
  initialGlobals: { bothThemes },
  globalTypes: { bothThemes: { description: 'Render each story in dark and light at once' } },
  decorators: [
    withThemeByDataAttribute({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
    }),
    (Story, { globals }) =>
      globals.bothThemes ? (
        <div>
          {['dark', 'light'].map((theme) => (
            <div key={theme} data-theme={theme} className="bg-canvas p-4 text-ink">
              <Story />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4">
          <Story />
        </div>
      ),
  ],
};
export default preview;
