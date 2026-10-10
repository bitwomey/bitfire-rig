// Library build, kept apart from vite.config.ts so Storybook and Vitest are
// untouched. `vite build -c vite.lib.config.ts` emits dist/index.js (ESM);
// `--mode styles` emits dist/styles.css from src/styles.entry.css.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ mode }) =>
  mode === 'styles'
    ? {
        plugins: [tailwindcss()],
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          cssMinify: false,
          rollupOptions: {
            input: here('./src/styles.entry.css'),
            output: { assetFileNames: 'styles.css' },
          },
        },
      }
    : {
        plugins: [react()],
        build: {
          outDir: 'dist',
          emptyOutDir: true,
          lib: { entry: here('./src/index.ts'), formats: ['es'], fileName: 'index' },
          rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime', 'react-aria-components', /^@bitfire\/tokens(\/.*)?$/],
          },
        },
      },
);
