// Service Worker for Rest Point PWA
const CACHE_NAME = 'restpoint-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/logo.png',
  '/cloud.png',
  '/rest1.png',
  '/rest2.png',
  '/flower.jpg',
  '/flower.png',
  '/familyportal.png',
  '/cross.jpg',
  '/image.png',
  '/landing.png',
  '/icons.svg',
  '/pdf.worker.min.js',
  '/assets/',
  '/css/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Caching static assets...');
        // Cache core assets
        try {
          await cache.addAll([
            '/',
            '/manifest.json',
            '/favicon.ico'
          ]);
        } catch (error) {
          console.warn('Failed to cache core assets:', error);
        }
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {
        console.log('Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Skip API requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle tenant path requests - rewrite to root
  let requestUrl = event.request.url;
  if (url.pathname.startsWith('/tenant/')) {
    // Extract the asset path after /tenant/[tenant-slug]/
    const match = url.pathname.match(/^\/tenant\/[^\/]+\/(.+)$/);
    if (match) {
      // Rewrite to root path
      const newUrl = new URL(event.request.url);
      newUrl.pathname = '/' + match[1];
      requestUrl = newUrl.toString();
    }
  }

  // Skip manifest.json requests from tenant path
  if (url.pathname.includes('manifest.json') && url.pathname.startsWith('/tenant/')) {
    return;
  }

  event.respondWith(
    fetch(requestUrl, { mode: 'cors' })
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            // Cache the original request URL
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Network error', { status: 503 });
          });
      })
  );
});