// Bible Charades: a pass-the-phone party game. One player holds the phone up so only the group
// can see the card, the group acts it out, and the player guesses before the timer runs out.
(function () {
  const { h, shuffle, store } = BP;
  const LENGTHS = [60, 90];

  function deck(cat, level) {
    const cats = cat === 'mix' ? ['people', 'stories', 'things', 'church'] : [cat];
    const cards = [];
    cats.forEach((c) => {
      const set = BIBLE_CHARADES[c];
      const lv = level === 'both' ? ['easy', 'hard'] : [level];
      lv.forEach((l) => set[l].forEach((word) => cards.push({ word, cat: set.label })));
    });
    return BP.fresh.order('charades', cards);
  }

  BP.games.charades = {
    title: 'Bible Charades',
    color: 'var(--c-charades)',
    badge() {
      const best = store.get('charades-best', null);
      return best == null ? 'Party game' : `Best round: ${best} cards`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Bible Charades', 'A party game for youth group, fellowship or your friends. Act it out, no talking, and beat the clock.'), body);
      const opts = { cat: store.get('charades-cat', 'mix'), level: store.get('charades-level', 'easy'), secs: LENGTHS.includes(store.get('charades-secs', 60)) ? store.get('charades-secs', 60) : 60, teams: store.get('charades-teams', 2) };
      const tally = {};
      let wakeLock = null;
      let tiltAllowed = null; // null = not asked yet, true/false once known
      setup();

      // iOS 13+ only hands out orientation data after a tap asks for it, so ask from Start/Go.
      function askTilt() {
        const D = window.DeviceOrientationEvent;
        if (!D || tiltAllowed != null) return;
        if (typeof D.requestPermission !== 'function') { tiltAllowed = true; return; }
        try {
          D.requestPermission().then((r) => { tiltAllowed = r === 'granted'; }, () => { tiltAllowed = false; });
        } catch (e) { tiltAllowed = false; }
      }

      function picker(label, key, choices) {
        const btns = choices.map(([value, text]) => h('button', {
          class: 'btn btn-small', type: 'button', 'aria-pressed': String(opts[key] === value),
          onclick: () => { opts[key] = value; store.set('charades-' + key, value); btns.forEach((b, n) => b.setAttribute('aria-pressed', String(choices[n][0] === value))); },
        }, text));
        return h('div', { class: 'size-row' }, h('span', { class: 'ref' }, label), btns);
      }

      function setup() {
        releaseWake();
        Object.keys(tally).forEach((k) => delete tally[k]);
        body.replaceChildren(
                    BP.howTo('How to set up',
            h('li', null, 'The guesser holds the phone up facing the group, so they can’t see the screen.'),
            h('li', null, 'The group acts out the card without speaking.'),
            h('li', null, 'On a phone, tilt the screen ', h('strong', null, 'down'), ' when you get it, or ', h('strong', null, 'up'), ' to pass. You can also tap ', h('strong', null, 'Got it'), ' or ', h('strong', null, 'Pass'), '.'),
            h('li', null, 'On a computer, press → (or ↓) for Got it and ← (or ↑) to pass.'),
            h('li', null, 'Teams take turns. Most cards wins.')),
          picker('Cards:', 'cat', [['mix', 'Mix'], ['people', 'People'], ['stories', 'Stories'], ['things', 'Places and things'], ['church', 'Church life']]),
          picker('Difficulty:', 'level', [['easy', 'Classic'], ['hard', 'Hard'], ['both', 'Both']]),
          picker('Timer:', 'secs', LENGTHS.map((s) => [s, s + ' seconds'])),
          picker('Teams:', 'teams', [[1, 'Just us'], [2, '2 teams'], [3, '3 teams']]),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: () => { askTilt(); ready(1); } }, 'Start')));
      }

      function teamName(t) { return opts.teams === 1 ? 'Your group' : `Team ${t}`; }

      function ready(team) {
        body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:16px' },
          h('p', { class: 'pill pill-game' }, teamName(team)),
          h('h2', { class: 'panel-title' }, 'Pick a guesser and hand them the phone'),
          h('p', null, 'Press go, then hold the phone sideways on your forehead, screen facing the group. Tilt down for Got it, up to pass.'),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: () => { askTilt(); countdown(team); } }, 'Go'))));
      }

      function countdown(team) {
        requestWake();
        let n = 3;
        const num = h('p', { class: 'charade-count' }, n);
        body.replaceChildren(h('div', { class: 'charade-stage' }, h('p', { class: 'ref' }, 'Get ready'), num));
        const t = setInterval(() => {
          n--;
          if (n > 0) { num.textContent = n; return; }
          clearInterval(t);
          play(team);
        }, 800);
      }

      function play(team) {
        const cards = deck(opts.cat, opts.level);
        const results = [];
        let k = 0, left = opts.secs, over = false;
        const timer = h('p', { class: 'charade-timer' }, left);
        const cat = h('p', { class: 'charade-cat' });
        const word = h('p', { class: 'charade-word' });
        const got = h('button', { class: 'btn btn-green charade-btn', onclick: () => mark(true) }, 'Got it');
        const pass = h('button', { class: 'btn charade-btn', onclick: () => mark(false) }, 'Pass');
        const tiltNote = h('p', { class: 'charades-tilt-note', hidden: true }, 'Tilt mode on · down = Got it · up = Pass');
        const stage = h('div', { class: 'charade-stage' }, timer, cat, word, h('div', { class: 'charade-actions' }, pass, got), tiltNote);
        body.replaceChildren(stage);
        show();

        function show() {
          if (k >= cards.length) return end();
          cat.textContent = cards[k].cat;
          word.textContent = cards[k].word;
          BP.fresh.mark('charades', cards[k]);
        }
        function mark(ok) {
          if (over) return;
          results.push({ word: cards[k].word, ok });
          k++;
          stage.classList.remove('charades-flash-good', 'charades-flash-pass');
          void stage.offsetWidth;
          stage.classList.add(ok ? 'charades-flash-good' : 'charades-flash-pass');
          if (ok) { BP.sfx && BP.sfx('coin'); BP.buzz && BP.buzz(40); }
          else { BP.sfx && BP.sfx('bad'); BP.buzz && BP.buzz([30, 40, 30]); }
          show();
        }
        const keys = (e) => {
          if (e.altKey || e.ctrlKey || e.metaKey) return;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); mark(true); }
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); mark(false); }
        };
        document.addEventListener('keydown', keys);

        // Tilt: work out how much the screen faces the sky (+1) or the floor (-1) from beta and gamma.
        // This is the screen normal's vertical part, so it reads the same in either landscape
        // orientation (and portrait) without picking an axis. The phone must pass through upright
        // (neutral) before a tilt counts, so a phone lying flat when the round starts does nothing.
        const TRIGGER = 0.55, NEUTRAL = 0.3, COOLDOWN = 700;
        let armed = false, lastTilt = 0;
        const tilt = (e) => {
          if (over || e.beta == null || e.gamma == null) return;
          if (tiltNote.hidden) tiltNote.hidden = false;
          const r = Math.PI / 180;
          const up = Math.cos(e.beta * r) * Math.cos(e.gamma * r);
          if (Math.abs(up) < NEUTRAL) { armed = true; return; }
          if (!armed || Math.abs(up) < TRIGGER || Date.now() - lastTilt < COOLDOWN) return;
          armed = false; lastTilt = Date.now();
          mark(up < 0); // face to the floor = Got it, face to the sky = Pass
        };
        window.addEventListener('deviceorientation', tilt);
        const unlisten = () => { document.removeEventListener('keydown', keys); window.removeEventListener('deviceorientation', tilt); };
        const tick = setInterval(() => {
          if (!document.body.contains(stage)) { clearInterval(tick); unlisten(); return; }
          left--;
          timer.textContent = left;
          timer.classList.toggle('low', left <= 10);
          if (left <= 0) end();
        }, 1000);

        function end() {
          if (over) return;
          over = true;
          clearInterval(tick);
          unlisten();
          releaseWake();
          const scored = results.filter((r) => r.ok).length;
          tally[team] = (tally[team] || 0) + scored;
          if (scored > store.get('charades-best', 0)) store.set('charades-best', scored);
          const nextTeam = team % opts.teams + 1;
          const behind = BIBLE_CHARADES.behind || {};
          const pick = shuffle(results.filter((r) => behind[r.word]))[0];
          body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
            h('p', { class: 'pill pill-game' }, `${teamName(team)}: time’s up!`),
            h('p', { class: 'big-score' }, scored),
            h('p', null, scored === 1 ? 'card guessed' : 'cards guessed'),
            h('ul', { class: 'charade-results' }, results.map((r) => h('li', { class: r.ok ? 'ok' : 'miss' }, (r.ok ? '✓ ' : '✗ ') + r.word))),
            pick ? h('div', { class: 'feedback good charade-behind' }, h('strong', null, `Behind the card: ${pick.word}`), h('p', null, behind[pick.word])) : '',
            opts.teams > 1 ? h('div', { class: 'charade-tally' }, Array.from({ length: opts.teams }, (_, n) =>
              h('span', { class: 'pill' }, `Team ${n + 1}: ${tally[n + 1] || 0}`))) : '',
            h('div', { class: 'btn-row' },
              h('button', { class: 'btn btn-primary', onclick: () => ready(opts.teams > 1 ? nextTeam : team) }, opts.teams > 1 ? `${teamName(nextTeam)}’s turn` : 'Play another round'),
              h('button', { class: 'btn', onclick: setup }, 'New game')),
            BP.finish('charades', { coins: scored * 5, board: false, share: false })));
        }
      }

      // Keep the screen on while a round runs, where the browser allows it.
      async function requestWake() {
        try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { wakeLock = null; }
      }
      function releaseWake() { try { if (wakeLock) wakeLock.release(); } catch (e) {} wakeLock = null; }
    },
  };
})();
