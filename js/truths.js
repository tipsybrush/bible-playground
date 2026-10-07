// Two Truths and a Lie: three statements about a Bible character or story. Two are true, one is a
// common mix-up. Spot the lie fast. Every card then flips to show why, with the KJV reference.
(function () {
  const { h, shuffle, store } = BP;
  const ROUND = 10;
  const PLAN = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3]; // character level for each turn
  const BASE = 100, BONUS = 50, FULL_SECS = 3, ZERO_SECS = 20; // speed bonus: full up to 3s, gone by 20s
  const LETTERS = ['A', 'B', 'C'];
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function speedBonus(secs) {
    if (secs <= FULL_SECS) return BONUS;
    return Math.max(0, Math.round(BONUS * (1 - (secs - FULL_SECS) / (ZERO_SECS - FULL_SECS))));
  }

  // One lie and two truths that never cover the same fact (statements sharing a k key).
  function draw(c, turn) {
    const hardLies = c.lies.filter((l) => l.hard), easyLies = c.lies.filter((l) => !l.hard);
    let pool = c.lies;
    if (turn < 3 && easyLies.length) pool = easyLies;
    else if (turn >= 6 && hardLies.length) pool = hardLies;
    const lie = shuffle(pool)[0];
    const truths = [];
    for (const t of shuffle(c.truths)) {
      if (truths.length === 2) break;
      if (t.k && (t.k === lie.k || truths.some((x) => x.k === t.k))) continue;
      truths.push(t);
    }
    return shuffle([{ ...lie, lie: true }, ...truths.map((t) => ({ ...t, lie: false }))]);
  }

  BP.games.truths = {
    title: 'Two Truths and a Lie',
    color: 'var(--c-truths)',
    scoring: `${BASE} points for each lie you spot, plus up to ${BONUS} more for answering fast (full bonus inside ${FULL_SECS} seconds).`,
    badge() {
      const b = store.get('truths-best', 0);
      return b ? `Best: ${b.toLocaleString('en-US')}` : 'New';
    },
    mount(root) {
      const body = h('section', { class: 'panel truths' });
      root.append(BP.gameHead('Two Truths and a Lie', 'Three statements. One is a lie. Can you catch it?'), body);
      let onKey = null; // current key handler for the screen on show
      function keyListener(e) {
        if (!document.body.contains(body)) { document.removeEventListener('keydown', keyListener); return; }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (onKey) onKey(e);
      }
      document.addEventListener('keydown', keyListener);
      menu();

      function menu() {
        onKey = null;
        const best = store.get('truths-best', 0);
        const start = h('button', { class: 'btn btn-primary', type: 'button', onclick: play }, 'Start round');
        body.replaceChildren(
          h('div', { class: 'truths-intro' },
            h('div', { class: 'truths-demo', 'aria-hidden': 'true' },
              h('span', { class: 'truths-demo-card is-true' }, 'TRUE'),
              h('span', { class: 'truths-demo-card is-lie' }, 'LIE'),
              h('span', { class: 'truths-demo-card is-true' }, 'TRUE')),
            h('h2', { class: 'panel-title' }, 'How it works'),
            h('ul', { class: 'how-list' },
              h('li', null, `${ROUND} Bible characters and stories, from Sunday-school favourites to deeper cuts.`),
              h('li', null, 'Each one gets three statements. Two are true. One is a lie, often a mix-up many of us grew up hearing.'),
              h('li', null, `Tap the lie (or press 1, 2, 3). ${BASE} points if you catch it, up to ${BONUS} more for speed.`),
              h('li', null, 'The cards then flip to show why, with the KJV reference. Check it in your Bible!')),
            best ? h('p', { class: 'ref' }, `Your best: ${best.toLocaleString('en-US')} points`) : null,
            h('div', { class: 'btn-row' }, start)));
        start.focus({ preventScroll: true });
      }

      function pickCharacters() {
        const seen = new Set(store.get('truths-seen', []));
        const chosen = [];
        for (const level of PLAN) {
          const avail = TRUTHS.filter((c) => c.level === level && !chosen.includes(c));
          const fresh = avail.filter((c) => !seen.has(c.name));
          chosen.push(shuffle(fresh.length ? fresh : avail)[0]);
        }
        store.set('truths-seen', [...seen, ...chosen.map((c) => c.name)].slice(-24));
        return chosen;
      }

      function play() {
        const chars = pickCharacters();
        const results = [];
        let i = 0, score = 0, right = 0, streak = 0, bestStreak = 0;
        const started = Date.now();
        ask();

        function ask() {
          const c = chars[i];
          const items = draw(c, i);
          const shownAt = Date.now();
          let done = false;

          const bar = h('span', { class: 'truths-timer-fill' });
          const bonusLabel = h('span', { class: 'truths-timer-label' }, `+${BONUS} speed`);
          const feedback = h('div', { class: 'truths-feedback', 'aria-live': 'polite' });
          const cards = items.map((it, n) => h('button', {
            class: 'truths-card', type: 'button', style: `--d:${n * 90}ms`,
            'aria-label': `Statement ${LETTERS[n]}: ${it.s}`,
            onclick: () => answer(n),
          }, front(it, n)));

          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Character ${i + 1} of ${ROUND}`),
              h('span', null, `${score.toLocaleString('en-US')} pts`)),
            h('div', { class: 'truths-progress', 'aria-hidden': 'true' },
              chars.map((_, n) => h('span', { class: n < i ? (results[n].ok ? 'is-ok' : 'is-miss') : n === i ? 'is-now' : '' }))),
            h('div', { class: 'truths-subject' },
              h('span', { class: 'truths-level' }, ['', 'Warm-up', 'Getting deeper', 'Deep cut'][c.level]),
              h('h2', { class: 'truths-name' }, c.name),
              h('p', { class: 'truths-tag' }, c.tag)),
            h('div', { class: 'truths-timer', role: 'presentation' }, h('span', { class: 'truths-timer-track' }, bar), bonusLabel),
            h('p', { class: 'truths-ask' }, 'Which one is the lie?'),
            h('div', { class: 'truths-cards' }, cards),
            feedback);

          const tick = setInterval(() => {
            if (done || !document.body.contains(bar)) { clearInterval(tick); return; }
            const secs = (Date.now() - shownAt) / 1000;
            const b = speedBonus(secs);
            bar.style.width = (b / BONUS) * 100 + '%';
            bar.classList.toggle('is-low', b < BONUS / 3);
            bonusLabel.textContent = b ? `+${b} speed` : 'No speed bonus';
          }, 100);

          onKey = (e) => {
            const n = { 1: 0, 2: 1, 3: 2, a: 0, b: 1, c: 2 }[e.key.toLowerCase()];
            if (n != null && !done) { e.preventDefault(); answer(n); }
          };

          function answer(n) {
            if (done) return;
            done = true; clearInterval(tick);
            const secs = (Date.now() - shownAt) / 1000;
            const ok = items[n].lie;
            const lieIdx = items.findIndex((x) => x.lie);
            const gained = ok ? BASE + speedBonus(secs) : 0;
            if (ok) { right++; streak++; bestStreak = Math.max(bestStreak, streak); score += gained; } else streak = 0;
            results.push({ name: c.name, ok, lie: items[lieIdx], pick: items[n] });

            const flip = !reduced();
            cards.forEach((card, m) => {
              card.disabled = true;
              card.classList.add(items[m].lie ? 'is-lie' : 'is-true');
              if (m === n) card.classList.add('is-pick');
              const reveal = () => card.replaceChildren(...back(items[m], m === n));
              if (flip) { card.classList.add('is-flipping'); setTimeout(reveal, 230 + m * 90); }
              else reveal();
              card.setAttribute('aria-label', `${items[m].lie ? 'The lie' : 'True'}: ${items[m].s} ${items[m].why} ${items[m].ref}`);
            });

            const last = i === ROUND - 1;
            const next = h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { i++; last ? finish() : ask(); } }, last ? 'See my score' : 'Next character');
            const lie = items[lieIdx];
            feedback.replaceChildren(
              h('div', { class: 'feedback ' + (ok ? 'good' : 'bad') },
                h('strong', null, ok ? `${BP.cheer()} +${gained}` : `Oops! That one is true. The lie was ${LETTERS[lieIdx]}.`),
                h('p', null, ok
                  ? (streak >= 3 ? `${streak} in a row. You know this book!` : `Caught it in ${secs < 10 ? secs.toFixed(1) : Math.round(secs)}s.`)
                  : `“${lie.s}” ${lie.why}`),
                h('p', { class: 'ref' }, `Check it: ${lie.ref}`)),
              h('div', { class: 'btn-row' }, next));
            setTimeout(() => { if (document.body.contains(next)) next.focus({ preventScroll: true }); }, flip ? 520 : 0);
            onKey = (e) => { if (e.key === 'Enter' && document.activeElement !== next) { e.preventDefault(); next.click(); } };
          }
        }

        function front(it, n) {
          return [h('span', { class: 'truths-letter' }, LETTERS[n]), h('span', { class: 'truths-text' }, it.s)];
        }
        function back(it, picked) {
          return [
            h('span', { class: 'truths-verdict' }, it.lie ? 'The lie' : 'True', picked ? h('em', null, 'your pick') : null),
            h('span', { class: 'truths-text' }, it.s),
            h('span', { class: 'truths-why' }, it.why),
            h('span', { class: 'truths-ref' }, it.ref),
          ];
        }

        function finish() {
          onKey = null;
          const secs = Math.round((Date.now() - started) / 1000);
          if (score > store.get('truths-best', 0)) store.set('truths-best', score);
          if (right >= 8) BP.confetti();
          const msg = right === ROUND ? 'Perfect! Not one lie got past you!'
            : right >= 8 ? 'Sharp eyes! You know your Bible.'
            : right >= 5 ? 'Good one. Some of those mix-ups catch everybody.'
            : 'No worries. Now you know the real story. Go again!';
          const missed = results.filter((r) => !r.ok);
          body.replaceChildren(h('div', { class: 'result truths-result' },
            h('p', { class: 'big-score' }, `${right}/${ROUND}`),
            h('p', null, `lies spotted · ${score.toLocaleString('en-US')} points · best streak ${bestStreak} · ${secs}s`),
            h('h2', { class: 'panel-title' }, msg),
            missed.length ? h('div', { class: 'truths-recap' },
              h('h3', null, 'Lies that got past you'),
              h('ul', null, missed.map((r) => h('li', null,
                h('strong', null, r.name + ': '), `“${r.lie.s}” `, h('span', { class: 'truths-recap-why' }, r.lie.why + ' '), h('span', { class: 'ref' }, r.lie.ref))))) : null,
            h('div', { class: 'feedback good truths-takeaway' },
              h('strong', null, 'The truth that never changes'),
              h('p', null, 'Stories get passed around and small details drift: a whale here, three kings there. That is why we go back to the Book. God’s word does not mix up the facts, and Jesus did not just tell the truth; He said, “I am the way, the truth, and the life” (John 14:6).'),
              BP.verse({ text: 'Sanctify them through thy truth: thy word is truth.', ref: 'John 17:17' })),
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', type: 'button', onclick: play }, 'Play again'),
              h('button', { class: 'btn', type: 'button', onclick: menu }, 'How to play')),
            BP.finish('truths', {
              points: score, secs, detail: `${right}/${ROUND} lies spotted`,
              coins: right * 4 + (right === ROUND ? 10 : 0),
              sub: `${right}/${ROUND} lies spotted`,
            })));
          window.scrollTo(0, 0);
        }
      }
    },
  };
})();
