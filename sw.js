const CACHE_NAME = 'ball-flaps-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  // Local assets
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/audioService.ts',
  '/components/Game.tsx',
  '/components/StartScreen.tsx',
  '/components/GameOverScreen.tsx',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg',
  // Remote assets
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
];

// Install service worker and pre-cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to open cache or add URLs:', err);
      })
  );
  self.skipWaiting();
});

// Activate event to clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event to serve content from cache or network
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (e.g., loading the page), use a network-first strategy.
  // If the network fails (offline), it falls back to the cached index.html.
  // This is the key to fixing the 404 issue for SPAs.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For all other requests (assets like scripts, styles), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return the cached response if it exists.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from the network.
      return fetch(event.request).then(networkResponse => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        // A response must be consumed only once. We need to clone it to store in cache.
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
