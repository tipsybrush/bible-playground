// Word of the Day: guess a 5-letter Bible word in 6 tries. Everyone gets the same daily word;
// practice mode picks a random one. Green = right letter, right spot. Gold = in the word, wrong spot.
(function () {
  const { h, store } = BP;
  const TRIES = 6;
  const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  // The same word for everyone on a given day (by the player's local date).
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  function dailyIndex() {
    const d = new Date(); const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
    return (day * 7 + 3) % BIBLE_WORDS.length; // stepping by 7 keeps neighbouring days from looking alike
  }

  // Score one guess: 'hit', 'near' or 'miss' for each letter, counting repeated letters properly.
  function score(guess, word) {
    const res = Array(5).fill('miss'); const left = {};
    for (let i = 0; i < 5; i++) { if (guess[i] === word[i]) res[i] = 'hit'; else left[word[i]] = (left[word[i]] || 0) + 1; }
    for (let i = 0; i < 5; i++) if (res[i] !== 'hit' && left[guess[i]]) { res[i] = 'near'; left[guess[i]]--; }
    return res;
  }
  const EMOJI = { hit: '🟩', near: '🟨', miss: '⬛' };

  BP.games.word = {
    title: 'Word of the Day',
    color: 'var(--c-word)',
    scoring: '600 points on the first try, 100 less per extra try, plus up to 180 for speed.',
    badge() {
      const d = store.get('word-daily', null);
      if (d && d.date === today() && d.done) return d.won ? `Today: solved in ${d.guesses.length}` : 'Today: missed it';
      const streak = store.get('word-streak', 0);
      return streak ? `Streak: ${streak} days` : 'New word daily';
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Word of the Day', 'Guess the 5-letter Bible word in 6 tries. Everyone gets the same word today.'), body);
      let keyHandler = null;
      menu();

      function menu() {
        const d = store.get('word-daily', null);
        const doneToday = d && d.date === today() && d.done;
        body.replaceChildren(
                    BP.howTo(
            h('li', null, 'Type any 5-letter word and press Enter.'),
            h('li', null, h('span', { class: 'tile-key hit' }, 'G'), ' green means the letter is in the right spot.'),
            h('li', null, h('span', { class: 'tile-key near' }, 'O'), ' gold means it’s in the word, but somewhere else.'),
            h('li', null, h('span', { class: 'tile-key miss' }, 'D'), ' grey means it isn’t in the word.')),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', onclick: () => play('daily') }, doneToday ? 'See today’s result' : 'Play today’s word'),
            h('button', { class: 'btn', onclick: () => play('practice') }, 'Practice word')));
      }

      function play(mode) {
        const daily = mode === 'daily';
        const entry = daily ? BIBLE_WORDS[dailyIndex()] : BP.fresh('word-practice', BIBLE_WORDS.filter((w, n) => n !== dailyIndex()))[0];
        const word = entry.w;
        let saved = daily ? store.get('word-daily', null) : null;
        if (!saved || saved.date !== today()) saved = { date: today(), guesses: [], done: false, won: false };
        const guesses = daily ? saved.guesses.slice() : [];
        let current = '', over = false;
        if (daily && !saved.started) { saved.started = Date.now(); store.set('word-daily', saved); }
        const started = daily ? saved.started : Date.now();
        const clockEl = BP.stopwatch(started, daily && saved.finished);
        let meta;

        const grid = h('div', { class: 'word-grid', role: 'grid', 'aria-label': 'Your guesses' });
        const note = h('p', { class: 'word-note', 'aria-live': 'polite' });
        const keys = {};
        const kb = h('div', { class: 'word-kb' }, ROWS.map((row, r) => h('div', { class: 'word-kb-row' },
          r === 2 ? h('button', { class: 'key key-wide', type: 'button', onclick: enter }, 'Enter') : '',
          ...row.split('').map((L) => (keys[L] = h('button', { class: 'key', type: 'button', onclick: () => add(L) }, L))),
          r === 2 ? h('button', { class: 'key key-wide', type: 'button', 'aria-label': 'Delete', onclick: back }, '⌫') : '')));
        const after = h('div');

        body.replaceChildren(
          meta = h('div', { class: 'meta-row word-meta' },
            h('span', { class: 'pill pill-game' }, daily ? 'Today’s word' : 'Practice'),
            clockEl,
            h('button', { class: 'btn btn-small', onclick: () => { stopKeys(); menu(); } }, 'Back')),
          grid, note, kb, after);
        draw();
        // On phones, bring the clock and board up so they sit right above the keyboard.
        if (matchMedia('(max-width: 600px)').matches) requestAnimationFrame(() => meta.scrollIntoView({ block: 'start', behavior: 'smooth' }));
        if (daily && saved.done) return reveal(saved.won, true);

        stopKeys();
        keyHandler = (e) => {
          if (!document.body.contains(grid)) return stopKeys();
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          if (e.key === 'Enter') { e.preventDefault(); enter(); } else if (e.key === 'Backspace') back();
          else if (/^[a-z]$/i.test(e.key)) add(e.key.toUpperCase());
        };
        document.addEventListener('keydown', keyHandler);

        function add(L) { if (!over && current.length < 5) { current += L; draw(); } }
        function back() { if (!over) { current = current.slice(0, -1); draw(); } }
        function enter() {
          if (over) return;
          if (current.length < 5) { note.textContent = 'Not enough letters.'; shake(); return; }
          guesses.push(current); current = '';
          const won = guesses[guesses.length - 1] === word;
          if (daily) { saved.guesses = guesses.slice(); store.set('word-daily', saved); }
          draw();
          if (won || guesses.length >= TRIES) reveal(won, false);
        }
        function shake() { const row = grid.children[guesses.length]; if (row) { row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); } }

        function draw() {
          note.textContent = '';
          const rows = [];
          for (let r = 0; r < TRIES; r++) {
            const g = r < guesses.length ? guesses[r] : r === guesses.length ? current : '';
            const marks = r < guesses.length ? score(g, word) : null;
            rows.push(h('div', { class: 'word-row', role: 'row' }, Array.from({ length: 5 }, (_, i) =>
              h('span', { class: 'tile' + (marks ? ' ' + marks[i] : g[i] ? ' filled' : ''), role: 'gridcell',
                'aria-label': g[i] ? `${g[i]}${marks ? ', ' + { hit: 'right spot', near: 'wrong spot', miss: 'not in word' }[marks[i]] : ''}` : 'empty' }, g[i] || ''))));
          }
          grid.replaceChildren(...rows);
          // Colour the keyboard with the best result seen for each letter.
          const best = {}; const rank = { miss: 0, near: 1, hit: 2 };
          guesses.forEach((g) => score(g, word).forEach((m, i) => { if (!(g[i] in best) || rank[m] > rank[best[g[i]]]) best[g[i]] = m; }));
          Object.entries(keys).forEach(([L, k]) => { k.className = 'key' + (best[L] ? ' ' + best[L] : ''); });
        }

        function reveal(won, already) {
          over = true; stopKeys();
          const tries = guesses.length;
          const secs = Math.round(((daily && saved.finished) || Date.now()) - started) / 1000 | 0;
          if (daily && !already) saved.finished = Date.now();
          clockEl.stop(started + secs * 1000);
          const points = won ? (TRIES + 1 - tries) * 100 + Math.max(0, 180 - secs) : 0;
          if (daily && !already) {
            saved.done = true; saved.won = won; store.set('word-daily', saved);
            const last = store.get('word-last-win', '');
            const y = new Date(); y.setDate(y.getDate() - 1);
            const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
            store.set('word-streak', won ? (last === yesterday ? store.get('word-streak', 0) + 1 : 1) : 0);
            if (won) store.set('word-last-win', today());
          }
          if (won && !already) BP.confetti();
          kb.remove();
          const streak = store.get('word-streak', 0);
          const grid2 = guesses.map((g) => score(g, word).map((m) => EMOJI[m]).join('')).join('\n');
          const label = daily ? `Word of the Day ${today()}` : 'Word of the Day (practice)';
          const kids = [
            h('div', { class: 'feedback ' + (won ? 'good' : 'bad') },
              h('strong', null, won ? `${BP.cheer()} ${tries}/${TRIES}` : `The word was ${word}.`),
              h('p', null, entry.point)),
            BP.verse({ text: entry.text, ref: entry.ref }),
            daily && streak > 1 ? h('p', { class: 'done-mark' }, `${streak}-day streak. Come back tomorrow to keep it going!`) : '',
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', onclick: () => play('practice') }, daily ? 'Play a practice word' : 'Another practice word'),
              h('button', { class: 'btn', onclick: menu }, 'Back')),
          ];
          if (!already) {
            kids.push(BP.finish('word', {
              points, secs, detail: `${daily ? 'Daily' : 'Practice'} · ${won ? tries : 'X'}/${TRIES}`,
              coins: won ? 10 + (TRIES - tries) * 5 : 2,
              big: `${won ? tries : 'X'}/${TRIES}`, sub: daily ? 'Today’s word' : 'Practice word',
              board: daily && won,
              shareText: () => `${label} ${won ? tries : 'X'}/${TRIES}\n${grid2}\nPlay on Bible Playground:`,
            }));
          } else kids.push(h('p', { class: 'ref' }, 'You’ve played today’s word. A new one arrives tomorrow.'));
          after.replaceChildren(...kids);
        }
      }

      function stopKeys() { if (keyHandler) document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    },
  };
})();
