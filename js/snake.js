// Books of the Bible Snake: a modern take on snake. Eat the books in order. Each right book makes
// the snake longer and faster. A wrong book or your own tail costs a life. The walls wrap around.
(function () {
  const { h, store } = BP;
  const COLS = 10, ROWS = 10, LIVES = 3, DECOYS = 2;
  const START_MS = 260, MIN_MS = 110, STEP_MS = 6; // tick speed: starts slow, speeds up per book
  const SIZE = 720, PAR_SECS = 5; // board size in canvas pixels; seconds per book before the speed bonus runs out
  const MODES = {
    ot: { label: 'Old Testament', from: 0, to: 38 },
    nt: { label: 'New Testament', from: 39, to: 65 },
    all: { label: 'Whole Bible', from: 0, to: 65 },
  };
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };

  // Each part of the Bible gets its own colour, so players learn the sections as they go.
  const SECTIONS = [
    { to: 4, name: 'Law', c1: '#FFA94D', c2: '#E8590C', ink: '#fff' },
    { to: 16, name: 'History', c1: '#C0EB75', c2: '#74B816', ink: '#1B2A00' },
    { to: 21, name: 'Poetry', c1: '#F783AC', c2: '#D6336C', ink: '#fff' },
    { to: 26, name: 'Major Prophets', c1: '#74C0FC', c2: '#1C7ED6', ink: '#fff' },
    { to: 38, name: 'Minor Prophets', c1: '#63E6BE', c2: '#0CA678', ink: '#04261C' },
    { to: 42, name: 'Gospels', c1: '#FFE066', c2: '#F59F00', ink: '#2B1B00' },
    { to: 43, name: 'Church History', c1: '#FF8787', c2: '#E03131', ink: '#fff' },
    { to: 56, name: 'Paul’s Letters', c1: '#91A7FF', c2: '#4263EB', ink: '#fff' },
    { to: 64, name: 'General Letters', c1: '#E599F7', c2: '#AE3EC9', ink: '#fff' },
    { to: 65, name: 'Prophecy', c1: '#F1F3F5', c2: '#ADB5BD', ink: '#1A1B3A' },
  ];
  const sectionOf = (i) => SECTIONS.find((s) => i <= s.to);
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const mix = (a, b, f) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, k) => Math.round(v + (B[k] - v) * f)).join(',')})`; };

  BP.games.snake = {
    title: 'Books of the Bible Snake',
    color: 'var(--c-snake)',
    scoring: '100 points per book in order, 10 more for every second under 5 seconds a book, plus a bonus for finishing.',
    badge() {
      const best = store.get('snake-best', null);
      return best == null ? 'New' : `Best: ${best} books`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Books of the Bible Snake', 'Eat the books of the Bible in the right order, as fast as you can.'), body);
      let mode = MODES[store.get('snake-mode', 'ot')] ? store.get('snake-mode', 'ot') : 'ot';
      let cleanup = () => {};
      menu();

      function menu() {
        cleanup();
        const btns = Object.entries(MODES).map(([k, m]) => h('button', {
          class: 'btn btn-small', type: 'button', 'aria-pressed': String(k === mode),
          onclick: () => { mode = k; store.set('snake-mode', k); btns.forEach((b, n) => b.setAttribute('aria-pressed', String(Object.keys(MODES)[n] === k))); },
        }, m.label));
        body.replaceChildren(
                    BP.howTo(
            h('li', null, 'The next book you need is shown above the board. Books glow in the colour of their part of the Bible.'),
            h('li', null, 'Steer with the arrow keys, by swiping on the board, or with the buttons underneath.'),
            h('li', null, 'Some books on the board are decoys. Eat the wrong one and you lose a life.'),
            h('li', null, 'The walls wrap around: go off one edge and you come out the other side. Hitting your own tail costs a life. You have three.'),
            h('li', null, 'Be quick: beat 5 seconds a book for a speed bonus.')),
          h('div', { class: 'size-row' }, h('span', { class: 'ref' }, 'Books:'), btns),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: play }, 'Start')));
      }

      function play() {
        cleanup();
        const m = MODES[mode];
        const books = BIBLE_BOOKS.slice(m.from, m.to + 1);
        let next = 0, lives = LIVES, eaten = 0, misses = 0;
        let snake, prev, dir, queued, items, tickMs, acc = 0, paused = false, over = false;
        let revived = false, boosted = false;
        let playMs = 0, glow = 0, hurt = 0, raf = 0, lastFrame = performance.now(), shownSecs = -1;
        const sparks = [], pops = [];

        const canvas = h('canvas', { class: 'snake-board', width: SIZE, height: SIZE, role: 'img', 'aria-label': 'Snake board' });
        const needEl = h('strong', { class: 'snake-need' });
        const needSec = h('span', { class: 'snake-sec' });
        const nextChip = h('div', { class: 'snake-next', 'aria-live': 'polite' }, h('span', { class: 'snake-next-label' }, 'Next'), needEl, needSec);
        const livesEl = h('span', { class: 'snake-lives' });
        const countEl = h('span', { class: 'snake-stat' });
        const clockEl = h('span', { class: 'snake-stat' }, '0:00');
        const msg = h('p', { class: 'snake-msg', 'aria-live': 'polite' });
        const pad = h('div', { class: 'snake-pad' },
          ...[['up', '▲'], ['left', '◀'], ['down', '▼'], ['right', '▶']].map(([d, t]) =>
            h('button', { class: 'snake-key snake-' + d, type: 'button', 'aria-label': d, onpointerdown: (e) => { e.preventDefault(); turn(d); } }, t)));
        const pauseBtn = h('button', { class: 'snake-pause', type: 'button', onclick: () => setPaused(!paused) }, 'Pause');

        body.replaceChildren(
          h('div', { class: 'snake-hud' }, h('span', { class: 'snake-mode' }, m.label), countEl, clockEl, livesEl, pauseBtn),
          nextChip,
          h('div', { class: 'snake-frame' }, canvas), msg, pad);

        const ctx = canvas.getContext('2d');
        const cell = SIZE / COLS;
        reset(true);
        hud();

        // Input: keyboard, swipes on the board and the on-screen pad.
        const onKey = (e) => {
          const d = KEYMAP[e.key] || KEYMAP[e.key.toLowerCase && e.key.toLowerCase()];
          if (d) { e.preventDefault(); turn(d); } else if (e.key === ' ' || e.key === 'p') { e.preventDefault(); setPaused(!paused); }
        };
        let touch = null;
        const onDown = (e) => { touch = [e.clientX, e.clientY]; };
        const onUp = (e) => {
          if (!touch) return;
          const dx = e.clientX - touch[0], dy = e.clientY - touch[1]; touch = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
          turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        };
        const onHide = () => { if (document.hidden) setPaused(true); lastFrame = performance.now(); };
        document.addEventListener('keydown', onKey);
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointerup', onUp);
        document.addEventListener('visibilitychange', onHide);
        const unlisten = () => {
          document.removeEventListener('keydown', onKey);
          document.removeEventListener('visibilitychange', onHide);
        };
        cleanup = () => { unlisten(); cancelAnimationFrame(raf); cleanup = () => {}; };
        raf = requestAnimationFrame(loop);

        function turn(d) {
          if (over) return;
          if (paused) setPaused(false);
          const [dx, dy] = DIRS[d]; const last = queued.length ? queued[queued.length - 1] : dir;
          if (dx === -last[0] && dy === -last[1]) return; // can't reverse into yourself
          if (dx === last[0] && dy === last[1]) return;
          if (queued.length < 2) queued.push([dx, dy]);
        }
        function setPaused(p) {
          if (over) return;
          paused = p; pauseBtn.textContent = p ? 'Resume' : 'Pause';
          msg.textContent = p ? 'Paused. Press a direction to carry on.' : '';
        }

        function reset(first) {
          const len = first ? 3 : Math.max(3, snake.length);
          const y = Math.floor(ROWS / 2);
          snake = Array.from({ length: len }, (_, i) => [Math.max(0, 3 - i), y]);
          dir = [1, 0]; queued = []; acc = 0;
          prev = snake.map((p) => p.slice());
          tickMs = first ? START_MS : tickMs;
          spawn();
        }

        // Put the needed book and a few decoys on free cells. Decoys are nearby books, which are easy to mix up.
        function spawn() {
          const want = books[next];
          const near = [next + 1, next + 2, next - 1, next + 3].filter((i) => i >= 0 && i < books.length && i !== next);
          const pool = [...new Set([...near.slice(0, 3), ...Array.from({ length: 6 }, () => Math.floor(Math.random() * books.length))])].filter((i) => i !== next);
          const decoys = BP.shuffle(pool).slice(0, DECOYS);
          const taken = new Set(snake.map(([x, y]) => x + ',' + y));
          const head = snake[0];
          const free = [];
          for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
            if (taken.has(x + ',' + y)) continue;
            if (Math.abs(x - head[0]) + Math.abs(y - head[1]) < 2) continue; // not right in front of the snake
            free.push([x, y]);
          }
          const spots = BP.shuffle(free);
          const born = performance.now();
          items = [{ book: want, ok: true, at: spots[0] }, ...decoys.map((i, n) => ({ book: books[i], ok: false, at: spots[n + 1] }))]
            .filter((it) => it.at).map((it, n) => ({ ...it, born: born + n * 70 }));
        }

        // One frame: advance the game clock in fixed ticks, then draw the snake part-way between ticks so it glides.
        function loop(now) {
          if (!document.body.contains(canvas)) return cleanup();
          const dt = Math.min(100, now - lastFrame); lastFrame = now;
          if (!paused && !over) {
            playMs += dt; acc += dt;
            while (acc >= tickMs && !paused && !over) { acc -= tickMs; step(); }
            const s = Math.floor(playMs / 1000);
            if (s !== shownSecs) { shownSecs = s; clockEl.textContent = '⏱ ' + clock(s); }
          }
          draw(now, dt / 1000);
          raf = requestAnimationFrame(loop);
        }

        function step() {
          if (queued.length) dir = queued.shift();
          // Walls wrap: going off one edge brings the snake out of the opposite edge.
          const wrap = (v, n) => ((v % n) + n) % n;
          const head = [wrap(snake[0][0] + dir[0], COLS), wrap(snake[0][1] + dir[1], ROWS)];
          const hitSelf = snake.slice(0, -1).some(([x, y]) => x === head[0] && y === head[1]);
          if (hitSelf) return loseLife('You ran into your own tail!');
          prev = snake.map((p) => p.slice());
          snake.unshift(head);
          const it = items.find((t) => t.at[0] === head[0] && t.at[1] === head[1]);
          if (!it) snake.pop();
          else if (it.ok) {
            prev.push(prev[prev.length - 1].slice()); // the new tail segment starts where the old one was
            eaten++; next++; glow = 1; BP.sfx('coin'); BP.buzz(15);
            burst(it, 22);
            tickMs = Math.max(MIN_MS, tickMs - STEP_MS);
            msg.textContent = `${it.book.name} ✓`;
            if (next >= books.length) { hud(); return end(true); }
            spawn();
          } else {
            snake.pop(); misses++;
            items = items.filter((t) => t !== it);
            burst(it, 10, '#FF6B6B');
            return loseLife(`${it.book.name} isn’t next. You need ${books[next].name}.`);
          }
          hud();
        }

        function burst(it, n, color) {
          const [x, y] = it.at, cx = (x + 0.5) * cell, cy = (y + 0.5) * cell;
          const sec = sectionOf(it.book.i);
          for (let k = 0; k < n; k++) {
            const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
            sparks.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, r: 3 + Math.random() * 5, c: color || (k % 2 ? sec.c1 : sec.c2) });
          }
          pops.push({ x: cx, y: cy, text: color ? '✗' : '+100', life: 1, c: color || '#FFFFFF' });
        }

        function loseLife(text) {
          lives--; hud(); hurt = 1; BP.sfx('bad'); BP.buzz([60, 40, 60]);
          msg.textContent = text;
          canvas.classList.remove('hurt'); void canvas.offsetWidth; canvas.classList.add('hurt');
          if (lives <= 0) {
            // Coin Shop: a Second Chance gives one life back, once per run.
            if (revived || !BP.shop) return end(false);
            revived = true; paused = true;
            BP.shop.offer('revive', { title: 'Second Chance?', text: 'Get one life back and keep eating books.' }).then((ok) => {
              if (!document.body.contains(canvas)) return;
              if (!ok) { paused = false; return end(false); }
              boosted = true; lives = 1; hud(); reset(false);
              pauseBtn.textContent = 'Resume';
              msg.textContent = 'Second Chance! Press a direction to carry on.';
            });
            return;
          }
          reset(false);
          paused = true; pauseBtn.textContent = 'Resume';
          msg.textContent = text + ' Press a direction to carry on.';
        }

        function hud() {
          const book = books[next];
          needEl.textContent = book ? book.name : 'Done!';
          const sec = book ? sectionOf(book.i) : null;
          needSec.textContent = sec ? sec.name : '';
          nextChip.style.setProperty('--sec-a', sec ? sec.c1 : '#8CE99A');
          nextChip.style.setProperty('--sec-b', sec ? sec.c2 : '#2F9E44');
          nextChip.style.setProperty('--sec-ink', sec ? sec.ink : '#fff');
          countEl.textContent = `📖 ${eaten}/${books.length}`;
          livesEl.textContent = '♥'.repeat(Math.max(0, lives)) + '♡'.repeat(LIVES - Math.max(0, lives));
          livesEl.setAttribute('aria-label', `${lives} lives left`);
        }

        function rounded(x, y, w, hh, r) {
          ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r);
          ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
        }

        function draw(now, dts) {
          const W = SIZE;
          // Board: deep night gradient with soft tiles.
          const bg = ctx.createRadialGradient(W / 2, W * 0.4, W * 0.1, W / 2, W / 2, W * 0.75);
          bg.addColorStop(0, '#241F4D'); bg.addColorStop(1, '#0B0A1C');
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, W);
          ctx.fillStyle = 'rgba(255,255,255,.035)';
          for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2 === 0) { rounded(x * cell + 4, y * cell + 4, cell - 8, cell - 8, 10); ctx.fill(); }

          // Books: glowing cards coloured by their part of the Bible.
          items.forEach((it) => {
            const [x, y] = it.at, sec = sectionOf(it.book.i);
            const age = Math.min(1, Math.max(0, (now - it.born) / 260));
            const s = (0.55 + 0.45 * (1 - Math.pow(1 - age, 3))) * (1 + 0.035 * Math.sin(now / 320 + x + y));
            const w = (cell - 12) * s, cx = (x + 0.5) * cell, cy = (y + 0.5) * cell;
            ctx.save();
            ctx.globalAlpha = age;
            ctx.shadowColor = sec.c1; ctx.shadowBlur = 18;
            const g = ctx.createLinearGradient(cx, cy - w / 2, cx, cy + w / 2);
            g.addColorStop(0, sec.c1); g.addColorStop(1, sec.c2);
            ctx.fillStyle = g; rounded(cx - w / 2, cy - w / 2, w, w, 12); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,.28)'; rounded(cx - w / 2 + 4, cy - w / 2 + 4, w - 8, w * 0.32, 8); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(cx - w / 2 + 6, cy - w / 2 + 8, 4, w - 16); // spine
            ctx.fillStyle = sec.ink; ctx.font = `700 ${Math.round(cell * 0.34 * s)}px "Chakra Petch", sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(it.book.short, cx + 3, cy + 1);
            ctx.restore();
          });

          // Snake: a smooth glowing tube, sliding between grid cells.
          const t = paused || over ? 1 : Math.min(1, acc / tickMs);
          const ease = t * t * (3 - 2 * t);
          // A segment that just came through a wall jumps to the far side, so it is drawn without sliding.
          const far = (a, b) => Math.abs(a[0] - b[0]) > 1 || Math.abs(a[1] - b[1]) > 1;
          const pts = snake.map((p, n) => {
            const q = prev[n] || p;
            const e = far(p, q) ? 1 : ease;
            return [(q[0] + (p[0] - q[0]) * e + 0.5) * cell, (q[1] + (p[1] - q[1]) * e + 0.5) * cell];
          });
          ctx.save();
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.shadowColor = '#9775FA'; ctx.shadowBlur = 16 + glow * 24;
          for (let n = pts.length - 1; n > 0; n--) {
            const f = n / Math.max(1, pts.length - 1);
            ctx.strokeStyle = mix('#B197FC', '#5F3DC4', f);
            ctx.lineWidth = cell * (0.62 - 0.2 * f);
            if (far(snake[n], snake[n - 1])) continue; // no line across the board where the snake wrapped
            ctx.beginPath(); ctx.moveTo(pts[n][0], pts[n][1]); ctx.lineTo(pts[n - 1][0], pts[n - 1][1]); ctx.stroke();
          }
          // Head
          const [hx, hy] = pts[0];
          const hg = ctx.createRadialGradient(hx - cell * 0.1, hy - cell * 0.12, 2, hx, hy, cell * 0.4);
          hg.addColorStop(0, '#E5DBFF'); hg.addColorStop(1, glow > 0 ? mix('#8CE99A', '#9775FA', 1 - glow) : '#9775FA');
          ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, cell * 0.37, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          const look = queued.length ? queued[0] : dir;
          const side = [-look[1], look[0]];
          [-1, 1].forEach((k) => {
            const ex = hx + look[0] * cell * 0.13 + side[0] * k * cell * 0.15, ey = hy + look[1] * cell * 0.13 + side[1] * k * cell * 0.15;
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, cell * 0.095, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1A1240'; ctx.beginPath(); ctx.arc(ex + look[0] * cell * 0.035, ey + look[1] * cell * 0.035, cell * 0.05, 0, Math.PI * 2); ctx.fill();
          });

          // Sparks and score pops.
          for (let k = sparks.length - 1; k >= 0; k--) {
            const p = sparks[k];
            p.life -= dts * 1.6; if (p.life <= 0) { sparks.splice(k, 1); continue; }
            p.x += p.vx * dts; p.y += p.vy * dts; p.vx *= 0.92; p.vy *= 0.92;
            ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); ctx.fill();
          }
          for (let k = pops.length - 1; k >= 0; k--) {
            const p = pops[k];
            p.life -= dts * 1.1; if (p.life <= 0) { pops.splice(k, 1); continue; }
            ctx.globalAlpha = Math.min(1, p.life * 1.5); ctx.fillStyle = p.c;
            ctx.font = `700 ${Math.round(cell * 0.42)}px "Chakra Petch", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(p.text, p.x, p.y - (1 - p.life) * cell * 0.9);
          }
          ctx.globalAlpha = 1;
          glow = Math.max(0, glow - dts * 2.2);

          // Hurt flash and pause veil.
          if (hurt > 0) {
            const v = ctx.createRadialGradient(W / 2, W / 2, W * 0.3, W / 2, W / 2, W * 0.75);
            v.addColorStop(0, 'rgba(255,60,60,0)'); v.addColorStop(1, `rgba(255,60,60,${0.55 * hurt})`);
            ctx.fillStyle = v; ctx.fillRect(0, 0, W, W);
            hurt = Math.max(0, hurt - dts * 1.5);
          }
          if (paused && !over) {
            ctx.fillStyle = 'rgba(8,7,20,.55)'; ctx.fillRect(0, 0, W, W);
            ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = `700 ${Math.round(W * 0.07)}px "Chakra Petch", sans-serif`; ctx.fillText('Paused', W / 2, W / 2 - 18);
            ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = `500 ${Math.round(W * 0.032)}px "Chakra Petch", sans-serif`;
            ctx.fillText('Press a direction to carry on', W / 2, W / 2 + 28);
          }
        }

        function end(won) {
          over = true; unlisten();
          const best = store.get('snake-best', 0);
          if (eaten > best) store.set('snake-best', eaten);
          if (won) BP.confetti();
          const secs = Math.round(playMs / 1000);
          const speed = Math.max(0, eaten * PAR_SECS - secs) * 10; // beat 5 seconds a book to earn a speed bonus
          const points = eaten * 100 + speed + (won ? 1000 : 0) + (won ? lives * 250 : 0);
          const recap = books.slice(0, next + (won ? 0 : 1));
          setTimeout(() => body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
            h('p', { class: 'big-score' }, String(eaten)),
            h('p', null, `${eaten === 1 ? 'book' : 'books'} in order in ${clock(secs)}${speed ? ` · +${speed} speed bonus` : ''}`),
            h('h2', { class: 'panel-title' }, won ? `You finished the ${m.label}! Amazing!` : eaten >= 10 ? 'You know your books!' : 'No worries. Go again!'),
            !won && next < books.length ? h('p', null, `Next was `, h('strong', null, books[next].name), next > 0 ? ` (after ${books[next - 1].name}).` : '.') : '',
            h('ol', { class: 'snake-recap', start: String(m.from + 1) }, recap.map((b, n) => h('li', { class: n < next ? 'ok' : 'miss' }, b.name))),
            h('div', { class: 'feedback good', style: 'text-align:left' },
              h('strong', null, 'Why learn the books?'),
              h('p', null, 'After he rose, Jesus walked two friends through the whole Old Testament and showed them it was all about him. Knowing your way around the Bible helps you see the same thing.')),
            BP.verse({ text: 'And beginning at Moses and all the prophets, he expounded unto them in all the scriptures the things concerning himself.', ref: 'Luke 24:27' }),
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', onclick: play }, 'Play again'),
              h('button', { class: 'btn', onclick: menu }, 'Change books')),
            BP.finish('snake', { points, secs, boosted, detail: `${eaten} books · ${m.label}`, coins: eaten * 3 + (won ? 50 : 0) }))), 700);
        }
      }
    },
  };
})();
