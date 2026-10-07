// Bible Crossword: every puzzle is built fresh from a bank of Bible words, so no two are the same.
// Everyone gets the same daily puzzle (seeded by the date); practice puzzles are random.
(function () {
  const { h, store } = BP;
  const SIZES = { mini: { n: 7, words: 7, label: 'Mini 7×7' }, big: { n: 9, words: 10, label: 'Big 9×9' } };
  const HINT_COST = 100;
  const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  // Small seeded random generator, so a seed always builds the same puzzle.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const shuffleWith = (arr, r) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const hash = (s) => { let x = 2166136261; for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619); return x >>> 0; };

  // ---- Grid building ----
  // Try to place each word so it crosses an existing one, following normal crossword rules:
  // no two words touch side by side, and every word has a clear cell before and after it.
  function build(size, target, r) {
    let best = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const pool = shuffleWith(CROSSWORD_WORDS.filter((x) => x.w.length <= size && x.w.length >= 3), r);
      const cells = {}; // "r,c" -> { ch, across, down }
      const placed = [];
      const key = (y, x) => y + ',' + x;
      const at = (y, x) => cells[key(y, x)];
      const inside = (y, x) => y >= 0 && x >= 0 && y < size && x < size;

      function fits(word, y, x, dir) {
        const [dy, dx] = dir === 'across' ? [0, 1] : [1, 0];
        const endY = y + dy * (word.length - 1), endX = x + dx * (word.length - 1);
        if (!inside(y, x) || !inside(endY, endX)) return -1;
        if (at(y - dy, x - dx) || at(endY + dy, endX + dx)) return -1;
        let cross = 0;
        for (let i = 0; i < word.length; i++) {
          const cy = y + dy * i, cx = x + dx * i, c = at(cy, cx);
          if (c) {
            if (c.ch !== word[i] || c[dir]) return -1;
            cross++;
          } else if (at(cy + dx, cx + dy) || at(cy - dx, cx - dy)) return -1; // side neighbours must be empty
        }
        return cross === word.length ? -1 : cross;
      }
      function place(entry, y, x, dir) {
        const [dy, dx] = dir === 'across' ? [0, 1] : [1, 0];
        for (let i = 0; i < entry.w.length; i++) {
          const k = key(y + dy * i, x + dx * i);
          cells[k] = cells[k] || { ch: entry.w[i] };
          cells[k][dir] = true;
        }
        placed.push({ ...entry, y, x, dir });
      }

      const first = pool.find((x) => x.w.length >= Math.min(5, size - 2));
      if (!first) break;
      const firstDir = r() < 0.5 ? 'across' : 'down';
      const off = Math.floor(r() * (size - first.w.length + 1)), mid = Math.floor(size / 2) - (r() < 0.5 ? 1 : 0);
      place(first, firstDir === 'across' ? mid : off, firstDir === 'across' ? off : mid, firstDir);

      for (const entry of pool) {
        if (placed.length >= target) break;
        if (placed.some((p) => p.w === entry.w)) continue;
        let options = [], top = 0;
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) for (const dir of ['across', 'down']) {
          const c = fits(entry.w, y, x, dir);
          if (c > top) { top = c; options = []; }
          if (c > 0 && c === top) options.push([y, x, dir]);
        }
        if (options.length) { const [y, x, dir] = options[Math.floor(r() * options.length)]; place(entry, y, x, dir); }
      }
      const score = placed.length * 10 + Object.keys(cells).length / 10;
      if (!best || score > best.score) best = { score, placed: placed.slice(), cells: { ...cells } };
      if (placed.length >= target) break;
    }
    // Number the clues in reading order.
    const starts = {};
    best.placed.forEach((p) => { starts[p.y + ',' + p.x] = true; });
    let num = 0; const numbers = {};
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (starts[y + ',' + x]) numbers[y + ',' + x] = ++num;
    best.placed.forEach((p) => { p.num = numbers[p.y + ',' + p.x]; });
    best.placed.sort((a, b) => (a.dir === b.dir ? a.num - b.num : a.dir === 'across' ? -1 : 1));
    return { size, words: best.placed, cells: best.cells, numbers };
  }

  BP.crosswordBuild = (size, target, seed) => build(size, target, rng(seed)); // for testing

  BP.games.crossword = {
    title: 'Bible Crossword',
    color: 'var(--c-crossword)',
    scoring: '150 points per word, minus 100 per hint, plus a speed bonus.',
    badge() {
      const d = store.get('xword-daily', null);
      if (d && d.date === today() && d.done) return 'Today: solved';
      return 'New puzzle daily';
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Bible Crossword', 'A fresh crossword every time, built from hundreds of Bible words.'), body);
      let size = SIZES[store.get('xword-size', 'mini')] ? store.get('xword-size', 'mini') : 'mini';
      let keyHandler = null;
      menu();

      function stopKeys() { if (keyHandler) document.removeEventListener('keydown', keyHandler); keyHandler = null; }

      function menu() {
        stopKeys();
        const d = store.get('xword-daily', null);
        const doneToday = d && d.date === today() && d.done;
        const btns = Object.entries(SIZES).map(([k, s]) => h('button', {
          class: 'btn btn-small', type: 'button', 'aria-pressed': String(k === size),
          onclick: () => { size = k; store.set('xword-size', k); btns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(SIZES)[i] === k))); },
        }, s.label));
        body.replaceChildren(
          h('h2', { class: 'panel-title' }, 'How it works'),
          h('ul', { class: 'how-list' },
            h('li', null, 'Tap a square, then type. Tap the same square again to switch between across and down.'),
            h('li', null, `Stuck? A hint reveals one letter for ${HINT_COST} points.`),
            h('li', null, 'Today’s puzzle is the same for everyone. Practice puzzles are new every time.')),
          h('div', { class: 'size-row' }, h('span', { class: 'ref' }, 'Practice size:'), btns),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', onclick: () => play(true) }, doneToday ? 'See today’s puzzle' : 'Play today’s puzzle'),
            h('button', { class: 'btn', onclick: () => play(false) }, 'Practice puzzle')));
      }

      function play(daily) {
        stopKeys();
        const seed = daily ? hash('xword:' + today()) : Math.floor(Math.random() * 2 ** 32);
        const sz = daily ? SIZES.big : SIZES[size];
        const r = rng(seed);
        const puzzle = build(sz.n, sz.words, r);
        const verse = CROSSWORD_VERSES[Math.floor(r() * CROSSWORD_VERSES.length)];
        const N = puzzle.size;

        let saved = daily ? store.get('xword-daily', null) : null;
        if (!saved || saved.date !== today()) saved = { date: today(), letters: {}, hints: 0, secs: 0, done: false };
        const letters = daily ? { ...saved.letters } : {};
        let hints = daily ? saved.hints : 0, secs = daily ? saved.secs : 0, done = false;
        let active = puzzle.words[0], pos = 0, revealed = new Set(daily ? saved.revealed || [] : []);

        const cellEls = {};
        const grid = h('div', { class: 'xw-grid', style: `--n:${N}`, role: 'grid', 'aria-label': 'Crossword grid' });
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const k = y + ',' + x;
          if (!puzzle.cells[k]) { grid.append(h('span', { class: 'xw-block', 'aria-hidden': 'true' })); continue; }
          const el = h('button', { class: 'xw-cell', type: 'button', onclick: () => tap(y, x) },
            puzzle.numbers[k] ? h('span', { class: 'xw-num' }, puzzle.numbers[k]) : '', h('span', { class: 'xw-letter' }));
          cellEls[k] = el; grid.append(el);
        }
        const clueBar = h('div', { class: 'xw-cluebar' });
        const prevBtn = h('button', { class: 'btn btn-small', type: 'button', 'aria-label': 'Previous clue', onclick: () => jump(-1) }, '◀');
        const nextBtn = h('button', { class: 'btn btn-small', type: 'button', 'aria-label': 'Next clue', onclick: () => jump(1) }, '▶');
        const clueText = h('p', { class: 'xw-clue', 'aria-live': 'polite' });
        clueBar.append(prevBtn, clueText, nextBtn);
        const timerEl = h('span', null, '0:00');
        const hintBtn = h('button', { class: 'btn btn-small', type: 'button', onclick: hint }, `Hint (−${HINT_COST})`);
        const checkBtn = h('button', { class: 'btn btn-small', type: 'button', onclick: check }, 'Check');
        const note = h('p', { class: 'word-note', 'aria-live': 'polite' });
        const kb = h('div', { class: 'word-kb' }, ROWS.map((row, i) => h('div', { class: 'word-kb-row' },
          ...row.split('').map((L) => h('button', { class: 'key', type: 'button', onclick: () => type(L) }, L)),
          i === 2 ? h('button', { class: 'key key-wide', type: 'button', 'aria-label': 'Delete', onclick: back }, '⌫') : '')));
        const lists = h('div', { class: 'xw-lists' });
        const after = h('div');

        body.replaceChildren(
          h('div', { class: 'meta-row' },
            h('span', { class: 'pill pill-game' }, daily ? 'Today’s puzzle' : `Practice · ${sz.label}`),
            timerEl, hintBtn, checkBtn,
            h('button', { class: 'btn btn-small', onclick: () => { stopKeys(); clearInterval(tick); menu(); } }, 'Back')),
          clueBar, grid, note, kb, lists, after);

        const tick = setInterval(() => {
          if (!document.body.contains(grid)) return clearInterval(tick);
          if (done || document.hidden) return;
          secs++; timerEl.textContent = clock(secs);
          if (daily && secs % 5 === 0) persist();
        }, 1000);
        keyHandler = (e) => {
          if (!document.body.contains(grid)) return stopKeys();
          if (e.ctrlKey || e.metaKey || e.altKey || done) return;
          if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); type(e.key.toUpperCase()); }
          else if (e.key === 'Backspace') { e.preventDefault(); back(); }
          else if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); jump(e.shiftKey ? -1 : 1); }
          else if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            const [dy, dx] = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
            const [y, x] = cellOf(active, pos); let ny = y + dy, nx = x + dx;
            while (ny >= 0 && nx >= 0 && ny < N && nx < N && !puzzle.cells[ny + ',' + nx]) { ny += dy; nx += dx; }
            if (puzzle.cells[ny + ',' + nx]) tap(ny, nx, dy ? 'down' : 'across');
          }
        };
        document.addEventListener('keydown', keyHandler);
        timerEl.textContent = clock(secs);
        if (daily && saved.done) { Object.keys(puzzle.cells).forEach((k) => { letters[k] = puzzle.cells[k].ch; }); draw(); return win(true); }
        draw();

        function clock(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
        function cellOf(w, i) { return w.dir === 'across' ? [w.y, w.x + i] : [w.y + i, w.x]; }
        function wordsAt(y, x) { return puzzle.words.filter((w) => w.dir === 'across' ? w.y === y && x >= w.x && x < w.x + w.w.length : w.x === x && y >= w.y && y < w.y + w.w.length); }
        function persist() { if (daily) store.set('xword-daily', { ...saved, letters, hints, secs, revealed: [...revealed], done }); }

        function tap(y, x, prefer) {
          if (done) return;
          const ws = wordsAt(y, x);
          const same = cellOf(active, pos).join() === [y, x].join();
          let w = ws.find((v) => v.dir === (prefer || active.dir)) || ws[0];
          if (same && !prefer && ws.length > 1) w = ws.find((v) => v !== active);
          active = w; pos = w.dir === 'across' ? x - w.x : y - w.y;
          draw();
        }
        function jump(step) {
          const i = puzzle.words.indexOf(active);
          active = puzzle.words[(i + step + puzzle.words.length) % puzzle.words.length];
          pos = Math.max(0, [...active.w].findIndex((_, j) => !letters[cellOf(active, j).join()]));
          draw();
        }
        function type(L) {
          if (done) return;
          const k = cellOf(active, pos).join();
          if (!revealed.has(k)) letters[k] = L;
          note.textContent = '';
          Object.values(cellEls).forEach((el) => el.classList.remove('wrong'));
          if (pos < active.w.length - 1) pos++;
          else if (wordDone(active)) jump(1);
          draw(); persist(); if (solved()) win(false);
        }
        function back() {
          if (done) return;
          const k = cellOf(active, pos).join();
          if (letters[k] && !revealed.has(k)) delete letters[k];
          else if (pos > 0) { pos--; const k2 = cellOf(active, pos).join(); if (!revealed.has(k2)) delete letters[k2]; }
          draw(); persist();
        }
        function hint() {
          if (done) return;
          let k = cellOf(active, pos).join();
          if (letters[k] === puzzle.cells[k].ch) {
            let j = [...active.w].findIndex((ch, i) => letters[cellOf(active, i).join()] !== ch);
            if (j < 0) { // this word is right: hint the next unfinished word instead
              const w = puzzle.words.find((x) => !wordDone(x));
              if (!w) return;
              active = w; j = [...w.w].findIndex((ch, i) => letters[cellOf(w, i).join()] !== ch);
            }
            pos = j; k = cellOf(active, j).join();
          }
          letters[k] = puzzle.cells[k].ch; revealed.add(k); hints++;
          note.textContent = `Hint used (−${HINT_COST}).`;
          if (pos < active.w.length - 1) pos++;
          draw(); persist(); if (solved()) win(false);
        }
        function check() {
          let wrong = 0;
          Object.entries(cellEls).forEach(([k, el]) => { const bad = letters[k] && letters[k] !== puzzle.cells[k].ch; el.classList.toggle('wrong', !!bad); if (bad) wrong++; });
          note.textContent = wrong ? `${wrong} letter${wrong === 1 ? '' : 's'} not right yet (marked in red).` : 'Everything so far is right!';
        }
        function wordDone(w) { return [...w.w].every((ch, i) => letters[cellOf(w, i).join()] === ch); }
        function solved() { return Object.keys(puzzle.cells).every((k) => letters[k] === puzzle.cells[k].ch); }

        function draw() {
          const activeCells = new Set(active.w.split('').map((_, i) => cellOf(active, i).join()));
          const cur = cellOf(active, pos).join();
          Object.entries(cellEls).forEach(([k, el]) => {
            el.querySelector('.xw-letter').textContent = letters[k] || '';
            el.classList.toggle('in-word', activeCells.has(k));
            el.classList.toggle('current', k === cur);
            el.classList.toggle('revealed', revealed.has(k));
            if (letters[k] === puzzle.cells[k].ch) el.classList.remove('wrong');
            el.setAttribute('aria-label', `${letters[k] || 'blank'}${puzzle.numbers[k] ? ', ' + puzzle.numbers[k] : ''}`);
          });
          clueText.replaceChildren(h('strong', null, `${active.num} ${active.dir === 'across' ? 'Across' : 'Down'}`), ` ${active.clue} (${active.w.length})`);
          const section = (dir) => h('section', null, h('h3', null, dir === 'across' ? 'Across' : 'Down'),
            h('ol', { class: 'xw-cluelist' }, puzzle.words.filter((w) => w.dir === dir).map((w) => h('li', {
              class: (w === active ? 'on ' : '') + (wordDone(w) ? 'done' : ''),
            }, h('button', { type: 'button', onclick: () => { active = w; pos = 0; draw(); } }, h('b', null, w.num), ' ', w.clue)))));
          lists.replaceChildren(section('across'), section('down'));
        }

        function win(already) {
          done = true; clearInterval(tick); stopKeys(); kb.remove(); hintBtn.remove(); checkBtn.remove();
          Object.values(cellEls).forEach((el) => el.classList.add('solved'));
          persist();
          const points = Math.max(100, puzzle.words.length * 150 - hints * HINT_COST + Math.max(0, 600 - secs));
          if (!already) BP.confetti();
          const kids = [
            h('div', { class: 'feedback good' },
              h('strong', null, `${BP.cheer()} Solved in ${clock(secs)}${hints ? ` with ${hints} hint${hints === 1 ? '' : 's'}` : ' with no hints'}.`),
              h('p', null, 'Every answer comes from the same big story, and it all points to Jesus.')),
            BP.verse(verse),
            h('details', { class: 'xw-answers' }, h('summary', null, 'Where the answers come from'),
              h('ul', null, puzzle.words.map((w) => h('li', null, h('strong', null, w.w), ` · ${w.clue} `, h('span', { class: 'ref' }, w.ref))))),
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', onclick: () => play(false) }, 'Practice puzzle'),
              h('button', { class: 'btn', onclick: menu }, 'Back')),
          ];
          if (!already) kids.push(BP.finish('crossword', {
            points, secs, detail: daily ? 'Daily' : 'Practice', coins: Math.max(2, puzzle.words.length * 4 - hints * 2 + 10),
            board: daily, big: clock(secs), sub: `${hints} hint${hints === 1 ? '' : 's'} · ${daily ? 'Today’s puzzle' : 'Practice'}`,
            shareText: () => `I solved ${daily ? `the Bible Crossword for ${today()}` : 'a Bible Crossword'} in ${clock(secs)} with ${hints} hint${hints === 1 ? '' : 's'}. Can you beat that?`,
          }));
          else kids.push(h('p', { class: 'ref' }, 'You’ve solved today’s puzzle. A new one arrives tomorrow.'));
          after.replaceChildren(...kids);
        }
      }
    },
  };
})();
