const CACHE_NAME = 'peditrack-v1';
const urlsToCache = [
    '/pwa/',
    '/pwa/index.html',
    '/pwa/css/styles.css',
    '/pwa/js/app.js',
    '/pwa/js/db.js',
    '/pwa/js/children.js',
    '/pwa/js/symptoms.js',
    '/pwa/js/vitals.js',
    '/pwa/js/interventions.js',
    '/pwa/js/summary.js',
    '/pwa/js/timeline.js',
    '/pwa/js/charts.js',
    '/pwa/js/export.js',
    '/pwa/icons/icon-192.png',
    '/pwa/icons/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log('Cache install error:', err);
                // Don't fail if some resources can't be cached
                return Promise.resolve();
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Offline fallback
                    return caches.match('/pwa/index.html');
                });
            })
    );
});
