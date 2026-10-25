import { defineConfig } from 'vite';

// Change '/wheelman-four-cities/' to your GitHub repo name if different
// For user.github.io root, use base: '/'
export default defineConfig({
  base: '/wheelman-four-cities/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
});
