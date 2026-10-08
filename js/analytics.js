// Analytics for Bible Playground: Microsoft Clarity and Google Analytics 4.
// Visitors from the UK or the EU/EEA see a small OK / No thanks bar, and nothing loads until they tap OK.
// Everyone else gets analytics straight away, with no bar. Nothing is sent from localhost.
(function () {
  var cfg = window.BP_CONFIG || {};
  var KEY = 'bp-consent';
  var started = false, ga = null, clarityOn = false;
  var hasPage = false, lastPage = '';
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private window: the bar may come back next visit */ } }

  // Clarity's own snippet, with the ID from js/config.js.
  function startClarity() {
    if (!cfg.clarityId) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', cfg.clarityId);
    clarityOn = true;
  }
  function startGA() {
    var id = cfg.gaId;
    if (!/^G-[A-Z0-9]{4,}$/.test(id || '')) return;
    window.dataLayer = window.dataLayer || [];
    ga = function () { window.dataLayer.push(arguments); };
    ga('js', new Date());
    ga('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(s);
  }
  function sendPage(id) {
    if (!ga) return;
    var ch = /^c\.([a-z]+)\./.exec(id || ''); // challenge links carry the challenger's name, so keep only the game
    var tag = ch ? 'challenge-' + ch[1] : id;
    ga('event', 'page_view', { page_title: document.title, page_location: location.origin + location.pathname + (tag ? '#' + tag : ''), page_path: '/' + (tag ? '#' + tag : '') });
  }
  function start() {
    if (started || local) return;
    started = true;
    startClarity(); startGA();
    if (hasPage) sendPage(lastPage); // a page view that happened before consent is sent now
  }

  // Called by the game code on every page view and game event.
  window.bpPageView = function (id) { hasPage = true; lastPage = id || ''; sendPage(lastPage); };
  window.bpTrack = function (name, params) {
    if (!started) return;
    try {
      if (clarityOn && window.clarity) { window.clarity('event', name); if (params && params.game) window.clarity('set', 'game', params.game); }
      if (ga) ga('event', name, params || {});
    } catch (e) { /* analytics must never break a game */ }
  };

  function bar() {
    var el = document.createElement('div');
    el.className = 'consent';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie choice');
    el.innerHTML = '<p>We use cookies to see how the games are played. <a href="/privacy">Privacy</a></p>' +
      '<div class="consent-btns"><button type="button" class="btn btn-small" data-c="no">No thanks</button>' +
      '<button type="button" class="btn btn-small btn-primary" data-c="yes">OK</button></div>';
    el.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!v) return;
      save(v); el.remove();
      if (v === 'yes') start();
    });
    document.body.append(el);
  }
  function show() { if (document.body) bar(); else document.addEventListener('DOMContentLoaded', bar); }

  var choice = saved();
  if (choice === 'no') return;          // they said no before: nothing loads, no bar
  if (choice === 'yes') { start(); return; }
  fetch('/api/geo', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : { regulated: false }; })
    .catch(function () { return { regulated: false }; })
    .then(function (d) { if (d.regulated) show(); else start(); });
})();
