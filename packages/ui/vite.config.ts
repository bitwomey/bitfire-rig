import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // @bitfire/tokens is a sibling workspace, linked from the repo root.
  server: { fs: { allow: ['../..'] } },
});
