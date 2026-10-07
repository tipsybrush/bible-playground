// Wilderness Trail: an Oregon Trail-style journey from Egypt to Canaan. Keep manna, water, morale
// and faith above zero while random events hit the camp. Your choices (and a bit of luck) decide
// which of six endings you reach. Event picks, road costs and outcomes are rolled fresh every run.
(function () {
  const { h, shuffle, store } = BP;
  const NS = 'http://www.w3.org/2000/svg';
  const STATS = [
    { k: 'manna', label: 'Manna', icon: 'M4 11.5C4 7.9 7.6 5 12 5s8 2.9 8 6.5c0 1-.6 1.9-1.5 2.3V18a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-4.2C4.6 13.4 4 12.5 4 11.5z' },
    { k: 'water', label: 'Water', icon: 'M12 2.5c3.6 4.6 6.6 8.3 6.6 11.6a6.6 6.6 0 0 1-13.2 0c0-3.3 3-7 6.6-11.6z' },
    { k: 'morale', label: 'Morale', icon: 'M12 20.6l-1.4-1.3C5.4 14.6 2 11.5 2 7.7 2 4.6 4.4 2.2 7.5 2.2c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.6 11.6z' },
    { k: 'faith', label: 'Faith', icon: 'M12 2c1 3.6 5.6 5.7 5.6 11.1a5.6 5.6 0 0 1-11.2 0c0-2.7 1.2-4.4 2.7-5.7.2 1.8 1 3 2.2 3.5C10.9 8.7 10.5 5.1 12 2z' },
  ];
  const START = { manna: 70, water: 70, morale: 65, faith: 40 };
  // What each leg of the road costs (index = the stop you are walking to).
  const ROAD = [null,
    { water: [-14, -10], manna: [-10, -7], morale: [-7, -3] },
    { water: [-24, -18], manna: [-10, -7], morale: [-8, -4] },
    { water: [-14, -9], manna: [-14, -10], morale: [-7, -3] },
    { water: [-20, -14], manna: [-6, -3], morale: [-7, -3] },
    { water: [-14, -9], manna: [-6, -3], morale: [-7, -3] },
    { water: [-8, -2], manna: [-5, -2], morale: [-8, -4] },
    { water: [-18, -12], manna: [-6, -3], morale: [-7, -3] },
  ];
  const TRAIL_CHANCE = [0, 0.35, 0.6, 0.6, 0.55, 0.5, 0.9, 0.85]; // chance of a road event before each stop
  const SPEED_MAX = 500, SPEED_RATE = 2; // speed bonus: 500, minus 2 per second
  const GOOD = ['Amazing!', 'Well done!', 'God came through!', 'Yes!', 'Brilliant!', 'Look at that!', 'Wise move!'];
  const BAD = ['Oh no!', 'Ouch!', 'Uh-oh.', 'Oof…', 'Yikes!'];
  // Journey map: one point per stop, in a 1000 x 200 strip.
  const PTS = [[52, 128], [178, 98], [300, 136], [422, 104], [540, 132], [656, 82], [792, 122], [944, 92]];

  const rand = (r) => (Array.isArray(r) ? r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)) : r || 0);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function sv(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) el.setAttribute(k, v);
    kids.flat().forEach((k) => { if (k != null) el.append(k.nodeType ? k : document.createTextNode(String(k))); });
    return el;
  }
  function icon(stat) {
    return sv('svg', { viewBox: '0 0 24 24', class: 'trail-ico', 'aria-hidden': 'true' }, sv('path', { d: stat.icon }));
  }
  function found() {
    const f = store.get('trail-endings', []);
    return Array.isArray(f) ? f.filter((id) => TRAIL_ENDINGS[id]) : [];
  }

  // Smooth path through the stops (Catmull-Rom turned into cubic Beziers).
  function pathThrough(pts, upto) {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < upto; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  // The journey strip: desert, the parted sea, Sinai, the Jordan and green Canaan, with a glowing caravan marker.
  function makeMap() {
    const sea = PTS[1];
    const full = pathThrough(PTS, PTS.length - 1);
    const base = sv('path', { d: full, class: 'trail-road' });
    const done = sv('path', { d: full, class: 'trail-road-done' });
    const marker = sv('g', { class: 'trail-marker' },
      sv('circle', { r: 30, class: 'trail-marker-glow' }),
      sv('ellipse', { cx: 0, cy: -26, rx: 8, ry: 12, class: 'trail-marker-pillar' }),
      sv('circle', { r: 13, class: 'trail-marker-dot' }));
    const nodes = PTS.map(([x, y]) => sv('circle', { cx: x, cy: y, r: 11, class: 'trail-node' }));
    const labels = PTS.map(([x, y], i) => sv('text', { x, y: i % 2 ? y + 46 : y - 44, class: 'trail-map-label', 'text-anchor': 'middle' }, TRAIL_STOPS[i].short));
    const svg = sv('svg', { viewBox: '0 0 1000 200', class: 'trail-map', role: 'img', 'aria-label': 'Journey map from Egypt to Canaan' },
      sv('defs', null,
        sv('linearGradient', { id: 'trail-sand', x1: 0, y1: 0, x2: 0, y2: 1 },
          sv('stop', { offset: 0, class: 'trail-sand-a' }), sv('stop', { offset: 1, class: 'trail-sand-b' })),
        sv('linearGradient', { id: 'trail-green', x1: 0, y1: 0, x2: 0, y2: 1 },
          sv('stop', { offset: 0, class: 'trail-green-a' }), sv('stop', { offset: 1, class: 'trail-green-b' })),
        sv('linearGradient', { id: 'trail-gold', x1: 0, y1: 0, x2: 1, y2: 0 },
          sv('stop', { offset: 0, 'stop-color': '#FFD43B' }), sv('stop', { offset: 1, 'stop-color': '#FF922B' }))),
      sv('rect', { x: 0, y: 0, width: 1000, height: 200, fill: 'url(#trail-sand)' }),
      // Dunes
      sv('path', { d: 'M0 170 Q120 140 240 168 T480 160 T720 170 T1000 158 V200 H0z', class: 'trail-dune' }),
      // Egypt: the Nile and its green banks
      sv('rect', { x: 0, y: 0, width: 26, height: 200, class: 'trail-bank' }),
      sv('path', { d: 'M14 0 C24 40 4 80 14 120 S8 180 14 200', class: 'trail-river' }),
      // The Red Sea, parted where the road crosses it
      sv('path', { d: `M${sea[0] - 30} 0 H${sea[0] + 26} C${sea[0] + 36} 30 ${sea[0] + 18} ${sea[1] - 40} ${sea[0] + 22} ${sea[1] - 24} H${sea[0] - 24} C${sea[0] - 20} ${sea[1] - 50} ${sea[0] - 40} 30 ${sea[0] - 30} 0z`, class: 'trail-sea' }),
      sv('path', { d: `M${sea[0] - 24} ${sea[1] + 24} H${sea[0] + 22} C${sea[0] + 16} ${sea[1] + 60} ${sea[0] + 36} 170 ${sea[0] + 28} 200 H${sea[0] - 34} C${sea[0] - 40} 170 ${sea[0] - 18} ${sea[1] + 60} ${sea[0] - 24} ${sea[1] + 24}z`, class: 'trail-sea' }),
      // Elim's palms
      sv('ellipse', { cx: 360, cy: 176, rx: 22, ry: 6, class: 'trail-oasis' }),
      sv('path', { d: 'M352 174 l2 -22 M368 174 l-1 -18', class: 'trail-palm-trunk' }),
      sv('circle', { cx: 354, cy: 150, r: 8, class: 'trail-palm' }), sv('circle', { cx: 367, cy: 155, r: 7, class: 'trail-palm' }),
      // Sinai with the cloud on top
      sv('path', { d: `M${PTS[5][0] - 74} 200 L${PTS[5][0] - 6} 18 L${PTS[5][0] + 20} 46 L${PTS[5][0] + 34} 34 L${PTS[5][0] + 90} 200z`, class: 'trail-mountain' }),
      sv('ellipse', { cx: PTS[5][0] - 4, cy: 20, rx: 36, ry: 12, class: 'trail-cloud' }),
      // Canaan: the Jordan and green hills
      sv('path', { d: 'M880 200 C890 150 920 140 940 150 S990 120 1000 128 V200z', class: 'trail-hill' }),
      sv('path', { d: 'M900 0 V200 H1000 V0z', class: 'trail-canaan', fill: 'url(#trail-green)' }),
      sv('path', { d: 'M904 0 C914 40 894 80 906 120 S898 170 906 200', class: 'trail-river' }),
      base, done, nodes, labels, marker);

    let total = 0, stopsAt = PTS.map(() => 0), pos = 0, raf = 0;
    function measure() {
      try {
        total = base.getTotalLength();
        const tmp = sv('path', { d: '' }); svg.append(tmp);
        stopsAt = PTS.map((_, i) => { tmp.setAttribute('d', pathThrough(PTS, i)); return i ? tmp.getTotalLength() : 0; });
        tmp.remove();
      } catch (e) { total = 0; }
    }
    function setPos(len) {
      pos = len;
      let x = PTS[0][0], y = PTS[0][1];
      if (total) { const p = base.getPointAtLength(len); x = p.x; y = p.y; }
      marker.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      done.style.strokeDasharray = `${len} ${total + 10}`;
    }
    function mark(stop) {
      nodes.forEach((n, i) => n.setAttribute('class', 'trail-node' + (i < stop ? ' is-done' : i === stop ? ' is-now' : '')));
      labels.forEach((n, i) => n.setAttribute('class', 'trail-map-label' + (i === stop ? ' is-now' : '')));
    }
    return {
      el: svg,
      // Call once the svg is in the page.
      init(stop) { measure(); setPos(stopsAt[stop] || 0); mark(stop); },
      travel(to, ms, done2) {
        cancelAnimationFrame(raf);
        const from = pos, target = stopsAt[to] || 0;
        if (!total || ms <= 0) { setPos(target); mark(to); done2(); return; }
        const t0 = performance.now();
        const step = (now) => {
          if (!document.body.contains(svg)) return;
          const t = Math.min(1, (now - t0) / ms);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          setPos(from + (target - from) * e);
          if (t < 1) raf = requestAnimationFrame(step); else { mark(to); done2(); }
        };
        raf = requestAnimationFrame(step);
      },
      stop() { cancelAnimationFrame(raf); },
    };
  }

  BP.games.trail = {
    title: 'Wilderness Trail',
    color: 'var(--c-trail)',
    scoring: 'Points for the ending you reach (up to 1,200), plus your four supplies if you reach Kadesh, plus a speed bonus (up to 500 for the best ending) that drops every second.',
    badge() {
      const n = found().length;
      return n ? `Endings found: ${n}/${TRAIL_ENDING_ORDER.length}` : 'New';
    },
    mount(root) {
      const body = h('section', { class: 'panel trail-panel' });
      root.append(BP.gameHead('Wilderness Trail', 'Lead Israel from Egypt to the Promised Land. Every journey goes differently.'), body);
      let keyHandler = null, tick = 0, map = null, usingKeys = false;
      function onKey(e) {
        if (!document.body.contains(body)) { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); clearInterval(tick); if (map) map.stop(); return; }
        usingKeys = true;
        if (keyHandler && !e.altKey && !e.ctrlKey && !e.metaKey) keyHandler(e);
      }
      function onPointer() { usingKeys = false; }
      document.addEventListener('keydown', onKey);
      document.addEventListener('pointerdown', onPointer);
      intro();

      function endingsGrid(fresh) {
        const got = found();
        return h('ul', { class: 'trail-endings' }, TRAIL_ENDING_ORDER.map((id) => {
          const e = TRAIL_ENDINGS[id], has = got.includes(id);
          return h('li', { class: `trail-ending-chip tone-${e.tone}${has ? ' is-found' : ''}${id === fresh ? ' is-new' : ''}` },
            has ? e.title : 'Locked ending', id === fresh ? h('span', { class: 'trail-new' }, 'NEW') : null);
        }));
      }

      function intro() {
        keyHandler = null; clearInterval(tick);
        if (map) map.stop();
        map = makeMap();
        const n = found().length;
        body.replaceChildren(
          h('div', { class: 'trail-mapbox' }, map.el),
                    BP.howTo(
            h('li', null, 'Follow the cloud from Rameses in Egypt, through the Red Sea and Sinai, all the way to Canaan.'),
            h('li', null, 'Watch your four supplies: manna, water, morale and faith. If any of them hits zero, the journey ends early.'),
            h('li', null, 'At every stop something happens. Pick a choice (tap it, or press 1, 2 or 3). Results are never quite the same twice.'),
            h('li', null, 'At Kadesh the twelve spies come back. What the camp does there decides how your story ends.'),
            h('li', null, 'There are six endings to find. Better endings, more supplies left and a faster journey mean more points.')),
          h('div', { class: 'trail-found' }, h('span', { class: 'ref' }, n ? `Endings found: ${n} of ${TRAIL_ENDING_ORDER.length}` : 'No endings found yet'), endingsGrid()),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: play }, 'Start the journey')));
        map.init(0);
      }

      function play() {
        const st = Object.assign({}, START);
        let stop = 0, day = 1, over = false, boosted = false, revived = false;
        const used = new Set();
        const started = Date.now();
        map = makeMap();

        const dayEl = h('span', { class: 'trail-chip' }, 'Day 1');
        const stopEl = h('span', { class: 'trail-chip' }, '');
        const clockEl = h('span', { class: 'trail-chip trail-clock' }, '0:00');
        const whereEl = h('p', { class: 'trail-where', 'aria-live': 'polite' });
        const bars = {};
        const statsEl = h('div', { class: 'trail-stats' }, STATS.map((s) => {
          const fill = h('span', { class: 'trail-bar-fill' });
          const val = h('span', { class: 'trail-stat-val' }, String(st[s.k]));
          const fx = h('span', { class: 'trail-stat-fx', 'aria-hidden': 'true' });
          const box = h('div', { class: `trail-stat trail-${s.k}` },
            h('span', { class: 'trail-stat-ico' }, icon(s)),
            h('span', { class: 'trail-stat-name' }, s.label), val, fx,
            h('span', { class: 'trail-bar', role: 'meter', 'aria-label': s.label, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(st[s.k]) }, fill));
          bars[s.k] = { box, fill, val, fx, bar: box.lastChild, shown: st[s.k] };
          return box;
        }));
        const stage = h('div', { class: 'trail-stage' });
        body.replaceChildren(
          h('div', { class: 'trail-hud' }, h('span', { class: 'trail-chip trail-chip-game' }, 'Exodus'), dayEl, stopEl, clockEl),
          h('div', { class: 'trail-mapbox' }, map.el, whereEl),
          h('div', { class: 'trail-main' }, statsEl, stage));
        map.init(0);
        const hud = document.querySelector('.hud');
        body.style.setProperty('--trail-top', (hud ? hud.offsetHeight : 0) + 'px');
        drawStats({});
        updateHud();
        tick = setInterval(() => {
          if (!document.body.contains(body)) { clearInterval(tick); return; }
          clockEl.textContent = '⏱ ' + clock(Math.round((Date.now() - started) / 1000));
        }, 500);

        // Start card
        card({
          kicker: 'Rameses · Egypt', title: 'Out of Egypt', ref: 'Exodus 12-13',
          text: 'The Passover night is over. Six hundred thousand men on foot, plus families, flocks and dough still in the kneading troughs, march out of Egypt. The LORD goes before you in a pillar of cloud.',
          go: 'Follow the cloud', onGo: () => travel(1),
        });

        function updateHud() {
          dayEl.textContent = `Day ${day.toLocaleString('en-US')}`;
          stopEl.textContent = `Stop ${stop} of ${TRAIL_STOPS.length - 1}`;
          const nxt = TRAIL_STOPS[stop + 1];
          whereEl.replaceChildren(h('strong', null, TRAIL_STOPS[stop].name), nxt ? h('span', null, ` → next: ${nxt.name}`) : h('span', null, ' · the Promised Land'));
        }

        function drawStats(changes) {
          STATS.forEach((s) => {
            const b = bars[s.k], v = st[s.k];
            b.fill.style.width = v + '%';
            b.bar.setAttribute('aria-valuenow', String(v));
            b.box.classList.toggle('is-low', v <= 25);
            const c = changes[s.k];
            if (c) {
              b.fx.textContent = (c > 0 ? '+' : '') + c;
              b.fx.className = 'trail-stat-fx ' + (c > 0 ? 'up' : 'down');
              void b.fx.offsetWidth; b.fx.classList.add('show');
              b.box.classList.remove('flash-up', 'flash-down'); void b.box.offsetWidth;
              b.box.classList.add(c > 0 ? 'flash-up' : 'flash-down');
            }
            countTo(b, v);
          });
        }
        function countTo(b, v) {
          const from = b.shown; b.shown = v;
          if (from === v || reduced()) { b.val.textContent = String(v); return; }
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - t0) / 500);
            b.val.textContent = String(Math.round(from + (v - from) * t));
            if (t < 1 && document.body.contains(b.val)) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }

        // Apply a set of [lo, hi] deltas. Returns the real changes after clamping.
        function apply(d) {
          const ch = {};
          Object.entries(d || {}).forEach(([k, r]) => {
            const before = st[k];
            st[k] = clamp(before + rand(r));
            if (st[k] !== before) ch[k] = st[k] - before;
          });
          drawStats(ch);
          return ch;
        }
        function dead() {
          if (st.water <= 0 || st.manna <= 0) return 'thirst';
          if (st.faith <= 0) return 'idol';
          if (st.morale <= 0) return 'egypt';
          return null;
        }
        function chips(ch) {
          const list = STATS.filter((s) => ch[s.k]).map((s) => h('span', { class: `trail-delta ${ch[s.k] > 0 ? 'up' : 'down'}` }, icon(s), `${s.label} ${ch[s.k] > 0 ? '+' : '−'}${Math.abs(ch[s.k])}`));
          return list.length ? h('div', { class: 'trail-deltas' }, list) : null;
        }

        // One event card. o: {kicker, title, ref, text, note, choices, onPick} or {…, go, onGo}
        function card(o) {
          const btns = [];
          const res = h('div', { class: 'trail-result', 'aria-live': 'polite' });
          const el = h('article', { class: 'trail-card' + (o.road ? ' is-road' : '') },
            o.note || null,
            h('p', { class: 'trail-kicker' }, o.kicker),
            h('h2', { class: 'trail-title' }, o.title),
            o.ref ? h('p', { class: 'trail-ref' }, o.ref) : null,
            h('p', { class: 'trail-text' }, o.text),
            o.choices ? h('div', { class: 'trail-choices' }, o.choices.map((c, i) => {
              const b = h('button', { class: 'trail-choice', type: 'button', onclick: () => choose(i) },
                h('span', { class: 'trail-choice-num' }, String(i + 1)),
                h('span', { class: 'trail-choice-text' }, c.label, c.hint ? h('small', null, c.hint) : null));
              btns.push(b); return b;
            })) : null,
            res);
          stage.replaceChildren(el);
          if (o.go) showGo(o.go, o.onGo);
          else keyHandler = (e) => { const n = +e.key; if (n >= 1 && n <= btns.length) { e.preventDefault(); choose(n - 1); } };
          const first = btns[0] || el.querySelector('.trail-go');
          if (first && usingKeys) first.focus({ preventScroll: true });
          ensureVisible(el);

          function choose(i) {
            if (btns[i].disabled) return;
            keyHandler = null;
            btns.forEach((b, n) => { b.disabled = true; b.classList.add(n === i ? 'is-picked' : 'is-dim'); });
            const r = o.onPick(i);
            res.replaceChildren(...[
              r.cheer ? h('p', { class: `trail-cheer ${r.good ? 'good' : 'bad'}` }, r.cheer) : null,
              r.text ? h('p', { class: 'trail-out' }, r.text) : null,
              chips(r.ch || {})].filter(Boolean));
            res.classList.add('show');
            showGo(r.go, r.onGo);
          }
          function showGo(label, fn) {
            const go = h('button', { class: 'trail-go', type: 'button', onclick: () => { keyHandler = null; go.disabled = true; fn(); } }, label, h('span', { 'aria-hidden': 'true' }, ' →'));
            res.append(go);
            keyHandler = (e) => { if (e.key === 'Enter' && document.activeElement !== go) { e.preventDefault(); go.click(); } };
            if (usingKeys) go.focus({ preventScroll: true });
            ensureVisible(go);
          }
        }
        function ensureVisible(el) {
          requestAnimationFrame(() => {
            const r = el.getBoundingClientRect();
            if (r.bottom > window.innerHeight - 8) {
              const y = window.scrollY + Math.min(r.top - 80, r.bottom - window.innerHeight + 24);
              window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
            }
          });
        }

        // Walk to the next stop: animate the map, roll the road costs, then show what happens there.
        function travel(to) {
          keyHandler = null;
          const leg = TRAIL_STOPS[to];
          const days = rand(leg.days);
          const startDay = day;
          stage.replaceChildren(h('article', { class: 'trail-card is-walking' },
            h('p', { class: 'trail-kicker' }, 'On the road'),
            h('h2', { class: 'trail-title' }, `To ${leg.name}`),
            h('p', { class: 'trail-text' }, leg.road),
            h('div', { class: 'trail-walk', 'aria-hidden': 'true' }, h('span'), h('span'), h('span'))));
          const ms = reduced() ? 0 : Math.min(1600, 900 + days * 20);
          const t0 = performance.now();
          const tickDay = (now) => {
            if (!document.body.contains(dayEl)) return;
            const t = ms ? Math.min(1, (now - t0) / ms) : 1;
            dayEl.textContent = `Day ${Math.round(startDay + days * t).toLocaleString('en-US')}`;
            if (t < 1) requestAnimationFrame(tickDay);
          };
          requestAnimationFrame(tickDay);
          map.travel(to, ms, () => {
            if (!document.body.contains(body)) return;
            stop = to; day = startDay + days;
            updateHud();
            const ch = apply(ROAD[to]);
            const note = h('div', { class: 'trail-roadnote' },
              h('span', { class: 'trail-roadnote-label' }, `${days} days on the road`), chips(ch));
            const end = dead();
            const queue = [];
            if (Math.random() < TRAIL_CHANCE[to]) {
              const pool = TRAIL_EVENTS.filter((e) => !e.land && !used.has(e.id) && to >= e.at[0] && to <= e.at[1]);
              if (pool.length) queue.push(pick(pool));
            }
            const lands = TRAIL_EVENTS.filter((e) => e.land && to >= e.at[0] && to <= e.at[1]);
            queue.push(pick(lands));
            if (end) return rescue(end, () => endCard(end, note), () => runQueue(queue, note));
            runQueue(queue, note);
          });
        }

        function runQueue(queue, note) {
          const ev = queue.shift();
          used.add(ev.id);
          const choices = shuffle(ev.choices);
          card({
            note, kicker: ev.land ? `Stop ${stop} · ${TRAIL_STOPS[stop].name}` : 'On the road',
            title: ev.title, ref: ev.ref, text: ev.text, choices,
            onPick(i) {
              const c = choices[i];
              const out = c.out.length === 1 ? c.out[0] : weighted(c.out);
              if (out.kadesh) return kadesh(out.kadesh);
              const ch = apply(out.d);
              const sum = Object.values(ch).reduce((a, b) => a + b, 0);
              const end = dead();
              const cont = queue.length ? () => runQueue(queue) : stop < TRAIL_STOPS.length - 1 ? () => travel(stop + 1) : () => endCard('promised');
              const next = end ? () => rescue(end, () => endCard(end), cont) : queue.length ? () => runQueue(queue) : stop < TRAIL_STOPS.length - 1 ? () => travel(stop + 1) : () => endCard('promised');
              const label = end ? 'See what happens' : queue.length ? 'Continue' : stop < TRAIL_STOPS.length - 1 ? 'Follow the cloud' : 'Enter the land';
              return { text: out.t, ch, cheer: sum >= 10 ? pick(GOOD) : sum <= -10 ? pick(BAD) : '', good: sum > 0, go: label, onGo: next };
            },
          });
        }
        // A supply hit zero: offer a Second Chance (once per run) before the journey ends.
        async function rescue(end, lose, cont) {
          if (revived || over) return lose();
          revived = true; keyHandler = null;
          const low = STATS.filter((s) => st[s.k] <= 0);
          const names = low.map((s) => s.label.toLowerCase()).join(' and ');
          const ok = await BP.shop.offer('revive', {
            title: 'Second Chance',
            text: `God sends help in the wilderness: restore ${names} to 35 and keep going?`,
          });
          if (!document.body.contains(body) || over) return;
          if (!ok) return lose();
          boosted = true;
          const ch = {};
          low.forEach((s) => { ch[s.k] = 35 - st[s.k]; st[s.k] = 35; });
          drawStats(ch);
          card({
            kicker: 'Second Chance', title: 'Help from heaven', ref: 'Psalm 121:1-2',
            text: `The LORD provides in the wilderness. ${names.charAt(0).toUpperCase() + names.slice(1)} restored to 35. The camp gets up and keeps walking.`,
            note: chips(ch), go: 'Keep going', onGo: cont,
          });
        }
        function weighted(outs) {
          const ws = outs.map((o) => o.w * (o.faith ? 0.4 + st.faith / 60 : 1));
          let r = Math.random() * ws.reduce((a, b) => a + b, 0);
          for (let i = 0; i < outs.length; i++) { r -= ws[i]; if (r <= 0) return outs[i]; }
          return outs[outs.length - 1];
        }

        // The decision at Kadesh.
        function kadesh(choice) {
          if (choice === 'go') {
            const roll = st.faith * 0.6 + st.morale * 0.4 + rand([-12, 12]);
            if (roll >= 55) {
              const ch = apply({ faith: [4, 6], morale: [4, 8] });
              return { text: 'Caleb stills the people. One tribe after another says yes. No forty years of wandering for this camp: on to the Jordan!', ch, cheer: pick(GOOD), good: true, go: 'Follow the cloud', onGo: () => travel(stop + 1) };
            }
            if (st.faith >= 45) return { text: 'The crowd wants to stone Joshua and Caleb. You stand beside them anyway. Faith that strong is rare.', cheer: 'Stand firm!', good: true, go: 'See what happens', onGo: () => endCard('remnant') };
            return { text: 'You speak up, but your voice shakes, and the fear in the camp is louder.', cheer: pick(BAD), go: 'See what happens', onGo: () => endCard('wander') };
          }
          if (choice === 'ten') return { text: 'The whole camp weeps all night. “Would God we had died in this wilderness!”', cheer: pick(BAD), go: 'See what happens', onGo: () => endCard('wander') };
          return { text: '“Let us make a captain, and let us return into Egypt.”', cheer: pick(BAD), go: 'See what happens', onGo: () => endCard('egypt') };
        }

        function endCard(id, note) {
          if (over) return;
          over = true; keyHandler = null; clearInterval(tick);
          const secs = Math.max(1, Math.round((Date.now() - started) / 1000));
          const e = TRAIL_ENDINGS[id];
          // Supplies only count if you made it as far as Kadesh; the speed bonus scales with the ending.
          const left = stop >= 6 ? STATS.reduce((a, s) => a + st[s.k], 0) : 0;
          const speed = Math.round(Math.max(0, SPEED_MAX - SPEED_RATE * secs) * e.base / 1200);
          const points = e.base + left + speed;
          const got = found();
          const fresh = !got.includes(id);
          if (fresh) store.set('trail-endings', got.concat(id));
          const best = store.get('trail-best', 0);
          if (points > best) store.set('trail-best', points);
          if (e.tone === 'good') BP.confetti();
          const n = found().length;
          const show = () => {
            if (!document.body.contains(body)) return;
            body.replaceChildren(h('div', { class: 'trail-end' },
              h('div', { class: `trail-end-banner tone-${e.tone}` },
                h('p', { class: 'trail-kicker' }, `Ending ${TRAIL_ENDING_ORDER.indexOf(id) + 1} of ${TRAIL_ENDING_ORDER.length} · Day ${day.toLocaleString('en-US')}`),
                h('h2', { class: 'trail-end-title' }, e.title),
                h('p', { class: 'trail-end-story' }, e.story)),
              note || null,
              h('div', { class: 'result trail-score' },
                h('p', { class: 'big-score' }, points.toLocaleString('en-US')),
                h('p', null, 'points')),
              h('dl', { class: 'trail-breakdown' },
                h('div', null, h('dt', null, 'Ending'), h('dd', null, e.base.toLocaleString('en-US'))),
                h('div', null, h('dt', null, stop >= 6 ? 'Supplies left' : 'Supplies (from Kadesh)'), h('dd', null, String(left))),
                h('div', null, h('dt', null, `Speed (${clock(secs)})`), h('dd', null, String(speed)))),
              h('div', { class: 'feedback good trail-lesson' },
                h('strong', null, 'Where this points'),
                h('p', null, e.lesson)),
              BP.verse(e.verse),
              h('div', { class: 'trail-found' },
                h('span', { class: 'ref' }, fresh ? `New ending found! ${n} of ${TRAIL_ENDING_ORDER.length}` : `Endings found: ${n} of ${TRAIL_ENDING_ORDER.length}`),
                endingsGrid(fresh ? id : null)),
              h('div', { class: 'btn-row' },
                h('button', { class: 'btn btn-primary', type: 'button', onclick: play }, n < TRAIL_ENDING_ORDER.length ? 'Find another ending' : 'Journey again'),
                h('button', { class: 'btn', type: 'button', onclick: intro }, 'How to play')),
              BP.finish('trail', {
                points, secs, coins: e.coins, boosted,
                detail: `${e.title} · ${clock(secs)}`,
                kicker: 'Wilderness Trail', sub: e.title,
                shareText: () => `I reached “${e.title}” in Wilderness Trail on Bible Playground and scored ${points.toLocaleString('en-US')}. ${n} of ${TRAIL_ENDING_ORDER.length} endings found. Can you lead Israel better?`,
              })));
            window.scrollTo({ top: Math.max(0, body.getBoundingClientRect().top + window.scrollY - 70), behavior: reduced() ? 'auto' : 'smooth' });
          };
          if (note) {
            // Ran out on the road: show the road costs first, then the ending.
            card({ note, kicker: 'On the road', title: id === 'thirst' ? 'The skins are empty' : id === 'idol' ? 'Faith is gone' : 'The camp gives up', text: TRAIL_ENDINGS[id].story.split('. ')[0] + '.', go: 'See what happens', onGo: show });
          } else show();
        }
      }
    },
  };
})();
