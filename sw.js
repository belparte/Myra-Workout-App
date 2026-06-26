const CACHE = 'myra-v2';
const SHELL = [
  '/Myra-Workout-App/',
  '/Myra-Workout-App/index.html',
  '/Myra-Workout-App/manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never cache API calls
  if (url.hostname.includes('anthropic') || url.hostname.includes('workers.dev')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for everything else with network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Push notifications
self.addEventListener('push', e => {
  if (!e.data) return;
  const d = e.data.json();
  e.waitUntil(
    self.registration.showNotification(d.title || 'Myra', {
      body: d.body || "Time to train 💪",
      icon: '/Myra-Workout-App/icons/icon-192.png',
      badge: '/Myra-Workout-App/icons/icon-72.png',
      vibrate: [100, 50, 100],
    })
  );
});
