// Optional top-10 leaderboards. Nobody has to sign up to play: after a game, a player
// whose score makes the top 10 can choose to add a nickname.
//
// Where scores are kept, in order of preference:
//   1. The site's own /api/scores (Vercel), when js/config.js sets scoresApi: one board for everyone.
//      (Supabase is still supported if supabaseUrl and supabaseKey are set instead.)
//   2. The Claude artifact store, when the page is opened as a Claude preview.
//   3. This browser only, as a fallback (for example when opening index.html from disk).
(function () {
  const { h, store } = BP;
  const SIZE = 10;
  // A light filter for nicknames. Words in the first list are blocked anywhere in a name;
  // short words in the second only as whole words, so names like "Cassie" still work.
  const BLOCKED_ANYWHERE = ['fuck', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'pussy', 'nigg', 'penis', 'vagina', 'retard', 'hitler', 'bastard', 'porn'];
  const BLOCKED_WORDS = ['ass', 'arse', 'sex', 'dick', 'cock', 'fag', 'rape', 'nazi', 'damn', 'boob', 'boobs', 'tits', 'kill', 'satan', 'hell'];

  // Higher score first; on equal scores the faster time ranks higher, then whoever got there first.
  const secsOf = (r) => (typeof r.secs === 'number' ? r.secs : Infinity);
  const beats = (a, b) => b.score - a.score || secsOf(a) - secsOf(b) || a.at - b.at;
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function sortTop(rows) {
    return rows.slice().sort(beats).slice(0, SIZE);
  }

  const local = {
    shared: false,
    async top(game) { return sortTop(store.get('board-' + game, [])); },
    async submit(game, entry) {
      store.set('board-' + game, sortTop([...store.get('board-' + game, []), entry]));
    },
  };

  function artifactStore(db) {
    const col = (game) => db.collection(`boards/${game}/scores`);
    return {
      shared: true,
      async top(game) {
        const snap = await col(game).orderBy('score', 'desc').limit(30).get();
        return sortTop(snap.docs.map((d) => d.data()));
      },
      async submit(game, entry) { await col(game).add(entry); },
    };
  }

  function supabaseStore(url, key) {
    const base = url.replace(/\/$/, '') + '/rest/v1/scores';
    const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
    return {
      shared: true,
      async top(game) {
        const res = await fetch(`${base}?game=eq.${encodeURIComponent(game)}&select=name,score,detail,secs,at,boost,crown&order=score.desc,secs.asc.nullslast,at.asc&limit=${SIZE}`, { headers });
        if (!res.ok) throw new Error('Could not load the leaderboard');
        return sortTop(await res.json());
      },
      async submit(game, entry) {
        const res = await fetch(base, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ game, ...entry }) });
        if (!res.ok) throw new Error('Could not save your score');
      },
    };
  }

  // The live site's own API. One request fetches every game's board; it is reused for a few seconds
  // so the leaderboards page doesn't ask fourteen times.
  function apiStore(url) {
    let all = null, fetchedAt = 0;
    const boards = () => {
      if (!all || Date.now() - fetchedAt > 15000) {
        fetchedAt = Date.now();
        all = fetch(url).then((res) => { if (!res.ok) throw new Error('Could not load the leaderboard'); return res.json(); })
          .then((d) => d.boards || {})
          .catch((e) => { all = null; throw e; });
      }
      return all;
    };
    return {
      shared: true,
      async top(game) { return sortTop((await boards())[game] || []); },
      async submit(game, entry) {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game, ...entry }) });
        if (!res.ok) throw new Error('Could not save your score');
        const { board } = await res.json();
        if (all) all = all.then((b) => ({ ...b, [game]: board }));
        return board;
      },
    };
  }

  // Pick the backend once. The Claude preview answers asynchronously, so games wait on this promise.
  const ready = (async () => {
    const cfg = window.BP_CONFIG || {};
    if (cfg.supabaseUrl && cfg.supabaseKey) return supabaseStore(cfg.supabaseUrl, cfg.supabaseKey);
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const db = await window.claude.use('db');
        if (db) return artifactStore(db);
      } catch (e) {}
    }
    if (cfg.scoresApi && /^https?:$/.test(location.protocol)) return apiStore(cfg.scoresApi);
    return local;
  })();

  function cleanName(raw) {
    const name = raw.replace(/\s+/g, ' ').trim();
    if (name.length < 2 || name.length > 16) return { error: 'Use 2 to 16 letters or numbers.' };
    if (!/^[\p{L}\p{N} ._'-]+$/u.test(name)) return { error: 'Use letters, numbers and spaces only.' };
    const plain = name.toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/[^a-z ]/g, '');
    const squashed = plain.replace(/ /g, '');
    if (BLOCKED_ANYWHERE.some((w) => squashed.includes(w)) || plain.split(' ').some((w) => BLOCKED_WORDS.includes(w))) {
      return { error: 'Please pick a different nickname.' };
    }
    return { name };
  }

  function table(rows, highlight) {
    if (!rows.length) return h('p', { class: 'board-empty' }, 'No scores yet. Be the first!');
    return h('ol', { class: 'board-list' }, rows.map((r, n) =>
      h('li', { class: r === highlight ? 'me' : '' },
        h('span', { class: 'board-rank' }, n + 1),
        h('span', { class: 'board-name' }, r.crown ? '👑 ' : '', r.name),
        h('span', { class: 'board-detail' }, [r.detail, typeof r.secs === 'number' ? '⏱ ' + clock(r.secs) : '', r.boost ? '⚡ power-up' : ''].filter(Boolean).join(' · ')),
        h('span', { class: 'board-score' }, r.score.toLocaleString('en-US')))));
  }

  function whereNote(backend) {
    return backend.shared ? 'Top 10 for everyone playing.' : 'Top 10 on this device. Scores are shared once the site is online.';
  }

  BP.board = {
    ready,

    // Shown at the end of a game. score: number (higher is better); detail: short text like "8/10";
    // secs: how long the game took (faster ranks higher on equal scores).
    panel(game, score, detail, secs, extra = {}) {
      const box = h('div', { class: 'lboard' }, h('p', { class: 'ref' }, 'Checking the leaderboard…'));
      (async () => {
        let backend, rows;
        try { backend = await ready; rows = await backend.top(game); }
        catch (e) { box.replaceChildren(h('p', { class: 'ref' }, 'The leaderboard is not available right now.')); return; }
        const me = { score, secs: typeof secs === 'number' ? secs : undefined, at: Date.now() };
        const makesIt = score > 0 && (rows.length < SIZE || beats(me, rows[rows.length - 1]) < 0);
        const title = h('h3', { class: 'board-title' }, 'Leaderboard');
        const note = h('p', { class: 'ref' }, whereNote(backend));
        if (!makesIt) {
          const need = rows.length >= SIZE ? rows[rows.length - 1].score + 1 : 1;
          box.replaceChildren(title, note, table(rows),
            h('p', { class: 'board-hint' }, `Score ${need.toLocaleString('en-US')} or more to get on the board.`));
          return;
        }
        const input = h('input', { id: `nick-${game}`, class: 'nick', type: 'text', maxlength: '16', autocomplete: 'nickname', placeholder: 'Your nickname', value: store.get('nickname', '') });
        input.addEventListener('input', () => BP.nick.set(input.value, input));
        const err = h('p', { class: 'board-error', 'aria-live': 'polite' });
        const save = h('button', { class: 'btn btn-primary', type: 'submit' }, 'Add my name');
        const skip = h('button', { class: 'btn', type: 'button', onclick: () => box.replaceChildren(title, note, table(rows)) }, 'No thanks');
        const form = h('form', { class: 'nick-form', onsubmit: async (e) => {
          e.preventDefault();
          const { name, error } = cleanName(input.value);
          if (error) { err.textContent = error; input.focus(); return; }
          save.disabled = true; skip.disabled = true; err.textContent = '';
          const entry = { name, score, detail: detail || '', at: Date.now() };
          if (typeof secs === 'number') entry.secs = secs;
          if (extra.boosted) entry.boost = true;
          if (BP.shop && BP.shop.has('crown')) entry.crown = true;
          try {
            const returned = await backend.submit(game, entry);
            store.set('nickname', name);
            const fresh = Array.isArray(returned) ? sortTop(returned) : await backend.top(game);
            const mine = fresh.find((r) => r.at === entry.at && r.name === name) || null;
            box.replaceChildren(title, note, table(fresh, mine),
              h('p', { class: 'done-mark' }, mine ? `Nice one, ${name}! You're on the board.` : 'Someone just beat that score a moment ago. Play again to climb back on!'));
          } catch (e2) {
            save.disabled = false; skip.disabled = false;
            err.textContent = 'Your name could not be saved. Check your connection and try again.';
          }
        } },
          h('label', { for: `nick-${game}`, class: 'nick-label' }, 'Want your name on the board? It’s up to you.'),
          h('div', { class: 'btn-row' }, input, save, skip), err,
          h('p', { class: 'ref' }, 'Use a nickname, not your full name.'));
        box.replaceChildren(h('h3', { class: 'board-title' }, 'You made the top 10!'), note, table(rows), form);
      })();
      return box;
    },

    // The leaderboards page: one table per game.
    page(root) {
      root.style.setProperty('--game', 'var(--c-quiz)');
      const games = ['quiz', 'ladder', 'blanks', 'riddles', 'word', 'snake', 'timeline', 'ark', 'map', 'crossword', 'verse', 'trail', 'sling', 'truths'];
      const note = h('p', { class: 'ref' });
      const grid = h('div', { class: 'boards-grid' });
      root.append(BP.gameHead('Leaderboards', 'The top 10 for each game. Every game rewards speed, and on equal scores the faster time ranks higher.'), note, grid);
      games.forEach((g) => {
        const game = BP.games[g];
        const slot = h('div', null, h('p', { class: 'ref' }, 'Loading…'));
        grid.append(h('section', { class: 'panel board-card', style: `--game:${game.color}` },
          h('div', { class: 'meta-row' }, h('h2', { class: 'panel-title' }, game.title), h('a', { class: 'btn btn-small', href: '#' + g }, 'Play')),
          h('p', { class: 'ref' }, game.scoring), slot));
        ready.then((b) => { note.textContent = whereNote(b); return b.top(g); })
          .then((rows) => slot.replaceChildren(table(rows)))
          .catch(() => slot.replaceChildren(h('p', { class: 'ref' }, 'Not available right now.')));
      });
    },
  };

  BP.games.leaderboards = { title: 'Leaderboards', color: 'var(--c-quiz)', keys: 'Esc for the world map', mount: (root) => BP.board.page(root) };
})();
