import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/user/',
  plugins: [react()],
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
});
