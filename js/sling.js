// David's Sling: a first-person sling game, seen through David's own eyes in the valley of Elah.
// Pull the sling pouch back, line up the reticle, mind the wind and let fly. Five smooth stones a round
// (1 Samuel 17:40), each at a farther target, and the last one at Goliath himself.
// The clock is running: every second you hold a stone, that throw is worth a little less.
// Every hit wins a true Goliath fact from 1 Samuel 17 and nearby.
(function () {
  const { h, store } = BP;
  const G = 9.8, EYE = 1.6, STONE_R = 0.045;      // metres, metres per second squared
  const SENS = 0.6, FLIGHT = 0.85;                // reticle pixels per pixel of pull; flight plays a touch slow
  const GRACE = 3, DECAY_END = 10, FLOOR = 0.25;  // full points for 3 s, then down to a quarter by 10 s
  const PAR = 35, PEN_PER_SEC = 4, PEN_CAP = 0.35; // round clock: par, points lost per second over par, most it can take

  const FACTS = [
    { t: 'Goliath was the champion of the Philistines, and he came from Gath.', ref: '1 Samuel 17:4' },
    { t: 'His height was six cubits and a span. That is about 2.9 metres, nearly 10 feet tall.', ref: '1 Samuel 17:4' },
    { t: 'He wore a helmet of brass on his head.', ref: '1 Samuel 17:5' },
    { t: 'His coat of mail weighed five thousand shekels of brass, about 57 kg. Heavier than many of us!', ref: '1 Samuel 17:5' },
    { t: 'He had greaves of brass on his legs and a target of brass between his shoulders.', ref: '1 Samuel 17:6' },
    { t: 'The staff of his spear was like a weaver’s beam.', ref: '1 Samuel 17:7' },
    { t: 'His spear’s head alone weighed six hundred shekels of iron, about 7 kg.', ref: '1 Samuel 17:7' },
    { t: 'A shield-bearer walked in front of him.', ref: '1 Samuel 17:7' },
    { t: 'He shouted his challenge: choose a man, and let him come down to me.', ref: '1 Samuel 17:8' },
    { t: 'The armies faced each other on two mountains, with the valley of Elah between them.', ref: '1 Samuel 17:2–3' },
    { t: 'When Saul and all Israel heard Goliath, they were dismayed and greatly afraid.', ref: '1 Samuel 17:11' },
    { t: 'Goliath came out morning and evening, and showed himself for forty days.', ref: '1 Samuel 17:16' },
    { t: 'David only came to the camp because his father Jesse sent him with parched corn and ten loaves for his brothers.', ref: '1 Samuel 17:17' },
    { t: 'The men of Israel said the king would give great riches and his daughter to the man who killed Goliath.', ref: '1 Samuel 17:25' },
    { t: 'David’s eldest brother Eliab got angry with him for coming to see the battle.', ref: '1 Samuel 17:28' },
    { t: 'David had already killed a lion and a bear while keeping his father’s sheep.', ref: '1 Samuel 17:34–36' },
    { t: 'Saul dressed David in his own armour, but David took it off because he had not tested it.', ref: '1 Samuel 17:38–39' },
    { t: 'David chose five smooth stones out of the brook and put them in his shepherd’s bag.', ref: '1 Samuel 17:40' },
    { t: 'Goliath looked down on David because he was only a youth, ruddy and of a fair countenance.', ref: '1 Samuel 17:42' },
    { t: 'Goliath mocked him: “Am I a dog, that thou comest to me with staves?”', ref: '1 Samuel 17:43' },
    { t: 'David said: thou comest with a sword, a spear and a shield, but I come to thee in the name of the LORD of hosts.', ref: '1 Samuel 17:45' },
    { t: 'David told the whole army that the battle is the LORD’s.', ref: '1 Samuel 17:47' },
    { t: 'David ran toward the army to meet the giant.', ref: '1 Samuel 17:48' },
    { t: 'The stone sank into Goliath’s forehead, and he fell upon his face to the earth.', ref: '1 Samuel 17:49' },
    { t: 'There was no sword in David’s hand. He used Goliath’s own sword to finish the job.', ref: '1 Samuel 17:50–51' },
    { t: 'When the Philistines saw their champion was dead, they fled.', ref: '1 Samuel 17:51' },
    { t: 'David brought Goliath’s head to Jerusalem and put his armour in his tent.', ref: '1 Samuel 17:54' },
    { t: 'Goliath’s sword was later kept at Nob, wrapped in a cloth behind the ephod. David said, “There is none like that.”', ref: '1 Samuel 21:9' },
    { t: 'Goliath had a brother, Lahmi, whose spear staff was also like a weaver’s beam.', ref: '1 Chronicles 20:5' },
    { t: 'The Philistines gathered at Shochoh, which belonged to Judah, and camped between Shochoh and Azekah.', ref: '1 Samuel 17:1' },
    { t: 'Saul and the men of Israel camped by the valley of Elah and set the battle in array.', ref: '1 Samuel 17:2' },
    { t: 'Goliath offered a deal: if Israel’s man killed him, the Philistines would serve Israel. If he won, Israel would serve them.', ref: '1 Samuel 17:9' },
    { t: 'Goliath boasted: “I defy the armies of Israel this day; give me a man, that we may fight together.”', ref: '1 Samuel 17:10' },
    { t: 'David’s father Jesse was an Ephrathite of Bethlehem-judah, and he had eight sons.', ref: '1 Samuel 17:12' },
    { t: 'David was the youngest of Jesse’s sons.', ref: '1 Samuel 17:14' },
    { t: 'Jesse’s three eldest sons, Eliab, Abinadab and Shammah, had followed Saul to the battle.', ref: '1 Samuel 17:13' },
    { t: 'David went back and forth from Saul’s court to feed his father’s sheep at Bethlehem.', ref: '1 Samuel 17:15' },
    { t: 'Jesse also sent ten cheeses for the captain over his sons’ thousand. Snacks for the commander!', ref: '1 Samuel 17:18' },
    { t: 'David rose early in the morning and left the sheep with a keeper before setting off.', ref: '1 Samuel 17:20' },
    { t: 'David reached the camp just as the army was going out to the battle line, shouting for battle.', ref: '1 Samuel 17:20' },
    { t: 'David left his supplies with the keeper of the baggage and ran into the army to greet his brothers.', ref: '1 Samuel 17:22' },
    { t: 'When the men of Israel saw Goliath, they fled from him and were sore afraid.', ref: '1 Samuel 17:24' },
    { t: 'Part of the promised reward: the winner’s father’s house would be made free in Israel.', ref: '1 Samuel 17:25' },
    { t: 'David asked: “Who is this uncircumcised Philistine, that he should defy the armies of the living God?”', ref: '1 Samuel 17:26' },
    { t: 'Eliab sneered at David: “With whom hast thou left those few sheep in the wilderness?”', ref: '1 Samuel 17:28' },
    { t: 'David answered his brother: “What have I now done? Is there not a cause?”', ref: '1 Samuel 17:29' },
    { t: 'David’s words were repeated to Saul, and Saul sent for him.', ref: '1 Samuel 17:31' },
    { t: 'David told Saul: “Let no man’s heart fail because of him; thy servant will go and fight with this Philistine.”', ref: '1 Samuel 17:32' },
    { t: 'Saul said David was only a youth, while Goliath had been a man of war from his youth.', ref: '1 Samuel 17:33' },
    { t: 'When a lion or a bear took a lamb from the flock, David went after it and rescued the lamb from its mouth.', ref: '1 Samuel 17:34–35' },
    { t: 'David said the LORD who saved him from the paw of the lion and the bear would save him from this Philistine too.', ref: '1 Samuel 17:37' },
    { t: 'Saul finally said to David: “Go, and the LORD be with thee.”', ref: '1 Samuel 17:37' },
    { t: 'Saul put a helmet of brass on David’s head and armed him with a coat of mail.', ref: '1 Samuel 17:38' },
    { t: 'David went out with his staff in his hand and his sling in his hand.', ref: '1 Samuel 17:40' },
    { t: 'Goliath cursed David by his gods.', ref: '1 Samuel 17:43' },
    { t: 'Goliath threatened to give David’s flesh to the birds of the air and the beasts of the field.', ref: '1 Samuel 17:44' },
    { t: 'David said he would win so that all the earth may know that there is a God in Israel.', ref: '1 Samuel 17:46' },
    { t: 'David put his hand in his bag, took out a stone, slung it, and struck the Philistine.', ref: '1 Samuel 17:49' },
    { t: 'So David prevailed over the Philistine with a sling and with a stone.', ref: '1 Samuel 17:50' },
    { t: 'The men of Israel and Judah shouted and chased the Philistines as far as Gath and the gates of Ekron.', ref: '1 Samuel 17:52' },
    { t: 'On the way back, Israel plundered the Philistines’ tents.', ref: '1 Samuel 17:53' },
    { t: 'Watching David go out, Saul asked Abner, the captain of the host: “Whose son is this youth?”', ref: '1 Samuel 17:55' },
    { t: 'Abner brought David to Saul with the head of the Philistine still in his hand.', ref: '1 Samuel 17:57' },
    { t: 'David told Saul: “I am the son of thy servant Jesse the Bethlehemite.”', ref: '1 Samuel 17:58' },
    { t: 'That same day the soul of Saul’s son Jonathan was knit with the soul of David.', ref: '1 Samuel 18:1' },
    { t: 'Jonathan gave David his robe, his garments, his sword, his bow and his girdle.', ref: '1 Samuel 18:4' },
    { t: 'The women sang: “Saul hath slain his thousands, and David his ten thousands.”', ref: '1 Samuel 18:7' },
    { t: 'Before the battle, Samuel had anointed David among his brothers, and the Spirit of the LORD came upon him from that day.', ref: '1 Samuel 16:13' },
    { t: 'When Samuel chose David, God said man looks on the outward appearance, but the LORD looks on the heart.', ref: '1 Samuel 16:7' },
    { t: 'David was a skilful harp player, and he played for Saul to refresh him.', ref: '1 Samuel 16:18, 23' },
    { t: 'Before facing Goliath, David had already served as Saul’s armourbearer.', ref: '1 Samuel 16:21' },
    { t: 'The five Philistine lords ruled Ashdod, Gaza, Askelon, Gath and Ekron.', ref: '1 Samuel 6:17' },
    { t: 'When the Philistines put the ark of God in Dagon’s temple, their idol Dagon fell on his face before it.', ref: '1 Samuel 5:3' },
    { t: 'In Saul’s day there was no smith in Israel. Israelites went down to the Philistines to sharpen their tools.', ref: '1 Samuel 13:19–20' },
    { t: 'Jonathan once attacked a Philistine garrison with just his armourbearer, saying the LORD can save by many or by few.', ref: '1 Samuel 14:6' },
    { t: 'Later, running from Saul, David went to Achish king of Gath, Goliath’s hometown, and pretended to be mad.', ref: '1 Samuel 21:10–13' },
    { t: 'Elhanan the son of Jair was the man who killed Lahmi, Goliath’s brother.', ref: '1 Chronicles 20:5' },
    { t: 'Another giant at Gath had six fingers on each hand and six toes on each foot: twenty-four in all.', ref: '1 Chronicles 20:6' },
    { t: 'That six-fingered giant was killed by Jonathan, the son of David’s brother Shimea.', ref: '1 Chronicles 20:7' },
    { t: 'The giant Ishbi-benob, whose spear weighed three hundred shekels of brass, tried to kill David. Abishai saved him.', ref: '2 Samuel 21:16–17' },
    { t: 'One of David’s mighty men, Shammah, stood his ground in a field of lentils and the LORD gave a great victory over the Philistines.', ref: '2 Samuel 23:11–12' },
    { t: 'Three mighty men broke through the Philistine army to bring David water from the well of Bethlehem. He poured it out to the LORD.', ref: '2 Samuel 23:15–16' },
    { t: 'As king, David later struck the Philistines and subdued them.', ref: '2 Samuel 8:1' },
    { t: 'Hebrews 11 names David among the heroes of faith who out of weakness were made strong.', ref: 'Hebrews 11:32–34' },
    { t: 'David wrote: “Blessed be the LORD my strength, which teacheth my hands to war, and my fingers to fight.”', ref: 'Psalm 144:1' },
    { t: 'The New Testament opens by calling Jesus Christ “the son of David”.', ref: 'Matthew 1:1' },
    { t: 'Like David, Jesus was born in Bethlehem, the city of David.', ref: 'Luke 2:4–7' },
  ];

  // Targets. cy is the height of the bullseye centre, R its outer ring (metres).
  const KINDS = {
    shield: { name: 'Philistine shield', bull: 'BULLSEYE!', the: 'Shield struck', cy: 1.25, R: 0.6 },
    jar: { name: 'Clay jar', bull: 'SMASHED!', the: 'Jar in pieces', cy: 0.92, R: 0.5 },
    standard: { name: 'Philistine standard', bull: 'BULLSEYE!', the: 'Standard struck', cy: 2.05, R: 0.62 },
    goliath: { name: 'Goliath', bull: 'FOREHEAD!', the: 'Goliath goes down', cy: 2.76, R: 0.12 },
  };
  // One stone per stage, each a little farther and windier. The fifth stone is for Goliath.
  const STAGES = [
    { kind: 'shield', z: 10, wind: 0.25, spread: 0.5 },
    { kind: 'jar', z: 14, wind: 0.4, spread: 0.9 },
    { kind: 'shield', z: 19, wind: 0.55, spread: 1.1, R: 0.5 },
    { kind: 'standard', z: 24, wind: 0.7, spread: 1.2 },
    { kind: 'goliath', z: 30, wind: 0.8, spread: 0.6 },
  ];
  const STONES = STAGES.length;
  const RING_PTS = [100, 60, 40, 25, 10];
  const GOLIATH_PTS = { forehead: 250, head: 110, body: 50 };
  const HIT_CHEERS = ['Great shot!', 'Nailed it!', 'What an arm!', 'Right on target!', 'Brilliant!', 'Boom!', 'Sharp shooter!'];
  const MISS_LINES = ['Not quite! Next stone.', 'Close! Adjust a little.', 'Hmm, try again, champion.', 'Steady your hand. Next one.'];
  const VERSES = [
    { text: 'And all this assembly shall know that the LORD saveth not with sword and spear: for the battle is the LORD’s, and he will give you into our hands.', ref: '1 Samuel 17:47' },
    { text: 'But thanks be to God, which giveth us the victory through our Lord Jesus Christ.', ref: '1 Corinthians 15:57' },
  ];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (k) => k * k * (3 - 2 * k);
  const zoomFor = (z) => 1 + (z - 10) / 28; // far targets get a little scope-in
  // What a throw is still worth after `s` seconds with the stone ready.
  const shotValue = (s) => s <= GRACE ? 1 : Math.max(FLOOR, 1 - (s - GRACE) / (DECAY_END - GRACE) * (1 - FLOOR));

  BP.games.sling = {
    title: 'David’s Sling',
    color: 'var(--c-sling)',
    keys: 'Keys: arrows to aim · hold Space to pull, let go to throw · Esc for the world map',
    scoring: 'Rings score 100, 60, 40, 25 or 10 (Goliath: forehead 250, head 110, body 50), up to 2x for distance, 1.3x for wind and 2x for a hit streak. Each throw keeps full points for 3 seconds, then shrinks to a quarter by 10 seconds. Five out of five adds 300; every second past 35 for the round costs 4.',
    badge() {
      const best = store.get('sling-best', null);
      return best == null ? 'New' : `Best: ${Number(best).toLocaleString('en-US')}`;
    },
    mount(root) {
      const body = h('section', { class: 'panel' });
      root.append(BP.gameHead('David’s Sling', 'Five smooth stones. One giant. Quick hands win.'), body);
      let cleanup = () => {};
      menu();

      function menu() {
        cleanup();
        body.replaceChildren(
                    BP.howTo(
            h('li', null, 'You see the valley through David’s eyes. Press on the field, pull the sling down and aim the circle, then let go to throw.'),
            h('li', null, 'Keyboard: the arrow keys aim. Hold Space to pull the sling back, let go to throw.'),
            h('li', null, 'Five smooth stones (1 Samuel 17:40), each at a farther target. The last one is for Goliath: hit his forehead!'),
            h('li', null, 'The stone drops on its way, and the circle already allows for that. The wind does not: watch the flag and aim into the wind.'),
            h('li', null, 'Be quick! Each throw keeps full points for 3 seconds, then the value drains away. The round clock counts too.'),
            h('li', null, 'Hit in a row for a streak bonus. Every hit wins you a true Goliath fact from the Bible.')),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', onclick: play }, 'Start')));
      }

      function play() {
        cleanup();
        const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
        const isDark = () => {
          const theme = document.documentElement.dataset.theme;
          return theme === 'dark' || (theme !== 'light' && !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches));
        };
        let dark = isDark();
        const facts = BP.shuffle(FACTS);
        const won = [];
        let thrown = 0, totalStones = STONES, score = 0, hits = 0, bulls = 0, streak = 0, bestStreak = 0, felled = false;
        let playMs = 0, readyMs = 0, lastTick = 0, phase = 'intro', phaseT = 0, hold = 1, over = false, paused = false;
        let revived = false, boosted = false;
        let target = null, wind = 0, aim = { x: 0, y: 0 }, drag = null, charge = 0, kbCharge = false, fullBuzz = false;
        let rock = null, rel = 0, timeScale = 1, slowHold = 0, shake = 0, flash = 0, fade = 0, fadeDir = 0, afterFade = null, bars = 0;
        let raf = 0, lastFrame = performance.now(), shown = -1, shownVal = '', frameNo = 0;
        let W = 360, H = 480, f0 = 600, f = 600, hz = 200, ui = 1, sw = { x: 0, y: 0 };
        const keys = {};
        const cam = { x: 0, y: EYE, z: 0, zoom: 1, lift: 0 }; // lift tilts the view up to follow a high stone
        const parts = [], pops = [], marks = [], gusts = [];
        const dpr = Math.min(2, window.devicePixelRatio || 1);

        // Scenery that stays put for the whole round
        const tufts = Array.from({ length: 190 }, () => ({ x: rand(-16, 16), z: rand(1.2, 70), h: rand(0.14, 0.34), k: Math.random() < 0.5 }))
          .filter((t) => Math.abs(t.x) > 1.25).sort((a, b) => b.z - a.z);
        const bushes = Array.from({ length: 16 }, () => ({ x: (Math.random() < 0.5 ? -1 : 1) * rand(3.2, 20), z: rand(8, 64), r: rand(0.3, 0.75) })).sort((a, b) => b.z - a.z);
        const pebbles = Array.from({ length: 26 }, () => ({ x: rand(-1, 1), z: rand(1.5, 45), r: rand(0.03, 0.07) })).sort((a, b) => b.z - a.z);
        const clouds = Array.from({ length: 6 }, (_, i) => ({ x: -330 + i * 120 + rand(-30, 30), y: rand(80, 160), r: rand(9, 16) }));
        const ridge = Array.from({ length: 19 }, (_, i) => [-540 + i * 60, rand(18, 48)]);
        const ridge2 = Array.from({ length: 15 }, (_, i) => [-280 + i * 40, rand(8, 22)]);
        const stars = Array.from({ length: 60 }, () => [Math.random(), Math.random() * 0.9, rand(0.25, 0.9)]);

        const canvas = h('canvas', { class: 'sl3-field', tabindex: '0', role: 'img',
          'aria-label': 'The valley of Elah through David’s eyes. Press and pull down to aim the sling, release to throw. Or use the arrow keys to aim and hold Space.' });
        const ctx = canvas.getContext('2d');
        const stonesEl = h('span', { class: 'sling-stones', 'aria-label': '' });
        const scoreEl = h('span', { class: 'sling-stat' }, '0 pts');
        const clockEl = h('span', { class: 'sling-stat sl3-clock' }, '⏱ 0:00');
        const valFill = h('i');
        const valLbl = h('span', null, 'Full points');
        const valPct = h('b', null, '100%');
        const valueEl = h('div', { class: 'sl3-chip sl3-value', role: 'status', 'aria-label': 'Shot value' },
          h('div', { class: 'sl3-value-row' }, valLbl, valPct), h('div', { class: 'sl3-bar' }, valFill));
        const windArrow = h('span', { class: 'sl3-wind-arrow', 'aria-hidden': 'true' }, '→');
        const windTxt = h('span', null, 'Calm');
        const windEl = h('div', { class: 'sl3-chip sl3-wind' }, windArrow, windTxt);
        const comboEl = h('div', { class: 'sl3-chip sl3-combo', hidden: true });
        const bannerKick = h('span', { class: 'sl3-banner-kick' });
        const bannerMain = h('span', { class: 'sl3-banner-main' });
        const bannerEl = h('div', { class: 'sl3-banner', 'aria-hidden': 'true' }, bannerKick, bannerMain);
        const hintEl = h('div', { class: 'sl3-hint', 'aria-hidden': 'true' }, 'Press, pull down, let go');
        const msg = h('p', { class: 'sling-msg', 'aria-live': 'polite' }, 'Pull the sling down to aim, then let go.');
        const factBox = h('div', { class: 'sling-fact', 'aria-live': 'polite' },
          h('span', { class: 'sling-fact-label' }, 'Goliath facts'),
          h('p', null, 'Hit a target to win a fact from 1 Samuel 17.'));
        body.replaceChildren(
          h('div', { class: 'sling-hud' }, stonesEl, scoreEl, clockEl),
          h('div', { class: 'sling-frame sl3-frame' }, canvas,
            h('div', { class: 'sl3-top' }, valueEl, h('div', { class: 'sl3-side' }, windEl, comboEl)),
            bannerEl, hintEl),
          msg, factBox);

        function resize() {
          const r = canvas.getBoundingClientRect();
          if (!r.width || !r.height) return;
          W = r.width; H = r.height;
          canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
          f0 = 1.2 * Math.max(H, 0.62 * W);
          ui = clamp(Math.min(H / 520, W / 360), 0.8, 1.4);
          dark = isDark();
        }
        const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
        if (ro) ro.observe(canvas); else window.addEventListener('resize', resize);
        resize();

        // ---------- Input: drag the pouch, or arrows and Space ----------
        const onDown = (e) => {
          if (over || paused || phase !== 'ready' || (e.button && e.button !== 0)) return;
          e.preventDefault();
          try { canvas.focus({ preventScroll: true }); } catch (err) {}
          try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
          drag = { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, id: e.pointerId };
          charge = 0; fullBuzz = false;
          canvas.classList.add('pulling');
        };
        const onMove = (e) => {
          if (!drag || e.pointerId !== drag.id) return;
          e.preventDefault();
          drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0;
          charge = clamp(Math.hypot(drag.dx, drag.dy) / (70 * ui), 0, 1);
          if (charge >= 1 && !fullBuzz) { fullBuzz = true; BP.buzz(8); }
        };
        const onUp = (e) => {
          if (!drag || e.pointerId !== drag.id) return;
          const d = drag;
          canvas.classList.remove('pulling');
          if (Math.hypot(d.dx, d.dy) < 18 * ui) { drag = null; charge = 0; msg.textContent = 'Pull the sling back further, then let go.'; return; }
          fling();
        };
        const onCancel = () => { drag = null; charge = 0; canvas.classList.remove('pulling'); };
        const stop = (e) => e.stopPropagation(); // keep the edge-swipe-to-go-back gesture out of aiming
        const OWN = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
        const onKey = (e) => {
          if (e.key === 'Shift') keys.Shift = e.type === 'keydown';
          if (over || e.ctrlKey || e.metaKey || e.altKey) return;
          const tag = (e.target && e.target.tagName) || '';
          if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (e.target && e.target.isContentEditable)) return;
          const k = e.key === 'Spacebar' ? ' ' : e.key;
          if (!OWN.includes(k) || (k === ' ' && /^(BUTTON|A)$/.test(tag))) return;
          if (paused || document.querySelector('.offer')) return;
          e.preventDefault();
          if (e.type === 'keydown') {
            if (k !== ' ') keys[k] = true;
            else if (!e.repeat && phase === 'ready' && !drag) { kbCharge = true; charge = 0; fullBuzz = false; }
          } else if (k !== ' ') keys[k] = false;
          else if (kbCharge) {
            kbCharge = false;
            if (phase !== 'ready') charge = 0;
            else if (charge < 0.15) { charge = 0; msg.textContent = 'Hold Space a moment to pull the sling back, then let go.'; }
            else fling();
          }
        };
        const onBlur = () => { for (const k in keys) keys[k] = false; kbCharge = false; };
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onCancel);
        canvas.addEventListener('touchstart', stop, { passive: true });
        canvas.addEventListener('touchend', stop, { passive: true });
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', onKey);
        document.addEventListener('keyup', onKey);
        window.addEventListener('blur', onBlur);
        const unlisten = () => {
          document.removeEventListener('keydown', onKey);
          document.removeEventListener('keyup', onKey);
          window.removeEventListener('blur', onBlur);
        };
        cleanup = () => {
          unlisten(); cancelAnimationFrame(raf);
          if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
          cleanup = () => {};
        };

        setTarget(0);
        hud();
        raf = requestAnimationFrame(loop);
        // Bring the score bar and the whole field into view (the sling hand sits at the very bottom)
        const bar = document.querySelector('header.hud');
        const topGap = (bar ? bar.getBoundingClientRect().bottom : 0) + 8;
        const hudTop = body.querySelector('.sling-hud').getBoundingClientRect().top, fr = canvas.getBoundingClientRect();
        const need = fr.bottom - window.innerHeight + 8, room = hudTop - topGap; // scroll at least `need`, at most `room`
        const dy = need > room ? need : need > 0 ? need : room < 0 ? room : 0;
        if (Math.abs(dy) > 2) window.scrollBy({ top: dy, behavior: reduce ? 'auto' : 'smooth' });

        // ---------- The round ----------
        function setTarget(i) {
          const st = STAGES[i];
          target = { kind: st.kind, z: st.z, x: rand(-st.spread, st.spread), R: st.R || KINDS[st.kind].R,
            hit: null, hitT: 0, tilt: 0, lean: 0, broken: false, landed: false };
          wind = (Math.random() < 0.5 ? -1 : 1) * rand(0.35, 1) * st.wind;
          if (i === 0 && Math.random() < 0.35) wind = 0;
          const s = f0 * zoomFor(st.z) / st.z;
          aim = { x: rand(-45, 45) * ui / s, y: -(85 * SENS * ui) / s }; // starts low: pull down to raise it
          readyMs = 0; lastTick = 0; charge = 0; drag = null; kbCharge = false;
          cam.x = 0; cam.y = EYE; cam.z = 0; cam.zoom = 1; cam.lift = 0; bars = 0; timeScale = 1; slowHold = 0;
          rock = null; parts.length = 0; pops.length = 0;
          phase = 'intro'; phaseT = 0;
          const n = thrown + 1;
          bannerKick.textContent = n > STONES ? 'Second chance' : n === STONES ? 'Last stone' : `Stone ${n} of ${totalStones}`;
          bannerMain.textContent = `${KINDS[st.kind].name} · ${st.z} m`;
          bannerEl.classList.remove('show'); void bannerEl.offsetWidth; bannerEl.classList.add('show');
          const kmh = Math.round(Math.abs(wind) * 14);
          windTxt.textContent = kmh ? `Wind ${kmh} km/h` : 'Calm';
          windArrow.textContent = kmh ? '→' : '•';
          windArrow.style.transform = wind < 0 ? 'scaleX(-1)' : '';
          windEl.classList.toggle('strong', kmh >= 8);
          windEl.setAttribute('aria-label', kmh ? `Wind ${kmh} kilometres per hour to the ${wind > 0 ? 'right' : 'left'}` : 'No wind');
          msg.textContent = `${KINDS[st.kind].name}, ${st.z} m away. ${kmh ? `Wind blowing ${wind > 0 ? 'right' : 'left'}, aim a little ${wind > 0 ? 'left' : 'right'}.` : 'No wind this time.'}`;
          valueUI(true);
        }

        function launchPoint() {
          // The pouch sits low and to the right of David's eyes, just in front of him.
          const sx = W * 0.6, sy = H * 0.86, d = 0.9;
          return { x: cam.x + (sx - W / 2) * d / f, y: cam.y - (sy - hz) * d / f, z: cam.z + d };
        }
        function sway() {
          const a = ui * (reduce ? 1.2 : 1.8) + ui * Math.min(5, readyMs / 1000 * 0.55); // tired arms shake more
          const t = performance.now() / 1000;
          return { x: a * (Math.sin(t * 1.3) + 0.5 * Math.sin(t * 2.9 + 1)), y: a * (Math.cos(t * 1.1) + 0.5 * Math.sin(t * 2.3 + 2)) };
        }
        // The point on the target's plane that the sling is aimed at right now (gravity already allowed for).
        function reticle() {
          const s = f / Math.max(0.5, target.z - cam.z);
          let x = aim.x, y = aim.y;
          if (drag) { x -= drag.dx * SENS / s; y += drag.dy * SENS / s; }
          return { x: target.x + x + sw.x / s, y: KINDS[target.kind].cy + y - sw.y / s };
        }
        function posAt(r, t) {
          return { x: r.S.x + r.v.x * t + 0.5 * r.aw * t * t, y: r.S.y + r.v.y * t - 0.5 * G * t * t, z: r.S.z + r.v.z * t };
        }

        function fling() {
          if (phase !== 'ready' || over) return;
          const c = Math.max(0.3, charge);
          const R = reticle(), S = launchPoint();
          const vz = 9 + 9 * c;                       // a weak pull is slower, so the wind pushes it more
          const tc = (target.z - S.z) / vz;
          const v = { x: (R.x - S.x) / tc, y: (R.y - S.y + 0.5 * G * tc * tc) / tc, z: vz };
          rock = { S, v, aw: wind, t: 0, trail: [], p: S };
          const tg = (v.y + Math.sqrt(v.y * v.y + 2 * G * S.y)) / G; // when it would reach the ground
          const at = posAt(rock, tc);
          rock.zone = tg > tc ? zoneAt(at.x - target.x, at.y) : null;
          rock.end = rock.zone ? tc : tg;
          rock.short = tg <= tc;
          rock.at = at;
          rock.value = shotValue(readyMs / 1000);
          rock.slow = !reduce && target.kind === 'goliath' && rock.zone && rock.zone.bull;
          thrown++; drag = null; charge = 0; kbCharge = false; rel = 1;
          phase = 'flying'; phaseT = 0;
          canvas.classList.remove('pulling'); hintEl.hidden = true;
          hud(); valueUI(true);
          BP.sfx('tap'); BP.buzz(18);
          msg.textContent = '';
        }

        function zoneAt(lx, ly) {
          const k = KINDS[target.kind];
          if (target.kind === 'goliath') {
            if (Math.hypot(lx, ly - k.cy) <= k.R + STONE_R) return { ring: 0, bull: true, pts: GOLIATH_PTS.forehead, lx, ly };
            if (Math.hypot(lx, ly - 2.66) <= 0.3 + STONE_R) return { ring: 1, pts: GOLIATH_PTS.head, part: 'head', lx, ly };
            if (Math.abs(lx) <= 0.56 + STONE_R && ly <= 2.42 && ly >= 0) return { ring: 2, pts: GOLIATH_PTS.body, part: 'body', lx, ly };
            return null;
          }
          const d = Math.max(0, Math.hypot(lx, ly - k.cy) - STONE_R);
          if (d > target.R) return null;
          const ring = Math.min(4, Math.floor(d / (target.R / 5)));
          return { ring, bull: ring === 0, pts: RING_PTS[ring], lx, ly };
        }

        function impact() {
          const z = rock.zone, p = posAt(rock, rock.end), k = KINDS[target.kind];
          phase = 'impact'; phaseT = 0;
          if (z) {
            hits++; streak++; bestStreak = Math.max(bestStreak, streak);
            if (z.bull) bulls++;
            const combo = 1 + 0.25 * Math.min(4, streak - 1);
            const distF = 1 + (target.z - 10) / 20, windF = 1 + Math.abs(wind) / 0.8 * 0.3;
            const gained = Math.max(1, Math.round(z.pts * distF * windF * combo * rock.value));
            score += gained;
            target.hit = z; target.hitT = 0;
            if (target.kind === 'goliath' && z.bull) felled = true;
            const label = z.bull ? k.bull : target.kind === 'goliath' ? (z.part === 'head' ? 'HELMET!' : 'HIT!') : ['', 'GREAT!', 'GOOD!', 'HIT!', 'JUST!'][z.ring];
            pops.push({ x: p.x, y: p.y + 0.15, z: p.z - 0.05, text: `+${gained}`, sub: label + (combo > 1 ? ` ×${+combo.toFixed(2)}` : ''), life: 1.6, c: z.bull ? '#FFE066' : '#FFFFFF' });
            if (target.kind === 'jar') { target.broken = true; burst(p, 46, ['#C8753F', '#E29A62', '#8E4E26', '#F1E4CC'], 0.07, 4.5); }
            else if (target.kind === 'standard') burst(p, 30, ['#E9C46A', '#5B3A8C', '#FFFFFF'], 0.035, 4);
            else burst(p, z.bull ? 36 : 24, ['#FFE08A', '#FFC72C', '#FFFFFF', '#E8A33D'], 0.03, z.bull ? 6 : 4);
            marks.push({ x: p.x + rand(-0.2, 0.2), z: target.z - rand(0.2, 0.6) });
            if (z.bull) {
              if (!reduce) { shake = target.kind === 'goliath' ? 1.3 : 1; flash = 0.55; }
              if (target.kind === 'goliath') { BP.sfx('win'); BP.buzz([60, 40, 60, 40, 160]); }
              else { BP.sfx('level'); BP.buzz([30, 40, 90]); }
            } else {
              if (!reduce) shake = 0.45;
              BP.sfx('coin'); BP.buzz(30);
            }
            const how = z.bull ? k.bull.charAt(0) + k.bull.slice(1).toLowerCase() : 'Hit!';
            msg.textContent = `${pick(HIT_CHEERS)} ${how} ${z.bull || target.kind !== 'goliath' ? k.the + '.' : 'Goliath staggers.'} +${gained}${rock.value < 1 ? ` (${Math.round(rock.value * 100)}% for time)` : ''}`;
            const fact = facts[(hits - 1) % facts.length];
            won.push(fact);
            factBox.replaceChildren(
              h('span', { class: 'sling-fact-label' }, `Goliath fact #${hits}`),
              h('p', null, fact.t),
              h('span', { class: 'ref' }, fact.ref));
            factBox.classList.remove('pop'); void factBox.offsetWidth; factBox.classList.add('pop');
            hold = felled && target.kind === 'goliath' ? 2.6 : 1.35;
          } else {
            streak = 0;
            dust(p, 14);
            marks.push({ x: p.x, z: p.z });
            const lx = rock.at.x - target.x, ly = rock.at.y - KINDS[target.kind].cy;
            let line = pick(MISS_LINES), tag = 'MISS';
            if (rock.short) { line = 'Too short! Aim a little higher.'; tag = 'SHORT'; }
            else if (Math.abs(lx) > Math.abs(ly) && wind && Math.sign(lx) === Math.sign(wind)) { line = 'The wind pushed it wide. Aim into the wind.'; tag = 'WIDE'; }
            else if (Math.abs(lx) > Math.abs(ly)) { line = `Just ${lx > 0 ? 'right' : 'left'}. Nudge it back.`; tag = 'WIDE'; }
            else if (ly > 0) { line = 'Over the top! Aim a little lower.'; tag = 'HIGH'; }
            pops.push({ x: p.x, y: 0.5, z: p.z, text: tag, sub: '', life: 1.2, c: '#FFFFFF' });
            msg.textContent = line;
            BP.sfx('bad'); BP.buzz([50, 30, 50]);
            hold = 1.15;
          }
          if (marks.length > 14) marks.shift();
          rock = null;
          hud();
        }

        function afterImpact() {
          const lastWasGoliath = target.kind === 'goliath';
          if (thrown < totalStones) return cut(() => setTarget(Math.min(thrown, STONES - 1)));
          if (lastWasGoliath && !target.hit && !revived && BP.shop) {
            phase = 'wait'; paused = true;
            BP.shop.offer('revive', { title: 'Second Chance?', text: 'Pick up one more smooth stone and face Goliath again.' }).then((ok) => {
              paused = false; lastFrame = performance.now();
              if (over) return;
              if (!ok) return end();
              revived = boosted = true; totalStones++;
              hud(); cut(() => setTarget(STONES - 1));
            });
            return;
          }
          end();
        }
        function cut(fn) { phase = 'cut'; fadeDir = 1; afterFade = fn; }

        // ---------- Frame loop ----------
        function loop(now) {
          if (!document.body.contains(canvas)) return cleanup();
          const rdt = Math.min(50, now - lastFrame) / 1000; lastFrame = now;
          if (!paused) {
            if (!over) {
              playMs += rdt * 1000;
              const secs = Math.floor(playMs / 1000);
              if (secs !== shown) { shown = secs; clockEl.textContent = '⏱ ' + clock(secs); }
            }
            update(rdt);
          }
          if (++frameNo % 90 === 0) dark = isDark();
          draw(now / 1000, rdt);
          raf = requestAnimationFrame(loop);
        }

        function update(rdt) {
          const dt = rdt * timeScale;
          const kk = 1 - Math.exp(-rdt * 6);
          f = f0 * cam.zoom; hz = H * 0.42 + cam.lift;
          sw = phase === 'ready' ? sway() : sw;
          if (phase === 'intro') {
            phaseT += rdt;
            cam.zoom += (zoomFor(target.z) - cam.zoom) * kk;
            if (phaseT > 0.75 && fade < 0.2) { phase = 'ready'; phaseT = 0; cam.zoom = zoomFor(target.z); valueUI(true); }
          } else if (phase === 'ready') {
            readyMs += rdt * 1000;
            const s = f / target.z, step = (keys.Shift ? 22 : 60) * ui * rdt / s;
            if (keys.ArrowUp) aim.y += step;
            if (keys.ArrowDown) aim.y -= step;
            if (keys.ArrowLeft) aim.x -= step;
            if (keys.ArrowRight) aim.x += step;
            aim.x = clamp(aim.x, -6, 6); aim.y = clamp(aim.y, -KINDS[target.kind].cy - 1, 8);
            if (kbCharge) {
              charge = Math.min(1, charge + rdt * 1.8);
              if (charge >= 1 && !fullBuzz) { fullBuzz = true; BP.buzz(8); }
            }
            const secs = readyMs / 1000;
            if (secs > GRACE && Math.floor(secs) > lastTick) { lastTick = Math.floor(secs); if (shotValue(secs) > FLOOR) { BP.sfx('tick'); if (lastTick === GRACE + 1) BP.buzz(10); } }
            valueUI();
          } else if (phase === 'flying') {
            const remain = rock.end - rock.t;
            if (rock.slow && remain < 0.5) { timeScale += (0.16 - timeScale) * Math.min(1, rdt * 14); slowHold = 0.9; }
            rock.t = Math.min(rock.end, rock.t + rdt * timeScale * FLIGHT);
            rock.p = posAt(rock, rock.t);
            rock.trail.push(rock.p); if (rock.trail.length > 16) rock.trail.shift();
            if (!reduce) {
              const k = 1 - Math.exp(-rdt * 4.5 * (timeScale < 0.9 ? 0.6 : 1));
              const gz = clamp(rock.p.z - 4.2, 0, target.z - 4.6);
              cam.z += (gz - cam.z) * k;
              cam.x += (rock.p.x * 0.7 - cam.x) * k;
              cam.y += (clamp(rock.p.y * 0.55 + 0.75, 1.2, 3.6) - cam.y) * k;
              cam.zoom += (1 - cam.zoom) * k;
              const sy = H * 0.42 - (rock.p.y - cam.y) * f0 * cam.zoom / Math.max(0.5, rock.p.z - cam.z);
              cam.lift += (clamp(H * 0.34 - sy, 0, H * 0.5) - cam.lift) * k;
              bars += (1 - bars) * k;
            }
            if (rock.t >= rock.end) impact();
          } else if (phase === 'impact') {
            phaseT += rdt;
            cam.lift += (0 - cam.lift) * kk * 0.5;
            if (!reduce && target.hit) cam.y += (Math.max(1.3, KINDS[target.kind].cy * 0.7) - cam.y) * kk * 0.3;
            if (phaseT > hold) afterImpact();
          }
          if (fadeDir > 0) {
            fade = Math.min(1, fade + rdt / 0.16);
            if (fade >= 1) { fadeDir = -1; const fn = afterFade; afterFade = null; if (fn) fn(); }
          } else if (fadeDir < 0) {
            fade = Math.max(0, fade - rdt / 0.3);
            if (fade <= 0) fadeDir = 0;
          }
          if (slowHold > 0 && phase !== 'flying') slowHold -= rdt;
          else if (phase !== 'flying' || !rock || !rock.slow) timeScale += (1 - timeScale) * Math.min(1, rdt * 3);
          if (phase === 'intro' || phase === 'ready' || phase === 'cut') bars += (0 - bars) * kk;
          rel = Math.max(0, rel - rdt / 0.32);
          shake = Math.max(0, shake - rdt * 2.4);
          flash = Math.max(0, flash - rdt * 2.2);
          animateTarget(dt);
          for (let i = parts.length - 1; i >= 0; i--) {
            const q = parts[i];
            q.life -= dt * q.fade;
            if (q.life <= 0) { parts.splice(i, 1); continue; }
            q.vy -= q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
            if (q.y < 0) { q.y = 0; q.vy *= -0.3; q.vx *= 0.6; q.vz *= 0.6; }
          }
          for (let i = pops.length - 1; i >= 0; i--) {
            const q = pops[i];
            q.life -= rdt; q.y += rdt * 0.5;
            if (q.life <= 0) pops.splice(i, 1);
          }
          // Wind streaks drift across the view so you can feel it
          if (wind && gusts.length < (reduce ? 3 : 10) && Math.random() < Math.abs(wind) * 0.25) {
            gusts.push({ x: wind > 0 ? -60 : W + 60, y: rand(H * 0.1, H * 0.75), len: rand(24, 60) * ui, sp: rand(0.8, 1.3) });
          }
          for (let i = gusts.length - 1; i >= 0; i--) {
            const g = gusts[i];
            g.x += wind * W * 0.55 * g.sp * dt;
            if (g.x < -80 || g.x > W + 80) gusts.splice(i, 1);
          }
          clouds.forEach((c) => { c.x += (1.2 + wind * 5) * dt; if (c.x > 360) c.x = -360; if (c.x < -360) c.x = 360; });
        }

        function animateTarget(dt) {
          const tg = target;
          if (!tg.hit) return;
          tg.hitT += dt;
          const t = tg.hitT;
          if (tg.kind === 'goliath') {
            if (tg.hit.bull) {
              const k = clamp((t - 0.15) / 1.1, 0, 1);
              tg.tilt = -k * k * (Math.PI / 2) * 0.97; // he falls on his face, toward David (1 Samuel 17:49)
              tg.lean = Math.sin(t * 6) * 0.04 * (1 - k);
              if (k >= 1 && !tg.landed) {
                tg.landed = true;
                for (let i = 0; i < 5; i++) dust({ x: tg.x + rand(-0.4, 0.4), y: 0, z: tg.z - 0.4 - i * 0.6 }, 6);
                if (!reduce) shake = Math.max(shake, 0.9);
                BP.buzz(60);
              }
            } else tg.lean = Math.sin(t * 9) * 0.07 * Math.exp(-t * 2.2) * (tg.hit.part === 'head' ? 1.4 : 1);
          } else if (tg.kind === 'jar') {
            tg.tilt = 0;
          } else if (tg.hit.bull) {
            tg.tilt = ease(clamp(t * 2.2, 0, 1)) * 1.3; // knocked over backwards
          } else {
            tg.tilt = 0.4 * Math.exp(-t * 2.5) * Math.sin(t * 11);
          }
        }

        function burst(p, n, colors, size, speed) {
          const count = reduce ? Math.ceil(n / 3) : n;
          for (let i = 0; i < count; i++) {
            const a = rand(0, Math.PI * 2), u = rand(0.3, 1);
            parts.push({ x: p.x, y: p.y, z: p.z - 0.05, vx: Math.cos(a) * speed * u, vy: Math.sin(a) * speed * u + 1.5, vz: -rand(0.5, 3),
              life: rand(0.7, 1.2), fade: 1, r: size * rand(0.5, 1.4), c: pick(colors), g: 9 });
          }
        }
        function dust(p, n) {
          const cols = dark ? ['#8C7B5A', '#6E6047', '#9A8A6A'] : ['#D9C08A', '#C8A870', '#E8D6A8'];
          const count = reduce ? Math.ceil(n / 3) : n;
          for (let i = 0; i < count; i++) {
            const a = rand(0, Math.PI * 2);
            parts.push({ x: p.x, y: 0.05, z: p.z, vx: Math.cos(a) * rand(0.3, 1.4), vy: rand(0.6, 2), vz: Math.sin(a) * rand(0.3, 1.2),
              life: rand(0.8, 1.3), fade: 0.9, r: rand(0.06, 0.16), c: pick(cols), g: 2.5 });
          }
        }

        function hud() {
          const left = totalStones - thrown;
          stonesEl.replaceChildren(...Array.from({ length: totalStones }, (_, i) => h('i', { class: i < left ? 'on' : '' })));
          stonesEl.setAttribute('aria-label', `${left} of ${totalStones} stones left`);
          scoreEl.textContent = `${score.toLocaleString('en-US')} pts`;
          const next = 1 + 0.25 * Math.min(4, streak);
          comboEl.hidden = streak < 1;
          comboEl.textContent = `Streak ${streak} · next hit ×${+next.toFixed(2)}`;
        }

        // The draining "shot value" meter. Full for GRACE seconds, then it ticks down.
        function valueUI(force) {
          let lbl, v;
          if (phase === 'ready') {
            const s = readyMs / 1000;
            v = shotValue(s);
            lbl = s < GRACE ? `Full points ${(GRACE - s).toFixed(1)}s` : 'Shot value';
          } else if (rock || phase === 'impact') {
            v = rock ? rock.value : (valFill.dataset.v ? +valFill.dataset.v : 1);
            lbl = 'Thrown at';
          } else { v = 1; lbl = 'Get ready'; }
          const key = lbl + v.toFixed(3);
          if (!force && key === shownVal) return;
          shownVal = key;
          valFill.dataset.v = String(v);
          valLbl.textContent = lbl;
          valPct.textContent = `${Math.round(v * 100)}%`;
          valFill.style.width = `${(v * 100).toFixed(1)}%`;
          valueEl.classList.toggle('warn', v < 0.75 && v >= 0.45);
          valueEl.classList.toggle('low', v < 0.45);
          valueEl.classList.toggle('grace', phase === 'ready' && readyMs / 1000 < GRACE);
        }

        // ---------- Drawing ----------
        function P(x, y, z) {
          const d = z - cam.z;
          if (d < 0.2) return null;
          const s = f / d;
          return { x: W / 2 + (x - cam.x) * s, y: hz - (y - cam.y) * s, s };
        }

        function draw(t, rdt) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          f = f0 * cam.zoom; hz = H * 0.42 + cam.lift;
          if (shake > 0) ctx.translate(rand(-7, 7) * shake * ui, rand(-5, 5) * shake * ui);
          drawSky(t);
          drawLand();
          // Things on the field, far to near
          const rockBehind = rock && rock.p.z > target.z;
          if (rockBehind) drawRock();
          drawFlag(t);
          drawTarget(t);
          drawParts();
          if (rock && !rockBehind) drawRock();
          drawGusts();
          drawLabel();
          const handA = 1 - bars;
          if (handA > 0.02) { ctx.globalAlpha = handA; drawStaff(); drawHand(t); ctx.globalAlpha = 1; }
          if (phase === 'ready') drawReticle(t);
          drawPops();
          // Cinema: letterbox on the chase, a white flash on a bullseye, a dip to black between stones
          if (bars > 0.01) {
            ctx.fillStyle = '#000';
            const bh = bars * H * 0.075;
            ctx.fillRect(-20, -20, W + 40, bh + 20); ctx.fillRect(-20, H - bh, W + 40, bh + 20);
          }
          if (timeScale < 0.8) {
            const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
            v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,8,30,${(0.8 - timeScale) * 0.7})`);
            ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
          }
          if (flash > 0) { ctx.fillStyle = `rgba(255,250,230,${flash})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
          if (fade > 0) { ctx.fillStyle = `rgba(8,10,28,${fade})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
        }

        function drawSky(t) {
          const g = ctx.createLinearGradient(0, 0, 0, hz);
          if (dark) { g.addColorStop(0, '#0B1033'); g.addColorStop(0.6, '#35306A'); g.addColorStop(1, '#C97E6C'); }
          else { g.addColorStop(0, '#3E9BE0'); g.addColorStop(0.6, '#A3D8F5'); g.addColorStop(1, '#FBE6C0'); }
          ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, hz + 22);
          if (dark) {
            ctx.fillStyle = '#FFFFFF';
            stars.forEach(([u, v, a]) => { ctx.globalAlpha = a * (0.7 + 0.3 * Math.sin(t * 2 + u * 40)); ctx.fillRect(u * W, v * hz * 0.8, 1.6, 1.6); });
            ctx.globalAlpha = 1;
          }
          const sx = W * 0.78 - cam.x * 3, sy = hz - H * 0.25;
          const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, H * 0.35);
          glow.addColorStop(0, dark ? 'rgba(255,236,200,.5)' : 'rgba(255,250,220,.95)');
          glow.addColorStop(1, 'rgba(255,240,200,0)');
          ctx.fillStyle = glow; ctx.fillRect(-20, -20, W + 40, hz + 22);
          ctx.fillStyle = dark ? '#FFF2D6' : '#FFF9E3';
          ctx.beginPath(); ctx.arc(sx, sy, H * (dark ? 0.035 : 0.045), 0, Math.PI * 2); ctx.fill();
          // Clouds, far away
          ctx.fillStyle = dark ? 'rgba(170,170,220,.1)' : 'rgba(255,255,255,.85)';
          clouds.forEach((c) => {
            const p = P(c.x, c.y + cam.y, 420 + cam.z);
            if (!p) return;
            [[0, 0, 1], [1.1, -0.45, 1.15], [2.2, 0, 0.95], [1.1, 0.3, 1]].forEach(([dx, dy, r]) => {
              ctx.beginPath(); ctx.arc(p.x + dx * c.r * p.s, p.y + dy * c.r * p.s, r * c.r * p.s, 0, Math.PI * 2); ctx.fill();
            });
          });
        }

        function ridgeFill(pts, z, color) {
          ctx.fillStyle = color;
          ctx.beginPath();
          const base = P(pts[0][0], -cam.y - 2, z);
          ctx.moveTo(base.x, base.y);
          pts.forEach(([x, y]) => { const p = P(x, y, z); ctx.lineTo(p.x, p.y); });
          const end = P(pts[pts.length - 1][0], -cam.y - 2, z);
          ctx.lineTo(end.x, end.y); ctx.closePath(); ctx.fill();
        }

        function drawLand() {
          // Far mountains and the two camps on their hills (1 Samuel 17:3)
          ridgeFill(ridge, 640 + cam.z, dark ? '#3A3C6E' : '#A9C2D2');
          ridgeFill(ridge2, 300 + cam.z * 0.5, dark ? '#323B60' : '#93B5A4');
          const hill = (pts, z, color) => {
            ctx.fillStyle = color; ctx.beginPath();
            pts.forEach(([x, y], i) => { const p = P(x, y, z); if (p) i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
            ctx.closePath(); ctx.fill();
          };
          const hillCol = dark ? '#2E3A57' : '#84AC83';
          hill([[-90, 0], [-70, 6], [-48, 10], [-28, 8], [-14, 3], [-8, 0]], 85, hillCol);
          hill([[8, 0], [16, 4], [34, 11], [60, 13], [95, 8], [120, 0]], 100, hillCol);
          tents([[-52, 10, 85], [-45, 10.2, 85], [-37, 9.4, 85]], dark ? '#B8A98A' : '#F2E6CC');
          tents([[40, 11.6, 100], [50, 12.4, 100], [62, 12.8, 100], [72, 12.3, 100]], dark ? '#8D6B76' : '#D9A79A');
          // The valley floor
          const gy = Math.max(hz, P(0, 0, 200).y);
          const g = ctx.createLinearGradient(0, hz, 0, H);
          if (dark) { g.addColorStop(0, '#4E5446'); g.addColorStop(0.25, '#3C4634'); g.addColorStop(1, '#232A1C'); }
          else { g.addColorStop(0, '#CBD7A0'); g.addColorStop(0.25, '#A9C26A'); g.addColorStop(1, '#7C9E3E'); }
          ctx.fillStyle = g; ctx.fillRect(-20, gy, W + 40, H - gy + 20);
          // Mown stripes give the ground its depth
          ctx.fillStyle = dark ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.09)';
          for (let z = 1; z < 80; z += 3) {
            if (z + 1.5 < cam.z + 0.3) continue;
            const a = P(0, 0, Math.max(z, cam.z + 0.3)), b = P(0, 0, z + 1.5);
            if (a && b) ctx.fillRect(-20, b.y, W + 40, a.y - b.y);
          }
          // The dirt path toward the Philistines
          quad(-1.1, 1.1, cam.z + 0.3, 140, dark ? '#6E6248' : '#D9C291');
          ctx.strokeStyle = dark ? 'rgba(0,0,0,.25)' : 'rgba(120,90,40,.25)'; ctx.lineWidth = 2;
          [-1.1, 1.1].forEach((x) => { const a = P(x, 0, cam.z + 0.3), b = P(x, 0, 140); if (a && b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } });
          ctx.fillStyle = dark ? '#857A62' : '#BBA474';
          pebbles.forEach((q) => { const p = P(q.x, 0, q.z); if (p) { ctx.beginPath(); ctx.ellipse(p.x, p.y, q.r * p.s, q.r * p.s * 0.45, 0, 0, Math.PI * 2); ctx.fill(); } });
          // The brook where David chose his stones (1 Samuel 17:40)
          if (cam.z < 7.2) {
            const bw = quad(-90, 90, Math.max(6.2, cam.z + 0.3), 7.2, dark ? '#3E5F94' : '#7CC7EE');
            if (bw) {
              ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
              for (let i = 0; i < 6; i++) {
                const x = -6 + i * 2.4 + Math.sin(i * 7) * 0.6, p = P(x, 0, 6.7);
                if (p) { ctx.beginPath(); ctx.moveTo(p.x - 0.3 * p.s, p.y); ctx.lineTo(p.x + 0.3 * p.s, p.y); ctx.stroke(); }
              }
              ctx.fillStyle = dark ? '#A3A3B5' : '#EDE8DC';
              [[-0.5, 6.45], [0.15, 6.75], [0.7, 6.5], [-2.6, 6.9], [2.4, 6.8], [3.1, 6.55]].forEach(([x, z]) => {
                const p = P(x, 0, z); if (p) { ctx.beginPath(); ctx.ellipse(p.x, p.y, 0.16 * p.s, 0.06 * p.s, 0, 0, Math.PI * 2); ctx.fill(); }
              });
            }
          }
          // Distance cairns
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          [10, 20, 30].forEach((d) => {
            const p = P(-2.4, 0, d);
            if (!p) return;
            ctx.fillStyle = dark ? '#8A8A96' : '#CFC8B8';
            [[0, 0.06, 0.22], [0.02, 0.17, 0.16], [-0.01, 0.26, 0.1]].forEach(([dx, y, r]) => {
              const q = P(-2.4 + dx, y, d); ctx.beginPath(); ctx.ellipse(q.x, q.y, r * q.s, r * q.s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
            });
            if (p.s > 14) {
              const q = P(-2.4, 0.55, d);
              ctx.font = `700 ${Math.round(clamp(p.s * 0.22, 9, 14))}px "Chakra Petch", sans-serif`;
              ctx.fillStyle = dark ? 'rgba(255,255,255,.7)' : 'rgba(40,40,20,.6)';
              ctx.fillText(`${d} m`, q.x, q.y);
            }
          });
          // Grass and bushes
          const paths = [new Path2D(), new Path2D()];
          tufts.forEach((q) => {
            if (q.z < cam.z + 0.4) return;
            const p = P(q.x, 0, q.z);
            if (!p || p.x < -30 || p.x > W + 30) return;
            const hh = q.h * p.s;
            if (hh < 1.5) return;
            const pt = paths[q.k ? 1 : 0];
            pt.moveTo(p.x, p.y); pt.lineTo(p.x - hh * 0.35, p.y - hh * 0.8);
            pt.moveTo(p.x, p.y); pt.lineTo(p.x + hh * 0.05, p.y - hh);
            pt.moveTo(p.x, p.y); pt.lineTo(p.x + hh * 0.4, p.y - hh * 0.75);
          });
          ctx.lineCap = 'round';
          ctx.lineWidth = Math.max(1, 1.6 * ui);
          ctx.strokeStyle = dark ? '#5C7040' : '#5F8A2C'; ctx.stroke(paths[0]);
          ctx.strokeStyle = dark ? '#6E8450' : '#86AE45'; ctx.stroke(paths[1]);
          bushes.forEach((b) => {
            if (b.z < cam.z + 0.5) return;
            const p = P(b.x, b.r * 0.7, b.z);
            if (!p) return;
            ctx.fillStyle = dark ? '#2C3B2A' : '#5E8C3A';
            [[-0.6, 0, 0.8], [0.5, 0.05, 0.75], [0, 0.35, 0.85]].forEach(([dx, dy, r]) => {
              ctx.beginPath(); ctx.arc(p.x + dx * b.r * p.s, p.y - dy * b.r * p.s, r * b.r * p.s, 0, Math.PI * 2); ctx.fill();
            });
          });
          // Stones that already flew
          ctx.fillStyle = dark ? '#B9B6AE' : '#8E8A80';
          marks.forEach((m) => { const p = P(m.x, 0, m.z); if (p) { ctx.beginPath(); ctx.ellipse(p.x, p.y, Math.max(1, 0.05 * p.s), Math.max(0.8, 0.03 * p.s), 0, 0, Math.PI * 2); ctx.fill(); } });
        }
        function quad(x0, x1, z0, z1, color) {
          const a = P(x0, 0, z0), b = P(x1, 0, z0), c = P(x1, 0, z1), d = P(x0, 0, z1);
          if (!a || !b || !c || !d) return false;
          ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); ctx.fill();
          return true;
        }
        function tents(list, color) {
          list.forEach(([x, y, z]) => {
            const p = P(x, y, z);
            if (!p) return;
            const w = 2.2 * p.s, hh = 1.8 * p.s;
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(p.x - w, p.y); ctx.lineTo(p.x, p.y - hh); ctx.lineTo(p.x + w, p.y); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.moveTo(p.x, p.y - hh); ctx.lineTo(p.x + w, p.y); ctx.lineTo(p.x + w * 0.2, p.y); ctx.closePath(); ctx.fill();
          });
        }

        // A little wind flag beside each target: it streams with the wind and hangs when calm.
        function drawFlag(t) {
          const fx = target.x + (target.x > 0 ? -1.9 : 1.9), fz = target.z + 0.4;
          const base = P(fx, 0, fz), top = P(fx, 2.5, fz);
          if (!base || !top) return;
          ctx.strokeStyle = dark ? '#A08A6A' : '#6B4524'; ctx.lineWidth = Math.max(1.2, 0.045 * base.s); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(top.x, top.y); ctx.stroke();
          const str = Math.abs(wind) / 0.8, dir = Math.sign(wind) || 1;
          const len = 0.3 + str * 0.6, n = 8;
          ctx.fillStyle = '#E8590C';
          ctx.beginPath(); ctx.moveTo(top.x, top.y);
          for (let i = 1; i <= n; i++) {
            const u = i / n;
            const wav = Math.sin(t * (4 + str * 6) - u * 5) * 0.05 * u * (0.3 + str);
            const droop = (1 - Math.min(1, str * 1.6)) * u * 0.45;
            const p = P(fx + dir * len * u * (1 - droop * 0.6), 2.5 - 0.12 * u - droop + wav, fz);
            ctx.lineTo(p.x, p.y);
          }
          for (let i = n; i >= 0; i--) {
            const u = i / n;
            const wav = Math.sin(t * (4 + str * 6) - u * 5) * 0.05 * u * (0.3 + str);
            const droop = (1 - Math.min(1, str * 1.6)) * u * 0.45;
            const p = P(fx + dir * len * u * (1 - droop * 0.6), 2.5 - 0.28 + 0.12 * u - droop + wav, fz);
            ctx.lineTo(p.x, p.y);
          }
          ctx.closePath(); ctx.fill();
        }

        function drawGusts() {
          if (!gusts.length) return;
          ctx.strokeStyle = dark ? 'rgba(220,220,255,.22)' : 'rgba(255,255,255,.55)';
          ctx.lineWidth = 1.6 * ui; ctx.lineCap = 'round';
          ctx.beginPath();
          gusts.forEach((g) => { ctx.moveTo(g.x, g.y); ctx.lineTo(g.x - Math.sign(wind) * g.len, g.y); });
          ctx.stroke();
        }

        // ---------- Targets, drawn in their own metres so they sit in the 3D scene ----------
        function tp(lx, ly) {
          const tg = target;
          return P(tg.x + lx + ly * tg.lean, ly * Math.cos(tg.tilt), tg.z + ly * Math.sin(tg.tilt));
        }
        function poly(pts) {
          ctx.beginPath();
          for (let i = 0; i < pts.length; i++) {
            const p = tp(pts[i][0], pts[i][1]);
            if (!p) return false;
            if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
          }
          ctx.closePath();
          return true;
        }
        function disc(lx, ly, r) {
          const p = tp(lx, ly);
          if (!p) return false;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, Math.max(0.5, r * p.s), Math.max(0.5, r * p.s * Math.abs(Math.cos(target.tilt))), 0, 0, Math.PI * 2);
          return true;
        }
        function line(pts, w, color) {
          ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          const p0 = tp(pts[0][0], pts[0][1]);
          if (!p0) return;
          ctx.lineWidth = Math.max(1, w * p0.s);
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y);
          for (let i = 1; i < pts.length; i++) { const p = tp(pts[i][0], pts[i][1]); if (p) ctx.lineTo(p.x, p.y); }
          ctx.stroke();
        }
        function groundShadow(x, z, r) {
          const p = P(x, 0, z);
          if (!p) return;
          const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, r * p.s);
          g.addColorStop(0, 'rgba(20,15,5,.35)'); g.addColorStop(1, 'rgba(20,15,5,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * p.s, r * p.s * clamp(cam.y / (z - cam.z), 0.08, 0.45), 0, 0, Math.PI * 2); ctx.fill();
        }

        function drawTarget(t) {
          if (target.z < cam.z + 0.5) return;
          const k = target.kind;
          groundShadow(target.x, target.z, k === 'goliath' ? 1.1 : 0.7);
          if (k === 'goliath') goliath(t);
          else if (k === 'jar') jar();
          else if (k === 'standard') standard(t);
          else shield();
          // A dent where the stone struck
          const z = target.hit;
          if (z && !target.broken && !(k === 'goliath' && z.bull)) {
            if (disc(z.lx, z.ly, 0.045)) { ctx.fillStyle = 'rgba(40,25,10,.75)'; ctx.fill(); }
          }
        }

        function rings(cy, R, colors) {
          for (let i = 4; i >= 0; i--) {
            if (!disc(0, cy, R * (i + 1) / 5)) return;
            ctx.fillStyle = colors[i]; ctx.fill();
            ctx.strokeStyle = 'rgba(40,20,5,.35)'; ctx.lineWidth = 1; ctx.stroke();
          }
          const c = tp(0, cy);
          if (!c) return;
          const g = ctx.createRadialGradient(c.x - R * c.s * 0.4, c.y - R * c.s * 0.5, 1, c.x, c.y, R * c.s);
          g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.18)');
          if (disc(0, cy, R)) { ctx.fillStyle = g; ctx.fill(); }
        }

        function shield() {
          const cy = KINDS.shield.cy, R = target.R;
          line([[0, 0.55], [-0.35, 0]], 0.05, '#5A3A1E');
          line([[0, 0.55], [0.35, 0]], 0.05, '#5A3A1E');
          line([[0, 0], [0, cy]], 0.09, '#6B4524');
          if (disc(0, cy, R * 1.06)) { ctx.fillStyle = '#7A4E1C'; ctx.fill(); }
          rings(cy, R, ['#C92A2A', '#F3E3BE', '#C8923E', '#F3E3BE', '#B07A2E']);
          ctx.fillStyle = '#F2D48A';
          for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2;
            if (disc(Math.cos(a) * R * 1.0, cy + Math.sin(a) * R * 1.0, 0.022)) ctx.fill();
          }
          if (disc(0, cy, R * 0.07)) { ctx.fillStyle = '#FFE066'; ctx.fill(); }
        }

        function jar() {
          const cy = KINDS.jar.cy, R = target.R;
          // flat rock it stands on
          if (poly([[-0.75, 0], [-0.6, 0.12], [0.55, 0.14], [0.8, 0]])) { ctx.fillStyle = dark ? '#7C7A86' : '#A9A49A'; ctx.fill(); }
          const prof = [[0.2, 0.1], [0.42, 0.25], [0.6, 0.6], [0.64, 0.95], [0.56, 1.3], [0.32, 1.52], [0.19, 1.6], [0.25, 1.7]];
          if (target.broken) {
            const shard = [[-0.42, 0.25], [-0.2, 0.1], [0.2, 0.1], [0.42, 0.25], [0.5, 0.42], [0.3, 0.36], [0.18, 0.5], [0, 0.34], [-0.2, 0.48], [-0.32, 0.33], [-0.5, 0.42]];
            if (poly(shard)) { ctx.fillStyle = '#B5652F'; ctx.fill(); }
            return;
          }
          const pts = prof.concat([[-0.25, 1.7]]).concat(prof.slice(0, -1).reverse().map(([x, y]) => [-x, y]));
          if (!poly(pts)) return;
          const l = tp(-0.64, cy), r = tp(0.64, cy);
          const g = ctx.createLinearGradient(l.x, 0, r.x, 0);
          g.addColorStop(0, '#E9A56C'); g.addColorStop(0.45, '#C8753F'); g.addColorStop(1, '#7E4220');
          ctx.fillStyle = g; ctx.fill();
          rings(cy, R, ['#F2C14E', '#8E3B1F', '#F1E4CC', '#8E3B1F', '#F1E4CC']);
          if (poly([[-0.25, 1.66], [0.25, 1.66], [0.25, 1.72], [-0.25, 1.72]])) { ctx.fillStyle = '#6E3A1C'; ctx.fill(); }
        }

        function standard(t) {
          const cy = KINDS.standard.cy, R = target.R, str = Math.abs(wind) / 0.8;
          line([[0, 0], [0, 3.0]], 0.07, '#5A3A1E');
          line([[-0.72, 2.82], [0.72, 2.82]], 0.05, '#5A3A1E');
          if (disc(0, 3.05, 0.08)) { ctx.fillStyle = '#E9C46A'; ctx.fill(); }
          line([[-0.5, 2.82], [-0.4, cy + R * 0.8]], 0.015, '#3B2A1A');
          line([[0.5, 2.82], [0.4, cy + R * 0.8]], 0.015, '#3B2A1A');
          // streamers under the banner
          [-0.35, 0, 0.35].forEach((x, i) => {
            const pts = [];
            for (let j = 0; j <= 5; j++) {
              const u = j / 5;
              pts.push([x + Math.sign(wind) * u * 0.35 * str + Math.sin(t * 5 + i + u * 4) * 0.05 * u, cy - R * 0.9 - u * 0.55]);
            }
            line(pts, 0.05, i === 1 ? '#E9C46A' : '#7B4FB0');
          });
          if (disc(0, cy, R * 1.05)) { ctx.fillStyle = '#E9C46A'; ctx.fill(); }
          rings(cy, R, ['#D6336C', '#E9C46A', '#5B3A8C', '#E9C46A', '#3F2766']);
        }

        // An original giant, front on, feet at (0, 0). Six cubits and a span (1 Samuel 17:4).
        function goliath(t) {
          const breathe = target.hit ? 0 : Math.sin(t * 2) * 0.012;
          const skin = '#9C6644', bronzeA = '#E2B65E', bronzeB = '#9A6A26';
          const sh = tp(-0.56, 2.2), sh2 = tp(0.56, 2.2);
          if (!sh || !sh2) return;
          const bronze = ctx.createLinearGradient(sh.x, 0, sh2.x, 0);
          bronze.addColorStop(0, bronzeA); bronze.addColorStop(0.55, '#C08A3A'); bronze.addColorStop(1, bronzeB);
          // Spear like a weaver's beam (1 Samuel 17:7)
          line([[0.8, 0.05], [0.8, 3.45]], 0.075, '#5E3C1E');
          if (poly([[0.8, 3.75], [0.86, 3.45], [0.8, 3.4], [0.74, 3.45]])) { ctx.fillStyle = '#A7B0BA'; ctx.fill(); }
          // Legs, greaves of brass (17:6) and sandals
          ctx.fillStyle = skin;
          if (poly([[-0.33, 0.04], [-0.1, 0.04], [-0.12, 1.22], [-0.35, 1.22]])) ctx.fill();
          if (poly([[0.1, 0.04], [0.33, 0.04], [0.35, 1.22], [0.12, 1.22]])) ctx.fill();
          ctx.fillStyle = bronze;
          if (poly([[-0.35, 0.14], [-0.08, 0.14], [-0.09, 0.72], [-0.36, 0.72]])) ctx.fill();
          if (poly([[0.08, 0.14], [0.35, 0.14], [0.36, 0.72], [0.09, 0.72]])) ctx.fill();
          ctx.fillStyle = '#3B2614';
          if (poly([[-0.4, 0], [-0.06, 0], [-0.06, 0.06], [-0.4, 0.06]])) ctx.fill();
          if (poly([[0.06, 0], [0.4, 0], [0.4, 0.06], [0.06, 0.06]])) ctx.fill();
          // Kilt and belt
          if (poly([[-0.47, 1.12], [0.47, 1.12], [0.41, 1.56 + breathe], [-0.41, 1.56 + breathe]])) { ctx.fillStyle = '#6E2B2B'; ctx.fill(); }
          for (let i = -3; i <= 3; i++) line([[i * 0.12, 1.14], [i * 0.11, 1.5]], 0.012, 'rgba(0,0,0,.25)');
          if (poly([[-0.45, 1.5 + breathe], [0.45, 1.5 + breathe], [0.45, 1.62 + breathe], [-0.45, 1.62 + breathe]])) { ctx.fillStyle = bronzeB; ctx.fill(); }
          // Coat of mail (17:5)
          const b = breathe;
          if (poly([[-0.45, 1.6 + b], [0.45, 1.6 + b], [0.57, 2.24 + b], [0.3, 2.42 + b], [-0.3, 2.42 + b], [-0.57, 2.24 + b]])) { ctx.fillStyle = bronze; ctx.fill(); }
          for (let r = 0; r < 7; r++) {
            const y = 1.68 + r * 0.1 + b, wdt = 0.43 + r * 0.015, pts = [];
            for (let i = 0; i <= 12; i++) pts.push([-wdt + i * wdt / 6, y + (i % 2 ? -0.025 : 0.02)]);
            line(pts, 0.012, 'rgba(70,40,10,.4)');
          }
          // Arms: one holds the spear, one rests on the sword
          line([[0.55, 2.2 + b], [0.72, 1.95], [0.79, 1.72]], 0.17, skin);
          line([[-0.55, 2.2 + b], [-0.68, 1.85], [-0.62, 1.5]], 0.17, skin);
          line([[-0.55, 2.22 + b], [-0.63, 2.0]], 0.2, bronzeA);
          line([[0.55, 2.22 + b], [0.63, 2.0]], 0.2, bronzeB);
          line([[-0.55, 1.42], [-0.66, 0.78]], 0.05, '#C9CED6');
          line([[-0.5, 1.47], [-0.64, 1.43]], 0.05, '#7A5A2A');
          if (disc(0.79, 1.72, 0.09)) { ctx.fillStyle = skin; ctx.fill(); }
          if (disc(-0.6, 1.47, 0.085)) { ctx.fillStyle = skin; ctx.fill(); }
          // Neck, head and beard
          ctx.fillStyle = skin;
          if (poly([[-0.1, 2.38 + b], [0.1, 2.38 + b], [0.1, 2.5 + b], [-0.1, 2.5 + b]])) ctx.fill();
          if (disc(0, 2.64 + b, 0.22)) ctx.fill();
          if (poly([[-0.21, 2.6 + b], [0.21, 2.6 + b], [0.17, 2.44 + b], [0, 2.32 + b], [-0.17, 2.44 + b]])) { ctx.fillStyle = '#2B1C10'; ctx.fill(); }
          ctx.fillStyle = '#1A120A';
          if (disc(-0.075, 2.66 + b, 0.026)) ctx.fill();
          if (disc(0.075, 2.66 + b, 0.026)) ctx.fill();
          line([[-0.13, 2.73 + b], [-0.03, 2.7 + b]], 0.022, '#1A120A');
          line([[0.13, 2.73 + b], [0.03, 2.7 + b]], 0.022, '#1A120A');
          // Helmet of brass (17:5), leaving the forehead bare
          const dome = [];
          for (let i = 0; i <= 12; i++) { const a = Math.PI - i / 12 * Math.PI; dome.push([Math.cos(a) * 0.255, 2.84 + b + Math.sin(a) * 0.23]); }
          if (poly(dome)) { ctx.fillStyle = bronze; ctx.fill(); }
          if (poly([[-0.26, 2.82 + b], [0.26, 2.82 + b], [0.26, 2.88 + b], [-0.26, 2.88 + b]])) { ctx.fillStyle = bronzeB; ctx.fill(); }
          if (poly([[-0.26, 2.84 + b], [-0.25, 2.56 + b], [-0.19, 2.6 + b], [-0.2, 2.84 + b]])) { ctx.fillStyle = bronzeB; ctx.fill(); }
          if (poly([[0.26, 2.84 + b], [0.25, 2.56 + b], [0.19, 2.6 + b], [0.2, 2.84 + b]])) { ctx.fillStyle = bronzeB; ctx.fill(); }
          const crest = [];
          for (let i = 0; i <= 10; i++) { const a = Math.PI - i / 10 * Math.PI; crest.push([Math.cos(a) * 0.2, 3.04 + b + Math.sin(a) * 0.16]); }
          if (poly(crest)) { ctx.fillStyle = '#9E2A2A'; ctx.fill(); }
          // A soft glint on the forehead while you aim: that's the bullseye
          if (!target.hit && (phase === 'ready' || phase === 'intro')) {
            if (disc(0, KINDS.goliath.cy + b, KINDS.goliath.R)) {
              ctx.strokeStyle = `rgba(255,224,102,${0.45 + 0.3 * Math.sin(t * 4)})`; ctx.lineWidth = Math.max(1, 1.5 * ui); ctx.stroke();
            }
          }
        }

        function drawRock() {
          const p = rock.p, sp = P(p.x, p.y, p.z);
          if (!sp) return;
          // Motion blur trail, tapering into the distance
          const tr = rock.trail;
          ctx.lineCap = 'round';
          for (let i = 1; i < tr.length; i++) {
            const a = P(tr[i - 1].x, tr[i - 1].y, tr[i - 1].z), b = P(tr[i].x, tr[i].y, tr[i].z);
            if (!a || !b) continue;
            const u = i / tr.length;
            ctx.strokeStyle = `rgba(255,255,255,${0.45 * u})`;
            ctx.lineWidth = Math.max(1, STONE_R * 2.2 * b.s * u);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
          // shadow on the ground
          const gp = P(p.x, 0, p.z);
          if (gp) {
            ctx.globalAlpha = clamp(0.45 - p.y * 0.06, 0.08, 0.45);
            ctx.fillStyle = '#1A1408'; ctx.beginPath(); ctx.ellipse(gp.x, gp.y, Math.max(1.5, 0.06 * gp.s), Math.max(0.8, 0.02 * gp.s), 0, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
          }
          stoneAt(sp.x, sp.y, Math.max(2, STONE_R * 1.4 * sp.s));
        }
        function stoneAt(x, y, r) {
          const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
          g.addColorStop(0, '#F7F4EC'); g.addColorStop(0.6, '#B8B3A8'); g.addColorStop(1, '#6F6B62');
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 1.08, r, -0.3, 0, Math.PI * 2); ctx.fill();
        }

        function drawParts() {
          parts.forEach((q) => {
            const p = P(q.x, q.y, q.z);
            if (!p) return;
            ctx.globalAlpha = clamp(q.life * 1.3, 0, 1);
            ctx.fillStyle = q.c;
            ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.8, q.r * p.s), 0, Math.PI * 2); ctx.fill();
          });
          ctx.globalAlpha = 1;
        }

        function pill(text, x, y, size, bg, fg) {
          ctx.font = `700 ${Math.round(size)}px "Chakra Petch", sans-serif`;
          const w = ctx.measureText(text).width + size * 1.1, hh = size * 1.7;
          ctx.fillStyle = bg; rr(x - w / 2, y - hh / 2, w, hh, hh / 2); ctx.fill();
          ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1);
        }
        function rr(x, y, w, hh, r) {
          ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r);
          ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
        }
        function drawLabel() {
          if (phase !== 'ready' && phase !== 'intro') return;
          const p = P(target.x, 0, target.z);
          if (p) pill(`${target.z} m`, p.x, p.y + 16 * ui, 11 * ui, 'rgba(12,14,40,.55)', '#FFFFFF');
        }

        // ---------- David's own hands, in the foreground ----------
        function drawStaff() {
          const u = ui;
          const x0 = W * 0.02, y0 = H + 20, x1 = W * 0.16, y1 = H * 0.6;
          const g = ctx.createLinearGradient(x0 - 10, 0, x0 + 16 * u, 0);
          g.addColorStop(0, '#5A3A1E'); g.addColorStop(0.5, '#8A5E34'); g.addColorStop(1, '#4A2E16');
          ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.lineWidth = 15 * u;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(W * 0.11, H * 0.8, x1, y1); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,230,190,.18)'; ctx.lineWidth = 3 * u;
          ctx.beginPath(); ctx.moveTo(x0 - 3 * u, y0); ctx.quadraticCurveTo(W * 0.11 - 4 * u, H * 0.8, x1 - 4 * u, y1); ctx.stroke();
          // left hand gripping it
          const hx = W * 0.105, hy = H * 0.84;
          ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.35);
          handShape(0, 0, u * 0.9, true);
          ctx.restore();
        }
        function handShape(x, y, u, grip) {
          const g = ctx.createLinearGradient(x - 20 * u, y - 20 * u, x + 20 * u, y + 20 * u);
          g.addColorStop(0, '#C48558'); g.addColorStop(1, '#8A5534');
          ctx.fillStyle = g;
          rr(x - 20 * u, y - 17 * u, 40 * u, 36 * u, 13 * u); ctx.fill();
          ctx.strokeStyle = 'rgba(70,35,15,.45)'; ctx.lineWidth = 1.6 * u; ctx.lineCap = 'round';
          ctx.beginPath();
          for (let i = 0; i < 3; i++) { const fx = x - 10 * u + i * 10 * u; ctx.moveTo(fx, y - 15 * u); ctx.lineTo(fx, y - (grip ? 3 : 6) * u); }
          ctx.stroke();
          ctx.fillStyle = '#B67A4F';
          ctx.beginPath(); ctx.ellipse(x - 18 * u, y + 2 * u, 7 * u, 12 * u, 0.5, 0, Math.PI * 2); ctx.fill();
        }
        function drawHand(t) {
          const u = ui;
          const A = { x: W * 0.62, y: H * 0.8 + Math.sin(t * 1.6) * 1.5 * u };
          // forearm and sleeve, coming in from the lower right
          const E = { x: A.x + 70 * u, y: H + 20 * u };      // where the arm leaves the picture
          const ax = E.x - A.x, ay = E.y - A.y, al = Math.hypot(ax, ay), nx0 = -ay / al, ny0 = ax / al;
          const arm = ctx.createLinearGradient(A.x + nx0 * 16 * u, A.y + ny0 * 16 * u, A.x - nx0 * 16 * u, A.y - ny0 * 16 * u);
          arm.addColorStop(0, '#7A4A2C'); arm.addColorStop(0.5, '#A86C44'); arm.addColorStop(1, '#8E5A36');
          ctx.fillStyle = arm; ctx.beginPath();
          ctx.moveTo(A.x + nx0 * 13 * u, A.y + ny0 * 13 * u); ctx.lineTo(E.x + nx0 * 24 * u, E.y + ny0 * 24 * u);
          ctx.lineTo(E.x - nx0 * 24 * u, E.y - ny0 * 24 * u); ctx.lineTo(A.x - nx0 * 13 * u, A.y - ny0 * 13 * u); ctx.closePath(); ctx.fill();
          // tunic sleeve with a red band, just at the edge of the view
          const k0 = 0.78, cx0 = A.x + ax * k0, cy0 = A.y + ay * k0;
          ctx.fillStyle = dark ? '#CFC2A6' : '#EFE3C6'; ctx.beginPath();
          ctx.moveTo(cx0 + nx0 * 27 * u, cy0 + ny0 * 27 * u); ctx.lineTo(E.x + ax * 0.4 + nx0 * 34 * u, E.y + ay * 0.4 + ny0 * 34 * u);
          ctx.lineTo(E.x + ax * 0.4 - nx0 * 34 * u, E.y + ay * 0.4 - ny0 * 34 * u); ctx.lineTo(cx0 - nx0 * 27 * u, cy0 - ny0 * 27 * u); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#B0472E'; ctx.lineWidth = 5 * u; ctx.lineCap = 'butt';
          const k1 = 0.86, bx = A.x + ax * k1, by = A.y + ay * k1;
          ctx.beginPath(); ctx.moveTo(bx + nx0 * 29 * u, by + ny0 * 29 * u); ctx.lineTo(bx - nx0 * 29 * u, by - ny0 * 29 * u); ctx.stroke();
          // where is the pouch?
          let pouch, loaded = phase === 'ready' || phase === 'intro', rot = 0;
          if (phase === 'ready' && drag) {
            let dx = drag.dx, dy = drag.dy;
            const L = Math.hypot(dx, dy), max = 120 * u;
            if (L > max) { dx *= max / L; dy *= max / L; }
            pouch = { x: A.x + dx * 0.7, y: A.y + 40 * u + dy * 0.7 };
          } else if (phase === 'ready' && charge > 0) {
            pouch = { x: A.x, y: A.y + 40 * u + 80 * u * charge };
          } else if (rel > 0) {
            const k = 1 - rel, ang = Math.PI / 2 - k * Math.PI * 1.25, rad = 70 * u * (1 - k * 0.25);
            pouch = { x: A.x + Math.cos(ang) * rad, y: A.y + Math.sin(ang) * rad };
            rot = k;
            ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3 * u;
            ctx.beginPath(); ctx.arc(A.x, A.y, rad, Math.PI / 2, ang, true); ctx.stroke();
          } else {
            pouch = { x: A.x + Math.sin(t * 2) * 3 * u, y: A.y + 40 * u };
          }
          // the two cords of the sling
          const ang = Math.atan2(pouch.y - A.y, pouch.x - A.x);
          const nx = -Math.sin(ang), ny = Math.cos(ang);
          ctx.strokeStyle = '#5B3B20'; ctx.lineWidth = 2.4 * u;
          ctx.beginPath();
          ctx.moveTo(A.x - 6 * u, A.y); ctx.lineTo(pouch.x + nx * 11 * u, pouch.y + ny * 11 * u);
          ctx.moveTo(A.x + 6 * u, A.y); ctx.lineTo(pouch.x - nx * 11 * u, pouch.y - ny * 11 * u);
          ctx.stroke();
          // the leather pouch, with a smooth stone in it
          ctx.save(); ctx.translate(pouch.x, pouch.y); ctx.rotate(ang - Math.PI / 2 + rot * 0.5);
          ctx.fillStyle = '#7A5230';
          ctx.beginPath(); ctx.ellipse(0, 2 * u, 15 * u, 10 * u, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          if (loaded) stoneAt(pouch.x, pouch.y - 1 * u, 10 * u);
          ctx.fillStyle = '#5E3E22';
          ctx.beginPath(); ctx.ellipse(pouch.x, pouch.y + 5 * u, 14 * u, 5 * u, ang - Math.PI / 2, 0, Math.PI); ctx.fill();
          // the fist holding the cords, drawn last so the fingers wrap them
          ctx.save(); ctx.translate(A.x, A.y); ctx.rotate(-0.15);
          handShape(0, 0, u, false);
          ctx.restore();
          // pull strength ring
          if (phase === 'ready' && charge > 0) {
            ctx.strokeStyle = charge >= 1 ? '#FFD43B' : 'rgba(255,255,255,.8)'; ctx.lineWidth = 3 * u;
            ctx.beginPath(); ctx.arc(pouch.x, pouch.y, 20 * u, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2); ctx.stroke();
          }
        }

        function drawReticle(t) {
          const R = reticle(), p = P(R.x, R.y, target.z);
          if (!p) return;
          const active = !!drag || kbCharge;
          const r = 13 * ui;
          ctx.save(); ctx.translate(p.x, p.y);
          ctx.globalAlpha = active ? 0.95 : 0.6;
          const ring = () => {
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
            [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => { ctx.moveTo(dx * (r + 7 * ui), dy * (r + 7 * ui)); ctx.lineTo(dx * (r - 5 * ui), dy * (r - 5 * ui)); });
          };
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(10,10,30,.55)'; ctx.lineWidth = 4.5 * ui; ring(); ctx.stroke();
          ctx.strokeStyle = active ? '#FFFFFF' : 'rgba(255,255,255,.9)'; ctx.lineWidth = 2 * ui; ring(); ctx.stroke();
          ctx.fillStyle = active ? '#FFD43B' : '#FFFFFF';
          ctx.beginPath(); ctx.arc(0, 0, 2.2 * ui, 0, Math.PI * 2); ctx.fill();
          if (charge > 0) {
            ctx.strokeStyle = charge >= 1 ? '#FFD43B' : 'rgba(255,212,59,.75)'; ctx.lineWidth = 3 * ui;
            ctx.beginPath(); ctx.arc(0, 0, r + 4 * ui, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2); ctx.stroke();
          }
          ctx.restore();
        }

        function drawPops() {
          pops.forEach((q) => {
            const p = P(q.x, q.y, q.z);
            if (!p) return;
            const a = clamp(q.life * 1.6, 0, 1), grow = 1 + Math.max(0, q.life - 1.3) * 1.2;
            const x = clamp(p.x, 60 * ui, W - 60 * ui), y = clamp(p.y - 20 * ui, 60 * ui, H - 40 * ui);
            ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
            ctx.font = `700 ${Math.round(28 * ui * grow)}px "Chakra Petch", sans-serif`;
            ctx.lineWidth = 6 * ui; ctx.strokeStyle = 'rgba(16,14,40,.8)';
            ctx.strokeText(q.text, x, y); ctx.fillStyle = q.c; ctx.fillText(q.text, x, y);
            if (q.sub) {
              ctx.font = `700 ${Math.round(15 * ui)}px "Chakra Petch", sans-serif`;
              ctx.lineWidth = 5 * ui; ctx.strokeText(q.sub, x, y - 26 * ui * grow);
              ctx.fillStyle = '#FFFFFF'; ctx.fillText(q.sub, x, y - 26 * ui * grow);
            }
          });
          ctx.globalAlpha = 1;
        }

        // ---------- End of the round ----------
        function end() {
          if (over) return;
          over = true; phase = 'over'; unlisten();
          const perfect = hits === thrown && hits >= STONES;
          const bonus = perfect ? 300 : 0;
          const secs = Math.round(playMs / 1000);
          const penalty = Math.min(Math.round(score * PEN_CAP), Math.max(0, Math.round((secs - PAR) * PEN_PER_SEC)));
          const points = Math.max(0, score + bonus - penalty);
          const best = store.get('sling-best', 0);
          if (points > best) store.set('sling-best', points);
          if (hits >= 4 || felled) BP.confetti();
          const verse = pick(VERSES);
          const title = felled && perfect ? 'Five for five and Goliath is down! Giant slayer!'
            : felled ? 'Goliath is down! The battle is the LORD’s.'
            : hits >= 3 ? 'You know your sling! Goliath is nervous.'
            : hits >= 1 ? 'Good aim! Run it back.' : 'No worries. Pick up your stones and go again.';
          const detail = `${hits}/${thrown} hits · ${bulls} bullseye${bulls === 1 ? '' : 's'}`;
          setTimeout(() => {
            cleanup();
            body.replaceChildren(h('div', { class: 'result', style: 'display:grid;gap:14px' },
              h('p', { class: 'big-score' }, points.toLocaleString('en-US')),
              h('p', null, `${detail} · ${clock(secs)}${felled ? ' · Goliath felled' : ''}`),
              h('ul', { class: 'sl3-tally' },
                h('li', null, h('span', null, 'Throws'), h('b', null, `+${score.toLocaleString('en-US')}`)),
                bonus ? h('li', null, h('span', null, 'Five for five'), h('b', null, `+${bonus}`)) : null,
                h('li', { class: penalty ? 'minus' : '' }, h('span', null, `Round clock ${clock(secs)} (par ${clock(PAR)})`), h('b', null, penalty ? `−${penalty}` : '0')),
                bestStreak > 1 ? h('li', null, h('span', null, 'Best streak'), h('b', null, `${bestStreak} in a row`)) : null),
              h('h2', { class: 'panel-title' }, title),
              won.length ? h('div', { class: 'sling-won' },
                h('h3', null, `Goliath facts you won (${won.length})`),
                h('ul', null, won.map((fc) => h('li', null, fc.t, ' ', h('span', { class: 'ref' }, fc.ref))))) : null,
              h('div', { class: 'feedback good', style: 'text-align:left' },
                h('strong', null, 'The bigger fight'),
                h('p', null, 'For forty days a whole army was too scared to move. Then one shepherd boy from Bethlehem stepped out for all of them, and his win became their win. Jesus, the greater Son of David, also born in Bethlehem, faced the giants none of us could beat: sin and death. He won at the cross and the empty tomb, and he shares that victory with everyone who trusts him.')),
              BP.verse(verse),
              h('div', { class: 'btn-row' },
                h('button', { class: 'btn btn-primary', onclick: play }, 'Play again'),
                h('button', { class: 'btn', onclick: menu }, 'How to play')),
              BP.finish('sling', { points, secs, boosted, detail, coins: hits * 6 + bulls * 4 + (perfect ? 10 : 0),
                kicker: 'DAVID’S SLING', sub: `${hits}/${thrown} stones hit the mark` })));
          }, felled ? 700 : 500);
        }
      }
    },
  };

  function clock(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
})();
