import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  root: './demo',
  server: {
    port: 6060,
  },
  plugins: [
    react(),
    svgr({
      exportAsDefault: false,
    }),
  ],
});
