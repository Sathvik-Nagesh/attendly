const CACHE_NAME = 'kle-academy-v2';
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

// 3. Strategic Fetching: Stale-While-Revalidate for APIs, Cache-First for Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy: Stale-While-Revalidate for Data (API calls to Supabase)
  if (url.origin.includes('supabase.co')) {
    event.respondWith(
      caches.open('kle-data-cache').then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchedResponse = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchedResponse;
        });
      })
    );
    return;
  }

  // Strategy: Cache-First for Local Static Assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// 4. Background Sync: Ensure Attendance is Pushed
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(
      // This will trigger a message to the client to execute the ROPE Sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_REQUISITION' });
        });
      })
    );
  }
});

// 5. Native Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'KLE Academy', body: 'New institutional alert.' };
  
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
