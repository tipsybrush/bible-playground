// Department Wars: a team party mode for youth fellowship and camp. Teams are named after church
// departments and take turns on quick mini rounds pulled from the other games' data. One host runs
// it on a phone or a projector, reads out, reveals and marks. Wildcards shake things up now and then.
(function () {
  const { h, shuffle, store } = BP;

  const DEPTS = [
    { id: 'choir', name: 'Choir', color: '#D9480F' },
    { id: 'ushers', name: 'Ushers', color: '#1864AB' },
    { id: 'media', name: 'Media', color: '#6741D9' },
    { id: 'keepers', name: 'Sanctuary Keepers', color: '#2B8A3E' },
    { id: 'drama', name: 'Drama', color: '#C2255C' },
    { id: 'prayer', name: 'Prayer Band', color: '#0B7285' },
  ];
  // Colours for teams the players add themselves.
  const CUSTOM_COLORS = ['#E67700', '#5C940D', '#862E9C', '#C92A2A', '#1098AD', '#364FC7', '#A61E4D', '#2F9E44'];
  const MAX_TEAMS = 6, MAX_CUSTOM = 6;
  const ROUND_CHOICES = [3, 5, 8];
  const PACES = { quick: 0.75, normal: 1, relaxed: 1.5 };
  const WILD_CHANCE = 0.22; // per team turn, from the second round on
  const BONUS_CHANCE = 0.35; // after each full round, a bonus question for everybody
  const MISS_LINES = ['Next time!', 'Not this time.', 'Ah, so close!', 'Hold on, the next one is yours.', 'Oof! Better luck next turn.'];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const has = (name) => Array.isArray(window[name]) ? window[name].length > 0 : !!(window[name] && Object.keys(window[name]).length);

  // ---------- Round types. Each reuses another game's data file. ----------
  const TYPES = {
    quiz: { label: 'Bible Quiz', how: 'Pick the right answer.', secs: 20, points: 10, need: 'BIBLE_QUESTIONS', bonus: true },
    riddle: { label: 'Who Am I?', how: 'Guess from the clues. Fewer clues, more points.', secs: 45, points: 15, need: 'BIBLE_RIDDLES', bonus: true },
    verse: { label: 'Name That Book', how: 'Which book of the Bible is this verse from?', secs: 20, points: 10, need: 'BOOK_VERSES', bonus: true },
    timeline: { label: 'Timeline', how: 'Put three events in Bible order. All three right to score.', secs: 30, points: 15, need: 'BIBLE_TIMELINE', bonus: false },
    charades: { label: 'Charades', how: 'One person acts it out, no talking. The team guesses.', secs: 60, points: 15, need: 'BIBLE_CHARADES', bonus: false },
    word: { label: 'Scramble', how: 'Unscramble the Bible word.', secs: 30, points: 10, need: 'BIBLE_WORDS', bonus: true },
    place: { label: 'Where in the Bible?', how: 'Name the place from the clue.', secs: 20, points: 10, need: 'BIBLE_PLACES', bonus: true },
    clue: { label: 'Crossword Clue', how: 'Solve the clue. You get the first letter.', secs: 30, points: 10, need: 'CROSSWORD_WORDS', bonus: true },
  };
  const WILDS = {
    steal: { label: 'STEAL!', how: 'Get it right and take the points from any team you choose.' },
    double: { label: 'DOUBLE OR NOTHING', how: 'Right doubles the points. Wrong loses them.' },
    bonus: { label: 'BONUS FOR ALL', how: 'Every team can answer. Shout it out: the first right answer takes the points.' },
  };

  function initials(name) {
    const w = name.trim().split(/\s+/).filter(Boolean);
    if (!w.length) return '?';
    return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
  }

  BP.games.wars = {
    title: 'Department Wars',
    color: 'var(--c-wars)',
    scoring: 'Party mode for 2 to 6 teams. The host marks each answer; not on the leaderboard.',
    badge() {
      const last = store.get('wars-last', null);
      return last ? `Last champions: ${last}` : 'Party mode · 2 to 6 teams';
    },
    mount(root) {
      const saved = store.get('wars-setup', {}) || {};
      const custom = (Array.isArray(saved.custom) ? saved.custom : [])
        .filter((c) => c && typeof c.id === 'string' && typeof c.name === 'string' && c.name.trim()).slice(0, MAX_CUSTOM);
      const allTeams = () => DEPTS.concat(opts.custom);
      const opts = {
        custom,
        picked: Array.isArray(saved.picked) && saved.picked.length >= 2 ? saved.picked.filter((id) => DEPTS.concat(custom).some((d) => d.id === id)) : ['choir', 'ushers', 'media', 'drama'],
        names: Object.assign({}, saved.names || {}),
        rounds: ROUND_CHOICES.includes(saved.rounds) ? saved.rounds : 5,
        pace: PACES[saved.pace] ? saved.pace : 'normal',
        wild: saved.wild !== false,
      };
      if (opts.picked.length < 2) opts.picked = ['choir', 'ushers'];
      const types = Object.keys(TYPES).filter((t) => has(TYPES[t].need));

      const wrap = h('section', { class: 'panel wars-wrap' });
      const body = h('div', { class: 'wars-body' });
      const fsBtn = h('button', { class: 'btn btn-small wars-fs', type: 'button', onclick: toggleFull, 'aria-label': 'Full screen' }, BP.fullscreen.on() ? 'Exit full screen' : 'Full screen');
      const fsOk = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
      wrap.append(h('div', { class: 'wars-top' }, h('span', { class: 'wars-brand' }, 'Department Wars'), fsOk ? fsBtn : null), body);
      root.append(BP.gameHead('Department Wars', 'Church departments go head to head. One host, one phone or projector, plenty of noise.'), wrap);

      let teams = [], plan = [], step = 0, timer = null, keys = {}, wakeLock = null;
      const decks = {};
      let typeBag = [];

      const onKey = (e) => {
        if (!document.body.contains(wrap)) { cleanup(); return; }
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const fn = keys[e.key.toLowerCase()];
        if (fn) { e.preventDefault(); fn(); }
      };
      const onFs = () => { if (!document.body.contains(wrap)) { cleanup(); return; } fsBtn.textContent = isFull() ? 'Exit full screen' : 'Full screen'; };
      document.addEventListener('keydown', onKey);
      document.addEventListener('fullscreenchange', onFs);
      document.addEventListener('webkitfullscreenchange', onFs);
      setup();

      function cleanup() {
        stopTimer();
        releaseWake();
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('fullscreenchange', onFs);
        document.removeEventListener('webkitfullscreenchange', onFs);
      }
      // Full screen covers the whole site (see BP.fullscreen in app.js), so it carries on between rounds and pages.
      function isFull() { return BP.fullscreen.on(); }
      function toggleFull() { BP.fullscreen.toggle(); }
      async function requestWake() { try { if (navigator.wakeLock && !wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { wakeLock = null; } }
      function releaseWake() { try { if (wakeLock) wakeLock.release(); } catch (e) {} wakeLock = null; }
      function show(...kids) { keys = {}; body.replaceChildren(...kids.filter((k) => k != null)); body.scrollTop = 0; }
      function save() { store.set('wars-setup', { picked: opts.picked, names: opts.names, custom: opts.custom, rounds: opts.rounds, pace: opts.pace, wild: opts.wild }); }
      function nameOf(d) { return (opts.names[d.id] || '').trim() || d.name; }

      function picker(label, key, choices) {
        const btns = choices.map(([value, text]) => h('button', {
          class: 'btn btn-small', type: 'button', 'aria-pressed': String(opts[key] === value),
          onclick: () => { opts[key] = value; save(); btns.forEach((b, n) => b.setAttribute('aria-pressed', String(choices[n][0] === value))); },
        }, text));
        return h('div', { class: 'size-row' }, h('span', { class: 'ref' }, label), btns);
      }

      // ---------- Setup ----------
      function setup() {
        stopTimer();
        releaseWake();
        const count = h('p', { class: 'ref', 'aria-live': 'polite' });
        const start = h('button', { class: 'btn btn-primary', type: 'button', onclick: begin }, 'Start the war');
        const refresh = () => {
          const n = opts.picked.length;
          count.textContent = n < 2 ? 'Pick at least 2 teams.' : n > MAX_TEAMS ? `${n} teams ticked. Untick some: ${MAX_TEAMS} is the most.` : `${n} teams are in.`;
          start.disabled = n < 2 || n > MAX_TEAMS;
          addBtn.disabled = opts.custom.length >= MAX_CUSTOM;
          addInput.disabled = opts.custom.length >= MAX_CUSTOM;
          addInput.placeholder = opts.custom.length >= MAX_CUSTOM ? 'That’s plenty of teams!' : 'e.g. Youth Band, Hospitality, Team Kofi';
        };
        // Teams that aren't on the list: type a name and add it.
        const addInput = h('input', { class: 'wars-name', 'data-clarity-mask': 'true', type: 'text', maxlength: '20', 'aria-label': 'Your own team name' });
        const addBtn = h('button', { class: 'btn btn-small btn-green', type: 'button', onclick: addTeam }, '+ Add team');
        addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTeam(); } });
        function addTeam() {
          const name = addInput.value.trim().slice(0, 20);
          if (!name) { addInput.focus(); return; }
          if (opts.custom.length >= MAX_CUSTOM) return;
          if (allTeams().some((d) => nameOf(d).toLowerCase() === name.toLowerCase())) { count.textContent = `There’s already a team called ${name}.`; return; }
          const used = new Set(opts.custom.map((c) => c.color));
          const color = CUSTOM_COLORS.find((c) => !used.has(c)) || pick(CUSTOM_COLORS);
          const team = { id: 'own-' + Date.now().toString(36), name, color, own: true };
          opts.custom.push(team);
          if (opts.picked.length < MAX_TEAMS) opts.picked.push(team.id);
          save(); BP.sfx('coin');
          setup();
          const box = document.getElementById('wars-pick-' + team.id);
          if (box) box.closest('.wars-dept').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        function removeTeam(d) {
          opts.custom = opts.custom.filter((c) => c.id !== d.id);
          opts.picked = opts.picked.filter((id) => id !== d.id);
          delete opts.names[d.id];
          save(); setup();
        }
        const rows = allTeams().map((d) => {
          const on = opts.picked.includes(d.id);
          const box = h('input', { type: 'checkbox', id: 'wars-pick-' + d.id, checked: on });
          const input = h('input', { class: 'wars-name', 'data-clarity-mask': 'true', type: 'text', maxlength: '20', value: opts.names[d.id] || '', placeholder: d.name, 'aria-label': `Name for ${d.name}` });
          const badge = h('span', { class: 'wars-badge', 'aria-hidden': 'true' }, initials(nameOf(d)));
          const row = h('div', { class: 'wars-dept' + (on ? ' on' : ''), style: `--team:${d.color}` },
            h('label', { class: 'wars-check', for: 'wars-pick-' + d.id }, box, badge, h('span', { class: 'wars-sr' }, `Include ${d.name}`)), input,
            d.own ? h('button', { class: 'wars-remove', type: 'button', 'aria-label': `Remove ${nameOf(d)}`, title: 'Remove this team', onclick: () => removeTeam(d) }, '✕') : null);
          box.addEventListener('change', () => {
            const i = opts.picked.indexOf(d.id);
            if (box.checked && i < 0) opts.picked.push(d.id);
            if (!box.checked && i >= 0) opts.picked.splice(i, 1);
            row.classList.toggle('on', box.checked);
            save(); refresh();
          });
          input.addEventListener('input', () => { opts.names[d.id] = input.value.slice(0, 20); badge.textContent = initials(nameOf(d)); save(); });
          return row;
        });
        refresh();
        show(
                    BP.howTo('How to set up',
            h('li', null, 'Split into teams. Tick 2 to 6 church departments and rename them if you like. Not on the list? Add your own team below.'),
            h('li', null, 'Teams take turns. Each turn is a surprise mini round: quiz, riddle, charades, timeline and more.'),
            h('li', null, 'The host reads out, keeps time, reveals and marks. The host’s word is final!'),
            h('li', null, 'Watch out for wildcards: Steal, Double or nothing, and Bonus for all.')),
          h('div', { class: 'wars-depts' }, rows),
          h('div', { class: 'wars-add' }, addInput, addBtn),
          count,
          picker('Rounds:', 'rounds', ROUND_CHOICES.map((r) => [r, `${r} each`])),
          picker('Timer:', 'pace', [['quick', 'Quick'], ['normal', 'Normal'], ['relaxed', 'Relaxed']]),
          picker('Wildcards:', 'wild', [[true, 'On'], [false, 'Off']]),
          h('div', { class: 'btn-row' }, start));
      }

      // ---------- Plan the game ----------
      function begin() {
        if (opts.picked.length < 2) return;
        save();
        if (opts.picked.length > MAX_TEAMS) return;
        teams = shuffle(allTeams().filter((d) => opts.picked.includes(d.id))).map((d) => ({ id: d.id, name: nameOf(d), color: d.color, score: 0, right: 0, played: 0 }));
        Object.keys(decks).forEach((k) => delete decks[k]);
        typeBag = [];
        plan = [];
        let lastType = null;
        for (let r = 0; r < opts.rounds; r++) {
          teams.forEach((t, i) => {
            let type = nextType(lastType);
            let wild = null;
            if (opts.wild && r > 0 && Math.random() < WILD_CHANCE) wild = Math.random() < 0.5 ? 'steal' : 'double';
            plan.push({ team: i, round: r, type, wild });
            lastType = type;
          });
          if (opts.wild && r < opts.rounds - 1 && Math.random() < BONUS_CHANCE) {
            const bt = shuffle(types.filter((t) => TYPES[t].bonus))[0];
            if (bt) plan.push({ team: null, round: r, type: bt, wild: 'bonus' });
          }
        }
        // Make sure a game with wildcards on has at least one, so everyone sees what they do.
        if (opts.wild && opts.rounds > 1 && !plan.some((p) => p.wild)) {
          const later = plan.filter((p) => p.round > 0);
          pick(later).wild = Math.random() < 0.5 ? 'steal' : 'double';
        }
        step = 0;
        requestWake();
        upNext();
      }
      function nextType(avoid) {
        if (!typeBag.length) typeBag = shuffle(types);
        let i = typeBag.findIndex((t) => t !== avoid);
        if (i < 0) i = 0;
        return typeBag.splice(i, 1)[0];
      }
      function deck(name, make) {
        if (!decks[name] || !decks[name].length) decks[name] = BP.fresh.order('wars-' + name, make()).reverse();
        const card = decks[name].pop();
        BP.fresh.mark('wars-' + name, card);
        return card;
      }

      // ---------- Scoreboard ----------
      function chip(t, extra) {
        return h('span', { class: 'wars-chip' + (extra ? ' ' + extra : ''), style: `--team:${t.color}` }, h('span', { class: 'wars-badge', 'aria-hidden': 'true' }, initials(t.name)), t.name);
      }
      function board(current, big) {
        const top = Math.max(1, ...teams.map((t) => t.score));
        const lead = Math.max(...teams.map((t) => t.score));
        const order = teams.slice().sort((a, b) => b.score - a.score);
        return h('ol', { class: 'wars-board' + (big ? ' big' : ''), 'aria-label': 'Scores' }, order.map((t) =>
          h('li', { class: 'wars-row' + (t === current ? ' now' : '') + (t.score === lead && lead > 0 ? ' lead' : ''), style: `--team:${t.color};--w:${Math.max(4, (t.score / top) * 100)}%` },
            h('span', { class: 'wars-badge', 'aria-hidden': 'true' }, initials(t.name)),
            h('span', { class: 'wars-row-name' }, t.name),
            h('span', { class: 'wars-row-score' }, t.score),
            h('span', { class: 'wars-bar', 'aria-hidden': 'true' }))));
      }

      // ---------- Between turns ----------
      function upNext() {
        stopTimer();
        if (!document.body.contains(wrap)) { cleanup(); return; }
        if (step >= plan.length) { finale(); return; }
        const turn = plan[step];
        const type = TYPES[turn.type];
        const team = turn.team == null ? null : teams[turn.team];
        const go = h('button', { class: 'btn btn-primary wars-go', type: 'button', onclick: () => play(turn) }, team ? `Go, ${team.name}!` : 'Everybody, get ready!');
        const adjust = h('details', { class: 'wars-adjust' },
          h('summary', null, 'Fix the scores'),
          h('div', { class: 'wars-adjust-list' }, teams.map((t) => {
            const val = h('strong', null, t.score);
            const bump = (n) => { t.score = Math.max(0, t.score + n); val.textContent = t.score; };
            return h('div', { class: 'wars-adjust-row', style: `--team:${t.color}` }, chip(t),
              h('button', { class: 'btn btn-small', type: 'button', 'aria-label': `Take 5 from ${t.name}`, onclick: () => bump(-5) }, '−5'), val,
              h('button', { class: 'btn btn-small', type: 'button', 'aria-label': `Give 5 to ${t.name}`, onclick: () => bump(5) }, '+5'));
          }),
          h('button', { class: 'btn btn-small', type: 'button', onclick: upNext }, 'Done')));
        const wild = turn.wild ? WILDS[turn.wild] : null;
        show(
          h('div', { class: 'wars-meta' },
            h('span', { class: 'pill pill-game' }, `Round ${turn.round + 1} of ${opts.rounds}`),
            h('span', { class: 'ref' }, `Turn ${step + 1} of ${plan.length}`)),
          h('div', { class: 'wars-split' },
            h('div', { class: 'wars-split-main' },
              wild ? h('div', { class: 'wars-wild wars-wild-' + turn.wild, role: 'status' }, h('strong', null, 'Wildcard: ' + wild.label), h('span', null, wild.how)) : null,
              h('div', { class: 'wars-next', style: team ? `--team:${team.color}` : '' },
                h('p', { class: 'wars-next-label' }, team ? 'Up next' : 'Bonus round'),
                h('p', { class: 'wars-next-team' }, team ? team.name : 'All departments'),
                h('p', { class: 'wars-next-type' }, h('strong', null, type.label), ' · ', type.how)),
              h('div', { class: 'btn-row wars-center' }, go)),
            board(team, true)),
          adjust,
          h('div', { class: 'btn-row wars-center' }, h('button', { class: 'btn btn-small', type: 'button', onclick: () => { if (confirm('End the game now and crown the leader?')) finale(); } }, 'End game now')));
        keys = { enter: () => play(turn), ' ': () => play(turn) };
        go.focus({ preventScroll: true });
      }

      // ---------- Timer ----------
      function stopTimer() { if (timer) { clearInterval(timer.id); timer = null; } }
      function makeTimer(secs) {
        const el = h('span', { class: 'wars-timer', role: 'timer', 'aria-label': 'Time left' }, String(secs));
        let left = secs, running = false;
        const api = {
          el,
          start() {
            if (running) return;
            running = true;
            stopTimer();
            timer = {
              id: setInterval(() => {
                if (!document.body.contains(el)) { stopTimer(); if (!document.body.contains(wrap)) cleanup(); return; }
                left = Math.max(0, left - 1);
                el.textContent = left > 0 ? String(left) : 'TIME!';
                el.classList.toggle('low', left <= 5);
                if (left === 0) { stopTimer(); el.classList.add('up'); wrap.classList.remove('wars-buzz'); void wrap.offsetWidth; wrap.classList.add('wars-buzz'); }
              }, 1000),
            };
          },
          stop() { stopTimer(); running = false; },
        };
        return api;
      }

      // ---------- A turn ----------
      function play(turn) {
        const type = TYPES[turn.type];
        const team = turn.team == null ? null : teams[turn.team];
        const bonus = turn.wild === 'bonus';
        const t = makeTimer(Math.round(type.secs * PACES[opts.pace]));
        const area = h('div', { class: 'wars-play' });
        let value = type.points;
        let settled = false;
        const api = {
          bonus, timer: t,
          setValue(v) { value = v; worth.textContent = worthText(); },
          // Normal turns: the host says whether the team got it.
          result(ok, info) { if (settled) return; settled = true; t.stop(); settle(turn, ok, info, value, null); },
          // After a reveal: Got it / Missed, or in a bonus round, which team got it first.
          judge(info, into) {
            t.stop();
            const box = h('div', { class: 'wars-judge' });
            if (bonus) {
              box.append(h('p', { class: 'wars-ask' }, 'Which department got it first?'),
                h('div', { class: 'wars-team-btns' }, teams.map((tm, i) => h('button', { class: 'btn wars-team-btn', type: 'button', style: `--team:${tm.color}`, onclick: () => { if (settled) return; settled = true; settle(turn, true, info, value, i); } }, chip(tm))),
                  h('button', { class: 'btn wars-team-btn', type: 'button', onclick: () => { if (settled) return; settled = true; settle(turn, false, info, value, null); } }, 'Nobody')));
              const firstBtn = box.querySelector('button');
              if (firstBtn) setTimeout(() => firstBtn.focus({ preventScroll: true }), 0);
            } else {
              box.append(h('div', { class: 'wars-mark' },
                h('button', { class: 'btn wars-got', type: 'button', onclick: () => api.result(true, info) }, 'Got it'),
                h('button', { class: 'btn wars-miss', type: 'button', onclick: () => api.result(false, info) }, 'Missed')),
                h('p', { class: 'wars-keys' }, 'Keys: Y got it, N missed'));
              keys.y = () => api.result(true, info);
              keys.n = () => api.result(false, info);
            }
            (into || area).append(box);
          },
        };
        const worthText = () => turn.wild === 'double' ? `${value} × 2` : `${value} pts`;
        const worth = h('span', { class: 'wars-worth' }, worthText());
        show(
          h('div', { class: 'wars-bar-top' },
            team ? chip(team, 'now') : h('span', { class: 'wars-chip now wars-chip-all' }, 'Everybody'),
            h('span', { class: 'wars-type' }, type.label),
            turn.wild && turn.wild !== 'bonus' ? h('span', { class: 'wars-wild-tag wars-tag-' + turn.wild }, WILDS[turn.wild].label) : null,
            worth, t.el),
          area);
        ROUNDS[turn.type](area, api);
      }

      // ---------- Scoring ----------
      function settle(turn, ok, info, value, bonusTeam) {
        stopTimer();
        const team = turn.team == null ? null : teams[turn.team];
        if (team) { team.played++; if (ok) team.right++; }
        const lines = [];
        let headline, good = ok;
        if (turn.wild === 'bonus') {
          if (ok && bonusTeam != null) {
            const w = teams[bonusTeam];
            w.score += value; w.right++;
            headline = `${BP.cheer()} +${value} to ${w.name}`;
          } else { headline = 'Nobody got it this time.'; good = false; }
          return result(headline, good, info, lines);
        }
        if (!ok) {
          if (turn.wild === 'double') {
            const lost = Math.min(team.score, value);
            team.score -= lost;
            headline = lost ? `Double or nothing… ${team.name} lose ${lost}.` : `Double or nothing… nothing lost, nothing gained.`;
          } else headline = pick(MISS_LINES);
          return result(headline, false, info, lines);
        }
        if (turn.wild === 'double') {
          team.score += value * 2;
          return result(`${BP.cheer()} Double! +${value * 2} to ${team.name}`, true, info, lines);
        }
        if (turn.wild === 'steal') {
          const targets = teams.filter((x) => x !== team && x.score > 0);
          if (!targets.length) {
            team.score += value;
            return result(`${BP.cheer()} Nobody has points to steal yet, so +${value} to ${team.name}.`, true, info, lines);
          }
          show(
            h('div', { class: 'feedback good' }, h('strong', null, `${BP.cheer()} ${team.name} can steal!`), h('p', null, `Pick a department to take up to ${value} points from.`)),
            h('div', { class: 'wars-team-btns' }, targets.map((x) => h('button', { class: 'btn wars-team-btn', type: 'button', style: `--team:${x.color}`, onclick: () => {
              const got = Math.min(x.score, value);
              x.score -= got; team.score += got;
              result(`${team.name} stole ${got} from ${x.name}!`, true, info, lines);
            } }, chip(x), h('span', { class: 'wars-team-pts' }, `${x.score} pts`)))));
          const firstBtn = body.querySelector('.wars-team-btn');
          if (firstBtn) firstBtn.focus({ preventScroll: true });
          return;
        }
        team.score += value;
        result(`${BP.cheer()} +${value} to ${team.name}`, true, info, lines);
      }

      function result(headline, good, info, lines) {
        step++;
        const nextBtn = h('button', { class: 'btn btn-primary', type: 'button', onclick: upNext }, step >= plan.length ? 'See the winner' : 'Next turn');
        show(
          h('div', { class: 'feedback wars-result ' + (good ? 'good' : 'bad'), role: 'status' },
            h('strong', null, headline),
            info && info.answer ? h('p', { class: 'wars-answer' }, 'Answer: ', h('b', null, info.answer), info.ref ? h('span', { class: 'ref' }, ` (${info.ref})`) : null) : null,
            info && info.note ? h('p', null, info.note) : null,
            lines.map((l) => h('p', null, l))),
          board(null, false),
          h('div', { class: 'btn-row wars-center' }, nextBtn));
        keys = { enter: upNext, ' ': upNext };
        nextBtn.focus({ preventScroll: true });
      }

      // ---------- The finale ----------
      function finale() {
        stopTimer();
        releaseWake();
        step = plan.length;
        const top = Math.max(...teams.map((t) => t.score));
        const winners = teams.filter((t) => t.score === top);
        const tie = winners.length > 1;
        const winName = winners.map((w) => w.name).join(' & ');
        store.set('wars-last', winName);
        BP.confetti();
        const others = teams.map((t) => t.name);
        const list = others.length > 2 ? others.slice(0, -1).join(', ') + ' and ' + others[others.length - 1] : others.join(' and ');
        show(
          h('div', { class: 'wars-crown', style: `--team:${winners[0].color}` },
            h('p', { class: 'wars-next-label' }, tie ? 'It’s a tie!' : 'Champions'),
            h('p', { class: 'wars-win-name' }, winName),
            h('p', { class: 'wars-win-pts' }, `${top} points`),
            h('p', { class: 'wars-win-cheer' }, tie ? 'What a game! Share the glory.' : 'Champions! Well played, everyone!')),
          board(null, true),
          h('div', { class: 'feedback wars-takeaway' },
            h('strong', null, 'Many parts, one body'),
            h('p', null, `${list}: different jobs, one Lord. The choir can’t do the ushers’ work, and media can’t do what the prayer band does, and that is exactly how God planned it. Nobody is a spare part. Jesus is the Head, and every department, on stage or behind the scenes, serves the same King.`)),
          BP.verse({ text: 'For as the body is one, and hath many members, and all the members of that one body, being many, are one body: so also is Christ.', ref: '1 Corinthians 12:12' }),
          BP.verse({ text: 'Now ye are the body of Christ, and members in particular.', ref: '1 Corinthians 12:27' }),
          h('div', { class: 'btn-row wars-center' },
            h('button', { class: 'btn btn-primary', type: 'button', onclick: begin }, 'Rematch, same teams'),
            h('button', { class: 'btn', type: 'button', onclick: setup }, 'Change teams')),
          BP.finish('wars', {
            coins: Math.min(50, 10 + opts.rounds * 4), board: false,
            kicker: tie ? 'Department Wars: a tie!' : 'Department Wars champions',
            big: winName, sub: `${top} pts · ${teams.length} departments · ${opts.rounds} rounds`,
            shareText: () => tie
              ? `Department Wars ended in a tie: ${winName} on ${top} points! Many parts, one body. Play it at your fellowship on Bible Playground.`
              : `${winName} won Department Wars with ${top} points! Many parts, one body. Play it at your fellowship on Bible Playground.`,
          }));
      }

      // ---------- Building blocks for rounds ----------
      function choices(area, api, prompt, options, answer, info) {
        const btns = options.map((o, i) => h('button', { class: 'btn opt', type: 'button', onclick: () => choose(i) },
          h('span', { class: 'opt-letter' }, 'ABCD'[i]), h('span', { class: 'opt-text' }, o)));
        const grid = h('div', { class: 'options wars-options' }, btns);
        let done = false;
        function mark() {
          btns.forEach((b, n) => { b.disabled = true; if (options[n] === answer) b.classList.add('is-correct'); else b.classList.add('is-dim'); });
        }
        function choose(i) {
          if (done) return;
          if (api.bonus) return; // in a bonus round the host reveals instead
          done = true;
          mark();
          if (options[i] !== answer) { btns[i].classList.remove('is-dim'); btns[i].classList.add('is-wrong'); }
          api.timer.stop();
          setTimeout(() => api.result(options[i] === answer, info), 900);
        }
        area.append(prompt, grid);
        if (api.bonus) {
          btns.forEach((b) => b.setAttribute('tabindex', '-1'));
          grid.classList.add('wars-readonly');
          const reveal = h('button', { class: 'btn btn-game', type: 'button', onclick: () => { if (done) return; done = true; reveal.remove(); mark(); api.judge(info); } }, 'Reveal answer');
          area.append(h('div', { class: 'btn-row' }, reveal));
          keys.r = () => reveal.click();
        } else {
          area.append(h('p', { class: 'wars-keys' }, 'Host: tap the answer the team gives (or press 1 to 4).'));
          options.forEach((o, i) => { keys[String(i + 1)] = () => choose(i); });
        }
        api.timer.start();
      }
      function revealRound(area, api, prompt, info, extra) {
        area.append(prompt);
        if (extra) area.append(extra);
        const ans = h('p', { class: 'wars-reveal', hidden: true }, info.answer);
        const reveal = h('button', { class: 'btn btn-game', type: 'button', onclick: doReveal }, 'Reveal answer');
        function doReveal() {
          if (!reveal.isConnected) return;
          reveal.parentNode.remove();
          ans.hidden = false;
          api.judge(info);
        }
        area.append(ans, h('div', { class: 'btn-row' }, reveal));
        keys.r = () => reveal.click();
        api.timer.start();
        return reveal;
      }

      // ---------- The rounds ----------
      const ROUNDS = {
        quiz(area, api) {
          const q = deck('quiz', () => BIBLE_QUESTIONS.filter((x) => x.level <= 3));
          const opts4 = shuffle([q.answer].concat(q.wrong.slice(0, 3)));
          choices(area, api, h('p', { class: 'question wars-q' }, q.q), opts4, q.answer, { answer: q.answer, ref: q.ref, note: q.fact });
        },
        verse(area, api) {
          const v = deck('verse', () => BOOK_VERSES.filter((x) => x.level <= 2));
          const names = (window.BIBLE_BOOKS || []).map((b) => b.name).filter((n) => n !== v.book);
          const opts4 = shuffle([v.book].concat(shuffle(names).slice(0, 3)));
          choices(area, api, h('div', null, h('p', { class: 'wars-ask' }, 'Which book is this verse from?'), h('blockquote', { class: 'verse wars-verse' }, v.text)), opts4, v.book, { answer: v.book, ref: v.ref, note: v.point });
        },
        place(area, api) {
          const p = deck('place', () => BIBLE_PLACES.slice());
          const names = BIBLE_PLACES.map((x) => x.name).filter((n) => n !== p.name);
          const opts4 = shuffle([p.name].concat(shuffle(names).slice(0, 3)));
          choices(area, api, h('div', null, h('p', { class: 'wars-ask' }, 'Name the place'), h('p', { class: 'question wars-q' }, p.clue)), opts4, p.name, { answer: p.name, note: p.note });
        },
        riddle(area, api) {
          const r = deck('riddle', () => BIBLE_RIDDLES.slice());
          const clues = r.clues.slice(0, 3);
          const values = [15, 10, 5];
          let shown = 1;
          const list = h('ol', { class: 'clues wars-clues' });
          const more = h('button', { class: 'btn btn-small', type: 'button', onclick: next }, 'Next clue');
          function draw() {
            list.replaceChildren(...clues.slice(0, shown).map((c, n) => h('li', { class: n === shown - 1 ? 'new' : '' }, c)));
            api.setValue(values[shown - 1]);
            more.textContent = shown >= clues.length ? 'No more clues' : `Next clue (worth ${values[shown]})`;
            more.disabled = shown >= clues.length;
          }
          function next() { if (!more.isConnected || more.dataset.locked) return; if (shown < clues.length) { shown++; draw(); } }
          draw();
          const reveal = revealRound(area, api, h('p', { class: 'wars-ask' }, 'Who am I?'), { answer: r.answer, ref: r.ref, note: r.point }, h('div', { class: 'wars-stack' }, list, h('div', { class: 'btn-row' }, more)));
          keys.c = next;
          reveal.addEventListener('click', () => { more.dataset.locked = '1'; more.disabled = true; });
        },
        word(area, api) {
          const w = deck('word', () => BIBLE_WORDS.slice());
          let mixed = w.w;
          for (let i = 0; i < 12 && mixed === w.w; i++) mixed = shuffle(w.w.split('')).join('');
          const blanked = w.text.replace(new RegExp('\\b' + w.w + '\\w*', 'gi'), '_____');
          const hint = h('p', { class: 'wars-hint', hidden: true }, `“${blanked}” (${w.ref})`);
          const hb = h('button', { class: 'btn btn-small', type: 'button', onclick: () => { hint.hidden = false; hb.remove(); } }, 'Show a verse hint');
          revealRound(area, api, h('div', { class: 'wars-tiles', 'aria-label': 'Scrambled letters: ' + mixed.split('').join(' ') }, mixed.split('').map((c) => h('span', { class: 'wars-tile', 'aria-hidden': 'true' }, c))),
            { answer: w.w, ref: w.ref, note: w.point }, h('div', { class: 'wars-stack' }, hint, h('div', { class: 'btn-row' }, hb)));
        },
        clue(area, api) {
          const c = deck('clue', () => CROSSWORD_WORDS.filter((x) => x.w.length >= 3 && x.w.length <= 9));
          const pattern = c.w.split('').map((ch, i) => (i === 0 ? ch : '_')).join(' ');
          revealRound(area, api, h('div', null, h('p', { class: 'wars-ask' }, `Crossword clue · ${c.w.length} letters`), h('p', { class: 'question wars-q' }, c.clue)),
            { answer: c.w, ref: c.ref }, h('p', { class: 'wars-pattern', 'aria-label': `Starts with ${c.w[0]}, ${c.w.length} letters` }, pattern));
        },
        timeline(area, api) {
          const all = BIBLE_TIMELINE.slice().sort((a, b) => a.n - b.n);
          let idx = [];
          const gap = Math.max(3, Math.floor(all.length / 14));
          for (let tries = 0; tries < 60; tries++) {
            idx = shuffle(all.map((_, i) => i)).slice(0, 3).sort((a, b) => a - b);
            if (idx[1] - idx[0] >= gap && idx[2] - idx[1] >= gap) break;
          }
          const events = shuffle(idx.map((i) => all[i]));
          const right = events.slice().sort((a, b) => a.n - b.n);
          const order = [];
          const btns = events.map((ev, i) => h('button', { class: 'btn opt wars-tl', type: 'button', onclick: () => tap(i) },
            h('span', { class: 'opt-letter' }, 'ABC'[i]), h('span', { class: 'opt-text' }, ev.event)));
          const check = h('button', { class: 'btn btn-game', type: 'button', disabled: true, onclick: doCheck }, 'Check order');
          const clear = h('button', { class: 'btn btn-small', type: 'button', onclick: () => { order.length = 0; draw(); } }, 'Start again');
          function draw() {
            btns.forEach((b, i) => {
              const at = order.indexOf(i);
              b.querySelector('.opt-letter').textContent = at >= 0 ? String(at + 1) : 'ABC'[i];
              b.classList.toggle('wars-picked', at >= 0);
            });
            check.disabled = order.length < 3;
          }
          function tap(i) { if (check.isConnected === false) return; const at = order.indexOf(i); if (at >= 0) order.splice(at, 1); else if (order.length < 3) order.push(i); draw(); }
          function doCheck() {
            if (order.length < 3 || !check.isConnected) return;
            const ok = order.every((i, n) => events[i] === right[n]);
            btns.forEach((b, i) => { b.disabled = true; b.classList.add(events[i] === right[order.indexOf(i)] ? 'is-correct' : 'is-wrong'); });
            check.parentNode.remove();
            api.timer.stop();
            setTimeout(() => api.result(ok, { answer: right.map((e) => e.event).join(' → '), note: 'Bible order: ' + right.map((e) => e.ref).join(', ') }), 1100);
          }
          area.append(
            h('p', { class: 'wars-ask' }, 'Which came first? Put these in Bible order.'),
            h('p', { class: 'wars-keys' }, 'Host: tap the events in the order the team says, then check.'),
            h('div', { class: 'options options-1 wars-options' }, btns),
            h('div', { class: 'btn-row' }, check, clear));
          events.forEach((_, i) => { keys[String(i + 1)] = () => tap(i); });
          keys.enter = doCheck;
          api.timer.start();
        },
        charades(area, api) {
          const cats = ['people', 'stories', 'things', 'church'].filter((k) => BIBLE_CHARADES[k] && BIBLE_CHARADES[k].easy);
          const card = deck('charades', () => {
            const cards = [];
            cats.forEach((k) => BIBLE_CHARADES[k].easy.forEach((w) => cards.push({ w, cat: BIBLE_CHARADES[k].label })));
            return cards;
          });
          const behind = BIBLE_CHARADES.behind || {};
          const info = { answer: card.w, note: behind[card.w] || null };
          const word = h('p', { class: 'charade-word wars-card' }, card.w);
          const cover = h('div', { class: 'wars-cover' },
            h('p', { class: 'wars-ask' }, 'Choose one actor. Only the actor looks!'),
            h('button', { class: 'btn btn-game', type: 'button', onclick: peek }, 'Show the actor the card'));
          area.append(cover);
          keys.enter = peek;
          function peek() {
            cover.replaceChildren(
              h('p', { class: 'charade-cat' }, card.cat), word,
              h('button', { class: 'btn btn-primary', type: 'button', onclick: go }, 'Hide card and start acting'));
            keys = { enter: go };
          }
          function go() {
            cover.replaceChildren(
              h('p', { class: 'wars-ask' }, 'Act it out. No talking!'),
              h('p', { class: 'ref' }, `Category: ${card.cat}`));
            keys = {};
            api.judge(info, cover);
            api.timer.start();
          }
        },
      };
    },
  };
})();
