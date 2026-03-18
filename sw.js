// OZZY Service Worker — enables PWA install & offline caching
const CACHE_NAME = 'ozzy-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/router.js',
    '/js/calculator.js',
    '/js/data-store.js',
    '/js/screens/landing.js',
    '/js/screens/quiz.js',
    '/js/screens/bmi-result.js',
    '/js/screens/loading.js',
    '/js/screens/dashboard.js',
    '/js/screens/meal-input.js',
    '/js/screens/exercise-input.js',
    '/js/screens/profile.js',
    '/assets/Device bez pozadine.png',
    '/manifest.json'
];

// Install — cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network first for API calls, cache first for static assets
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API calls: always go to network (no caching)
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Network first, cache fallback (ensures fresh code after deploy)
    event.respondWith(
        fetch(event.request).then(response => {
            if (response.ok && event.request.method === 'GET') {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request).then(cached => {
                if (cached) return cached;
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
