// Kingdom Career Match: twelve no-wrong-answers questions about what you love and what you're good at.
// The result shows your top three career paths, courses to look at, a Bible person who did similar
// work, and ways to serve God through it. Unscored. Question order and answer order shuffle every time.
(function () {
  const { h, shuffle, store } = BP;
  const LETTERS = 'ABCDEFGHIJ';

  // Simple line icons (24x24, stroke) for each path.
  const ICONS = {
    tech: '<polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/><line x1="14" y1="4" x2="10" y2="20"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    medicine: '<path d="M12 21s-7.5-4.6-9.6-9.3A5.2 5.2 0 0 1 12 6.4a5.2 5.2 0 0 1 9.6 5.3C19.5 16.4 12 21 12 21z"/><path d="M12 10v5M9.5 12.5h5"/>',
    business: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
    finance: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/><path d="M15 8h5v5"/>',
    teaching: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    law: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0z"/>',
    fashion: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
    engineering: '<path d="M2 19h20"/><path d="M4 19v-4a8 8 0 0 1 16 0v4"/><path d="M8 19v-6M12 19v-8M16 19v-6"/>',
    media: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/>',
    agriculture: '<path d="M12 22V12"/><path d="M12 12C12 7 8.5 4 3 4c0 5.5 3.5 8 9 8z"/><path d="M12 14c0-4.5 3-7.5 9-7.5 0 5.5-3.5 7.5-9 7.5z"/>',
    sports: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    public: '<path d="M3 21h18M4 10h16M12 3l9 5H3z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
    science: '<path d="M9 3h6M10 3v6L4.6 18.8A1.5 1.5 0 0 0 5.9 21h12.2a1.5 1.5 0 0 0 1.3-2.2L14 9V3"/><path d="M7 15h10"/>',
    trades: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  };
  function icon(id, cls) {
    const span = h('span', { class: 'career-icon ' + (cls || ''), 'aria-hidden': 'true' });
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[id] || '') + '</svg>';
    return span;
  }

  // How often each path can be picked, so paths with more answers don't win just by numbers.
  function totals() {
    const t = {};
    CAREER_QUESTIONS.forEach((q) => q.a.forEach(([, ids]) => ids.split(' ').forEach((id) => { t[id] = (t[id] || 0) + 1; })));
    return t;
  }

  // Score = picks / sqrt(chances): rewards a clear pattern without letting a rare path win on one pick.
  // Ties are broken randomly (shuffle before a stable sort).
  function rank(picks) {
    const t = totals(), got = {};
    picks.forEach((ids) => { if (ids) ids.split(' ').forEach((id) => { got[id] = (got[id] || 0) + 1; }); });
    return shuffle(Object.keys(CAREER_PATHS))
      .map((id) => ({ id, count: got[id] || 0, score: (got[id] || 0) / Math.sqrt(t[id] || 1) }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.score - a.score || b.count - a.count);
  }

  BP.games.career = {
    title: 'Kingdom Career Match',
    color: 'var(--c-career)',
    badge() {
      const last = store.get('career-result', null);
      return last && CAREER_PATHS[last] ? `Your match: ${CAREER_PATHS[last].name}` : 'No wrong answers';
    },
    mount(root) {
      const body = h('section', { class: 'panel career' });
      root.append(BP.gameHead('Kingdom Career Match', 'What you love + what you’re good at = a way to serve God. Find your top 3 paths.'), body);
      let onKey = null;
      function listen(fn) {
        if (onKey) document.removeEventListener('keydown', onKey);
        onKey = fn ? (e) => { if (!document.body.contains(body)) { document.removeEventListener('keydown', onKey); onKey = null; return; } fn(e); } : null;
        if (onKey) document.addEventListener('keydown', onKey);
      }
      intro();

      function intro() {
        listen(null);
        const sample = shuffle(Object.keys(CAREER_PATHS)).slice(0, 5);
        body.replaceChildren(
          h('div', { class: 'career-intro' },
            h('div', { class: 'career-orbit', 'aria-hidden': 'true' },
              sample.map((id, i) => {
                const el = icon(id, 'career-float');
                el.style.cssText = `--hue:${CAREER_PATHS[id].hue};--i:${i}`;
                return el;
              })),
            h('h2', { class: 'panel-title' }, 'What could God do through you?'),
            h('p', null, 'Twelve quick questions about what you enjoy and what you’re good at. There are no wrong answers, so pick what sounds most like you, not what anyone expects.'),
            h('ul', { class: 'career-perks' },
              h('li', null, h('strong', null, 'Your top 3 paths'), ' out of 15, from tech to farming'),
              h('li', null, h('strong', null, 'Courses to look at'), ' at university, college or polytechnic'),
              h('li', null, h('strong', null, 'A Bible person'), ' who did similar work'),
              h('li', null, h('strong', null, 'Ways to serve God'), ' through it')),
            h('p', { class: 'career-calm' }, 'No pressure. This isn’t an exam, and it won’t decide your future. It’s a conversation starter.'),
            h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, 'Start'))));
      }

      function start() {
        const qs = shuffle(CAREER_QUESTIONS).map((q) => ({ q: q.q, grid: q.grid, a: shuffle(q.a) }));
        const picks = [];
        let busy = false;
        ask();

        function choose(ids, btn) {
          if (busy) return;
          busy = true;
          if (btn) btn.classList.add('is-picked');
          setTimeout(() => {
            busy = false;
            if (!document.body.contains(body)) return;
            picks.push(ids);
            picks.length === qs.length ? result(picks) : ask();
          }, btn ? 220 : 0);
        }
        function back() { if (picks.length && !busy) { picks.pop(); ask(); } }

        function ask() {
          const i = picks.length;
          const q = qs[i];
          const title = h('h2', { class: 'career-q', tabindex: '-1' }, q.q);
          const opts = q.a.map(([text, ids], n) =>
            h('button', { class: 'career-opt', type: 'button', onclick: (e) => choose(ids, e.currentTarget) },
              h('span', { class: 'career-key', 'aria-hidden': 'true' }, LETTERS[n]),
              h('span', { class: 'career-opt-text' }, text)));
          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Question ${i + 1} of ${qs.length}`),
              i > 0 ? h('button', { class: 'btn btn-small', type: 'button', onclick: back }, 'Back') : null),
            h('div', { class: 'career-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(qs.length), 'aria-valuenow': String(i), 'aria-label': 'Progress' },
              h('span', { style: `width:${(i / qs.length) * 100}%` })),
            h('div', { class: 'career-step' },
              title,
              h('div', { class: 'career-opts' + (q.grid ? ' career-grid' : '') }, opts),
              h('button', { class: 'career-skip', type: 'button', onclick: () => choose(null, null) }, 'None of these really. Skip')));
          title.focus({ preventScroll: true });
          const top = body.getBoundingClientRect().top;
          if (top < 0) body.scrollIntoView({ block: 'start', behavior: 'auto' });
          listen((e) => {
            if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea/i.test(e.target.tagName)) return;
            const n = LETTERS.indexOf(e.key.toUpperCase());
            if (e.key.length === 1 && n >= 0 && n < opts.length) { e.preventDefault(); opts[n].click(); }
            else if (e.key === 'Backspace') { e.preventDefault(); back(); }
          });
        }
      }

      function chips(list) {
        return h('ul', { class: 'career-chips' }, list.map((c) => h('li', null, c)));
      }

      function result(picks) {
        listen(null);
        const order = rank(picks);
        if (!order.length) {
          body.replaceChildren(
            h('h2', { class: 'panel-title' }, 'You skipped them all!'),
            h('p', null, 'No worries. Maybe none of the options felt like you today. Try again and pick whatever is closest, even if it’s not perfect.'),
            h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, 'Try again')));
          return;
        }
        const top3 = order.slice(0, 3).map((r) => Object.assign({ id: r.id }, CAREER_PATHS[r.id]));
        const top = top3[0];
        const firstTime = store.get('career-result', null) == null;
        store.set('career-result', top.id);
        BP.confetti();
        const labels = ['Top match', 'Strong match', 'Worth exploring'];

        const alts = top3.slice(1).map((p, n) => {
          const card = h('article', { class: 'career-alt', style: `--hue:${p.hue}` },
            h('div', { class: 'career-alt-head' },
              icon(p.id, 'career-icon-sm'),
              h('div', null,
                h('p', { class: 'career-rank' }, `#${n + 2} · ${labels[n + 1]}`),
                h('h3', null, p.name))),
            h('p', { class: 'career-tag' }, p.tag),
            chips(p.courses.slice(0, 3)),
            h('p', { class: 'career-person-line' }, h('strong', null, `${p.person.name}, ${p.person.role}`), ` · ${p.person.ref}`),
            h('details', { class: 'career-more' },
              h('summary', null, 'How to serve God through it'),
              h('p', null, p.serve),
              h('blockquote', { class: 'career-mini-verse' }, p.verse.text, h('cite', null, p.verse.ref + ' (KJV)'))));
          return card;
        });

        body.replaceChildren(
          h('div', { class: 'career-hero', style: `--hue:${top.hue}` },
            icon(top.id, 'career-icon-lg'),
            h('div', { class: 'career-hero-text' },
              h('p', { class: 'career-kicker' }, 'Your top match'),
              h('h2', { class: 'career-name' }, top.name),
              h('p', { class: 'career-hero-tag' }, top.tag))),
          h('p', { class: 'career-about' }, top.about),
          h('div', { class: 'career-cols' },
            h('section', { class: 'career-box' },
              h('h3', null, 'Courses to look at'),
              chips(top.courses),
              h('p', { class: 'ref' }, 'Names differ between schools. Check each school’s current entry requirements.')),
            h('section', { class: 'career-box' },
              h('h3', null, 'Where it can lead'),
              chips(top.roles))),
          h('div', { class: 'career-cols' },
            h('section', { class: 'career-box career-box-serve' },
              h('h3', null, 'Serve God through it'),
              h('p', null, top.serve)),
            h('section', { class: 'career-box career-box-person' },
              h('h3', null, `${top.person.name}, ${top.person.role}`),
              h('p', null, top.person.text),
              h('p', { class: 'ref' }, top.person.ref))),
          BP.verse(top.verse),
          alts.length ? h('h3', { class: 'career-also' }, 'Also in your top 3') : null,
          alts.length ? h('div', { class: 'career-alts' }, alts) : null,
          h('div', { class: 'career-real' },
            h('strong', null, 'Real talk'),
            h('p', null, 'Your exam score is not your worth, and your first course doesn’t lock your whole life. Plenty of people switch paths and God still uses them. Pray about it, talk to your parents or guardians, a teacher or school counsellor, and someone already working in the field. Then work hard, whatever you choose.')),
          h('p', { class: 'ref' }, 'Every honest job can be done for God. Jesus himself worked as a carpenter.'),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, 'Take it again'),
            h('a', { class: 'btn', href: '#twin', style: 'text-decoration:none' }, 'Find your Bible Journey Twin')),
          BP.finish('career', {
            coins: firstTime ? 40 : 10, board: false,
            kicker: 'My Kingdom Career Match', big: top.short || top.name.split(' ')[0], sub: top.name + ' · like ' + top.person.name,
            shareText: () => `My Kingdom Career Match is ${top.name}, like ${top.person.name} in the Bible! My top 3: ${top3.map((p) => p.name).join(', ')}. Find yours on Bible Playground.`,
          }));
      }
    },
  };
})();
