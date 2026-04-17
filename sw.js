/**
 * Service Worker for Project Dashboard PWA
 * 
 * This service worker enables offline functionality by caching:
 * - The main HTML file
 * - Tailwind CSS from CDN (with fallback)
 * 
 * Version: 1.0.0
 */

// Cache name - update version to force refresh
const CACHE_NAME = 'pm-dashboard-v1';

// Files to cache for offline use
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://cdn.tailwindcss.com'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Activate immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Cache failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old versions
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
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
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached response if found
                if (cachedResponse) {
                    // Optionally update cache in background
                    fetchAndCache(request);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                return fetchAndCache(request);
            })
            .catch(() => {
                // If both cache and network fail, show offline page
                if (request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', { status: 503 });
            })
    );
});

/**
 * Fetch and update cache
 */
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        // Only cache successful responses
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            
            // Don't cache iframes or cross-origin requests (except Tailwind CDN)
            const url = new URL(request.url);
            if (url.origin === self.location.origin || 
                url.hostname === 'cdn.tailwindcss.com') {
                cache.put(request, response.clone());
            }
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Handle push notifications (for future use)
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Project Dashboard', {
            body: data.body || 'You have a new notification',
            icon: data.icon || './icon-192.png',
            badge: data.badge || './icon-192.png',
            tag: data.tag || 'default',
            data: data.data || {}
        })
    );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow('./');
                }
            })
    );
});

/**
 * Background sync (for future offline support)
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

/**
 * Sync data when back online
 */
async function syncData() {
    // This would sync any queued actions when back online
    console.log('[ServiceWorker] Syncing data...');
    // Implementation depends on your sync strategy
}

console.log('[ServiceWorker] Script loaded');