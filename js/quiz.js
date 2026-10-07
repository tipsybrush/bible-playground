// Bible Quiz: ten questions from a chosen part of the Bible.
(function () {
  const { h, shuffle, store } = BP;
  const ROUND = 10;
  const MODES = [
    { id: 'ot', label: 'Old Testament', blurb: 'From Creation to the prophets', filter: (q) => q.cat === 'ot' },
    { id: 'nt', label: 'New Testament', blurb: 'Jesus and the early church', filter: (q) => q.cat === 'nt' },
    { id: 'all', label: 'Everything', blurb: 'The whole Bible, mixed up', filter: () => true },
  ];
  const LETTERS = ['A', 'B', 'C', 'D'];
  // A round starts with a couple of warm-ups and finishes on harder questions.
  const MIX = [[1, 2], [2, 4], [3, 3], [4, 1]];
  function pickRound(mode) {
    const pool = BIBLE_QUESTIONS.filter(mode.filter);
    const picked = [];
    MIX.forEach(([lv, n]) => picked.push(...BP.fresh(`quiz-${mode.id}-${lv}`, pool.filter((q) => q.level === lv), n)));
    const rest = shuffle(pool.filter((q) => !picked.includes(q)));
    while (picked.length < ROUND && rest.length) picked.push(rest.pop());
    return picked.sort((a, b) => a.level - b.level);
  }

  function verdict(score) {
    if (score === ROUND) return 'Perfect round! You’re ready for the Bible quiz championship.';
    if (score >= 8) return 'Brilliant! You really know your Bible.';
    if (score >= 5) return 'Not bad at all. Go again and beat it.';
    return 'No worries. Every round teaches you something new. Try again!';
  }

  BP.games.quiz = {
    title: 'Bible Quiz',
    color: 'var(--c-quiz)',
    scoring: '100 points per right answer, plus up to 300 for speed.',
    badge() {
      const best = store.get('quiz-best', null);
      return best == null ? 'New' : `Best score ${best}/${ROUND}`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Bible Quiz', 'Ten questions. How many can you get right?'), body);
      showPicker();

      function showPicker() {
        body.replaceChildren(
          BP.howTo(
            h('li', null, 'Pick a round below: Old Testament, New Testament or everything.'),
            h('li', null, 'Answer 10 questions. They start easy and finish tough.'),
            h('li', null, 'Each right answer is worth 100 points, and finishing fast earns a speed bonus.')),
          h('h2', { class: 'panel-title' }, 'Pick a round'),
          h('div', { class: 'choice-grid' }, MODES.map((m) =>
            h('button', { class: 'btn choice', onclick: () => start(m) },
              h('span', { class: 'choice-label' }, m.label),
              h('span', { class: 'choice-blurb' }, m.blurb)))));
      }

      function start(mode) {
        const qs = pickRound(mode);
        let i = 0, score = 0, streak = 0;
        const started = Date.now();
        ask();

        function ask() {
          const q = qs[i];
          const options = shuffle([q.answer, ...q.wrong]);
          const feedback = h('div', { 'aria-live': 'polite' });
          const buttons = options.map((text, n) =>
            h('button', { class: 'btn opt', onclick: () => choose(text) },
              h('span', { class: 'opt-letter' }, LETTERS[n]), h('span', { class: 'opt-text' }, text)));

          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Question ${i + 1} of ${qs.length}`),
              h('span', null, `Score ${score}`, streak >= 2 ? `  ·  ${streak} in a row!` : ''),
              BP.stopwatch(started)),
            h('p', { class: 'question' }, q.q),
            h('div', { class: 'options' }, buttons),
            feedback);

          function choose(text) {
            const right = text === q.answer;
            if (right) { score++; streak++; } else { streak = 0; }
            buttons.forEach((b, n) => {
              b.disabled = true;
              if (options[n] === q.answer) b.classList.add('is-correct');
              else if (options[n] === text) b.classList.add('is-wrong');
              else b.classList.add('is-dim');
            });
            const last = i === qs.length - 1;
            const next = h('button', { class: 'btn btn-primary', onclick: () => { i++; last ? finish() : ask(); } },
              last ? 'See my score' : 'Next question');
            feedback.replaceChildren(h('div', { class: 'feedback ' + (right ? 'good' : 'bad') },
              h('strong', null, right ? BP.cheer() : `Not quite. It’s ${q.answer}.`),
              h('p', null, q.fact),
              h('p', { class: 'ref' }, q.ref)),
              h('div', { class: 'btn-row', style: 'margin-top:14px' }, next));
            next.focus({ preventScroll: true });
          }
        }

        function finish() {
          const best = store.get('quiz-best', 0);
          const isBest = score > best;
          if (isBest) store.set('quiz-best', score);
          if (score >= 8) BP.confetti();
          const seconds = Math.round((Date.now() - started) / 1000);
          const points = score * 100 + Math.round(Math.max(0, 300 - seconds) * score / ROUND);
          body.replaceChildren(h('div', { class: 'panel result', style: 'border:0;box-shadow:none;padding:0' },
            h('p', { class: 'ref' }, mode.label),
            h('p', { class: 'big-score' }, `${score}/${qs.length}`),
            h('h2', { class: 'panel-title' }, verdict(score)),
            h('p', null, `${points.toLocaleString('en-US')} points, with a speed bonus for finishing in ${seconds} second${seconds === 1 ? '' : 's'}.`),
            isBest && best > 0 ? h('p', { class: 'done-mark' }, 'New personal best!') : null,
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', onclick: () => start(mode) }, 'Play again'),
              h('button', { class: 'btn', onclick: showPicker }, 'Pick another round')),
            BP.finish('quiz', { points, secs: seconds, detail: `${score}/${qs.length} · ${mode.label}`, coins: score * 10 })));
        }
      }
    },
  };
})();
