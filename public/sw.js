// Offline support: keeps a copy of the app's files so Budjet opens without internet.
// Your data is already on the device (localStorage), so only the app itself needs caching.
// Only installs on a real build (`npm run build:web` writes precache.json); the dev server has
// no precache.json, so the install fails there and `expo start` is never served stale code.
const CACHE = 'budjet-v1'; // bump to clear old copies

// On install, save every file the app needs (listed by scripts/precache.mjs).
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const files = await fetch('/precache.json').then((r) => r.json());
      const cache = await caches.open(CACHE);
      await cache.addAll(['/', ...files]);
      await self.skipWaiting(); // take over right away instead of after all tabs close
    })(),
  );
});

// Delete copies from older versions, and start handling this page's requests now.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return; // only our own files

  if (request.mode === 'navigate') {
    // Pages: try the internet first (newest version), fall back to the saved app.
    event.respondWith(fetch(request).catch(() => caches.match('/')));
    return;
  }
  // Everything else: answer from the saved copy, and refresh that copy in the background.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const saved = await cache.match(request);
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => saved);
      return saved ?? fresh;
    }),
  );
});
