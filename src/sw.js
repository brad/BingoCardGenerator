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
