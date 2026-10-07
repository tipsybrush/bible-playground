// Jacob's Ladder: 15 questions that get harder, with three lifelines and two safe rungs.
(function () {
  const { h, shuffle, store } = BP;
  const POINTS = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
  const SAFE = [4, 9]; // rung 5 and rung 10, counted from zero
  const LETTERS = ['A', 'B', 'C', 'D'];
  const fmt = (n) => n.toLocaleString('en-US') + ' pts'; // the prize ladder is in points

  // Each safe rung opens a harder zone. The last zone ends on expert questions.
  const ZONES = [
    { name: 'Zone 1', label: 'Warm-up', from: 0 },
    { name: 'Zone 2', label: 'Harder', from: 5 },
    { name: 'Zone 3', label: 'Expert', from: 10 },
  ];
  const zoneOf = (rung) => (rung >= 10 ? 2 : rung >= 5 ? 1 : 0);
  const PLAN = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4, 4, 4]; // question level for each rung

  // Prefer questions this player hasn't seen in recent climbs, so the top rungs stay fresh.
  function pickQuestions() {
    const seen = new Set(store.get('ladder-seen', []));
    const used = new Set();
    const picks = PLAN.map((lv) => {
      const pool = shuffle(BIBLE_QUESTIONS.filter((q) => q.level === lv && !used.has(q)));
      const q = pool.find((x) => !seen.has(x.q)) || pool[0];
      used.add(q);
      return q;
    });
    store.set('ladder-seen', [...picks.map((q) => q.q), ...seen].slice(0, 60));
    return picks;
  }

  BP.games.ladder = {
    title: "Jacob's Ladder",
    color: 'var(--c-ladder)',
    scoring: 'The points you keep. On equal prizes, the faster climb ranks higher.',
    badge() {
      const best = store.get('ladder-best', null);
      return best == null ? 'New' : `Best ${fmt(best)}`;
    },
    mount(root) {
      const main = h('section', { class: 'panel' });
      const rungs = h('ol', { class: 'rungs', reversed: true, 'aria-label': 'The ladder' });
      root.append(
        BP.gameHead("Jacob's Ladder", 'Climb 15 rungs through three zones. Each safe rung unlocks harder questions.'),
        h('div', { class: 'ladder-layout' }, main, rungs));

      let qs, i, used, boosted = false, revived = false, refilled = false;
      intro();

      function intro() {
        drawRungs(-1);
        main.replaceChildren(
          h('h2', { class: 'panel-title' }, 'How to climb'),
          h('p', null, 'Each right answer moves you one rung up the ladder. The ladder has three zones, and every safe rung you pass unlocks a harder zone. The final zone ends with expert questions. One wrong answer and you drop back to your last safe rung, so you can stop and keep your money any time.'),
          h('p', null, 'You get three lifelines, one use each: ',
            h('strong', null, '50:50'), ' removes two wrong answers, ',
            h('strong', null, 'Ask the Youth Group'), ' shows how a crowd would vote, and ',
            h('strong', null, 'Hint'), ' tells you where in the Bible to look.'),
          h('p', { class: 'ref' }, 'In Genesis 28:12, Jacob dreamed of a ladder reaching up to heaven.'),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: begin }, 'Start climbing')));
      }

      let started = Date.now();
      function begin() {
        qs = pickQuestions(); i = 0; used = {}; started = Date.now(); boosted = revived = refilled = false;
        ask();
      }

      function drawRungs(current) {
        const items = [];
        for (let n = POINTS.length - 1; n >= 0; n--) {
          if (n === 14 || n === 9 || n === 4) {
            const z = ZONES[zoneOf(n)];
            items.push(h('li', { class: 'zone-label' + (zoneOf(n) === zoneOf(Math.max(current, 0)) && current >= 0 ? ' here' : '') }, `${z.name.toUpperCase()} \u00b7 ${z.label.toUpperCase()}`));
          }
          items.push(h('li', { class: [SAFE.includes(n) ? 'safe' : '', n < current ? 'done' : '', n === current ? 'now' : ''].join(' ') },
            h('span', { class: 'rung-num' }, n + 1), h('span', { class: 'rung-pts' }, fmt(POINTS[n]))));
        }
        rungs.replaceChildren(...items);
      }

      function banked(wrongAt) {
        // Points kept after a wrong answer on rung index wrongAt.
        const safe = SAFE.filter((s) => s < wrongAt);
        return safe.length ? POINTS[safe[safe.length - 1]] : 0;
      }

      function ask() {
        drawRungs(i);
        const q = qs[i];
        const options = shuffle([q.answer, ...q.wrong]);
        const extra = h('div', { 'aria-live': 'polite' });
        const buttons = options.map((text, n) =>
          h('button', { class: 'btn opt', onclick: () => choose(n) },
            h('span', { class: 'opt-letter' }, LETTERS[n]), h('span', { class: 'opt-text' }, text)));

        const lifeBtns = {};
        const lifeline = (key, label, fn) => (lifeBtns[key] = h('button', {
          class: 'btn btn-small lifeline' + (used[key] ? ' used' : ''), disabled: !!used[key],
          onclick: (e) => { used[key] = true; e.currentTarget.disabled = true; e.currentTarget.classList.add('used'); fn(); addRefill(); },
        }, label));
        // Coin Shop: an Extra Lifeline gives back one used lifeline, once per climb.
        function addRefill() {
          if (refilled || !Object.values(used).some(Boolean) || lifelines.querySelector('.power-chip')) return;
          const chip = BP.shop && BP.shop.chip('lifeline', () => {
            const key = Object.keys(used).find((k) => used[k]);
            delete used[key]; refilled = boosted = true;
            lifeBtns[key].disabled = false; lifeBtns[key].classList.remove('used');
          });
          if (chip) lifelines.append(chip);
        }

        const walk = h('button', { class: 'btn btn-small', onclick: () => end('walk', i > 0 ? POINTS[i - 1] : 0) },
          `Stop and keep ${fmt(i > 0 ? POINTS[i - 1] : 0)}`);
        const lifelines = h('div', { class: 'lifelines' },
          lifeline('fifty', '50:50', fifty),
          lifeline('poll', 'Ask the Youth Group', poll),
          lifeline('hint', 'Hint', () => extra.replaceChildren(h('div', { class: 'feedback' },
            h('strong', null, 'Hint'), h('p', null, `Look in ${q.ref}.`)))));

        main.replaceChildren(
          i === 5 || i === 10 ? h('div', { class: 'zone-banner' },
            h('strong', null, `${ZONES[zoneOf(i)].name} unlocked: ${ZONES[zoneOf(i)].label}!`),
            h('p', null, i === 5 ? 'You passed the first safe rung. The questions get harder from here.' : 'Final zone. These are the toughest questions on the ladder, and the last three are for real Bible experts.')) : '',
          h('div', { class: 'meta-row' },
            h('span', { class: 'pill pill-game' }, `Rung ${i + 1} of 15 \u00b7 ${ZONES[zoneOf(i)].label}`),
            h('span', null, `for ${fmt(POINTS[i])}`),
            BP.stopwatch(started)),
          h('p', { class: 'question' }, q.q),
          h('div', { class: 'options' }, buttons),
          lifelines, extra,
          h('div', { class: 'btn-row' }, walk));
        addRefill();

        function live() { return options.map((_, n) => n).filter((n) => !buttons[n].classList.contains('is-gone')); }

        function fifty() {
          const wrongs = shuffle(live().filter((n) => options[n] !== q.answer)).slice(0, 2);
          wrongs.forEach((n) => { buttons[n].classList.add('is-gone'); buttons[n].disabled = true; });
        }

        function poll() {
          const choices = live();
          const correct = choices.find((n) => options[n] === q.answer);
          const base = { 1: 62, 2: 48, 3: 36, 4: 28 }[q.level] + Math.floor(Math.random() * 18);
          const votes = {}; let left = 100 - base;
          const others = shuffle(choices.filter((n) => n !== correct));
          others.forEach((n, k) => {
            const share = k === others.length - 1 ? left : Math.floor(Math.random() * (left + 1) * 0.7);
            votes[n] = share; left -= share;
          });
          votes[correct] = base;
          extra.replaceChildren(h('div', { class: 'feedback' },
            h('strong', null, 'The youth group voted'),
            h('div', { class: 'poll' }, choices.map((n) => h('div', { class: 'poll-row' },
              h('span', null, LETTERS[n]),
              h('span', { class: 'poll-bar' }, h('span', { style: `width:${votes[n]}%` })),
              h('span', null, votes[n] + '%'))))));
        }

        function choose(n) {
          const right = options[n] === q.answer;
          buttons.forEach((b, k) => {
            b.disabled = true;
            if (options[k] === q.answer) b.classList.add('is-correct');
            else if (k === n) b.classList.add('is-wrong');
            else b.classList.add('is-dim');
          });
          lifelines.remove(); walk.remove();
          if (!right) {
            const row = h('div', { class: 'btn-row', style: 'margin-top:14px' });
            extra.replaceChildren(h('div', { class: 'feedback bad' },
              h('strong', null, `The answer was ${q.answer}.`), h('p', null, q.fact), h('p', { class: 'ref' }, q.ref)), row);
            const fell = () => row.replaceChildren(h('button', { class: 'btn btn-primary', onclick: () => end('fell', banked(i)) }, 'See how far I got'));
            // Coin Shop: a Second Chance keeps you on this rung with a fresh question, once per climb.
            if (revived || !BP.shop) return fell();
            setTimeout(() => BP.shop.offer('revive', { title: 'Second Chance?', text: `Stay on rung ${i + 1} and answer a fresh question instead of falling.` }).then((ok) => {
              if (!document.body.contains(row)) return;
              if (!ok) return fell();
              revived = boosted = true;
              const pool = shuffle(BIBLE_QUESTIONS.filter((x) => x.level === q.level && !qs.includes(x)));
              if (pool.length) qs[i] = pool[0];
              ask();
            }), 900);
            return;
          }
          if (i === POINTS.length - 1) { drawRungs(POINTS.length); return end('top', POINTS[i]); }
          const safeNow = SAFE.includes(i);
          // Move on by itself after a few seconds (a little longer on a safe rung, to enjoy it). Tap to go now.
          const wait = safeNow ? 5 : 4;
          let left = wait, moved = false;
          const label = h('span', null, `Climbing to rung ${i + 2} in ${left}…`);
          const go = () => { if (moved) return; moved = true; clearInterval(tick); i++; ask(); };
          const next = h('button', { class: 'btn btn-primary auto-next', style: `--wait:${wait}s`, onclick: go }, label);
          const tick = setInterval(() => {
            if (!document.body.contains(next)) return clearInterval(tick);
            left--;
            if (left <= 0) go(); else label.textContent = `Climbing to rung ${i + 2} in ${left}…`;
          }, 1000);
          extra.replaceChildren(h('div', { class: 'feedback good' },
            h('strong', null, `Correct! You’ve banked ${fmt(POINTS[i])}.`),
            safeNow ? h('p', null, 'Safe rung! This money is yours to keep, no matter what.') : null,
            h('p', null, q.fact), h('p', { class: 'ref' }, q.ref)),
            h('div', { class: 'btn-row', style: 'margin-top:14px' }, next));
          next.focus({ preventScroll: true });
        }
      }

      function end(how, points) {
        const best = store.get('ladder-best', 0);
        if (points > best) store.set('ladder-best', points);
        if (how === 'top') BP.confetti();
        const title = { top: 'A million points! You reached the top of the ladder.', walk: 'Wise move. You stopped and kept your points.', fell: 'Ah! You slipped off the ladder.' }[how];
        main.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
          h('p', { class: 'big-score' }, fmt(points)),
          h('p', { class: 'ref' }, 'prize money (play money only)'),
          h('h2', { class: 'panel-title' }, title),
          points > best && best > 0 ? h('p', { class: 'done-mark' }, 'New personal best!') : null,
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', onclick: begin }, 'Climb again')),
          BP.finish('ladder', { points, boosted, secs: Math.round((Date.now() - started) / 1000), detail: how === 'top' ? 'Reached the top' : `Climbed ${i} of 15 rungs`, coins: how === 'top' ? 200 : i * 10 })));
      }
    },
  };
})();
