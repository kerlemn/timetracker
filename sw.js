const CACHE_NAME = 'timetracker-v1';
const APP_URL = '/timetracker/';

// Cache the app shell on install
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add(APP_URL))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Serve from cache, fall back to network
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(APP_URL).then(cached => cached || fetch(event.request))
    );
  }
});

// Key part: when launched from home screen, focus existing tab if open
self.addEventListener('notificationclick', event => {
  event.waitUntil(focusOrOpen());
});

// Called when the PWA is launched (navigate event with source == null means home screen launch)
self.addEventListener('fetch', event => {
  if (
    event.request.mode === 'navigate' &&
    event.request.url.startsWith(self.location.origin + APP_URL)
  ) {
    event.waitUntil(focusOrOpen());
  }
});

async function focusOrOpen() {
  const allClients = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  for (const client of allClients) {
    if (client.url.startsWith(self.location.origin + '/timetracker') && 'focus' in client) {
      return client.focus();
    }
  }

  if (clients.openWindow) {
    return clients.openWindow(APP_URL);
  }
}
