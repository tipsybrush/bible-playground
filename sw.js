// Service worker: keeps a copy of the site so it opens instantly and works offline.
// Pages are fetched fresh when there is a connection; scripts, data and styles are served from the
// cache straight away and quietly refreshed in the background. Bump VERSION to clear old copies.
const VERSION = 'bp-v29';
const CORE = ['./', 'index.html', 'css/style.css', 'js/config.js', 'js/app.js', 'js/leaderboard.js', 'js/player.js', 'js/share.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !fonts) return; // leaderboard API calls go straight to the network
  if (url.pathname.startsWith('/api/')) return; // so does the site's own scores API

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html'))));
    return;
  }

  e.respondWith(caches.open(VERSION).then((cache) => cache.match(req).then((hit) => {
    const fresh = fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    }).catch(() => hit);
    return hit || fresh;
  })));
});
