import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      port: 5173,
      clientPort: 443,
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
    disabled: true,
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
      external: []
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