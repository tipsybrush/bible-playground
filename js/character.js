// Which Bible Character Are You? A quick, unscored personality quiz with a shareable result.
// Question order and answer order are shuffled each time.
(function () {
  const { h, shuffle, store } = BP;

  function rank(picks) {
    const counts = {};
    picks.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    // Ties go to whichever character was picked most recently, so the last answers count a little more.
    const lastSeen = {}; picks.forEach((id, i) => { lastSeen[id] = i; });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || lastSeen[b] - lastSeen[a]);
  }

  BP.games.character = {
    title: 'Which Bible Character Are You?',
    color: 'var(--c-character)',
    badge() {
      const last = store.get('character-result', null);
      return last && BIBLE_CHARACTERS[last] ? `You’re ${BIBLE_CHARACTERS[last].name}` : 'Just for fun';
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('Which Bible Character Are You?', 'Ten quick questions. No wrong answers. Find out who you’re most like.'), body);
      start();

      function start() {
        const qs = shuffle(CHARACTER_QUESTIONS).map((q) => ({ q: q.q, a: shuffle(q.a) }));
        const picks = [];
        ask();

        function ask() {
          const i = picks.length;
          const q = qs[i];
          body.replaceChildren(
            h('div', { class: 'meta-row' },
              h('span', { class: 'pill pill-game' }, `Question ${i + 1} of ${qs.length}`),
              i > 0 ? h('button', { class: 'btn btn-small', onclick: () => { picks.pop(); ask(); } }, 'Back') : ''),
            h('div', { class: 'progress', 'aria-hidden': 'true' }, h('span', { style: `width:${(i / qs.length) * 100}%` })),
            h('p', { class: 'question' }, q.q),
            h('div', { class: 'options options-1' }, q.a.map(([text, id]) =>
              h('button', { class: 'btn opt', onclick: () => { picks.push(id); picks.length === qs.length ? result(picks) : ask(); } },
                h('span', { class: 'opt-text' }, text)))));
        }
      }

      function result(picks) {
        const order = rank(picks);
        const top = BIBLE_CHARACTERS[order[0]];
        const runner = order[1] ? BIBLE_CHARACTERS[order[1]] : null;
        const firstTime = store.get('character-result', null) == null;
        store.set('character-result', order[0]);
        BP.confetti();
        body.replaceChildren(
          h('div', { class: 'gift-hero' },
            h('p', { class: 'ref' }, 'You’re most like'),
            h('h2', { class: 'gift-name' }, top.name),
            h('p', { class: 'gift-passion' }, top.tag),
            h('p', null, top.about)),
          h('div', { class: 'gift-grid' },
            h('section', { class: 'gift-box' },
              h('h3', null, 'Your strengths'),
              h('ul', null, top.strengths.map((s) => h('li', null, s)))),
            h('section', { class: 'gift-box' },
              h('h3', null, 'Watch out for'),
              h('p', null, top.watch)),
            h('section', { class: 'gift-box' },
              h('h3', null, 'Where Jesus comes in'),
              h('p', null, top.jesus))),
          BP.verse(top.verse),
          runner ? h('p', null, 'Runner-up: ', h('strong', null, runner.name), ` (${runner.tag.toLowerCase()}).`) : '',
          h('p', { class: 'ref' }, 'Just for fun. Everyone in the Bible was flawed, and God used them anyway. He can use you too.'),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn btn-primary', onclick: start }, 'Take it again'),
            h('a', { class: 'btn', href: '#gifts', style: 'text-decoration:none' }, 'Try Find Your Place')),
          BP.finish('character', {
            coins: firstTime ? 30 : 0, board: false, kicker: 'I’m most like…', big: top.name, sub: top.tag,
            shareText: () => `I got ${top.name}, ${top.tag.toLowerCase()}, in “Which Bible Character Are You?” on Bible Playground. Who are you?`,
          }));
      }
    },
  };
})();
