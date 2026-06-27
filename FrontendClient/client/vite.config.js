import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      timeout: 120000
    },
    allowedHosts: [
      'restpoint.co.ke',
      'app.restpoint.co.ke',
      'localhost'
    ],
    cors: true,
    fs: {
      strict: false,
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5013',
        ws: true,
        changeOrigin: true,
      },
    }
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [],
    exclude: [
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
      'moment'
    ]
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-fabric': ['fabric'],
          'vendor-calendar': ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
          'vendor-pdf': ['pdfjs-dist', 'react-pdf'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['lodash', 'moment', 'date-fns'],
        },
      },
    },
    // Enable cache busting with content hashes
    manifest: true,
    // Set shorter cache TTL for assets
    assetsInlineLimit: 4096,
    // Generate unique filenames with hashes
    cssCodeSplit: true,
    // Minification with cache busting
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})