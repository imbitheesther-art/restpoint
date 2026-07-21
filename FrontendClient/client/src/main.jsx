import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App'
import './index.css'



// Register Service Worker for PWA functionality
// Register immediately (not on load) to capture beforeinstallprompt event early
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('[PWA] Service Worker registered successfully:', registration.scope);

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 3600000);
    })
    .catch((error) => {
      console.error('[PWA] Service Worker registration failed:', error);
    });

  // Listen for service worker updates - show a notification instead of auto-reloading
  // Auto-reload can cause the app to disappear on mobile devices
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] New service worker activated');
    // Don't auto-reload, let the user continue using the app
    // The new version will be available on next load
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
