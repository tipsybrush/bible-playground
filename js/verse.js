// Where Is It Written? A KJV verse appears; pick the book it comes from out of four.
// Later questions use harder verses and decoy books from the same part of the Bible.
// After a right answer you can guess the chapter for bonus points.
(function () {
  const { h, shuffle, store } = BP;
  const ROUND = 10;
  const PLAN = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3]; // verse level for each question in a classic round
  // Sections of the Bible, by book index in BIBLE_BOOKS.
  const SECTIONS = [[0, 4], [5, 16], [17, 21], [22, 26], [27, 38], [39, 42], [43, 43], [44, 56], [57, 64], [65, 65]];
  const sectionOf = (i) => SECTIONS.findIndex(([a, b]) => i >= a && i <= b);
  const bookIndex = (name) => BIBLE_BOOKS.findIndex((b) => b.name === name);
  const chapterOf = (ref) => +((/(\d+):\d/.exec(ref) || [])[1] || 0);

  // Three wrong books. "near" decoys come from the same section (or the one next to it).
  function decoys(book, near) {
    const i = bookIndex(book), s = sectionOf(i);
    const pool = BIBLE_BOOKS.filter((b) => b.name !== book);
    if (!near) return shuffle(pool).slice(0, 3).map((b) => b.name);
    const close = pool.filter((b) => Math.abs(sectionOf(b.i) - s) <= (sectionOf(b.i) === s ? 0 : 1));
    const same = shuffle(pool.filter((b) => sectionOf(b.i) === s));
    const picks = [...same.slice(0, 2), ...shuffle(close)].filter((b, n, a) => a.indexOf(b) === n).slice(0, 3);
    while (picks.length < 3) { const b = shuffle(pool)[0]; if (!picks.includes(b)) picks.push(b); }
    return picks.map((b) => b.name);
  }

  BP.games.verse = {
    title: 'Where Is It Written?',
    color: 'var(--c-verse)',
    scoring: '100 to 300 points per right book, up to 60 more for speed, and up to 50 for the chapter.',
    badge() {
      const s = store.get('verse-streak-best', 0);
      return s ? `Best streak: ${s}` : 'New';
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Where Is It Written?', 'Read the verse. Which book of the Bible is it from?'), body);
      menu();

      function menu() {
        body.replaceChildren(
          h('h2', { class: 'panel-title' }, 'Pick a mode'),
          h('ul', { class: 'how-list' },
            h('li', null, h('strong', null, 'Classic: '), `${ROUND} verses that get harder, with trickier wrong answers as you go.`),
            h('li', null, h('strong', null, 'Streak: '), 'keep going until you miss one. How far can you get?'),
            h('li', null, 'Get the book right and you can guess the chapter for bonus points.')),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', onclick: () => play(false) }, 'Classic round'),
            h('button', { class: 'btn', onclick: () => play(true) }, 'Streak mode')));
      }

      function play(streakMode) {
        const used = new Set(store.get('verse-seen', []));
        let i = 0, score = 0, right = 0, chapters = 0, revived = false, boosted = false;
        const started = Date.now();
        const history = [];
        ask();

        function pickVerse() {
          const level = streakMode ? (i < 4 ? 1 : i < 10 ? 2 : 3) : PLAN[i];
          const fresh = (l) => BOOK_VERSES.filter((v) => v.level === l && !used.has(v.ref));
          let pool = fresh(level);
          if (!pool.length) pool = BOOK_VERSES.filter((v) => v.level === level && !history.includes(v));
          if (!pool.length) pool = BOOK_VERSES.filter((v) => !history.includes(v));
          const v = shuffle(pool)[0];
          used.add(v.ref); history.push(v);
          store.set('verse-seen', [...used].slice(-90));
          return v;
        }

        function ask() {
          const v = pickVerse();
          const shownAt = Date.now();
          const near = streakMode ? i >= 3 : i >= 4;
          const options = shuffle([v.book, ...decoys(v.book, near)]);
          const feedback = h('div', { 'aria-live': 'polite' });
          const btns = options.map((name) => h('button', { class: 'btn opt', type: 'button', onclick: () => answer(name) }, h('span', { class: 'opt-text' }, name)));
          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, streakMode ? `Streak ${right}` : `Verse ${i + 1} of ${ROUND}`),
              h('span', null, `${score.toLocaleString('en-US')} pts`),
              BP.stopwatch(started)),
            h('blockquote', { class: 'verse verse-big' }, v.text),
            h('p', { class: 'question' }, 'Which book is this from?'),
            h('div', { class: 'options' }, btns),
            feedback);

          function answer(name) {
            btns.forEach((b, n) => {
              b.disabled = true;
              if (options[n] === v.book) b.classList.add('is-correct');
              else if (options[n] === name) b.classList.add('is-wrong');
              else b.classList.add('is-dim');
            });
            const ok = name === v.book;
            const quick = Math.max(0, 15 - Math.round((Date.now() - shownAt) / 1000)) * 4; // up to 60 for a fast answer
            const gained = ok ? 100 * v.level + quick : 0;
            if (ok) { right++; score += gained; }
            const last = streakMode ? !ok : i === ROUND - 1;
            const next = h('button', { class: 'btn btn-primary', onclick: () => { i++; last ? finish() : ask(); } }, last ? 'See my score' : 'Next verse');
            const reveal = () => h('div', { class: 'feedback ' + (ok ? 'good' : 'bad') },
              h('strong', null, ok ? `${BP.cheer()} +${gained}` : `It’s from ${v.book}.`),
              h('p', { class: 'ref' }, v.ref),
              h('p', null, v.point));
            if (!ok) {
              const row = h('div', { class: 'btn-row', style: 'margin-top:14px' }, next);
              feedback.replaceChildren(reveal(), row); next.focus({ preventScroll: true });
              // Coin Shop: in streak mode a Second Chance keeps the streak alive, once per run.
              if (streakMode && !revived && BP.shop) {
                revived = true;
                setTimeout(() => BP.shop.offer('revive', { title: 'Save your streak?', text: `Keep your streak of ${right} going with a Second Chance.` }).then((saved) => {
                  if (!saved || !document.body.contains(row)) return;
                  boosted = true;
                  const go = h('button', { class: 'btn btn-primary', onclick: () => { i++; ask(); } }, 'Streak saved! Next verse');
                  row.replaceChildren(go); go.focus({ preventScroll: true });
                }), 900);
              }
              return;
            }

            // Chapter bonus: optional.
            const ch = chapterOf(v.ref);
            const input = h('input', { class: 'nick ch-input', type: 'number', inputmode: 'numeric', min: '1', max: '150', placeholder: 'Chapter', 'aria-label': 'Chapter number' });
            const bonusBox = h('form', { class: 'guess-row', onsubmit: (e) => {
              e.preventDefault();
              const g = parseInt(input.value, 10); if (!g) return;
              const off = Math.abs(g - ch);
              const bonus = off === 0 ? 50 : off <= 2 ? 20 : 0;
              score += bonus; if (bonus === 50) chapters++;
              bonusBox.replaceChildren(h('p', { class: bonus ? 'done-mark' : 'ref' },
                (off === 0 ? `Exactly right! +50` : bonus ? `Close! +20` : 'Not this time.') + ` It’s ${v.ref}.`));
              next.focus({ preventScroll: true });
            } }, h('label', { class: 'ref ch-label' }, `Bonus: which chapter of ${v.book}?`), input, h('button', { class: 'btn', type: 'submit' }, 'Guess'),
              h('button', { class: 'btn btn-small', type: 'button', onclick: () => { bonusBox.replaceChildren(h('p', { class: 'ref' }, `It’s ${v.ref}.`)); next.focus({ preventScroll: true }); } }, 'Skip'));
            feedback.replaceChildren(
              h('div', { class: 'feedback good' }, h('strong', null, `${BP.cheer()} +${gained}`), h('p', null, v.point)),
              bonusBox,
              h('div', { class: 'btn-row', style: 'margin-top:14px' }, next));
            input.focus({ preventScroll: true });
          }
        }

        function finish() {
          const secs = Math.round((Date.now() - started) / 1000);
          if (streakMode && right > store.get('verse-streak-best', 0)) store.set('verse-streak-best', right);
          if ((streakMode && right >= 10) || (!streakMode && right >= 8)) BP.confetti();
          const msg = streakMode
            ? (right >= 15 ? 'Walking concordance!' : right >= 7 ? 'Strong streak. You know your Bible.' : 'No worries. Go again!')
            : (right >= 9 ? 'Sword drill champion!' : right >= 6 ? 'You know your way around the Bible.' : 'Every round teaches you where to look.');
          body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
            h('p', { class: 'big-score' }, streakMode ? String(right) : `${right}/${ROUND}`),
            h('p', null, `${streakMode ? 'in a row' : 'books right'} · ${score.toLocaleString('en-US')} points · ${chapters} exact chapter${chapters === 1 ? '' : 's'} · ${secs}s`),
            h('h2', { class: 'panel-title' }, msg),
            h('div', { class: 'feedback good', style: 'text-align:left' },
              h('strong', null, 'Hide it in your heart'),
              h('p', null, 'Knowing where a verse lives helps you find it again when you need it. Jesus answered every temptation with “It is written” (Matthew 4:4).')),
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', onclick: () => play(streakMode) }, 'Play again'),
              h('button', { class: 'btn', onclick: menu }, 'Change mode')),
            BP.finish('verse', { points: score, secs, boosted, detail: streakMode ? `Streak of ${right}` : `${right}/${ROUND} books`, coins: right * 5 + chapters * 3 })));
        }
      }
    },
  };
})();
