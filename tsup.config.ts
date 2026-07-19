import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  tsconfig: 'tsconfig.build.json',
  // The published files are the Next.js client boundary; keep this as their first directive.
  banner: {
    js: "'use client';",
  },
  esbuildOptions: (options) => {
    // Keep compatibility with the declared React 16.8+ peer range.
    options.jsx = 'transform';
  },
});
