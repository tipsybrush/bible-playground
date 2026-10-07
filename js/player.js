// Coins and levels. Every game pays out coins; coins fill a level bar and unlock new titles.
// Saved in this browser only, so nobody has to sign up.
(function () {
  const { h, store } = BP;
  const TITLES = ['Seeker', 'Student', 'Disciple', 'Scribe', 'Scholar', 'Elder', 'Sage', 'Legend'];

  BP.COIN = '<svg class="coin-icon" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true">' +
    '<path fill="#B7791F" d="M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1z"/>' +
    '<path fill="#FFC72C" d="M2 1h4v1h1v4H6v1H2V6H1V2h1z"/>' +
    '<path fill="#FFF1A8" d="M3 2h1v4H3z"/></svg>';
  BP.coinEl = () => { const s = document.createElement('span'); s.innerHTML = BP.COIN; return s.firstChild; };

  // Level 1 starts at 0 coins; each next level needs 100 more coins than the last (100, 200, 300...).
  function levelFor(coins) {
    let lv = 1, start = 0, need = 100;
    while (coins >= start + need) { start += need; lv++; need = lv * 100; }
    return { lv, into: coins - start, need, title: TITLES[Math.min(lv, TITLES.length) - 1] };
  }

  BP.player = {
    coins: () => store.get('coins', 0),
    level() { return levelFor(this.coins()); },
    award(n) {
      const before = this.level();
      const coins = this.coins() + Math.max(0, Math.round(n));
      store.set('coins', coins);
      const after = levelFor(coins);
      renderHud();
      return { gained: Math.round(n), coins, level: after, levelUp: after.lv > before.lv };
    },
  };

  function renderHud() {
    const el = document.getElementById('hud-stats');
    if (!el) return;
    const coins = BP.player.coins();
    const l = levelFor(coins);
    el.replaceChildren(
      h('span', { class: 'hud-level', title: `${l.into} of ${l.need} coins to the next level` },
        `LV ${l.lv}`, h('span', { class: 'hud-rank' }, ` ${l.title.toUpperCase()}`),
        h('span', { class: 'hud-bar', 'aria-hidden': 'true' }, h('span', { style: `width:${Math.round((l.into / l.need) * 100)}%` }))),
      h('a', { class: 'hud-coins', href: '#shop', title: 'Your coin wallet. Spend coins in the Coin Shop.' }, BP.coinEl(), '×' + (BP.shop ? BP.shop.wallet() : coins).toLocaleString('en-US')));
  }
  BP.renderHud = renderHud;
})();
