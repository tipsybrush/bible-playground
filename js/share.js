// Bragging rights: coin rewards at the end of a game, a shareable score picture,
// and "challenge a friend" links that open the same game with your score to beat.
(function () {
  const { h, store } = BP;
  const HEX = { quiz: '#2F6FED', ladder: '#F08A1C', blanks: '#22A04B', puzzle: '#E5484D', gifts: '#8B5CF6', riddles: '#0E9F9A', charades: '#D6409F', word: '#AD7A00', snake: '#5F3DC4', timeline: '#A0522D', ark: '#3D7A1E', map: '#0C6E9E', character: '#862E9C', crossword: '#C92A2A', verse: '#1864AB', truths: '#A3245A', sling: '#556070', wars: '#C2410C', career: '#087F5B', twin: '#3B5BDB', trail: '#6E7B14' };
  const fmt = (n, game) => Number(n).toLocaleString('en-US') + (game === 'ladder' ? ' pts' : '');

  function siteUrl() {
    const cfg = window.BP_CONFIG || {};
    return cfg.siteUrl || location.href.split('#')[0];
  }
  const link = (hash) => siteUrl() + (hash ? '#' + hash : '');

  // Challenge links look like  ...#c.quiz.820.Sam_B  (only letters, digits, dots, dashes and _ survive in links).
  function challengeHash(game, score, name) {
    const safe = (name || 'A friend').replace(/[^A-Za-z0-9 ]/g, '').trim().replace(/ +/g, '_').slice(0, 16) || 'A_friend';
    return `c.${game}.${Math.round(score)}.${safe}`;
  }
  function parse(hash) {
    const m = /^c\.(quiz|ladder|blanks|riddles|word|snake|timeline|ark|map|crossword|verse|trail|sling|truths)\.(\d{1,7})\.([A-Za-z0-9_]{1,16})$/.exec(hash);
    return m ? { game: m[1], score: +m[2], from: m[3].replace(/_/g, ' ') } : null;
  }

  // Share with the phone's share sheet when it exists, otherwise copy to the clipboard,
  // otherwise show the text so it can be copied by hand.
  async function share({ title, text, url, canvas, game, kind }, note, copyBox) {
    note.textContent = ''; copyBox.hidden = true;
    const track = (method) => BP.track('share', { game: game || 'site', kind: kind || 'invite', method });
    if (navigator.share) {
      try {
        const data = { title, text, url };
        if (canvas && navigator.canShare) {
          const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
          const file = blob && new File([blob], 'bible-playground.png', { type: 'image/png' });
          if (file && navigator.canShare({ files: [file] })) { data.files = [file]; data.text = text + ' ' + url; delete data.url; }
        }
        await navigator.share(data);
        track('share_sheet');
        note.textContent = 'Shared! Now see if they can beat you.';
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(text + ' ' + url);
      track('copy');
      note.textContent = 'Copied! Paste it into a message to your friends.';
    } catch (e) {
      copyBox.textContent = text + ' ' + url;
      copyBox.hidden = false;
      track('manual');
      note.textContent = 'Copy this message and send it to your friends:';
    }
  }

  async function savePicture(canvas, filename, note) {
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) return;
    BP.track('save_picture', { game: filename.replace(/^bible-playground-|\.png$/g, '') });
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const downloads = await window.claude.use('downloads');
        if (downloads) { await downloads.save({ filename, data: blob }); note.textContent = 'Picture saved.'; return; }
      } catch (e) { if (e && e.code === 'declined') return; }
    }
    const a = h('a', { href: URL.createObjectURL(blob), download: filename });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    note.textContent = 'Picture saved. Post it or send it to a friend!';
  }

  // ---------- The score picture (1080 x 1080) ----------
  function block(ctx, x, y, w, hgt, fill, edge) {
    ctx.fillStyle = edge; ctx.fillRect(x, y, w, hgt);
    ctx.fillStyle = fill; ctx.fillRect(x + 8, y + 8, w - 16, hgt - 16);
  }
  function outlined(ctx, text, x, y, fill, stroke, w) {
    ctx.lineJoin = 'miter'; ctx.lineWidth = w; ctx.strokeStyle = stroke; ctx.strokeText(text, x, y);
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
  }
  function fit(ctx, text, max, size, family, weight) {
    let s = size;
    do { ctx.font = `${weight || ''} ${s}px ${family}`; s -= 4; } while (ctx.measureText(text).width > max && s > 16);
  }
  async function drawCard(canvas, o) {
    try { await Promise.all([document.fonts.load('700 40px "Pixelify Sans"'), document.fonts.load('700 40px "Chakra Petch"')]); } catch (e) {}
    const ctx = canvas.getContext('2d');
    const W = 1080;
    const color = HEX[o.game] || '#2F6FED';
    const sky = ctx.createLinearGradient(0, 0, 0, W);
    sky.addColorStop(0, '#4FB8F5'); sky.addColorStop(1, '#BDEBFF');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, W);
    // Pixel clouds
    [[90, 150, 1], [760, 110, 1.3], [520, 230, 0.8]].forEach(([x, y, s]) => {
      ctx.fillStyle = '#FFFFFF';
      [[2, 1, 4, 1], [1, 2, 7, 1], [0, 3, 10, 2]].forEach(([a, b, c, d]) => ctx.fillRect(x + a * 16 * s, y + b * 16 * s, c * 16 * s, d * 16 * s));
    });
    // Ground: grass on top of dirt blocks
    ctx.fillStyle = '#1A1B3A'; ctx.fillRect(0, 900, W, 180);
    ctx.fillStyle = '#8A5A2B'; ctx.fillRect(0, 908, W, 172);
    ctx.fillStyle = '#5CBF3A'; ctx.fillRect(0, 908, W, 36);
    ctx.fillStyle = 'rgba(0,0,0,.15)';
    for (let x = 0; x < W; x += 60) for (let y = 960; y < W; y += 40) ctx.fillRect(x + ((y / 40) % 2) * 30, y, 12, 12);
    // Title
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 72px "Pixelify Sans", sans-serif';
    outlined(ctx, 'BIBLE PLAYGROUND', W / 2, 90, '#FFC72C', '#1A1B3A', 14);
    // Score panel
    ctx.fillStyle = '#1A1B3A'; ctx.fillRect(116, 300, 864, 520);
    block(ctx, 100, 284, 864, 520, '#FFFFFF', '#1A1B3A');
    ctx.fillStyle = color; ctx.fillRect(108, 292, 848, 110);
    fit(ctx, o.kicker, 780, 64, '"Chakra Petch", sans-serif', 700);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(o.kicker, 532, 348);
    fit(ctx, o.big, 800, 150, '"Chakra Petch", sans-serif', 700);
    outlined(ctx, o.big, 532, 520, color, '#1A1B3A', 10);
    if (o.sub) { fit(ctx, o.sub, 780, 48, '"Chakra Petch", sans-serif', 700); ctx.fillStyle = '#4A5378'; ctx.fillText(o.sub, 532, 640); }
    fit(ctx, o.who, 780, 46, '"Chakra Petch", sans-serif', 700); ctx.fillStyle = '#1A1B3A'; ctx.fillText(o.who, 532, 730);
    // Call to action on the ground
    ctx.font = '700 60px "Chakra Petch", sans-serif';
    outlined(ctx, o.cta, W / 2, 1010, '#FFFFFF', '#1A1B3A', 12);
  }

  BP.share = {
    parse, link, siteUrl,

    // The page shown when someone opens a challenge link.
    splash(stage, ch) {
      BP.challenge = ch;
      const game = BP.games[ch.game];
      stage.append(h('section', { class: 'panel challenge-splash' },
        h('p', { class: 'pill pill-game' }, 'CHALLENGE!'),
        h('h1', { class: 'panel-title' }, `${ch.from} challenged you to ${game.title}`),
        h('p', { class: 'big-score' }, fmt(ch.score, ch.game)),
        h('p', null, `That’s their score. Think you can beat it?`),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn btn-primary', href: '#' + ch.game, style: 'text-decoration:none' }, 'Accept the challenge'))));
    },

    invite(note) {
      const copy = h('p', { class: 'share-copy', hidden: true });
      note.after(copy);
      share({ title: 'Bible Playground', text: 'Come play Bible games with me on Bible Playground! Free, no sign-up.', url: link('') }, note, copy)
        .finally(() => { if (copy.hidden) copy.remove(); });
    },
  };

  // "Play next": two other games, favouring ones this player hasn't tried yet, so they don't have to
  // go back to the world map. Uses the same cards (and cover art) as the home page.
  const PARTY = ['charades', 'wars']; // group games, not a natural "next" for one player
  function playNext(game) {
    const played = new Set(store.get('played', []));
    played.add(game); store.set('played', [...played]);
    const cards = [...document.querySelectorAll('#home .shelf a.card')]
      .map((el) => ({ el, id: (el.getAttribute('href') || '').slice(1) }))
      .filter((c) => c.id && c.id !== game && !PARTY.includes(c.id));
    if (cards.length < 2) return null;
    const shuffled = cards.sort(() => Math.random() - 0.5);
    const fresh = shuffled.filter((c) => !played.has(c.id));
    const picks = [...fresh, ...shuffled.filter((c) => played.has(c.id))].slice(0, 2);
    return h('section', { class: 'play-next' },
      h('h3', { class: 'fin-h' }, 'Play next'),
      h('div', { class: 'play-next-grid' }, picks.map((c) => {
        const card = c.el.cloneNode(true);
        card.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
        card.classList.add('card-next');
        return card;
      })));
  }

  // Called once at the end of every game. Pays out coins and shows the share and leaderboard boxes.
  // o: { points, detail, secs, coins, board (default true), share (default true), kicker, big, sub, shareText() }
  BP.finish = function (game, o) {
    const g = BP.games[game];
    const reward = BP.player.award(o.coins || 0);
    const out = h('div', { class: 'finish' });

    // One slim strip with what this run earned; the leaderboard adds the player's rank to it once known.
    const rankChip = h('span', { class: 'fin-chip fin-rank', hidden: true });
    out.append(h('div', { class: 'fin-strip', role: 'status' },
      h('span', { class: 'fin-chip fin-coins' }, BP.coinEl(), `+${reward.gained} coins`),
      reward.levelUp
        ? h('span', { class: 'fin-chip fin-up' }, `Level up! LV ${reward.level.lv} ${reward.level.title}`)
        : h('span', { class: 'fin-chip' }, `LV ${reward.level.lv} ${reward.level.title}`),
      rankChip));
    if (reward.levelUp) BP.confetti();
    BP.track('game_finish', { game, score: Math.round(+o.points || 0), secs: Math.round(+o.secs || 0), detail: String(o.detail || '').slice(0, 40) });
    if (reward.levelUp) BP.track('level_up', { level: reward.level.lv });

    const board = o.board !== false;
    const ch = BP.challenge;
    if (board && ch && ch.game === game) {
      out.append(h('p', { class: 'challenge-result' }, o.points > ch.score
        ? `You beat ${ch.from}’s ${fmt(ch.score, ch.game)}! Send them a challenge back.`
        : `${ch.from} still leads with ${fmt(ch.score, ch.game)}. Have another go!`));
      if (o.points > ch.score) BP.challenge = null;
    }

    // Leaderboard first: where this run ranks, saved automatically under the player's nickname.
    if (board) out.append(BP.board.panel(game, o.points, o.detail, typeof o.secs === 'number' ? Math.round(o.secs) : undefined, {
      boosted: !!o.boosted,
      onRank: (n) => { rankChip.replaceChildren(`🏆 #${n} on the board`); rankChip.hidden = false; },
    }));

    const next = playNext(game);
    if (o.share === false) { if (next) out.append(next); return out; }

    // Share box
    const canvas = h('canvas', { width: 1080, height: 1080, role: 'img', 'aria-label': 'Your score picture' });
    const note = h('p', { class: 'share-note', 'aria-live': 'polite' });
    const copyBox = h('p', { class: 'share-copy', hidden: true });
    const name = () => BP.nick.get();
    const lvl = () => BP.player.level();
    const big = o.big || fmt(o.points, game);
    const draw = () => drawCard(canvas, {
      game, kicker: o.kicker || g.title, big, sub: o.sub || o.detail || '',
      who: `${name() || 'A player'} · LV ${lvl().lv} ${lvl().title}`,
      cta: board ? 'CAN YOU BEAT ME?' : game === 'gifts' ? 'FIND YOUR PLACE!' : 'COME AND PLAY!',
    });
    // Nickname changed? Redraw the picture with the new name.
    const onNick = () => { if (!document.body.contains(canvas)) return document.removeEventListener('bp:nick', onNick); draw(); };
    document.addEventListener('bp:nick', onNick);
    draw();

    const shareText = () => o.shareText ? o.shareText() : board
      ? `I just scored ${big} in ${g.title} on Bible Playground and reached LV ${lvl().lv} ${lvl().title}!`
      : game === 'gifts' ? `My gift is ${big}! Take the Find Your Place quiz on Bible Playground and find yours.`
      : `I just played ${g.title} on Bible Playground. Come and play!`;
    const challengeText = () => `${name() || 'Your friend'} scored ${big} in ${g.title}. Bet you can’t beat it! Take the challenge:`;

    out.append(h('section', { class: 'sharebox' },
      canvas,
      h('div', { class: 'share-head' },
        h('h3', { class: 'fin-h' }, board ? 'Brag about it!' : game === 'gifts' ? 'Share your gift' : 'Share it'),
        h('p', { class: 'ref' }, board ? 'Send your score picture or dare a friend to beat it.' : 'Send your result picture to a friend.')),
      h('div', { class: 'share-main' },
        h('div', { class: 'btn-row share-btns' },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => share({ title: 'Bible Playground', text: shareText(), url: link(game), canvas, game, kind: 'score' }, note, copyBox) }, board ? 'Share my score' : 'Share my result'),
          board
            ? h('button', { class: 'btn btn-green', type: 'button', onclick: () => share({ title: 'Bible Playground challenge', text: challengeText(), url: link(challengeHash(game, o.points, name())), game, kind: 'challenge' }, note, copyBox) }, 'Challenge a friend')
            : h('button', { class: 'btn btn-green', type: 'button', onclick: () => share({ title: 'Bible Playground', text: game === 'gifts' ? 'Take the Find Your Place quiz and see where you fit at church!' : `Play ${g.title} with me on Bible Playground!`, url: link(game), game, kind: 'invite' }, note, copyBox) }, 'Invite a friend'),
          h('button', { class: 'btn btn-small share-save', type: 'button', onclick: () => savePicture(canvas, `bible-playground-${game}.png`, note) }, 'Save picture')),
        note, copyBox)));

    if (next) out.append(next);
    return out;
  };
})();
