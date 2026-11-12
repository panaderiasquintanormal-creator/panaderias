const CACHE_PREFIX = 'panaderia-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];
const MAX_STATIC_CACHE_ENTRIES = 100;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    request.headers.has('authorization')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const offlinePage = await caches.match('/offline.html');
        return offlinePage || Response.error();
      }),
    );
    return;
  }

  const isImmutableAsset = url.pathname.startsWith('/_next/static/');
  const isPwaAsset = url.pathname.startsWith('/icons/');

  if (!isImmutableAsset && !isPwaAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
        const keys = await cache.keys();
        const assetKeys = keys.filter((key) => {
          const path = new URL(key.url).pathname;
          return path.startsWith('/_next/static/') || path.startsWith('/icons/');
        });
        await Promise.all(
          assetKeys.slice(0, Math.max(0, assetKeys.length - MAX_STATIC_CACHE_ENTRIES)).map((key) => cache.delete(key)),
        );
      }
      return response;
    }),
  );
});
