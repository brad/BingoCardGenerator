const CACHE_NAME = 'bingo-VERSION_PLACEHOLDER';
const ASSETS = [
  './',
  'index.html',
  'card.html',
  'css/style.css',
  'js/bingo-core.js',
  'js/storage.js',
  'js/sync.js',
  'js/firebase-config.js',
  'assets/images/daub1.png',
  'assets/images/icon.svg',
  'assets/images/icon-maskable.svg',
  'manifest.json'
];

const FIREBASE_SDK = [
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isFirebase = url.hostname === 'www.gstatic.com';

  if (isLocal || isFirebase) {
    // Network-First strategy for local assets and Firebase SDKs
    // To ensure we always get the latest when online, but have offline fallback
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update the cache with the new version
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Default strategy for other requests
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  }
});
