import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // tokens.css lives outside this project root, two levels up in packages/
  server: { fs: { allow: ['../../..'] } },
});
