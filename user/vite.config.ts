import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => ({
  base: '/',
  plugins: [react()],
  server: {
    hmr: {
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/postal-api': {
        target: 'https://api.postalpincode.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/postal-api/, ''),
      },
    },
    watch:
      process.env.DISABLE_HMR === 'true'
        ? null
        : {
            usePolling: true,
            interval: 100,
            ignored: ['**/dist/**'],
          },
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, '..', 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, '..', 'node_modules', 'react-dom'),
      'react-dom/client': path.resolve(__dirname, '..', 'node_modules', 'react-dom', 'client'),
      'react-router-dom': path.resolve(__dirname, '..', 'node_modules', 'react-router-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}));
