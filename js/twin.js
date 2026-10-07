// Your Bible Journey Twin: twelve questions about the season you're in right now. The result is a
// Bible person whose story looks like yours: what happened, what God did, and how Jesus meets you there.
// Unscored. Question order and answer order shuffle every time.
(function () {
  const { h, shuffle, store } = BP;
  const LETTERS = 'ABCDEFGHIJ';

  // Most picks wins. Ties go to the person picked most recently, so the last answers count a little more.
  function rank(picks) {
    const counts = {}, lastSeen = {};
    picks.forEach((id, i) => { if (id) { counts[id] = (counts[id] || 0) + 1; lastSeen[id] = i; } });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || lastSeen[b] - lastSeen[a]);
  }

  function monogram(p, cls) {
    return h('span', { class: 'twin-mono ' + (cls || ''), style: `--hue:${p.hue}`, 'aria-hidden': 'true' }, p.name.charAt(0));
  }

  BP.games.twin = {
    title: 'Your Bible Journey Twin',
    color: 'var(--c-twin)',
    badge() {
      const last = store.get('twin-result', null);
      return last && TWIN_PEOPLE[last] ? `Your twin: ${TWIN_PEOPLE[last].name}` : 'Just for you';
    },
    mount(root) {
      const body = h('section', { class: 'panel twin' });
      root.append(BP.gameHead('Your Bible Journey Twin', 'Whatever season you’re in, someone in the Bible has been there. Meet yours.'), body);
      let onKey = null;
      function listen(fn) {
        if (onKey) document.removeEventListener('keydown', onKey);
        onKey = fn ? (e) => { if (!document.body.contains(body)) { document.removeEventListener('keydown', onKey); onKey = null; return; } fn(e); } : null;
        if (onKey) document.addEventListener('keydown', onKey);
      }
      intro();

      function intro() {
        listen(null);
        const sample = shuffle(Object.keys(TWIN_PEOPLE)).slice(0, 6).map((id) => TWIN_PEOPLE[id]);
        body.replaceChildren(
          h('div', { class: 'twin-intro' },
            h('div', { class: 'twin-path', 'aria-hidden': 'true' },
              sample.map((p, i) => { const m = monogram(p, 'twin-step-dot'); m.style.setProperty('--i', i); return m; })),
            h('h2', { class: 'panel-title' }, 'Every season has a story'),
            h('p', null, 'Waiting? Starting over? Feeling small, tired, or about to step into something big? Answer twelve honest questions about where you are right now, and meet the Bible person whose journey looks most like yours.'),
            h('div', { class: 'twin-seasons', 'aria-hidden': 'true' },
              shuffle(Object.values(TWIN_PEOPLE)).slice(0, 6).map((p) => h('span', { style: `--hue:${p.hue}` }, p.season))),
            h('p', { class: 'twin-calm' }, 'Be honest. Nobody sees your answers but you.'),
            h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, 'Start'))));
      }

      function start() {
        const qs = shuffle(TWIN_QUESTIONS).map((q) => ({ q: q.q, a: shuffle(q.a) }));
        const picks = [];
        let busy = false;
        ask();

        function choose(id, btn) {
          if (busy) return;
          busy = true;
          if (btn) btn.classList.add('is-picked');
          setTimeout(() => {
            busy = false;
            if (!document.body.contains(body)) return;
            picks.push(id);
            picks.length === qs.length ? result(picks) : ask();
          }, btn ? 220 : 0);
        }
        function back() { if (picks.length && !busy) { picks.pop(); ask(); } }

        function ask() {
          const i = picks.length;
          const q = qs[i];
          const title = h('h2', { class: 'twin-q', tabindex: '-1' }, q.q);
          const opts = q.a.map(([text, id], n) =>
            h('button', { class: 'twin-opt', type: 'button', onclick: (e) => choose(id, e.currentTarget) },
              h('span', { class: 'twin-key', 'aria-hidden': 'true' }, LETTERS[n]),
              h('span', { class: 'twin-opt-text' }, text)));
          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Question ${i + 1} of ${qs.length}`),
              i > 0 ? h('button', { class: 'btn btn-small', type: 'button', onclick: back }, 'Back') : null),
            h('div', { class: 'twin-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(qs.length), 'aria-valuenow': String(i), 'aria-label': 'Progress' },
              qs.map((_, n) => h('span', { class: n < i ? 'done' : n === i ? 'now' : '' }))),
            h('div', { class: 'twin-step' },
              title,
              h('div', { class: 'twin-opts' }, opts),
              h('button', { class: 'twin-skip', type: 'button', onclick: () => choose(null, null) }, 'None of these fit. Skip')));
          title.focus({ preventScroll: true });
          if (body.getBoundingClientRect().top < 0) body.scrollIntoView({ block: 'start', behavior: 'auto' });
          listen((e) => {
            if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea/i.test(e.target.tagName)) return;
            const n = LETTERS.indexOf(e.key.toUpperCase());
            if (e.key.length === 1 && n >= 0 && n < opts.length) { e.preventDefault(); opts[n].click(); }
            else if (e.key === 'Backspace') { e.preventDefault(); back(); }
          });
        }
      }

      function result(picks) {
        listen(null);
        const order = rank(picks);
        if (!order.length) {
          body.replaceChildren(
            h('h2', { class: 'panel-title' }, 'You skipped them all'),
            h('p', null, 'That’s okay. Some seasons are hard to put into words. Try again and pick whatever is closest, even if it’s not exact.'),
            h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, 'Try again')));
          return;
        }
        const top = TWIN_PEOPLE[order[0]];
        const runner = order[1] ? TWIN_PEOPLE[order[1]] : null;
        const firstTime = store.get('twin-result', null) == null;
        store.set('twin-result', order[0]);
        BP.confetti();
        body.replaceChildren(
          h('div', { class: 'twin-hero', style: `--hue:${top.hue}` },
            monogram(top, 'twin-mono-lg'),
            h('div', { class: 'twin-hero-text' },
              h('p', { class: 'twin-kicker' }, 'Your Bible Journey Twin'),
              h('h2', { class: 'twin-name' }, top.name),
              h('p', { class: 'twin-season' }, top.season))),
          h('ol', { class: 'twin-journey', style: `--hue:${top.hue}` },
            h('li', null,
              h('h3', null, 'Their story'),
              h('p', null, top.story),
              h('p', { class: 'ref' }, 'Read it: ' + top.ref)),
            h('li', null,
              h('h3', null, 'What God did'),
              h('p', null, top.god)),
            h('li', { class: 'twin-jesus' },
              h('h3', null, 'How Jesus meets you here'),
              h('p', null, top.jesus))),
          h('div', { class: 'twin-encourage', style: `--hue:${top.hue}` },
            h('strong', null, 'For you, today'),
            h('p', null, top.encourage)),
          BP.verse(top.verse),
          runner ? h('p', { class: 'twin-runner' }, monogram(runner, 'twin-mono-sm'),
            h('span', null, 'You also share a bit of ', h('strong', null, runner.name), '’s journey: ', runner.season.toLowerCase(), '.')) : null,
          h('p', { class: 'ref' }, 'If this season feels too heavy to carry, please talk to someone you trust: a parent, your teens’ pastor, a teacher or a counsellor. You don’t have to walk it alone.'),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, 'Take it again'),
            h('a', { class: 'btn', href: '#career', style: 'text-decoration:none' }, 'Try Kingdom Career Match')),
          BP.finish('twin', {
            coins: firstTime ? 40 : 10, board: false,
            kicker: 'My Bible Journey Twin', big: top.name, sub: top.season,
            shareText: () => `My Bible Journey Twin is ${top.name}: ${top.season.toLowerCase()}. Whatever season you’re in, someone in the Bible has been there. Find yours on Bible Playground.`,
          }));
      }
    },
  };
})();
