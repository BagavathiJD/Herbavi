import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const adminRoot = path.join(__dirname, 'admin');

  return {
    root: adminRoot,
    base: '/admin/',
    build: {
      outDir: path.join(__dirname, 'dist'),
      emptyOutDir: true,
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // Ensure both admin and user source import the same React instance
        react: path.resolve(__dirname, 'node_modules', 'react'),
        'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
        'react-dom/client': path.resolve(__dirname, 'node_modules', 'react-dom', 'client'),
        'react-router-dom': path.resolve(__dirname, 'node_modules', 'react-router-dom'),
      },
      dedupe: ["react", "react-dom", "react-router-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: {
        port: process.env.WS_PORT ? Number(process.env.WS_PORT) : undefined,
        host: 'localhost',
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        usePolling: true,
        interval: 100,
        ignored: [
          path.join(__dirname, 'data'),
          path.join(__dirname, 'data', '**'),
          path.join(__dirname, 'src', 'db.json'),
          path.join(__dirname, 'user', 'dist'),
          path.join(__dirname, 'user', 'dist', '**'),
        ],
      },
    },
  };
});
