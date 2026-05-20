const CACHE_NAME = 'bingo-v2';
const ASSETS = [
  'card.html',
  'css/style.css',
  'js/bingo-core.js',
  'js/storage.js',
  'js/sync.js',
  'js/firebase-config.js',
  'assets/images/daub1.png',
  'assets/images/icon.svg',
  'manifest.json'
];

// Firebase SDK URLs to cache
const FIREBASE_SDK = [
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(FIREBASE_SDK);
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
    // For card.html and Firebase SDKs, try Network-First to get latest state/SDK
    // but fall back to cache for offline support.
    if (event.request.url.includes('card.html') || event.request.url.includes('gstatic.com')) {
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
