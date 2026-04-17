const CACHE_NAME = 'attendly-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/login',
  '/manifest.json',
  '/icons/KLE_logo.jpg',
  '/globals.css'
];

// 1. Installation - Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activation - Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. Strategic Fetching: Optimized Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only handle GET requests for caching
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // Strategy: Network-First for APIs (Supabase), Cache-First for static
  if (url.origin.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache a copy of the valid response
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open('attendly-data-cache').then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy: Cache-First for Local Static Assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then(networkResponse => {
          if (networkResponse.ok && !url.pathname.includes('chrome-extension')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          }
          return networkResponse;
      });
    })
  );
});

// 4. Background Sync: Ensure Attendance is Pushed
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'ROPE_SYNC_REQUIRED' });
        });
      })
    );
  }
});

// 5. Native Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Attendly', body: 'New institutional alert.' };
  
  const options = {
    body: data.body,
    icon: '/icons/KLE_logo.jpg',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});

