import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600, // Phaser is a large single dependency
  },
  server: {
    host: true,
    open: true,
  },
});
