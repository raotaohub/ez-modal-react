import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './demo',
  server: {
    port: 6060,
  },
  plugins: [react()],
});
