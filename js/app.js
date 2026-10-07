// Shared helpers and the tiny router that swaps between the home page and a game.
(function () {
  const BP = (window.BP = { games: {} });

  BP.shuffle = function (list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // h('button', {class: 'btn', onclick: fn}, 'Label') -> element
  BP.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  };

  // Scores live in this browser only. Storage can be blocked, so never let it throw.
  BP.store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('bp:' + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('bp:' + key, JSON.stringify(value)); } catch (e) {}
    },
  };

  // Pick n items the player hasn't seen yet, like dealing from a deck. What's been dealt is remembered
  // per key (as short hashes) until the whole pool is used up; then the deck is reshuffled.
  const idOf = (x) => {
    const s = typeof x === 'string' ? x : x.q || x.question || x.id || x.word || x.name || x.text || JSON.stringify(x);
    let n = 5381;
    for (let i = 0; i < s.length; i++) n = (n * 33 + s.charCodeAt(i)) | 0;
    return (n >>> 0).toString(36);
  };
  BP.fresh = function (key, list, n = 1) {
    let seen = new Set(BP.store.get('seen-' + key, []));
    let pick = BP.shuffle(list.filter((x) => !seen.has(idOf(x)))).slice(0, n);
    if (pick.length < n) { // the deck ran out: start a new one without repeating this hand
      seen = new Set();
      pick = pick.concat(BP.shuffle(list.filter((x) => !pick.includes(x))).slice(0, n - pick.length));
    }
    pick.forEach((x) => seen.add(idOf(x)));
    BP.store.set('seen-' + key, [...seen]);
    return pick;
  };
  // For games that deal a long deck one card at a time: unseen cards first (shuffled), then the rest.
  // Call BP.fresh.mark(key, item) as each card is actually played.
  BP.fresh.order = function (key, list) {
    const seen = new Set(BP.store.get('seen-' + key, []));
    const unseen = list.filter((x) => !seen.has(idOf(x)));
    if (!unseen.length) { BP.store.set('seen-' + key, []); return BP.shuffle(list); }
    return BP.shuffle(unseen).concat(BP.shuffle(list.filter((x) => seen.has(idOf(x)))));
  };
  BP.fresh.mark = function (key, item) {
    const seen = BP.store.get('seen-' + key, []);
    const id = idOf(item);
    if (!seen.includes(id)) { seen.push(id); BP.store.set('seen-' + key, seen); }
  };

  // One nickname for the whole site. Typing it in any leaderboard or share box fills in every other
  // nickname box straight away, and it's remembered for next time.
  BP.nick = {
    get: () => BP.store.get('nickname', ''),
    set(value, from) {
      const name = String(value || '').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trimStart().slice(0, 16);
      BP.store.set('nickname', name.trim());
      document.querySelectorAll('input[id^="nick-"], input[id^="share-nick-"]').forEach((el) => { if (el !== from && el.value !== name) el.value = name; });
      document.dispatchEvent(new CustomEvent('bp:nick', { detail: name.trim() }));
    },
  };

  BP.gameHead = function (title, subtitle) {
    return BP.h('header', { class: 'game-head' }, BP.h('h1', null, title), BP.h('p', null, subtitle));
  };

  // Short, upbeat reactions for a right answer.
  const CHEERS = ['Correct!', 'Spot on!', 'Nailed it!', 'Sharp! Correct.', 'You know your stuff!', 'Brilliant!', 'That’s it!', 'On point!', 'Yes! Correct.'];
  BP.cheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];

  BP.verse = function (v) {
    return BP.h('blockquote', { class: 'verse' }, v.text, BP.h('cite', null, v.ref + ' (KJV)'));
  };

  BP.confetti = function () {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { BP.sfx('win'); return; }
    const colors = ['#FFC12E', '#3B5BDB', '#2B9A66', '#D6336C', '#E8890C', '#9775FA'];
    const box = BP.h('div', { class: 'confetti', 'aria-hidden': 'true' });
    for (let i = 0; i < 70; i++) {
      box.append(BP.h('i', {
        style: `left:${Math.random() * 100}%;background:${colors[i % colors.length]};` +
          `animation-delay:${Math.random() * 0.6}s;animation-duration:${1.4 + Math.random()}s`,
      }));
    }
    document.body.append(box);
    BP.sfx('win'); BP.buzz([40, 60, 40, 60, 120]);
    setTimeout(() => box.remove(), 3200);
  };

  // ---------- Sound and buzz ----------
  // Tiny chiptune blips made on the fly with Web Audio, so there are no sound files to download.
  let audio = null;
  const lastSfx = {};
  BP.soundOn = () => BP.store.get('sound', true);
  const NOTES = {
    coin: [[988, 0.07], [1319, 0.16]],
    bad: [[220, 0.12], [165, 0.2]],
    tap: [[660, 0.035]],
    tick: [[880, 0.03]],
    win: [[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.25]],
    level: [[784, 0.08], [988, 0.08], [1175, 0.08], [1568, 0.3]],
  };
  BP.sfx = function (name) {
    if (!BP.soundOn() || !NOTES[name]) return;
    const now = performance.now();
    if (now - (lastSfx[name] || 0) < 250) return; // don't stack the same sound
    lastSfx[name] = now;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      let t = audio.currentTime + 0.01;
      NOTES[name].forEach(([f, d]) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = name === 'bad' ? 'sawtooth' : 'square';
        o.frequency.value = f;
        g.gain.setValueAtTime(name === 'tap' || name === 'tick' ? 0.025 : 0.05, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(audio.destination);
        o.start(t); o.stop(t + d + 0.02);
        t += d * 0.9;
      });
    } catch (e) { /* no audio here */ }
  };
  BP.buzz = function (pattern) {
    if (!BP.soundOn()) return;
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
  };

  // A pixel coin that pops out of a button after a right answer, Mario style.
  function coinPop(el) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const c = BP.h('span', { class: 'coin-pop', 'aria-hidden': 'true', style: `left:${r.left + r.width / 2}px;top:${r.top + 6}px` });
    if (BP.coinEl) c.append(BP.coinEl());
    document.body.append(c);
    setTimeout(() => c.remove(), 800);
  }

  // Every game gets sounds and buzzes for free: right/wrong answer buttons and feedback boxes are noticed here.
  function watchFeedback() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('button, a.btn');
      if (!b || !document.getElementById('stage').contains(b)) return;
      setTimeout(() => {
        if (b.classList.contains('is-correct')) { BP.sfx('coin'); BP.buzz(25); coinPop(b); }
        else if (b.classList.contains('is-wrong')) { BP.sfx('bad'); BP.buzz([60, 40, 60]); }
        else BP.sfx('tap');
      }, 0);
    });
    new MutationObserver((list) => {
      for (const m of list) for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        const fb = n.matches('.feedback') ? n : n.querySelector && n.querySelector('.feedback.good, .feedback.bad');
        if (!fb || fb.closest('.result')) continue;
        if (fb.classList.contains('good')) { BP.sfx('coin'); BP.buzz(25); }
        else if (fb.classList.contains('bad')) { BP.sfx('bad'); BP.buzz([60, 40, 60]); }
      }
    }).observe(document.getElementById('stage'), { childList: true, subtree: true });
  }

  function soundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    const paint = () => {
      const on = BP.soundOn();
      btn.textContent = on ? '🔊' : '🔇';
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Sound and vibration on' : 'Sound and vibration off');
    };
    btn.addEventListener('click', () => { BP.store.set('sound', !BP.soundOn()); paint(); BP.sfx('tap'); });
    paint();
  }

  // ---------- Loading games on demand ----------
  // Only the shell loads up front. Each game's script and data arrive when it's opened (or when the
  // player hovers its card), so the home page is quick even on a slow connection.
  const Q = 'data/questions.js';
  BP.manifest = {
    quiz: [Q, 'js/quiz.js'], ladder: [Q, 'js/ladder.js'], blanks: ['data/stories.js', 'js/blanks.js'],
    riddles: ['data/riddles.js', 'js/riddles.js'], charades: ['data/charades.js', 'js/charades.js'],
    word: ['data/words.js', 'js/word.js'], snake: ['data/books.js', 'js/snake.js'],
    timeline: ['data/timeline.js', 'js/timeline.js'], ark: ['js/ark.js'], map: ['data/places.js', 'js/map.js'],
    crossword: ['data/crossword.js', 'js/crossword.js'], verse: ['data/books.js', 'data/verses.js', 'js/verse.js'],
    trail: ['data/trail.js', 'js/trail.js'], truths: ['data/truths.js', 'js/truths.js'], sling: ['js/sling.js'],
    wars: [Q, 'data/riddles.js', 'data/verses.js', 'data/books.js', 'data/timeline.js', 'data/charades.js', 'data/words.js', 'data/places.js', 'data/crossword.js', 'js/wars.js'],
    gifts: ['data/gifts.js', 'js/gifts.js'], character: ['data/characters.js', 'js/character.js'],
    career: ['data/career.js', 'js/career.js'], twin: ['data/twin.js', 'js/twin.js'],
  };
  BP.scored = ['quiz', 'ladder', 'blanks', 'riddles', 'word', 'snake', 'timeline', 'ark', 'map', 'crossword', 'verse', 'trail', 'sling', 'truths'];
  BP.manifest.leaderboards = [...new Set(BP.scored.flatMap((g) => BP.manifest[g]))];

  const loading = {};
  function loadScript(src) {
    if (!loading[src]) {
      loading[src] = new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src; el.async = false;
        el.onload = resolve;
        el.onerror = () => { delete loading[src]; el.remove(); reject(new Error('Could not load ' + src)); };
        document.body.append(el);
      });
    }
    return loading[src];
  }
  BP.load = function (id) {
    const list = BP.manifest[id] || [];
    return Promise.all(list.map(loadScript)); // async=false keeps them in order
  };

  function renderBadges() {
    const cache = BP.store.get('badges', {});
    document.querySelectorAll('[data-badge]').forEach((el) => {
      const id = el.dataset.badge;
      const game = BP.games[id];
      if (game && game.badge) { el.textContent = game.badge(); cache[id] = el.textContent; }
      else el.textContent = cache[id] || el.textContent || 'Play';
    });
    BP.store.set('badges', cache);
  }

  // When the browser is idle, fetch the rest of the games in the background (not on data saver or 2G).
  function warmUp() {
    const c = navigator.connection || {};
    if (c.saveData || /2g/.test(c.effectiveType || '')) return;
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    idle(() => {
      const all = [...new Set(Object.values(BP.manifest).flat())];
      let n = 0;
      const next = () => { if (n < all.length) loadScript(all[n++]).catch(() => {}).then(() => idle(next)); else if (!location.hash.slice(1)) renderBadges(); };
      next();
    });
  }

  function loadingScreen(stage) {
    stage.replaceChildren(BP.h('div', { class: 'loading-block', role: 'status' },
      BP.h('span', { class: 'q-block', 'aria-hidden': 'true' }, '?'), BP.h('p', null, 'Loading…')));
  }

  let routeId = 0;
  async function route() {
    const my = ++routeId;
    const id = location.hash.slice(1);
    const home = document.getElementById('home');
    const view = document.getElementById('view');
    const stage = document.getElementById('stage');
    const ch = /^c\.([a-z]+)\./.exec(id);
    const need = ch ? ch[1] : id;
    const ready = need === 'leaderboards' ? BP.scored.every((g) => BP.games[g]) : !!BP.games[need];
    if (BP.manifest[need] && !ready) {
      home.hidden = true; view.hidden = false;
      loadingScreen(stage);
      try { await BP.load(need); } catch (e) {
        if (my !== routeId) return;
        stage.replaceChildren(BP.h('div', { class: 'panel' },
          BP.h('h2', { class: 'panel-title' }, 'This game could not load'),
          BP.h('p', null, 'Check your connection and try again.'),
          BP.h('div', { class: 'btn-row' }, BP.h('button', { class: 'btn btn-primary', onclick: route }, 'Try again'))));
        return;
      }
      if (my !== routeId) return;
    }
    const game = BP.games[id];
    const challenge = BP.share && BP.share.parse(id);
    home.hidden = !!(game || challenge);
    view.hidden = !(game || challenge);
    stage.replaceChildren();
    stage.classList.remove('stage-in'); void stage.offsetWidth; stage.classList.add('stage-in');
    if (challenge) {
      document.title = 'Challenge · Bible Playground';
      stage.style.setProperty('--game', BP.games[challenge.game].color);
      BP.share.splash(stage, challenge);
      const hint = document.getElementById('key-hint'); if (hint) hint.textContent = '';
    } else if (game) {
      document.title = game.title + ' · Bible Playground';
      stage.style.setProperty('--game', game.color);
      game.mount(stage);
      const hint = document.getElementById('key-hint');
      if (hint) hint.textContent = game.keys || KEY_HINTS[id] || DEFAULT_KEYS;
    } else {
      document.title = 'Bible Playground';
      renderBadges();
    }
    window.scrollTo(0, 0);
  }

  // ---------- Keyboard ----------
  // Games with their own key handling list them in `keys`; every other game gets these for free.
  const DEFAULT_KEYS = 'Keys: 1–4 or A–D to answer · Enter for next · Esc for the world map';
  const ESC = ' · Esc for the world map';
  const KEY_HINTS = {
    word: 'Keys: type letters · Enter to guess · Backspace to delete' + ESC,
    crossword: 'Keys: type letters · arrows to move · Enter or Tab for the next word' + ESC,
    snake: 'Keys: arrows or WASD to steer · Space to pause' + ESC,
    sling: 'Keys: arrows to aim · hold Space to pull, let go to throw' + ESC,
    wars: 'Keys: 1–4 to pick · Y or N to mark · R to reveal · Enter for next' + ESC,
    trail: 'Keys: 1–3 to choose · Enter to continue' + ESC,
    truths: 'Keys: 1–3 or A–C to pick the lie · Enter for next' + ESC,
    career: 'Keys: A–J to answer · Backspace to go back' + ESC,
    twin: 'Keys: A–J to answer · Backspace to go back' + ESC,
    charades: 'Keys: → or ↓ for Got it · ← or ↑ to Pass' + ESC,
    timeline: 'Keys: ↑ ↓ to move · Space to lift and drop · C to lock in' + ESC,
    ark: 'Keys: Tab to an animal · Enter to pick it' + ESC,
    map: 'Click or tap the map' + ESC,
    blanks: 'Keys: type your answer · Enter to check' + ESC,
    riddles: 'Keys: type your answer · Enter to check' + ESC,
  };
  const OWN_KEYS = ['word', 'crossword', 'snake', 'sling', 'wars', 'trail', 'truths', 'career', 'twin', 'charades', 'timeline'];
  const visible = (el) => el && !el.disabled && el.offsetParent !== null;
  function keyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      const id = location.hash.slice(1);
      if (e.key === 'Escape') {
        if (typing) { t.blur(); return; }
        if (id && !document.getElementById('view').hidden) { e.preventDefault(); location.hash = ''; }
        return;
      }
      if (typing || !BP.games[id] || OWN_KEYS.includes(id)) return;
      const stage = document.getElementById('stage');
      let opts = [...stage.querySelectorAll('.opt')].filter(visible);
      if (!opts.length) opts = [...stage.querySelectorAll('.choice, .mode-btn')].filter(visible);
      const k = e.key.toLowerCase();
      let n = -1;
      if (/^[1-9]$/.test(k)) n = +k - 1;
      else if (/^[a-h]$/.test(k) && opts.length > 1) n = k.charCodeAt(0) - 97;
      if (n >= 0 && opts[n]) { e.preventDefault(); opts[n].click(); opts[n].focus({ preventScroll: true }); return; }
      if (e.key === 'Enter' && !(t && /^(BUTTON|A)$/.test(t.tagName))) {
        const next = [...stage.querySelectorAll('.btn-primary')].filter((b) => visible(b) && !b.closest('.finish'))[0];
        if (next) { e.preventDefault(); next.click(); }
      }
    });
  }

  // Swipe right from the left edge to go back to the world map, like a native app.
  function edgeSwipe() {
    let start = null;
    document.addEventListener('touchstart', (e) => {
      const p = e.touches[0];
      start = p.clientX < 24 && location.hash.slice(1) ? [p.clientX, p.clientY, Date.now()] : null;
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
      if (!start) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - start[0], dy = Math.abs(p.clientY - start[1]);
      if (dx > 90 && dy < 60 && Date.now() - start[2] < 600) { BP.buzz(15); location.hash = ''; }
      start = null;
    }, { passive: true });
  }

  // Prefetch a game's files as soon as the player shows interest in its card.
  function prefetchOnIntent() {
    const go = (e) => {
      const a = e.target.closest && e.target.closest('a.card, a[href="#leaderboards"]');
      if (a) BP.load(a.getAttribute('href').slice(1)).catch(() => {});
    };
    document.addEventListener('pointerenter', go, true);
    document.addEventListener('touchstart', go, { passive: true, capture: true });
    document.addEventListener('focusin', go);
  }

  // Offline support: a service worker keeps a copy of the site, so repeat visits open instantly.
  // Full screen for the whole site. Because the site is one page that swaps views, full screen stays on
  // through every game and back to the world map until the player turns it off. Where the browser allows
  // it (desktop Chrome and Edge), Esc is locked so a quick Esc goes back to the map instead of quitting
  // full screen; holding Esc or pressing the button still leaves it.
  BP.fullscreen = {
    ok: () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled),
    on: () => !!(document.fullscreenElement || document.webkitFullscreenElement),
    async enter() {
      const el = document.documentElement;
      try {
        await (el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen());
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(() => {});
      } catch (e) { /* the browser said no */ }
    },
    exit() {
      try {
        if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } catch (e) {}
    },
    toggle() { return this.on() ? this.exit() : this.enter(); },
  };
  function fullscreen() {
    const btn = document.getElementById('fs-toggle');
    if (!btn || !BP.fullscreen.ok()) return;
    btn.hidden = false;
    const sync = () => {
      const on = BP.fullscreen.on();
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
      btn.title = on ? 'Exit full screen' : 'Full screen';
      document.body.classList.toggle('is-fullscreen', on);
    };
    btn.addEventListener('click', () => { BP.sfx('tap'); BP.fullscreen.toggle(); });
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    sync();
  }

  // The site menu: a hamburger on phones, a "Menu" tab on desktop. Holds everything that isn't a game.
  function menu() {
    const btn = document.getElementById('menu-toggle');
    const panel = document.getElementById('site-menu');
    const scrim = document.getElementById('menu-scrim');
    if (!btn || !panel) return;
    const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open; scrim.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      if (open) { BP.sfx('tap'); (panel.querySelector('.menu-item') || panel).focus({ preventScroll: true }); }
    };
    btn.addEventListener('click', () => set(!isOpen()));
    scrim.addEventListener('click', () => set(false));
    panel.addEventListener('click', (e) => { if (e.target.closest('a.menu-item')) set(false); });
    window.addEventListener('hashchange', () => set(false));
    // Esc closes the menu first, before the global "back to the world map" key.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { e.preventDefault(); e.stopPropagation(); set(false); btn.focus(); }
    }, true);
  }

  // Footer "Support this site" button: shown only once a link is set in js/config.js.
  function coffee() {
    const url = (window.BP_CONFIG || {}).coffeeUrl;
    const el = document.getElementById('coffee-link');
    if (el && /^https:\/\//.test(url || '')) { el.href = url; el.hidden = false; }
  }

  function offline() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  BP.start = function () {
    BP.renderHud();
    const invite = document.getElementById('invite');
    if (invite) invite.addEventListener('click', () => BP.share.invite(document.getElementById('invite-note')));
    window.addEventListener('hashchange', route);
    soundToggle(); watchFeedback(); keyboard(); edgeSwipe(); prefetchOnIntent(); offline();
    coffee(); menu(); fullscreen();
    route().then(warmUp);
  };
})();
