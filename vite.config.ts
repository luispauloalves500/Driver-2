import { defineConfig } from 'vite';

// Base path for GitHub Pages: https://luispauloalves500.github.io/wellman/
export default defineConfig({
  base: '/wellman/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'esnext',
  },
  server: {
    port: 5173,
    open: true,
  },
});
