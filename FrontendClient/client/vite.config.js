import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: process.cwd(),
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,

    allowedHosts: [
      'restpoint.co.ke',
      'app.restpoint.co.ke',
      'localhost'
    ],
    cors: true,
    watch: {
      usePolling: true,
      interval: 250,
    },
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
      '/api/v1/restpoint/chemicals': {
        target: 'http://localhost:5016',
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('@mui')) return 'vendor-mui'
            if (id.includes('fabric')) return 'vendor-fabric'
            if (id.includes('@fullcalendar')) return 'vendor-calendar'
            if (id.includes('pdf')) return 'vendor-pdf'
            if (id.includes('recharts')) return 'vendor-charts'
            if (
              id.includes('lodash') ||
              id.includes('moment') ||
              id.includes('date-fns')
            ) return 'vendor-utils'

            return 'vendor'
          }
        }
      },
    },
    manifest: true,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})








