// Who Am I? Riddles: eight riddles per round. Each one reveals up to three clues;
// guessing on an earlier clue scores more.
(function () {
  const { h, shuffle, store } = BP;
  const ROUND = 8;
  const POINTS = [3, 2, 1]; // for solving on clue 1, 2 or 3

  // Rounds start with answers almost everyone knows and finish on deep cuts:
  // riddles 1-3 come from EASY, 4-6 from MEDIUM, 7-8 from everything else.
  const EASY = new Set(['Jonah', 'Lazarus', 'Manna', 'Peter', 'The burning bush', 'Samson', 'Zacchaeus', 'The Tower of Babel',
    'Esther', 'Goliath', 'The prodigal son', 'Elijah', 'Adam', 'Eve', 'Noah', 'Abraham', 'Isaac', 'Joseph (son of Jacob)', 'Moses',
    'The Red Sea', 'The Ten Commandments', 'The golden calf', 'The walls of Jericho', 'Ruth', 'David', 'Solomon', 'Daniel',
    'Shadrach, Meshach and Abed-nego', 'Mary, mother of Jesus', 'The shepherds', 'The star', 'John the Baptist', 'The cross',
    'The empty tomb', 'Bethlehem', 'The Good Samaritan', 'The Last Supper', 'Paul', 'Pontius Pilate', 'The lost sheep',
    'Thirty pieces of silver', 'Frogs', 'The Lord’s Prayer', 'The crown of thorns', 'Thomas']);
  const MEDIUM = new Set(['Jacob', 'Sarah', 'Esau', 'Rachel', 'Aaron', 'Miriam', 'The Passover lamb', 'Mount Sinai', 'Joshua', 'Gideon',
    'Deborah', 'Naomi', 'Boaz', 'Hannah', 'Samuel', 'Saul', 'Jonathan', 'Elisha', 'Naaman', 'Jezebel', 'Ahab', 'Isaiah', 'Jeremiah',
    'Nebuchadnezzar', 'Mordecai', 'Haman', 'Nehemiah', 'Job', 'Nineveh', 'King Herod', 'Andrew', 'Matthew', 'John', 'James',
    'Mary Magdalene', 'Martha', 'Barabbas', 'Nazareth', 'Gethsemane', 'The dove', 'The mustard seed', 'The widow’s mites',
    'The Sermon on the Mount', 'The day of Pentecost', 'Stephen', 'Barnabas', 'Damascus', 'Rahab', 'Nicodemus', 'Lot',
    'Moses’ staff', 'The ark of the covenant', 'Joseph, husband of Mary', 'Simon of Cyrene', 'Bartimaeus', 'Silas', 'Timothy',
    'Caleb', 'The Jordan', 'Methuselah', 'The cock', 'Myrrh', 'Salt', 'Quails', 'Legion', 'Philip', 'Jesse', 'Eli', 'Absalom',
    'Hezekiah', 'Belshazzar', 'Cornelius', 'Lydia', 'Patmos', 'The Mount of Olives', 'Ravens', 'The donkey', 'The fig tree',
    'Ananias and Sapphira', 'Zacharias', 'Elisabeth']);
  function pickRound() {
    const tier = (r) => (EASY.has(r.answer) ? 0 : MEDIUM.has(r.answer) ? 1 : 2);
    const of = (t) => BIBLE_RIDDLES.filter((r) => tier(r) === t);
    return [...BP.fresh('riddles-easy', of(0), 3), ...BP.fresh('riddles-medium', of(1), 3), ...BP.fresh('riddles-hard', of(2), ROUND - 6)];
  }

  const clean = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[‘’']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\b(the|a|an)\b/g, ' ').replace(/\s+/g, ' ').trim();

  function distance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[a.length][b.length];
  }

  // Right if it matches the answer or an accepted alternative, allowing one typo in longer words.
  function isRight(guess, r) {
    const g = clean(guess);
    if (!g) return false;
    return [r.answer, ...r.accept].map(clean).some((a) => a === g || (a.length >= 5 && distance(a, g) <= 1));
  }

  BP.games.riddles = {
    title: 'Who Am I?',
    color: 'var(--c-riddles)',
    scoring: '3 points for solving on the first clue, 2 on the second, 1 on the third, plus a speed bonus.',
    badge() {
      const best = store.get('riddles-best', null);
      return best == null ? 'New' : `Best ${best}/${ROUND * 3}`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Who Am I?', 'Bible riddles. Each clue makes it easier, but solving early scores more.'), body);
      intro();

      function intro() {
        body.replaceChildren(
          BP.howTo(
            h('li', null, `You get ${ROUND} riddles about Bible people, places and things. They start easy and get harder.`),
            h('li', null, 'Type your guess, or ask for the next clue. Spelling doesn’t have to be perfect.'),
            h('li', null, 'Solve on the first clue for 3 points, the second for 2 and the third for 1.')),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: start }, 'Start')));
      }

      function start() {
        const set = pickRound();
        const started = Date.now();
        let i = 0, score = 0;
        ask();

        function ask() {
          const r = set[i];
          let shown = 1, done = false;
          const clues = h('ol', { class: 'clues' });
          const input = h('input', { id: 'riddle-guess', class: 'nick', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Who or what am I?' });
          const feedback = h('div', { 'aria-live': 'polite' });
          const more = h('button', { class: 'btn', type: 'button', onclick: nextClue }, 'Next clue');
          const giveUp = h('button', { class: 'btn btn-small', type: 'button', onclick: () => finishRiddle(false) }, 'Reveal answer');
          const form = h('form', { class: 'guess-row', onsubmit: (e) => {
            e.preventDefault();
            if (done || !input.value.trim()) return;
            if (isRight(input.value, r)) return finishRiddle(true);
            feedback.replaceChildren(h('p', { class: 'board-error' }, `“${input.value.trim()}” isn’t it.` + (shown < 3 ? ' Try again or take another clue.' : ' One more try, or reveal the answer.')));
            input.select();
          } }, input, h('button', { class: 'btn btn-primary', type: 'submit' }, 'Guess'));

          function drawClues() {
            clues.replaceChildren(...r.clues.slice(0, shown).map((c, n) => h('li', { class: n === shown - 1 ? 'new' : '' }, c)));
            more.disabled = shown >= 3;
            more.textContent = shown >= 3 ? 'No more clues' : `Next clue (worth ${POINTS[shown]})`;
          }
          function nextClue() { if (shown < 3) { shown++; drawClues(); feedback.replaceChildren(); input.focus(); } }

          function finishRiddle(right) {
            done = true;
            const pts = right ? POINTS[shown - 1] : 0;
            score += pts;
            input.disabled = true; more.remove(); giveUp.remove();
            form.querySelector('button').disabled = true;
            shown = 3; drawClues();
            const last = i === set.length - 1;
            const next = h('button', { class: 'btn btn-primary', onclick: () => { i++; last ? finish() : ask(); } }, last ? 'See my score' : 'Next riddle');
            feedback.replaceChildren(h('div', { class: 'feedback ' + (right ? 'good' : 'bad') },
              h('strong', null, right ? `Yes! ${r.answer}. +${pts}` : `It was ${r.answer}.`),
              r.point ? h('p', null, r.point) : '',
              h('p', { class: 'ref' }, r.ref)),
              h('div', { class: 'btn-row', style: 'margin-top:14px' }, next));
            next.focus({ preventScroll: true });
          }

          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Riddle ${i + 1} of ${set.length}`),
              h('span', null, `Score ${score}`),
              BP.stopwatch(started)),
            clues, form,
            h('div', { class: 'btn-row' }, more, giveUp),
            feedback);
          drawClues();
          input.focus({ preventScroll: true });
        }

        function finish() {
          const max = set.length * 3;
          const seconds = Math.round((Date.now() - started) / 1000);
          const points = score * 100 + Math.round(Math.max(0, 480 - seconds) * score / max);
          const best = store.get('riddles-best', 0);
          if (score > best) store.set('riddles-best', score);
          const msg = score >= max - 4 ? 'Riddle master!' : score >= max / 2 ? 'Sharp! You know your Bible.' : 'Tough set, no worries. Another round will teach you new ones.';
          body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
            h('p', { class: 'big-score' }, `${score}/${max}`),
            h('h2', { class: 'panel-title' }, msg),
            h('p', null, `${points.toLocaleString('en-US')} points, with a speed bonus for finishing in ${seconds} seconds.`),
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', onclick: start }, 'Play again')),
            BP.finish('riddles', { points, secs: seconds, detail: `${score}/${max} clue points`, coins: score * 5 })));
        }
      }
    },
  };
})();
