const CACHE = 'studiux-shell-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/logo-mark.png',
  '/logo.png',
  '/pwa-192.png',
  '/pwa-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const x = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, x));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
