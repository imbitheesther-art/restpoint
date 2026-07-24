import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(),
    // Enable gzip/brotli compression for production builds
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files > 1KB
      minRatio: 0.8,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      minRatio: 0.8,
    }),
  ],
  base: '/',

  // Ensure @vkhangstack/veloqr and other libraries use the app's React instance
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Force libraries to use the app's React to avoid "Invalid hook call" errors
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },

  build: {

    // React core - always separate
    if(
      id.includes('/react/') ||
        id.includes('/react-dom/') ||
        id.includes('/react-router-dom/')
          ) {
  return 'react-vendor';
}

// UI Framework (Bootstrap, MUI, styled-components)
if (
  id.includes('/react-bootstrap/') ||
  id.includes('/bootstrap/') ||
  id.includes('/@mui/') ||
  id.includes('/styled-components/') ||
  id.includes('/@emotion/')
) {
  return 'ui-vendor';
}

// Charts - separate chunk
if (
  id.includes('/chart.js/') ||
  id.includes('/react-chartjs-2/') ||
  id.includes('/recharts/') ||
  id.includes('/react-gauge-chart/')
) {
  return 'chart-vendor';
}

// State management and data fetching
if (
  id.includes('/@tanstack/react-query/') ||
  id.includes('/zustand/') ||
  id.includes('/axios/')
) {
  return 'state-vendor';
}

// Socket.io - separate chunk
if (id.includes('/socket.io-client/')) {
  return 'socket-vendor';
}

// Date/time libraries
if (
  id.includes('/moment/') ||
  id.includes('/date-fns/')
) {
  return 'date-vendor';
}

// PDF and document handling
if (
  id.includes('/pdfjs-dist/') ||
  id.includes('/react-pdf/') ||
  id.includes('/react-to-print/')
) {
  return 'pdf-vendor';
}

// Heavy libraries that can be split
if (
  id.includes('/fabric/') ||
  id.includes('/framer-motion/') ||
  id.includes('/react-webcam/') ||
  id.includes('/react-big-calendar/') ||
  id.includes('/@fullcalendar/')
) {
  return 'heavy-vendor';
}

// Everything else
return 'vendor';
        },

// Optimize chunk naming for caching
chunkFileNames: (chunkInfo) => {
  const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.\w+$/, '') : 'chunk';
  return `assets/${facadeModuleId}-[hash].js`;
},

  // Keep entry point names clean
  entryFileNames: 'assets/[name]-[hash].js',

    // Asset file naming
    assetFileNames: (assetInfo) => {
      const info = assetInfo.name.split('.');
      const ext = info[info.length - 1];
      if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
        return `assets/images/[name]-[hash][extname]`;
      } else if (/woff2?|eot|ttf|otf/i.test(ext)) {
        return `assets/fonts/[name]-[hash][extname]`;
      } else if (/css/i.test(ext)) {
        return `assets/css/[name]-[hash][extname]`;
      }
      return `assets/[name]-[hash][extname]`;
    },
      },
    },

// Use esbuild for faster minification (better than terser for most cases)
minify: 'esbuild',

  // Enable CSS code splitting
  cssCodeSplit: true,

    // Tree shaking is enabled by default in Vite
    // Additional optimizations
    reportCompressedSize: false, // Faster builds

      // Source map for production debugging (optional, can be disabled)
      sourcemap: false,
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
      '@vkhangstack/veloqr',
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
