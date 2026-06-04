/* ══ Motorsport 2026 – Service Worker ══════════════════════════════════════
   Caches the app shell + photos for offline use.
   Firebase & weather API calls always go to network (need live data).     */

const CACHE    = 'motorsport-2026-v1';
const PRECACHE = [
  '/motorsport-2026/',
  '/motorsport-2026/index.html',
  '/motorsport-2026/images/01-brno.jpg',
  '/motorsport-2026/images/02-spielberg.jpg',
  '/motorsport-2026/images/03-norisring.jpg',
  '/motorsport-2026/images/04-budapest.jpg',
  '/motorsport-2026/images/05-zandvoort.jpg',
  '/motorsport-2026/images/06-monza.jpg',
  '/motorsport-2026/images/07-madrid.jpg',
];

/* ── Install: pre-cache app shell ────────────────────────────────────────── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

/* ── Activate: remove old caches ─────────────────────────────────────────── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first for local, network-first for APIs ────────────────── */
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always go to network for Firebase, weather APIs, CDN scripts
  if (url.includes('firebase') || url.includes('googleapis') ||
      url.includes('open-meteo') || url.includes('gstatic') ||
      url.includes('unpkg') || url.includes('fonts.')) {
    return; // default browser fetch
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache successful same-origin responses
        if (res.ok && url.includes('kholzer83.github.io')) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match('/motorsport-2026/'))
  );
});
