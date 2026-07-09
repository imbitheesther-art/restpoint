import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          // React
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'react-vendor';
          }

          // Bootstrap
          if (
            id.includes('/react-bootstrap/') ||
            id.includes('/bootstrap/')
          ) {
            return 'ui-vendor';
          }

          // Charts
          if (
            id.includes('/chart.js/') ||
            id.includes('/react-chartjs-2/') ||
            id.includes('/recharts/')
          ) {
            return 'chart-vendor';
          }

          // React Query
          if (id.includes('/@tanstack/react-query/')) {
            return 'query-vendor';
          }

          // Socket.io
          if (id.includes('/socket.io-client/')) {
            return 'socket-vendor';
          }

          // Everything else
          return 'vendor';
        },
      },
    },

    minify: 'terser',

    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },

    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
    ],
    exclude: [
      'jquery',
    ],
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});