// Leaderboards. Nobody has to sign up: every player has a nickname (picked on their first visit,
// or a fun random one), and a score good enough for the board is saved automatically under it.
// Each nickname appears once per game, with its best run. Right after a game the player sees
// where that run ranks.
//
// Where scores are kept, in order of preference:
//   1. Supabase, if supabaseUrl and supabaseKey are set in js/config.js.
//   2. The Claude artifact store, when the page is opened as a Claude preview.
//   3. The site's own /api/scores (Vercel), when js/config.js sets scoresApi: one board for everyone.
//   4. This browser only, as a fallback (for example when opening index.html from disk).
(function () {
  const { h, store } = BP;
  const SHOW = 10;  // rows shown on a board
  const KEEP = 100; // rows kept per game, so players outside the top 10 can still see their rank

  // Higher score first; on equal scores the faster time ranks higher, then whoever got there first.
  const secsOf = (r) => (typeof r.secs === 'number' ? r.secs : Infinity);
  const beats = (a, b) => b.score - a.score || secsOf(a) - secsOf(b) || a.at - b.at;
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

  // Rows carry a short hash of the player's private id, so two players with the same nickname
  // each keep their own place. Older rows without one fall back to the nickname.
  const keyOf = (r) => r.id || 'n:' + String(r.name).toLowerCase();

  // This browser's id: a random string made once and kept here. Only its hash appears on boards
  // (the same hash api/scores.js makes), so nobody can copy it from a board to post as someone else.
  function pid() {
    let id = store.get('pid', '');
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      const bytes = new Uint8Array(16);
      (window.crypto || {}).getRandomValues ? crypto.getRandomValues(bytes) : bytes.forEach((_, i) => { bytes[i] = Math.random() * 256; });
      id = [...bytes].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
      store.set('pid', id);
    }
    return id;
  }
  const myId = (async () => {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('bp:' + pid()));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
    } catch (e) { return ''; } // no crypto.subtle (opened from disk): match on nickname instead
  })();
  // Is this row the player's own? Rows with an id must match it; older rows match on nickname.
  const isMine = (r, name, id) => (r.id && id ? r.id === id : same(r.name, name));

  // Best run per player, best first.
  function rank(rows, n = KEEP) {
    const best = new Map();
    rows.slice().sort(beats).forEach((r) => { const k = keyOf(r); if (!best.has(k)) best.set(k, r); });
    return [...best.values()].slice(0, n);
  }

  const GAMES = ['quiz', 'ladder', 'blanks', 'riddles', 'word', 'snake', 'timeline', 'ark', 'map', 'crossword', 'verse', 'trail', 'sling', 'truths'];

  // Overall leaderboard (same rule as api/scores.js): up to 1000 points per game, in proportion to
  // that game's top score, added up across every game.
  function combine(boards) {
    const acc = new Map();
    GAMES.forEach((g) => {
      const rows = rank(boards[g] || []);
      const top = rows.length ? rows[0].score : 0;
      if (top <= 0) return;
      rows.forEach((r) => {
        const k = keyOf(r);
        const a = acc.get(k) || { name: r.name, points: 0, games: 0, crown: false };
        a.points += Math.round((1000 * r.score) / top); a.games++; a.crown = a.crown || !!r.crown;
        acc.set(k, a);
      });
    });
    return [...acc.values()].sort((a, b) => b.points - a.points || b.games - a.games).slice(0, KEEP);
  }
  // Backends without their own overall view work it out from each game's board.
  async function overallFrom(backend) {
    const boards = {};
    await Promise.all(GAMES.map(async (g) => { boards[g] = await backend.top(g, true); }));
    return combine(boards);
  }

  const local = {
    shared: false,
    async top(game) { return rank(store.get('board-' + game, [])); },
    async submit(game, entry) {
      const rows = rank([...store.get('board-' + game, []), entry]);
      store.set('board-' + game, rows);
      return rows;
    },
  };

  function artifactStore(db) {
    const col = (game) => db.collection(`boards/${game}/scores`);
    return {
      shared: true,
      async top(game) {
        const snap = await col(game).orderBy('score', 'desc').limit(300).get();
        return rank(snap.docs.map((d) => d.data()));
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
        const res = await fetch(`${base}?game=eq.${encodeURIComponent(game)}&select=name,score,detail,secs,at,boost,crown&order=score.desc,secs.asc.nullslast,at.asc&limit=300`, { headers });
        if (!res.ok) throw new Error('Could not load the leaderboard');
        return rank(await res.json());
      },
      async submit(game, entry) {
        const res = await fetch(base, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ game, ...entry }) });
        if (!res.ok) throw new Error('Could not save your score');
      },
    };
  }

  // The live site's own API. The leaderboards page fetches every game's top 10 in one request;
  // the end-of-game panel fetches that game's full board (up to 100) to work out the player's rank.
  function apiStore(url) {
    let all = null, fetchedAt = 0;
    const get = (q) => fetch(url + q).then((res) => { if (!res.ok) throw new Error('Could not load the leaderboard'); return res.json(); });
    const boards = () => {
      if (!all || Date.now() - fetchedAt > 15000) {
        fetchedAt = Date.now();
        all = get('').then((d) => d.boards || {}).catch((e) => { all = null; throw e; });
      }
      return all;
    };
    return {
      shared: true,
      async top(game, full) {
        if (full) return rank((await get('?game=' + encodeURIComponent(game))).board || []);
        return rank((await boards())[game] || []);
      },
      async overall() { return (await get('?overall=1')).overall || []; },
      async submit(game, entry) {
        const body = JSON.stringify({ game, ...entry, pid: pid() });
        let res;
        // One quiet retry covers a dropped connection or a busy moment on the server.
        for (let tries = 0; tries < 3; tries++) {
          if (tries) await new Promise((r) => setTimeout(r, 800 * tries));
          try { res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }); }
          catch (e) { res = null; continue; }
          if (res.ok || (res.status >= 400 && res.status < 500)) break;
        }
        if (!res || !res.ok) throw new Error('Could not save your score');
        const { board } = await res.json();
        if (all) all = all.then((b) => ({ ...b, [game]: board.slice(0, SHOW) }));
        return rank(board);
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

  function row(r, n, me) {
    return h('li', { class: me ? 'me' : '' },
      h('span', { class: 'board-rank' }, n + 1),
      h('span', { class: 'board-name' }, r.crown ? '👑 ' : '', r.name, me ? h('span', { class: 'board-you' }, 'YOU') : ''),
      h('span', { class: 'board-detail' }, [r.detail, typeof r.secs === 'number' ? '⏱ ' + clock(r.secs) : '', r.boost ? '⚡ power-up' : ''].filter(Boolean).join(' · ')),
      h('span', { class: 'board-score' }, r.score.toLocaleString('en-US')));
  }

  // Top 10, plus the player's own row underneath if they're further down.
  function table(rows, mine) {
    if (!rows.length) return h('p', { class: 'board-empty' }, 'No scores yet. Be the first!');
    const at = mine ? rows.indexOf(mine) : -1;
    const list = h('ol', { class: 'board-list' }, rows.slice(0, SHOW).map((r, n) => row(r, n, n === at)));
    if (at >= SHOW) list.append(h('li', { class: 'board-gap', 'aria-hidden': 'true' }, '⋯'), row(mine, at, true));
    return list;
  }

  function whereNote(backend) {
    return backend.shared ? 'Everyone playing shares this board.' : 'Scores on this device. They’re shared once the site is online.';
  }

  const ordinal = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

  // "Playing as Amara · Change": the nickname line shown with each board.
  function playingAs() {
    return h('p', { class: 'board-as' }, 'Playing as ', h('b', { 'data-nick': '' }, BP.nick.get()), ' · ',
      h('button', { class: 'linkish', type: 'button', onclick: () => BP.nick.prompt(false) }, 'Change name'));
  }

  BP.board = {
    ready,

    // Shown first at the end of a game. score: number (higher is better); detail: short text like "8/10";
    // secs: how long the game took (faster ranks higher on equal scores).
    panel(game, score, detail, secs, extra = {}) {
      const title = BP.games[game] ? BP.games[game].title : 'This game';
      const body = h('div', { class: 'lboard-body' }, h('p', { class: 'ref' }, 'Checking the leaderboard…'));
      const box = h('section', { class: 'lboard', 'aria-live': 'polite' },
        h('h3', { class: 'board-title fin-h' }, `${title} leaderboard`), body);

      (async () => {
        const backend = await ready;
        // If the board can't be loaded, still try to save: the server decides whether it counts.
        let rows, loaded = true;
        try { rows = await backend.top(game, true); } catch (e) { rows = []; loaded = false; }

        const name = BP.nick.get();
        const id = await myId;
        score = Math.round(score);
        const entry = { name, score, detail: detail || '', at: Date.now() };
        if (id) entry.id = id;
        if (typeof secs === 'number' && Number.isFinite(secs)) entry.secs = Math.round(secs);
        if (extra.boosted) entry.boost = true;
        if (BP.shop && BP.shop.has('crown')) entry.crown = true;

        const old = rows.find((r) => isMine(r, name, id));
        const others = rows.filter((r) => r !== old);
        const place = others.filter((r) => beats(r, entry) < 0).length + 1; // where this run lands
        const better = score > 0 && (!old || beats(entry, old) < 0);
        const fits = place <= KEEP || others.length < KEEP;

        let mine = old || null, saved = false;
        if (better && fits) {
          try {
            rows = await backend.submit(game, entry) || rank([...others, entry]);
            mine = rows.find((r) => isMine(r, name, id) && r.at === entry.at) || rows.find((r) => isMine(r, name, id)) || null;
            saved = true;
          } catch (e) {
            body.replaceChildren(h('p', { class: 'board-error' }, 'Your score could not be saved. Check your connection and play again.'), playingAs(), loaded ? table(rows, old) : '');
            return;
          }
        }
        const myRank = mine ? rows.indexOf(mine) + 1 : 0;

        let banner;
        if (saved && myRank) {
          banner = h('div', { class: 'board-banner' + (myRank <= 3 ? ' top3' : '') },
            h('span', { class: 'board-place' }, `#${myRank}`),
            h('span', null, myRank === 1 ? `You’re number one on ${title}!` : myRank <= SHOW ? `You’re ${ordinal(myRank)} on the ${title} leaderboard!` : `You’re ${ordinal(myRank)} on ${title}. Keep climbing to reach the top 10!`));
          if (myRank <= 3) BP.confetti();
          if (extra.onRank) extra.onRank(myRank);
        } else if (score <= 0) {
          banner = h('div', { class: 'board-banner low' }, h('span', null, 'Score some points to get on the board.'));
        } else if (old) {
          banner = h('div', { class: 'board-banner low' },
            h('span', { class: 'board-place' }, `#${myRank}`),
            h('span', null, `This run would be ${ordinal(place)}. Your best (${old.score.toLocaleString('en-US')}) still has you ${ordinal(myRank)}.`));
          if (extra.onRank && myRank) extra.onRank(myRank);
        } else {
          banner = h('div', { class: 'board-banner low' }, h('span', null, `Not in the top ${KEEP} yet. Score ${(rows[SHOW - 1] || rows[rows.length - 1]).score.toLocaleString('en-US')} or more to reach the top 10.`));
        }
        body.replaceChildren(banner, table(rows, mine), playingAs(), backend.shared ? '' : h('p', { class: 'ref' }, whereNote(backend)));
      })();
      return box;
    },

    // The leaderboards page: the overall board first, then one table per game.
    page(root) {
      root.style.setProperty('--game', 'var(--c-quiz)');
      const note = h('p', { class: 'ref' });
      const grid = h('div', { class: 'boards-grid' });
      const overallSlot = h('div', null, h('p', { class: 'ref' }, 'Loading…'));
      const me = BP.nick.get();
      root.append(BP.gameHead('Leaderboards', 'Who’s the best across every game, and the top 10 for each one. Speed counts: on equal scores the faster time ranks higher.'), playingAs(), note,
        h('section', { class: 'panel board-card board-overall' },
          h('h2', { class: 'panel-title' }, '👑 Overall champions'),
          h('p', { class: 'ref' }, 'In each game you earn up to 1,000 points: the leader gets 1,000 and everyone else gets a share in line with their best score. Your points from every game are added up, so playing more games helps.'),
          overallSlot),
        grid);
      ready.then((b) => (b.overall ? b.overall() : overallFrom(b))).then((rows) => {
        const at = rows.findIndex((r) => same(r.name, me));
        const line = (r, n) => h('li', { class: n === at ? 'me' : '' },
          h('span', { class: 'board-rank' }, n + 1),
          h('span', { class: 'board-name' }, r.crown ? '👑 ' : '', r.name, n === at ? h('span', { class: 'board-you' }, 'YOU') : ''),
          h('span', { class: 'board-detail' }, `${r.games} game${r.games === 1 ? '' : 's'}`),
          h('span', { class: 'board-score' }, r.points.toLocaleString('en-US')));
        if (!rows.length) { overallSlot.replaceChildren(h('p', { class: 'board-empty' }, 'No scores yet. Play any game to get on the board!')); return; }
        const list = h('ol', { class: 'board-list' }, rows.slice(0, SHOW).map(line));
        if (at >= SHOW) list.append(h('li', { class: 'board-gap', 'aria-hidden': 'true' }, '⋯'), line(rows[at], at));
        overallSlot.replaceChildren(list, at < 0 ? h('p', { class: 'board-hint' }, 'Play any game to join the overall board.') : '');
      }).catch(() => overallSlot.replaceChildren(h('p', { class: 'ref' }, 'Not available right now.')));
      GAMES.forEach((g) => {
        const game = BP.games[g];
        const slot = h('div', null, h('p', { class: 'ref' }, 'Loading…'));
        grid.append(h('section', { class: 'panel board-card', style: `--game:${game.color}` },
          h('div', { class: 'meta-row' }, h('h2', { class: 'panel-title' }, game.title), h('a', { class: 'btn btn-small', href: '#' + g }, 'Play')),
          h('p', { class: 'ref' }, game.scoring), slot));
        ready.then((b) => { note.textContent = whereNote(b); return b.top(g); })
          .then((rows) => slot.replaceChildren(table(rows.slice(0, SHOW), rows.slice(0, SHOW).find((r) => same(r.name, me)))))
          .catch(() => slot.replaceChildren(h('p', { class: 'ref' }, 'Not available right now.')));
      });
    },
  };

  BP.games.leaderboards = { title: 'Leaderboards', color: 'var(--c-quiz)', keys: 'Esc for the world map', mount: (root) => BP.board.page(root) };
})();
