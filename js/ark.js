// Two by Two: animals keep arriving. Tap two that match (or drag one onto its partner) to send
// the pair onto the ark. The flood keeps rising; every pair you load holds it back a little.
(function () {
  const { h, shuffle, store } = BP;
  const ANIMALS = ['🦁', '🐘', '🦒', '🐪', '🐑', '🐐', '🐄', '🐎', '🐖', '🐇', '🐻', '🦊', '🐺', '🐒', '🦓', '🦛', '🦏', '🐢', '🦉', '🐓', '🦅', '🐿️', '🦌', '🐫', '🐃', '🦔', '🐊', '🦩'];
  const NAMES = { '🦁': 'lion', '🐘': 'elephant', '🦒': 'giraffe', '🐪': 'camel', '🐑': 'sheep', '🐐': 'goat', '🐄': 'cow', '🐎': 'horse', '🐖': 'pig', '🐇': 'rabbit', '🐻': 'bear', '🦊': 'fox', '🐺': 'wolf', '🐒': 'monkey', '🦓': 'zebra', '🦛': 'hippo', '🦏': 'rhino', '🐢': 'tortoise', '🦉': 'owl', '🐓': 'rooster', '🦅': 'eagle', '🐿️': 'squirrel', '🦌': 'deer', '🐫': 'two-humped camel', '🐃': 'buffalo', '🦔': 'hedgehog', '🐊': 'crocodile', '🦩': 'flamingo' };
  const SLOTS = 16, GOAL = 40; // pairs needed before the rain stops
  const PAIR_DROP = 7;         // how far (in %) each loaded pair pushes the water back down
  const ARK_SVG = `<svg viewBox="0 0 240 110" role="presentation">
    <defs>
      <linearGradient id="arkWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C08552"/><stop offset="1" stop-color="#6E4321"/></linearGradient>
      <linearGradient id="arkRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C5A30"/><stop offset="1" stop-color="#5A3518"/></linearGradient>
    </defs>
    <path d="M60 46 L120 18 L180 46 Z" fill="url(#arkRoof)"/>
    <rect x="66" y="44" width="108" height="26" rx="4" fill="#A87444"/>
    <rect x="80" y="50" width="12" height="10" rx="2" fill="#FFE8A3" opacity=".85"/><rect x="100" y="50" width="12" height="10" rx="2" fill="#FFE8A3" opacity=".85"/>
    <rect x="128" y="50" width="12" height="10" rx="2" fill="#FFE8A3" opacity=".85"/><rect x="148" y="50" width="12" height="10" rx="2" fill="#FFE8A3" opacity=".85"/>
    <path d="M12 66 H228 Q220 100 186 104 H54 Q20 100 12 66 Z" fill="url(#arkWood)"/>
    <path d="M22 78 H218 M30 90 H210" stroke="#5A3518" stroke-width="2" opacity=".45"/>
    <rect x="108" y="70" width="24" height="26" rx="3" fill="#4A2A12"/>
  </svg>`;

  BP.games.ark = {
    title: 'Two by Two',
    color: 'var(--c-ark)',
    scoring: '100 points per pair, combo bonuses for quick pairs, and a full-ark bonus that grows the faster you fill it.',
    badge() {
      const best = store.get('ark-best', null);
      return best == null ? 'New' : `Best: ${best} pairs`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Two by Two', 'Get the animals onto the ark in pairs before the flood rises.'), body);
      let stop = () => {};
      intro();

      function intro() {
        stop();
        body.replaceChildren(
                    BP.howTo(
            h('li', null, 'Animals keep arriving. Tap two that match, or drag one onto its partner.'),
            h('li', null, 'Each pair walks onto the ark and pushes the water back down.'),
            h('li', null, 'A wrong match makes the water jump up. If the yard fills up, it rises faster.'),
            h('li', null, 'Pairs made close together build a combo for extra points.'),
            h('li', null, `Load ${GOAL} pairs before the flood reaches the top. The faster you fill the ark, the bigger your bonus.`)),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: play }, 'Start')));
      }

      function play() {
        stop();
        let water = 0, pairs = 0, wrong = 0, picked = null, over = false, last = performance.now(), spawnIn = 0;
        let combo = 0, bestCombo = 0, comboPts = 0, lastPair = 0, revived = false, boosted = false;
        const started = Date.now();
        const slots = Array(SLOTS).fill(null); // each: { a: emoji, el }
        let queue = [];
        const loaded = [];

        const yard = h('div', { class: 'ark-yard', role: 'group', 'aria-label': 'Animals waiting for the ark' });
        const flood = h('div', { class: 'ark-water', 'aria-hidden': 'true' }, h('span', { class: 'ark-wave ark-wave-back' }), h('span', { class: 'ark-wave' }));
        const fx = h('div', { class: 'ark-fx', 'aria-hidden': 'true' });
        const boat = h('div', { class: 'ark-boat', 'aria-hidden': 'true' });
        boat.innerHTML = ARK_SVG;
        const load = h('div', { class: 'ark-load', 'aria-hidden': 'true' });
        const sky = h('div', { class: 'ark-sky', 'aria-hidden': 'true' }, boat, load);
        const field = h('div', { class: 'ark-field' }, h('span', { class: 'ark-rain', 'aria-hidden': 'true' }), h('span', { class: 'ark-flash', 'aria-hidden': 'true' }), sky, yard, flood, fx);
        const count = h('span', { class: 'ark-chip' }, `🐾 0/${GOAL}`);
        const clockEl = h('span', { class: 'ark-chip' }, '⏱ 0:00');
        const comboEl = h('span', { class: 'ark-chip ark-combo', hidden: true });
        const meter = h('span', { class: 'ark-meter', role: 'meter', 'aria-label': 'Flood level', 'aria-valuemin': '0', 'aria-valuemax': '100' }, h('span'));
        const msg = h('p', { class: 'ark-msg', 'aria-live': 'polite' });
        body.replaceChildren(h('div', { class: 'ark-hud' }, h('span', { class: 'ark-chip ark-chip-game' }, '🌊 Flood'), meter, count, clockEl, comboEl), field, msg);

        for (let i = 0; i < SLOTS; i++) yard.append(h('div', { class: 'ark-slot' }));
        for (let i = 0; i < 6; i++) spawn();

        // Animals arrive in pairs, but the two halves of a pair are shuffled into the queue apart.
        function refill() {
          const batch = shuffle(ANIMALS).slice(0, 4);
          queue = queue.concat(shuffle([...batch, ...batch]));
        }
        function spawn() {
          const free = slots.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0);
          if (!free.length) return false;
          if (!queue.length) refill();
          const a = queue.shift();
          const i = free[Math.floor(Math.random() * free.length)];
          const el = h('button', { class: 'ark-animal', type: 'button', 'aria-label': NAMES[a] }, a);
          slots[i] = { a, el };
          el.addEventListener('pointerdown', (e) => grab(e, i));
          el.addEventListener('click', (e) => { if (e.detail === 0) select(i); }); // keyboard
          yard.children[i].replaceChildren(el);
          return true;
        }

        function select(i) {
          if (over || !slots[i]) return;
          if (picked === i) { slots[i].el.classList.remove('picked'); picked = null; return; }
          if (picked == null) { picked = i; slots[i].el.classList.add('picked'); return; }
          tryPair(picked, i);
        }
        function tryPair(i, j) {
          const A = slots[i], B = slots[j];
          picked = null;
          if (!A || !B || i === j) return;
          A.el.classList.remove('picked');
          if (A.a === B.a) {
            pairs++; BP.sfx('coin'); BP.buzz(15);
            water = Math.max(0, water - PAIR_DROP);
            const now = performance.now();
            combo = now - lastPair < 2500 ? combo + 1 : 1; lastPair = now;
            bestCombo = Math.max(bestCombo, combo);
            if (combo > 1) comboPts += (combo - 1) * 25;
            comboEl.hidden = combo < 2; comboEl.textContent = `🔥 x${combo}`;
            comboEl.classList.remove('pop'); void comboEl.offsetWidth; comboEl.classList.add('pop');
            [i, j].forEach((k) => {
              const el = slots[k].el;
              sparkle(el);
              el.classList.add('boarding'); setTimeout(() => el.remove(), 450); slots[k] = null;
            });
            loaded.unshift(A.a);
            load.replaceChildren(...loaded.slice(0, 8).map((a, n) => h('span', { class: n === 0 ? 'new' : null }, a + a)));
            boat.classList.remove('bump'); void boat.offsetWidth; boat.classList.add('bump');
            msg.textContent = combo > 1 ? `Combo x${combo}! ${A.a}${A.a} on board.` : `${BP.cheer()} ${A.a}${A.a} on board.`;
            count.textContent = `🐾 ${pairs}/${GOAL}`;
            if (pairs >= GOAL) return end(true);
          } else {
            wrong++; BP.sfx('bad'); BP.buzz([50, 30, 50]); water = Math.min(100, water + 6); combo = 0; comboEl.hidden = true;
            [A, B].forEach((s) => { s.el.classList.remove('nope'); void s.el.offsetWidth; s.el.classList.add('nope'); });
            msg.textContent = 'Those two don’t match. The water rose!';
          }
        }

        // A small burst of light where a pair leaves the yard.
        function sparkle(el) {
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          const f = field.getBoundingClientRect(), r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2 - f.left, cy = r.top + r.height / 2 - f.top;
          for (let n = 0; n < 10; n++) {
            const a = (n / 10) * Math.PI * 2 + Math.random() * 0.5, d = 30 + Math.random() * 30;
            const p = h('i', { style: `left:${cx}px;top:${cy}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px` });
            fx.append(p); setTimeout(() => p.remove(), 650);
          }
        }

        // Dragging: lift the animal, drop it on another slot to pair them. A tiny move counts as a tap.
        function grab(e, i) {
          if (over || !slots[i]) return;
          e.preventDefault();
          const el = slots[i].el; const x0 = e.clientX, y0 = e.clientY; let moved = false;
          try { el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
          const onMove = (ev) => {
            const dx = ev.clientX - x0, dy = ev.clientY - y0;
            if (!moved && Math.hypot(dx, dy) < 8) return;
            moved = true; el.classList.add('dragging'); el.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`;
          };
          const onUp = (ev) => {
            el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp);
            el.classList.remove('dragging'); el.style.transform = '';
            if (!moved) return select(i);
            el.style.visibility = 'hidden';
            const under = document.elementFromPoint(ev.clientX, ev.clientY);
            el.style.visibility = '';
            const slotEl = under && under.closest('.ark-slot');
            const j = slotEl ? [...yard.children].indexOf(slotEl) : -1;
            if (picked != null && slots[picked]) slots[picked].el.classList.remove('picked');
            picked = null;
            if (j >= 0 && j !== i && slots[j]) tryPair(i, j);
          };
          el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp);
        }

        // Game loop: the water rises over time, faster as you load more and when the yard is full.
        let raf = requestAnimationFrame(loop);
        const onHide = () => { last = performance.now(); };
        document.addEventListener('visibilitychange', onHide);
        stop = () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onHide); };

        function loop(now) {
          if (!document.body.contains(field)) return stop();
          const dt = Math.min(0.1, (now - last) / 1000); last = now;
          const full = slots.every(Boolean);
          const rate = 1.6 + pairs * 0.09 + (full ? 4 : 0); // % per second
          water = Math.min(100, water + rate * dt);
          spawnIn -= dt;
          if (spawnIn <= 0) { spawn(); spawnIn = Math.max(0.55, 1.5 - pairs * 0.025); }
          flood.style.height = water + '%';
          const secs = Math.floor((Date.now() - started) / 1000);
          if (clockEl.dataset.s !== String(secs)) { clockEl.dataset.s = secs; clockEl.textContent = `⏱ ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`; }
          if (Math.random() < dt * (0.05 + water / 900)) { field.classList.remove('flash'); void field.offsetWidth; field.classList.add('flash'); }
          meter.firstChild.style.width = water + '%';
          meter.setAttribute('aria-valuenow', String(Math.round(water)));
          meter.classList.toggle('high', water > 70);
          if (water >= 100) {
            // Coin Shop: a Second Chance pushes the flood back down, once per run.
            if (revived || !BP.shop) return end(false);
            revived = true;
            BP.shop.offer('revive', { title: 'Second Chance?', text: 'Push the flood back down and keep loading the ark.' }).then((ok) => {
              if (!document.body.contains(field)) return;
              if (!ok) return end(false);
              boosted = true; water = 45; last = performance.now();
              msg.textContent = 'Second Chance! The water went down.';
              raf = requestAnimationFrame(loop);
            });
            return;
          }
          raf = requestAnimationFrame(loop);
        }

        function end(won) {
          if (over) return;
          over = true; stop();
          const best = store.get('ark-best', 0);
          if (pairs > best) store.set('ark-best', pairs);
          if (won) BP.confetti();
          const secs = Math.round((Date.now() - started) / 1000);
          const speed = won ? Math.max(0, 300 - secs) * 10 : 0; // finish inside five minutes for a speed bonus
          const points = pairs * 100 + comboPts + (won ? 1500 + Math.round(100 - water) * 10 + speed : 0);
          setTimeout(() => body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
            h('p', { class: 'big-score' }, String(pairs)),
            h('p', null, `pairs on the ark in ${secs} seconds${wrong ? `, ${wrong} wrong match${wrong === 1 ? '' : 'es'}` : ''}`),
            h('p', { class: 'ref' }, `${points.toLocaleString('en-US')} points${bestCombo > 1 ? ` · best combo x${bestCombo}` : ''}${speed ? ` · +${speed} speed bonus` : ''}`),
            h('h2', { class: 'panel-title' }, won ? 'The ark is full and the door is shut. Amazing!' : pairs >= 20 ? 'So close! The water won this time.' : 'The flood came. Shake it off and try again!'),
            h('div', { class: 'feedback good', style: 'text-align:left' },
              h('strong', null, 'Safe inside'),
              h('p', null, 'God told Noah exactly how to be saved, and then God himself shut the door. Peter says the ark is a picture of how Jesus saves us (1 Peter 3:20–21). Everyone inside was safe because of the ark, not because they were strong swimmers.')),
            BP.verse({ text: 'And they that went in, went in male and female of all flesh, as God had commanded him: and the LORD shut him in.', ref: 'Genesis 7:16' }),
            h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: play }, 'Play again')),
            BP.finish('ark', { points, secs, boosted, detail: `${pairs} pairs`, coins: pairs * 2 + (won ? 40 : 0) }))), won ? 400 : 700);
        }
      }
    },
  };
})();
