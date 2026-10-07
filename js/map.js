// Bible Map Dash: a place appears, you tap where it is on the map. The closer you are, the more you score.
// The map is drawn here from real coordinates (simplified), so it's original art.
(function () {
  const { h, shuffle, store } = BP;
  const ROUND = 8, SECONDS = 20;
  // Map window and a simple flat projection in kilometres.
  const LON0 = 34.0, LON1 = 36.6, LAT0 = 30.85, LAT1 = 33.75;
  const KX = 111.32 * Math.cos(32.3 * Math.PI / 180), KY = 110.57;
  const W = (LON1 - LON0) * KX, H = (LAT1 - LAT0) * KY;
  const px = (lat, lon) => [(lon - LON0) * KX, (LAT1 - lat) * KY];
  const path = (pts, close) => pts.map(([la, lo], i) => (i ? 'L' : 'M') + px(la, lo).map((v) => v.toFixed(1)).join(' ')).join('') + (close ? 'Z' : '');

  const SEA = [[31.22, 34.0], [31.32, 34.22], [31.5, 34.42], [31.67, 34.55], [31.8, 34.64], [32.05, 34.74], [32.33, 34.85], [32.5, 34.88],
    [32.7, 34.94], [32.83, 34.96], [32.8, 35.03], [32.85, 35.07], [32.93, 35.07], [33.09, 35.1], [33.27, 35.19], [33.4, 35.25], [33.56, 35.37],
    [33.75, 35.47], [33.75, 34.0]];
  const GALILEE = [[32.88, 35.52], [32.9, 35.58], [32.85, 35.65], [32.78, 35.64], [32.71, 35.59], [32.74, 35.54], [32.82, 35.5]];
  const DEAD = [[31.77, 35.47], [31.76, 35.55], [31.6, 35.58], [31.4, 35.54], [31.2, 35.48], [31.05, 35.42], [31.1, 35.38], [31.35, 35.41], [31.55, 35.42]];
  const JORDAN = [[32.71, 35.57], [32.55, 35.56], [32.35, 35.55], [32.1, 35.53], [31.95, 35.54], [31.77, 35.52]];
  const UPPER_JORDAN = [[33.25, 35.63], [33.1, 35.61], [32.9, 35.6]];

  function mapSvg() {
    const t = (lat, lon, text, cls) => { const [x, y] = px(lat, lon); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}">${text}</text>`; };
    let grid = '';
    for (let lat = 31; lat <= 33.5; lat += 0.5) { const y = ((LAT1 - lat) * KY).toFixed(1); grid += `<path d="M0 ${y}H${W.toFixed(1)}" class="map-grid"/>`; }
    for (let lon = 34.5; lon <= 36.5; lon += 0.5) { const x = ((lon - LON0) * KX).toFixed(1); grid += `<path d="M${x} 0V${H.toFixed(1)}" class="map-grid"/>`; }
    return `<svg class="map-svg" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" role="img" aria-label="Map of the Bible lands">
      <rect width="100%" height="100%" class="map-land"/>
      ${grid}
      <path d="${path(SEA, true)}" class="map-water"/>
      <path d="${path(GALILEE, true)}" class="map-water map-lake"/>
      <path d="${path(DEAD, true)}" class="map-water map-lake"/>
      <path d="${path(JORDAN)}" class="map-river"/><path d="${path(UPPER_JORDAN)}" class="map-river"/>
      ${t(32.35, 34.2, 'GREAT SEA', 'map-label')}
      ${t(32.84, 35.7, 'Sea of', 'map-label map-small')}${t(32.78, 35.7, 'Galilee', 'map-label map-small')}
      ${t(31.5, 35.65, 'Dead', 'map-label map-small')}${t(31.44, 35.65, 'Sea', 'map-label map-small')}
      ${t(32.25, 35.6, 'Jordan', 'map-label map-small map-river-label')}
      <g class="map-compass" transform="translate(${(W - 22).toFixed(1)} ${(H - 26).toFixed(1)})"><path d="M0 -14 L5 4 L0 0 L-5 4 Z"/><text y="16" text-anchor="middle">N</text></g>
      <g class="map-scale" transform="translate(12 ${(H - 14).toFixed(1)})"><path d="M0 0H50"/><text x="25" y="-5" text-anchor="middle">50 km</text></g>
      <g class="map-pins"></g>
    </svg>`;
  }
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const el = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); return el; };

  BP.games.map = {
    title: 'Bible Map Dash',
    color: 'var(--c-map)',
    scoring: 'Up to 1,000 points per place: closer and faster taps score more.',
    badge() {
      const best = store.get('map-best', null);
      return best == null ? 'New' : `Best ${best.toLocaleString('en-US')} points`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Bible Map Dash', 'A Bible place pops up. Tap where it is on the map, fast.'), body);
      let stop = () => {};
      intro();

      function intro() {
        stop();
        body.replaceChildren(
                    BP.howTo(
            h('li', null, `You get ${ROUND} places from the Bible, with a clue for each.`),
            h('li', null, `Tap where you think it is. You have ${SECONDS} seconds for each one.`),
            h('li', null, 'Up to 1,000 points each. Right on top of it scores the most.'),
            h('li', null, 'Use the Great Sea, the Sea of Galilee, the Jordan and the Dead Sea to find your way.')),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: run }, 'Start')));
      }

      function run() {
        const set = BP.fresh('map', BIBLE_PLACES, ROUND);
        let i = 0, total = 0, boosted = false;
        const results = [];
        const started = Date.now();
        next();

        function next() {
          stop();
          const place = set[i];
          let left = SECONDS, done = false;
          const wrap = h('div', { class: 'map-wrap' }); wrap.innerHTML = mapSvg();
          const svg = wrap.querySelector('svg'); const pins = svg.querySelector('.map-pins');
          const timer = h('span', { class: 'charade-timer tl-timer' }, left);
          const out = h('div', { 'aria-live': 'polite' });
          // Extra Time power-up: +15 seconds, once per run.
          const extra = boosted ? null : BP.shop.chip('time', () => {
            if (done) return;
            boosted = true; left += 15;
            timer.textContent = left; timer.classList.toggle('low', left <= 5);
          });
          body.replaceChildren(
            h('div', { class: 'meta-row' }, h('span', { class: 'pill pill-game' }, `Place ${i + 1} of ${set.length}`), h('span', null, `${total.toLocaleString('en-US')} pts`), timer, extra),
            h('div', { class: 'map-ask' }, h('p', { class: 'map-name' }, place.name), h('p', { class: 'map-clue' }, place.clue)),
            wrap, out);

          svg.addEventListener('pointerdown', (e) => {
            if (done) return;
            const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
            const p = pt.matrixTransform(svg.getScreenCTM().inverse());
            guess([p.x, p.y]);
          });
          const tick = setInterval(() => {
            if (!document.body.contains(timer)) return clearInterval(tick);
            left--; timer.textContent = left; timer.classList.toggle('low', left <= 5);
            if (left <= 0) guess(null);
          }, 1000);
          stop = () => clearInterval(tick);

          function guess(at) {
            if (done) return;
            done = true; stop(); if (extra) extra.remove();
            const real = px(place.lat, place.lon);
            const km = at ? Math.hypot(at[0] - real[0], at[1] - real[1]) : null;
            const pts = km == null ? 0 : Math.round(1000 * Math.exp(-km / 30) * (0.7 + 0.3 * Math.min(1, left / SECONDS))); // a fast tap keeps more points
            total += pts; results.push({ place, km, pts });
            if (at) {
              pins.append(svgEl('path', { d: `M${at[0]} ${at[1]}L${real[0]} ${real[1]}`, class: 'map-line' }));
              pins.append(svgEl('circle', { cx: at[0], cy: at[1], r: 4.5, class: 'map-guess' }));
            }
            pins.append(svgEl('circle', { cx: real[0], cy: real[1], r: 5.5, class: 'map-real' }));
            const label = svgEl('text', { x: real[0] + (real[0] > W - 60 ? -8 : 8), y: real[1] - 7, class: 'map-pin-label', 'text-anchor': real[0] > W - 60 ? 'end' : 'start' });
            label.textContent = place.name; pins.append(label);
            const verdict = km == null ? 'Time’s up!' : km < 8 ? `Bullseye! ${BP.cheer()}` : km < 25 ? 'Very close!' : km < 60 ? 'Not far off.' : 'Way off. Now you know!';
            const last = i === set.length - 1;
            const btn = h('button', { class: 'btn btn-primary', onclick: () => { i++; last ? finish() : next(); } }, last ? 'See my score' : 'Next place');
            out.replaceChildren(h('div', { class: 'feedback ' + (pts >= 400 ? 'good' : 'bad') },
              h('strong', null, `${verdict} +${pts}`),
              km == null ? '' : h('p', { class: 'ref' }, `${Math.round(km)} km away`),
              h('p', null, place.note)),
              h('div', { class: 'btn-row', style: 'margin-top:14px' }, btn));
            btn.focus({ preventScroll: true });
          }
        }

        function finish() {
          stop();
          const best = store.get('map-best', 0);
          if (total > best) store.set('map-best', total);
          if (total >= 5000) BP.confetti();
          const secs = Math.round((Date.now() - started) / 1000);
          const msg = total >= 6000 ? 'Bible geographer! Amazing.' : total >= 4000 ? 'You know your way around.' : total >= 2000 ? 'Good going. The map gets easier every round.' : 'No worries. Every round teaches you the map.';
          body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
            h('p', { class: 'big-score' }, total.toLocaleString('en-US')),
            h('p', null, `points out of ${(ROUND * 1000).toLocaleString('en-US')} in ${secs} seconds`),
            h('h2', { class: 'panel-title' }, msg),
            h('ol', { class: 'map-results' }, results.map((r) => h('li', null, h('strong', null, r.place.name), ' ', h('span', { class: 'ref' }, r.km == null ? 'no guess' : `${Math.round(r.km)} km · +${r.pts}`)))),
            h('div', { class: 'feedback good', style: 'text-align:left' },
              h('strong', null, 'Real places, real history'),
              h('p', null, 'The Bible happens in towns you can still visit today. God stepped into real history in a real place, when Jesus was born in Bethlehem.')),
            BP.verse({ text: 'But when the fulness of the time was come, God sent forth his Son, made of a woman, made under the law.', ref: 'Galatians 4:4' }),
            h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: run }, 'Play again')),
            BP.finish('map', { points: total, secs, detail: `${ROUND} places`, coins: Math.round(total / 100), boosted })));
        }
      }
    },
  };
})();
