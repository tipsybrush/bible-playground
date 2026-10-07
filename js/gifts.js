// Find Your Place: twelve questions with no wrong answers. The result suggests a passion,
// places to serve, and a church department that can help that gift grow.
(function () {
  const { h, store } = BP;

  // How often each area appears, so areas with more answers don't win just by numbers.
  function totals() {
    const t = {};
    GIFT_QUESTIONS.forEach((q) => q.a.forEach(([, area]) => { t[area] = (t[area] || 0) + 1; }));
    return t;
  }

  function rank(picks) {
    const t = totals(), got = {};
    picks.forEach((area) => { got[area] = (got[area] || 0) + 1; });
    return Object.keys(GIFT_AREAS)
      .map((id) => ({ id, share: (got[id] || 0) / t[id], count: got[id] || 0 }))
      .sort((a, b) => b.share - a.share || b.count - a.count);
  }

  BP.games.gifts = {
    title: 'Find Your Place',
    color: 'var(--c-gifts)',
    badge() {
      const last = store.get('gifts-result', null);
      return last && GIFT_AREAS[last] ? `Your gift: ${GIFT_AREAS[last].name}` : 'No wrong answers';
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Find Your Place', 'Discover what you’re passionate about and where you could serve at church.'), body);
      intro();

      function intro() {
        body.replaceChildren(
          h('h2', { class: 'panel-title' }, 'God made you on purpose'),
          h('p', null, 'Answer 12 quick questions. There are no right or wrong answers, so pick whatever sounds most like you. At the end you’ll see your strongest gift, places you could serve, and who at church can help you grow.'),
          h('p', { class: 'ref' }, '“As every man hath received the gift, even so minister the same one to another.” 1 Peter 4:10 (KJV)'),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: start }, 'Start the quiz')));
      }

      function start() {
        const picks = [];
        ask();

        function ask() {
          const i = picks.length;
          const q = GIFT_QUESTIONS[i];
          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Question ${i + 1} of ${GIFT_QUESTIONS.length}`),
              i > 0 ? h('button', { class: 'btn btn-small', onclick: () => { picks.pop(); ask(); } }, 'Back') : null),
            h('div', { class: 'progress', 'aria-hidden': 'true' }, h('span', { style: `width:${(i / GIFT_QUESTIONS.length) * 100}%` })),
            h('p', { class: 'question' }, q.q),
            h('div', { class: 'options options-1' }, q.a.map(([text, area]) =>
              h('button', { class: 'btn opt', onclick: () => { picks.push(area); picks.length === GIFT_QUESTIONS.length ? result(picks) : ask(); } },
                h('span', { class: 'opt-text' }, text)))));
        }
      }

      function result(picks) {
        const order = rank(picks);
        const top = GIFT_AREAS[order[0].id];
        const next = order.slice(1, 3).filter((r) => r.count > 0).map((r) => GIFT_AREAS[r.id]);
        const firstTime = store.get('gifts-result', null) == null;
        store.set('gifts-result', order[0].id);
        BP.confetti();
        body.replaceChildren(
          h('div', { class: 'gift-hero' },
            h('p', { class: 'ref' }, 'Your strongest gift'),
            h('h2', { class: 'gift-name' }, top.name),
            h('p', { class: 'gift-passion' }, 'Your passion: ' + top.passion),
            h('p', null, top.about)),
          h('div', { class: 'gift-grid' },
            h('section', { class: 'gift-box' },
              h('h3', null, 'Where you could serve'),
              h('ul', null, top.serve.map((s) => h('li', null, s)))),
            h('section', { class: 'gift-box' },
              h('h3', null, 'Who can help you grow'),
              h('p', null, top.grow)),
            h('section', { class: 'gift-box' },
              h('h3', null, 'Someone in the Bible like you'),
              h('p', null, top.person))),
          BP.verse(top.verse),
          next.length ? h('p', null, 'You’d also shine in ', h('strong', null, next.map((a) => a.name).join(' and ')), '.') : '',
          h('div', { class: 'feedback' },
            h('strong', null, 'Your next step'),
            h('p', null, 'Show this to your teens’ pastor or teens’ coordinator and ask how you could try serving in this area. Your church may call these teams by different names.')),
          h('p', { class: 'ref' }, 'This quiz is a conversation starter, not a test. Your gifts can grow and change, and God can use you in lots of ways.'),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', onclick: start }, 'Take it again'),
            h('a', { class: 'btn', href: '#', style: 'text-decoration:none' }, 'Play a game')),
          BP.finish('gifts', { coins: firstTime ? 50 : 0, board: false, kicker: 'Find Your Place', big: top.name, sub: 'Passion: ' + top.passion }));
      }
    },
  };
})();
