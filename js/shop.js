// The Coin Shop. Coins earned in every game can be spent on power-ups. They're priced so a big one
// takes several sessions of saving. Runs that use a power-up are marked ⚡ on the leaderboards, and
// you can use at most one power-up of each kind per run, so the boards stay fair.
//
// Lifetime coins still drive your level; spending only lowers your wallet, never your level.
(function () {
  const { h, store } = BP;
  const MAX_HELD = 3; // you can stock up to 3 of each power-up

  const ITEMS = {
    time: { icon: '⏳', name: 'Extra Time', price: 150, kind: 'Power-up',
      text: 'Adds 15 seconds to the clock once in Timeline Rush or Bible Map Dash.' },
    lifeline: { icon: '🛟', name: 'Extra Lifeline', price: 250, kind: 'Power-up',
      text: 'Gives back one lifeline you have already used in Jacob’s Ladder.' },
    revive: { icon: '❤️', name: 'Second Chance', price: 500, kind: 'Major power-up',
      text: 'Brings back a lost run once: keep climbing Jacob’s Ladder, get a life back in Snake, push back the flood in Two by Two, save your streak in Where Is It Written?, rescue the camp in Wilderness Trail, or get one more stone at Goliath in David’s Sling.' },
    crown: { icon: '👑', name: 'Golden Crown', price: 1500, kind: 'Forever',
      text: 'A crown next to your nickname on every leaderboard. Bought once, yours to keep.', once: true },
  };

  const inv = () => store.get('inventory', {});
  const setInv = (v) => store.set('inventory', v);
  const spent = () => store.get('coins-spent', 0);

  BP.shop = {
    ITEMS,
    wallet: () => Math.max(0, BP.player.coins() - spent()),
    count: (id) => inv()[id] || 0,
    has: (id) => (inv()[id] || 0) > 0,
    canBuy(id) {
      const it = ITEMS[id];
      return this.wallet() >= it.price && (it.once ? !this.has(id) : this.count(id) < MAX_HELD);
    },
    buy(id) {
      if (!this.canBuy(id)) return false;
      store.set('coins-spent', spent() + ITEMS[id].price);
      const v = inv(); v[id] = (v[id] || 0) + 1; setInv(v);
      BP.renderHud(); BP.sfx('level'); BP.buzz([30, 30, 60]);
      BP.track('shop_buy', { item: id });
      return true;
    },
    use(id) {
      const v = inv();
      if (!v[id]) return false;
      v[id]--; setInv(v);
      return true;
    },

    // In the middle of a game: offer a power-up. Resolves true if the player used one.
    // Shows nothing (resolves false) when the player has none and can't afford one.
    offer(id, { title, text, seconds = 10 } = {}) {
      const it = ITEMS[id];
      const owned = this.count(id);
      if (!owned && !this.canBuy(id)) return Promise.resolve(false);
      return new Promise((resolve) => {
        let left = seconds, done = false;
        const timer = h('span', { class: 'offer-timer' }, String(left));
        const finish = (used) => {
          if (done) return; done = true;
          clearInterval(tick); document.removeEventListener('keydown', onKey, true);
          box.remove();
          if (used) { BP.sfx('level'); BP.buzz([40, 40, 80]); }
          resolve(used);
        };
        const useIt = () => {
          if (!this.has(id) && !this.buy(id)) return finish(false);
          this.use(id); finish(true);
        };
        const yes = h('button', { class: 'btn btn-primary', type: 'button', onclick: useIt },
          owned ? `Use ${it.name} (${owned} left)` : h('span', null, `Buy and use · `, BP.coinEl(), ` ${it.price}`));
        const no = h('button', { class: 'btn', type: 'button', onclick: () => finish(false) }, 'No thanks');
        const box = h('div', { class: 'offer', role: 'dialog', 'aria-modal': 'true', 'aria-label': it.name },
          h('div', { class: 'offer-card' },
            h('div', { class: 'offer-icon', 'aria-hidden': 'true' }, it.icon),
            h('h2', { class: 'panel-title' }, title || it.name),
            h('p', null, text || it.text),
            h('p', { class: 'ref' }, 'Wallet: ', BP.coinEl(), ` ${this.wallet().toLocaleString('en-US')} · Runs that use power-ups get a ⚡ on the leaderboard.`),
            h('div', { class: 'btn-row' }, yes, no, timer)));
        const onKey = (e) => {
          if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
          else if (e.key === 'Enter' || e.key.toLowerCase() === 'y') { e.preventDefault(); e.stopPropagation(); useIt(); }
          else if (e.key.toLowerCase() === 'n') { e.preventDefault(); e.stopPropagation(); finish(false); }
          else e.stopPropagation();
        };
        document.addEventListener('keydown', onKey, true);
        const tick = setInterval(() => {
          left--; timer.textContent = String(left); BP.sfx('tick');
          if (left <= 0 || !document.body.contains(box)) finish(false);
        }, 1000);
        document.body.append(box);
        yes.focus({ preventScroll: true });
        BP.sfx('coin'); BP.buzz(30);
      });
    },

    // A small button a game can show during play, e.g. "⏳ +15s". Returns null if the player has none.
    chip(id, onUse) {
      if (!this.has(id)) return null;
      const it = ITEMS[id];
      const b = h('button', { class: 'btn btn-small power-chip', type: 'button', title: it.text,
        onclick: () => { if (this.use(id)) { b.remove(); BP.sfx('level'); BP.buzz([30, 30, 60]); onUse(); } } },
        `${it.icon} ${it.name} (${this.count(id)})`);
      return b;
    },

    page(root) {
      root.style.setProperty('--game', 'var(--coin)');
      const body = h('div', { class: 'shop-grid' });
      const walletEl = h('p', { class: 'shop-wallet' });
      root.append(BP.gameHead('Coin Shop', 'Save your coins and spend them on power-ups. The big ones take a while to afford, so choose wisely.'), walletEl, body,
        h('section', { class: 'panel', style: 'margin-top:22px' },
          h('h2', { class: 'panel-title' }, 'Fair play rules'),
          h('ul', { class: 'how-list' },
            h('li', null, 'You can use each power-up at most once per run.'),
            h('li', null, 'Runs that use a power-up are marked ⚡ on the leaderboards.'),
            h('li', null, 'No power-ups in the daily Word of the Day or the daily Crossword: same puzzle, same rules for everyone.'),
            h('li', null, `You can stock up to ${MAX_HELD} of each power-up. Spending coins never lowers your level.`)),
          BP.verse({ text: 'Lay not up for yourselves treasures upon earth… But lay up for yourselves treasures in heaven.', ref: 'Matthew 6:19–20' })));
      const draw = () => {
        walletEl.replaceChildren('Wallet: ', BP.coinEl(), ` ${this.wallet().toLocaleString('en-US')} coins`);
        body.replaceChildren(...Object.entries(ITEMS).map(([id, it]) => {
          const owned = this.count(id);
          const short = Math.max(0, it.price - this.wallet());
          const btn = h('button', { class: 'btn btn-primary', type: 'button', disabled: !this.canBuy(id),
            onclick: () => { if (this.buy(id)) draw(); } },
            it.once && owned ? 'Owned' : h('span', null, 'Buy · ', BP.coinEl(), ` ${it.price.toLocaleString('en-US')}`));
          return h('article', { class: 'panel shop-item' + (owned ? ' owned' : '') },
            h('div', { class: 'shop-icon', 'aria-hidden': 'true' }, it.icon),
            h('span', { class: 'pill' }, it.kind),
            h('h2', { class: 'panel-title' }, it.name),
            h('p', null, it.text),
            h('p', { class: 'ref' }, it.once ? (owned ? 'You have it.' : '') : `You have ${owned} of ${MAX_HELD}.`,
              !owned || !it.once ? (short && !(it.once && owned) ? ` ${short.toLocaleString('en-US')} more coins to go.` : '') : ''),
            btn);
        }));
      };
      draw();
    },
  };

  BP.games.shop = { title: 'Coin Shop', color: 'var(--coin)', keys: 'Esc for the world map', mount: (root) => BP.shop.page(root) };
})();
