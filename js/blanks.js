// Story Gaps: tap words from the word bank to fill the blanks in a Bible story.
(function () {
  const { h, shuffle, store } = BP;
  const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

  BP.games.blanks = {
    title: 'Story Gaps',
    color: 'var(--c-blanks)',
    scoring: '100 points per word, minus 30 for each wrong guess, plus a speed bonus.',
    badge() {
      const done = store.get('blanks-done', []);
      return done.length ? `${done.length} of ${BIBLE_STORIES.length} done` : 'New';
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Story Gaps', 'Restore famous Scripture word for word, or fill in the key details of a Bible story. Tap a word to drop it into the next gap; tap a filled gap to take it back.'), body);
      showList();

      function showList() {
        const done = store.get('blanks-done', []);
        const list = (kind) => h('div', { class: 'story-list' }, BIBLE_STORIES.filter((s) => s.kind === kind).map((s) =>
          h('button', { class: 'btn choice', onclick: () => play(s) },
            h('span', { class: 'choice-label' }, s.title),
            h('span', { class: 'choice-blurb' }, s.ref, done.includes(s.id) ? h('span', { class: 'done-mark' }, '  ·  Done') : null))));
        body.replaceChildren(
          BP.howTo(
            h('li', null, 'Pick a Scripture passage or a Bible story below.'),
            h('li', null, 'Tap a word in the word bank to drop it into the highlighted gap. Tap any gap to choose it, or to take its word back. Watch out for decoys that almost fit.'),
            h('li', null, 'Press Check my answers. Fewer wrong guesses and a faster finish mean more points.')),
          h('h2', { class: 'panel-title' }, 'Scripture passages'),
          h('p', { class: 'ref' }, 'Word for word from the King James Version. Watch out for decoys that almost fit.'),
          list('passage'),
          h('h2', { class: 'panel-title' }, 'Bible stories'),
          h('p', { class: 'ref' }, 'Key moments retold in our own words.'),
          list('story'));
      }

      function play(story) {
        const parts = story.text.split(/\{([^}]+)\}/); // even = text, odd = answer
        const gaps = [];
        const textEl = h('p', { class: 'story-text' });
        parts.forEach((part, n) => {
          if (n % 2 === 0) { textEl.append(part); return; }
          const gap = { answer: part, chip: null };
          gap.el = h('button', { class: 'gap', 'aria-label': `Gap ${gaps.length + 1}`, onclick: () => tapGap(gap) });
          gaps.push(gap);
          textEl.append(gap.el);
        });

        const chips = shuffle([...gaps.map((g) => g.answer), ...story.extra]).map((word) => ({ word }));
        const bank = h('div', { class: 'bank' });
        const status = h('div', { 'aria-live': 'polite' });
        let target = gaps[0];
        let misses = 0;
        const started = Date.now();
        const clockEl = BP.stopwatch(started);

        chips.forEach((c) => {
          c.el = h('button', { class: 'btn chip', onclick: () => tapChip(c) }, c.word);
        });

        function firstEmpty() { return gaps.find((g) => !g.chip) || null; }
        function clearMarks() { gaps.forEach((g) => g.el.classList.remove('is-correct', 'is-wrong')); status.replaceChildren(); }

        function render() {
          gaps.forEach((g) => {
            g.el.textContent = g.chip ? g.chip.word : '';
            g.el.classList.toggle('filled', !!g.chip);
            g.el.classList.toggle('is-target', g === target);
          });
          bank.replaceChildren(h('span', { class: 'bank-label' }, 'Word bank'),
            ...chips.filter((c) => !c.placed).map((c) => c.el));
          check.disabled = !!firstEmpty();
        }

        function tapChip(c) {
          const g = target && !target.chip ? target : firstEmpty();
          if (!g) return;
          clearMarks();
          g.chip = c; c.placed = true;
          target = firstEmpty();
          render();
        }

        function tapGap(g) {
          clearMarks();
          if (g.chip) { g.chip.placed = false; g.chip = null; }
          target = g;
          render();
        }

        const check = h('button', { class: 'btn btn-primary', onclick: checkAnswers }, 'Check my answers');

        function checkAnswers() {
          let wrong = 0;
          gaps.forEach((g) => {
            const ok = g.chip && same(g.chip.word, g.answer);
            g.el.classList.add(ok ? 'is-correct' : 'is-wrong');
            if (!ok) wrong++;
          });
          if (wrong) {
            misses += wrong;
            status.replaceChildren(h('div', { class: 'feedback bad' },
              h('strong', null, wrong === 1 ? 'One word is in the wrong place.' : `${wrong} words are in the wrong place.`),
              h('p', null, 'Tap the red ones to send them back, then try again.')));
            return;
          }
          const done = store.get('blanks-done', []);
          if (!done.includes(story.id)) store.set('blanks-done', [...done, story.id]);
          BP.confetti();
          bank.remove(); check.remove();
          gaps.forEach((g) => { g.el.disabled = true; g.el.classList.remove('is-target'); });
          const idx = BIBLE_STORIES.indexOf(story);
          const nextStory = BIBLE_STORIES[(idx + 1) % BIBLE_STORIES.length];
          const seconds = Math.round((Date.now() - started) / 1000);
          clockEl.stop();
          const points = Math.max(0, gaps.length * 100 - misses * 30 + Math.max(0, gaps.length * 20 - seconds));
          status.replaceChildren(h('div', { class: 'feedback good' },
            h('strong', null, 'You got every word!'),
            h('p', null, `${points.toLocaleString('en-US')} points in ${seconds} seconds${misses ? `, with ${misses} wrong guess${misses === 1 ? '' : 'es'}` : ' with no wrong guesses'}.`),
            story.verse ? h('p', null, 'A verse to remember from this story:') : null,
            BP.verse(story.verse || { text: story.text.replace(/[{}]/g, ''), ref: story.ref })),
            h('div', { class: 'btn-row', style: 'margin-top:14px' },
              h('button', { class: 'btn btn-primary', onclick: () => play(nextStory) }, `Next: ${nextStory.title}`),
              h('button', { class: 'btn', onclick: showList }, 'All stories')),
            BP.finish('blanks', { points, secs: seconds, detail: story.title, coins: gaps.length * 5 + 20 }));
        }

        body.replaceChildren(
          h('div', { class: 'meta-row' }, h('span', { class: 'pill pill-game' }, story.title), h('span', null, story.ref + (story.kind === 'passage' ? ' (KJV)' : '')), clockEl),
          ...(story.note ? [h('p', { class: 'ref' }, story.note)] : []),
          textEl, bank,
          h('div', { class: 'btn-row' }, check, h('button', { class: 'btn btn-small', onclick: showList }, 'Pick another')),
          status);
        render();
      }
    },
  };
})();
