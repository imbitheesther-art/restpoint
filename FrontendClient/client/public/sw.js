// Service Worker for Rest Point PWA
const CACHE_NAME = 'restpoint-v1';
const STATIC_CACHE = 'restpoint-static-v1';
const DYNAMIC_CACHE = 'restpoint-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/logo.png',
    '/apple-touch-icon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== CACHE_NAME;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // For API requests, always go to network
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // Return offline fallback for API requests
                    return new Response(
                        JSON.stringify({ error: 'Offline', message: 'You are currently offline' }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                })
        );
        return;
    }

    // Handle tenant path requests - rewrite to root
    let cacheRequest = request;
    if (url.pathname.startsWith('/tenant/')) {
        // Extract the asset path after /tenant/[tenant-slug]/
        const match = url.pathname.match(/^\/tenant\/[^\/]+\/(.+)$/);
        if (match) {
            // Rewrite to root path
            const newUrl = new URL(request.url);
            newUrl.pathname = '/' + match[1];
            cacheRequest = new Request(newUrl.toString(), request);
        }
    }

    // For static assets (JS, CSS, images, fonts), use cache-first strategy
    if (request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'font' ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.woff2')) {

        event.respondWith(
            caches.match(cacheRequest)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // Return cached version, but update cache in background
                        event.waitUntil(
                            fetch(cacheRequest)
                                .then((response) => {
                                    if (response.ok) {
                                        caches.open(STATIC_CACHE)
                                            .then((cache) => cache.put(cacheRequest, response));
                                    }
                                    return response;
                                })
                                .catch(() => { })
                        );
                        return cachedResponse;
                    }

                    // Not in cache, fetch from network
                    return fetch(cacheRequest)
                        .then((response) => {
                            if (response.ok) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE)
                                    .then((cache) => cache.put(cacheRequest, responseClone));
                            }
                            return response;
                        })
                        .catch(() => {
                            // Return offline fallback
                            return new Response('Offline - Resource not cached', { status: 503 });
                        });
                })
        );
        return;
    }

    // For HTML pages, use network-first strategy
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response.ok && request.headers.get('Accept').includes('text/html')) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then((cache) => cache.put(request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // No cache, return offline page for HTML requests
                        if (request.headers.get('Accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }

                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_URLS':
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(payload.urls))
                .then(() => {
                    event.ports[0]?.postMessage({ success: true });
                })
                .catch((error) => {
                    event.ports[0]?.postMessage({ success: false, error: error.message });
                });
            break;

        case 'PURGE_CACHE':
            caches.delete(CACHE_NAME)
                .then(() => caches.delete(STATIC_CACHE))
                .then(() => caches.delete(DYNAMIC_CACHE))
                .then(() => {
                    event.ports[0]?.postMessage({ success: true });
                });
            break;

        default:
            break;
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Process any pending offline actions
            console.log('[SW] Background sync triggered')
        );
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    const options = {
        body: data.body || 'New notification',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Rest Point', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If a window is already open, focus it
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open a new window
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
});

console.log('[SW] Service worker script loaded');