const CACHE_NAME = 'enter-connect-v1';
const urlsToCache = [
  '/enter-connect/',
  '/enter-connect/index.html',
  '/enter-connect/style.css',
  '/enter-connect/script.js',
  '/enter-connect/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
