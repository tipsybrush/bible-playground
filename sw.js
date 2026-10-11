// Service worker: keeps a copy of the site so it opens fast and works offline and on bad connections.
// Pages are always fetched fresh. Scripts and styles with a version in their address (?v=N) never
// change, so they open straight from the saved copy (a new release uses a new N). Anything else is
// fetched fresh if the network answers quickly, otherwise the saved copy is used.
// Icons and fonts are served from the saved copy straight away. Bump VERSION to clear old copies.
const VERSION = 'bp-v35';
const WAIT_MS = 1500;
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

  // Versioned files: the saved copy if there is one, otherwise download and keep it.
  if (!fonts && url.searchParams.has('v')) {
    e.respondWith(caches.open(VERSION).then((cache) => cache.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }))));
    return;
  }

  // Other code and content: network first, falling back to the saved copy if the network is slow or down.
  if (!fonts && /\.(css|js|json)$/.test(url.pathname)) {
    e.respondWith(caches.open(VERSION).then((cache) => {
      const fresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
      const slow = new Promise((resolve) => setTimeout(resolve, WAIT_MS)).then(() => cache.match(req));
      return Promise.race([fresh, slow.then((hit) => hit || fresh)])
        .catch(() => cache.match(req).then((hit) => hit || fetch(req)));
    }));
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
