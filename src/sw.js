const CACHE_NAME = 'bingo-v1';
const ASSETS = [
  'card.html',
  'css/style.css',
  'js/bingo-core.js',
  'js/storage.js',
  'assets/images/daub1.png',
  'assets/images/icon.svg',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
    // If it's card.html, we don't want to cache it because it's dynamic via query params
    // and the current fetch strategy is Cache-First which fails for new query params if the base is cached?
    // Wait, caches.match(event.request) should differentiate based on query string.
    // However, the PWA start_url is card.html, so it's tricky.

    // For now, let's try Network-First for card.html
    if (event.request.url.includes('card.html')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
