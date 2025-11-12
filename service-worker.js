// Service Worker for MiauMiau PWA
const CACHE_NAME = 'miaumiau-v1.0.0';
const RUNTIME_CACHE = 'miaumiau-runtime-v1.0.0';

// Filer som skal caches ved installasjon
const PRECACHE_FILES = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './Bilder/',
  './icons/'
];

// Install event - cache viktige filer
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching files');
        return cache.addAll(PRECACHE_FILES);
      })
      .then(() => {
        return self.skipWaiting(); // Aktiver umiddelbart
      })
      .catch((error) => {
        console.error('[Service Worker] Install error:', error);
      })
  );
});

// Activate event - rydd opp gamle caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      return self.clients.claim(); // Ta kontroll over alle sider
    })
  );
});

// Fetch event - serve fra cache eller network
self.addEventListener('fetch', (event) => {
  // Ignorer ikke-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer chrome-extension og andre spesielle URLs
  if (event.request.url.startsWith('chrome-extension://') ||
      event.request.url.startsWith('moz-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Returner fra cache hvis tilgjengelig
        if (cachedResponse) {
          return cachedResponse;
        }

        // Hent fra network
        return fetch(event.request)
          .then((response) => {
            // Sjekk om responsen er gyldig
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Klon responsen for cache
            const responseToCache = response.clone();

            // Cache dynamiske ressurser
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Hvis network feiler, prøv å returnere offline-fallback
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            // For bilder, returner placeholder hvis tilgjengelig
            if (event.request.destination === 'image') {
              return new Response('', { status: 404 });
            }
          });
      })
  );
});

// Message event - håndter meldinger fra appen
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

