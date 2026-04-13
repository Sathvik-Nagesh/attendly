const CACHE_NAME = 'attendly-v2';
const APP_ASSETS = [
  '/',
  '/manifest.json',
  '/hero-preview.png',
  '/login',
  '/dashboard',
  '/attendance',
  '/students',
  '/settings'
];

// 1. Install & Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate & Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. Smart Fetching Strategy (Stale-while-revalidate for UI, Network-first for Data)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // For API/Data: Network primarily, fallback to cache (offline mode)
  if (url.pathname.startsWith('/api') || url.pathname.includes('prisma')) {
    event.respondWith(
      fetch(request)
        .then(response => {
           const copy = response.clone();
           caches.open('attendly-data').then(cache => cache.put(request, copy));
           return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For UI/Assets: Stale-while-revalidate (Immediate UI, background update)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
