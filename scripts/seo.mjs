// Builds the pages search engines read: one guide page per game in games/, the games/ index,
// sitemap.xml and robots.txt. The games themselves still run from index.html (#quiz and so on);
// Google ignores everything after a #, so without these pages it only ever sees the home page.
// Run after adding or renaming a game:  node scripts/seo.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://bible-playground.vercel.app';
const today = new Date().toISOString().slice(0, 10);

const GAMES = [
  { id: 'quiz', slug: 'bible-quiz', name: 'Bible Quiz', title: 'Bible Quiz Game: Free Online Bible Trivia Questions',
    desc: 'Play a free Bible quiz online. Ten Bible trivia questions from the Old Testament, New Testament or both, easy to hard, with a global leaderboard.',
    intro: 'Ten Bible trivia questions, Bible quiz competition style. Every round starts with warm-ups and finishes on tough questions, and each answer comes with a short fact and the verse to look it up.',
    steps: ['Pick a round: Old Testament, New Testament or the whole Bible.', 'Answer 10 multiple-choice questions. They start easy and finish hard.', 'Each right answer is worth 100 points, and a fast finish earns a speed bonus.'] },
  { id: 'ladder', slug: 'jacobs-ladder', name: "Jacob's Ladder", title: "Jacob's Ladder: Bible Millionaire Quiz Game",
    desc: "Climb 15 rungs to a million points in this millionaire-style Bible quiz. Three safe zones, harder questions at the top and lifelines like Ask the Youth Group.",
    intro: 'A millionaire-style Bible quiz game. Climb fifteen rungs from 100 points to a million. Every safe zone you reach unlocks harder questions, and the last zone is for Bible experts.',
    steps: ['Answer each question to climb one rung of the ladder.', 'Reach a safe zone to lock in your points before the questions get harder.', 'Use your lifelines wisely, or walk away with what you have.'] },
  { id: 'blanks', slug: 'fill-in-the-blank-bible-verses', name: 'Story Gaps', title: 'Story Gaps: Fill in the Blank Bible Verse Game',
    desc: 'Fill in the blanks of famous Bible verses and Bible stories. A free Scripture memory game with a word bank, decoys and KJV passages.',
    intro: 'Restore famous Scripture word for word, or fill in the key details of well-known Bible stories. A fun way to memorise Bible verses, with decoy words that almost fit.',
    steps: ['Pick a Scripture passage or a Bible story.', 'Tap words in the word bank to drop them into the gaps.', 'Check your answers. Fewer wrong guesses and a faster finish score more.'] },
  { id: 'riddles', slug: 'who-am-i-bible-riddles', name: 'Who Am I?', title: 'Who Am I? Bible Riddles Game with Answers',
    desc: 'Guess the Bible character from three clues. Free Bible riddles for teens and youth groups: the sooner you solve it, the more points you score.',
    intro: 'Cryptic Bible riddles about people in the Bible. Each riddle has three clues, from hard to easy, and solving it on the first clue scores the most.',
    steps: ['Read the first clue and type your guess. Spelling doesn’t have to be perfect.', 'Stuck? Ask for the next clue.', 'Solve on the first clue for 3 points, the second for 2 and the third for 1.'] },
  { id: 'charades', slug: 'bible-charades', name: 'Bible Charades', title: 'Bible Charades: Party Game for Youth Groups',
    desc: 'Bible charades on your phone. A free pass-the-phone party game for youth group, fellowship and camp with Bible characters, stories and objects.',
    intro: 'A pass-the-phone Bible charades game for youth group, fellowship, camp or friends. Act out Bible people, stories and objects with no talking, and beat the clock.',
    steps: ['The guesser holds the phone up facing the group, so they can’t see the screen.', 'The group acts out the card without speaking.', 'Tilt or tap when you get it or want to pass, and beat the clock.'] },
  { id: 'word', slug: 'bible-word-of-the-day', name: 'Word of the Day', title: 'Bible Word of the Day: Daily 5-Letter Bible Word Puzzle',
    desc: 'Guess the 5-letter Bible word in 6 tries. A free daily Bible word puzzle: everyone gets the same word, so compare results with friends.',
    intro: 'A daily Bible word guessing game. Everyone gets the same 5-letter Bible word each day, plus unlimited practice words.',
    steps: ['Type any 5-letter word and press Enter.', 'Green means right letter, right spot. Gold means right letter, wrong spot.', 'Find the word in 6 tries, then share your result.'] },
  { id: 'snake', slug: 'books-of-the-bible-game', name: 'Books of the Bible Snake', title: 'Books of the Bible Snake: Learn the Books of the Bible in Order',
    desc: 'Learn the books of the Bible in order with a snake game. Eat Genesis to Malachi or Matthew to Revelation in the right order, fast.',
    intro: 'A snake game that teaches the 66 books of the Bible in order. Glide through the Old Testament or New Testament and watch out for decoy books.',
    steps: ['The next book you need is shown above the board.', 'Steer with the arrow keys, by swiping, or with the buttons underneath.', 'Avoid decoys and your own tail. Walls wrap around, so you come out the other side, and be quick for a speed bonus.'] },
  { id: 'timeline', slug: 'bible-timeline-game', name: 'Timeline Rush', title: 'Timeline Rush: Put Bible Events in Order',
    desc: 'A Bible timeline game: put Bible events in the order they happened before the clock runs out. From Creation to the early church.',
    intro: 'How well do you know the order of events in the Bible? Put Bible events in order, from Creation to the early church, before time runs out.',
    steps: ['Drag five Bible events so the earliest is at the top.', 'Press Lock it in before time runs out.', 'Get them all right and the next level adds one more event.'] },
  { id: 'ark', slug: 'noahs-ark-matching-game', name: 'Two by Two', title: "Two by Two: Noah's Ark Animal Matching Game",
    desc: "A Noah's Ark memory game. Match the animals in pairs and load the ark before the flood rises. Free, quick and fun.",
    intro: "A Noah's Ark memory matching game. Find the animals in pairs and load them onto the ark before the flood water rises.",
    steps: ['Animals keep arriving. Tap two that match, or drag one onto its partner.', 'Each pair walks onto the ark and pushes the water back down.', 'Pairs made close together build a combo for extra points.'] },
  { id: 'map', slug: 'bible-map-game', name: 'Bible Map Dash', title: 'Bible Map Dash: Bible Geography Game',
    desc: 'A Bible geography game. Find Bethlehem, Jericho, Damascus and more on the map of Bible lands. The closer you tap, the more you score.',
    intro: 'Learn Bible geography the fun way. A place from the Bible pops up and you tap where it is on the map of Bible lands.',
    steps: ['Read the place name and its Bible story.', 'Tap where you think it is on the map.', 'The closer and faster you are, the more points you score.'] },
  { id: 'crossword', slug: 'bible-crossword', name: 'Bible Crossword', title: 'Bible Crossword Puzzle: Free Daily Bible Crossword',
    desc: 'Play a free Bible crossword puzzle online. A new daily Bible crossword for everyone plus unlimited practice puzzles, with hints and verse references.',
    intro: 'A fresh Bible crossword every time, built from hundreds of Bible words and clues. Everyone gets the same daily puzzle, and practice puzzles are unlimited.',
    steps: ['Pick a clue and type the answer into the grid.', 'Use a hint for the first letter, but it halves that word’s points.', 'Finish the grid fast for a speed bonus.'] },
  { id: 'verse', slug: 'bible-verse-game', name: 'Where Is It Written?', title: 'Where Is It Written? Bible Verse Guessing Game',
    desc: 'Read a Bible verse and guess which book it comes from. A free Bible verse game with bonus points for the chapter and a streak mode.',
    intro: 'How well do you know where Bible verses are found? Read a verse and pick the book of the Bible it comes from, with bonus points for the chapter.',
    steps: ['Read the Bible verse.', 'Pick the book it comes from, then guess the chapter for a bonus.', 'Try streak mode and see how long you can keep going.'] },
  { id: 'trail', slug: 'exodus-game', name: 'Wilderness Trail', title: 'Wilderness Trail: Exodus Bible Adventure Game',
    desc: 'Lead Israel from Egypt to the Promised Land in this Exodus adventure game. Manage manna, water, morale and faith. Six endings to find.',
    intro: 'A Bible adventure game based on the Exodus. Lead Israel from Egypt through the wilderness to the Promised Land, making choices that change the journey.',
    steps: ['Choose how to lead at each stop on the journey.', 'Keep manna, water, morale and faith from running out.', 'Find all six endings. No two journeys are the same.'] },
  { id: 'truths', slug: 'two-truths-and-a-lie-bible', name: 'Two Truths and a Lie', title: 'Two Truths and a Lie: Bible Characters Game',
    desc: 'Two truths and a lie about Bible characters. Spot the classic Bible mix-up fast. A free Bible game for teens, youth groups and small groups.',
    intro: 'Three statements about a Bible character. Two are true and one is a classic mix-up. Can you catch the lie?',
    steps: ['Read three statements about a Bible character.', 'Tap the one you think is the lie.', 'Be quick: speed adds to your score.'] },
  { id: 'sling', slug: 'david-and-goliath-game', name: "David's Sling", title: "David's Sling: David and Goliath Game",
    desc: 'See the valley through David’s eyes in this David and Goliath game. Pull back the sling, mind the wind and aim fast.',
    intro: 'A first-person David and Goliath game. Five smooth stones, one giant. Pull back your sling, allow for the wind and be quick.',
    steps: ['Press on the field, pull the sling down and aim, then let go to throw.', 'Watch the flag and aim into the wind.', 'Five stones, each at a farther target. The last one is for Goliath, and quick throws score more.'] },
  { id: 'wars', slug: 'church-youth-group-game', name: 'Department Wars', title: 'Department Wars: Church Team Game for Youth Fellowship',
    desc: 'A team game for church youth fellowship and camp. Choir vs Ushers vs Media: one host, one phone or projector, a big scoreboard and Bible rounds.',
    intro: 'Church departments go head to head in a Bible team game for youth fellowship, camp or church events. One host runs it from a phone or projector.',
    steps: ['Split into teams. Pick 2 to 6 church departments or add your own team names.', 'Teams take turns at surprise mini rounds: quiz, riddle, charades, timeline and more.', 'The host reads out, keeps time and marks, and wildcards can swing the scoreboard.'] },
  { id: 'gifts', slug: 'spiritual-gifts-quiz', name: 'Find Your Place', title: 'Find Your Place: Spiritual Gifts and Serving Quiz',
    desc: 'A free 12-question quiz for young people: find what you are passionate about, where you could serve at church and which team can help you grow.',
    intro: 'A short quiz with no wrong answers. Discover your passions, where you could serve at church, and a Bible example and verse for your area.',
    steps: ['Answer 12 quick questions about what you enjoy.', 'There are no wrong answers.', 'Get your serving area, teams to try and a verse to keep.'] },
  { id: 'character', slug: 'which-bible-character-are-you', name: 'Which Bible Character Are You?', title: 'Which Bible Character Are You? Free Personality Quiz',
    desc: 'Take the free Which Bible Character Are You quiz. Ten quick questions: are you a Peter, an Esther, a David or a Barnabas?',
    intro: 'A fun personality quiz. Answer ten quick questions and find out which Bible character you are most like, then compare with friends.',
    steps: ['Answer ten quick questions.', 'There are no wrong answers.', 'Meet your Bible character and share your result.'] },
  { id: 'career', slug: 'christian-career-quiz', name: 'Kingdom Career Match', title: 'Kingdom Career Match: Christian Career Quiz',
    desc: 'A Christian career quiz for students. Match what you love and what you are good at to your top 3 career paths, courses to study and a Bible person who did similar work.',
    intro: 'What you love plus what you are good at equals a way to serve God. Find your top three career paths, courses to look at and a Bible person who did similar work.',
    steps: ['Tell us what you love and what you are good at.', 'See your top 3 career paths.', 'Get courses to look at and a Bible example to learn from.'] },
  { id: 'twin', slug: 'bible-journey-twin', name: 'Your Bible Journey Twin', title: 'Your Bible Journey Twin: Which Bible Story Matches Your Season?',
    desc: 'Waiting, starting over, feeling small or stepping up? Take the quiz and meet the Bible person whose journey looks like your season of life.',
    intro: 'Whatever season you are in, someone in the Bible has been there. Answer a few questions and meet your Bible journey twin.',
    steps: ['Answer a few questions about your season of life.', 'Meet the Bible person whose journey matches yours.', 'Read what God did in their story and a verse for yours.'] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function head({ title, desc, url, jsonld }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Chakra+Petch:wght@600;700&family=Pixelify+Sans:wght@700&display=swap">
<link rel="stylesheet" href="/css/style.css">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/icon-180.png">
<meta name="theme-color" content="#1B1C3D">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Bible Playground">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/og.png">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script defer src="/js/config.js"></script>
<script defer src="/js/analytics.js"></script>
</head>
<body class="guide-page">
<header class="hud"><div class="hud-inner"><a class="hud-home" href="/">BIBLE<br>PLAYGROUND</a></div></header>
<div class="wrap">`;
}

const foot = `
<footer class="foot">
  <p class="foot-credit">Created with <span class="foot-heart" aria-label="love">♥</span> by Bolarinwa Timi</p>
  <p><a href="/">Bible Playground home</a> · <a href="/games">All Bible games</a></p>
  <p>Free Bible games for teens and young adults. No sign-up needed. Bible quotations are from the King James Version.</p>
</footer>
</div>
</body>
</html>
`;

function moreLinks(skip) {
  return `<ul class="guide-more">${GAMES.filter((g) => g.id !== skip).map((g) =>
    `<li><a href="/games/${g.slug}">${esc(g.name)}</a></li>`).join('')}</ul>`;
}

function gamePage(g) {
  const url = `${SITE}/games/${g.slug}`;
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'VideoGame', name: g.name, alternateName: g.title, description: g.desc, url,
      image: `${SITE}/og.png`, genre: ['Bible game', 'Educational game', 'Christian game'], gamePlatform: 'Web browser',
      applicationCategory: 'Game', operatingSystem: 'Any', inLanguage: 'en', isAccessibleForFree: true,
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 13 },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@type': 'Person', name: 'Bolarinwa Timi' },
      isPartOf: { '@type': 'WebSite', name: 'Bible Playground', url: SITE + '/' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bible Playground', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Games', item: SITE + '/games' },
      { '@type': 'ListItem', position: 3, name: g.name, item: url }] },
  ];
  return head({ title: `${g.title} | Bible Playground`, desc: g.desc, url, jsonld }) + `
<main class="guide">
  <nav class="crumb"><a href="/" class="btn btn-small" style="text-decoration:none">&larr; All games</a></nav>
  <h1 class="game-title">${esc(g.name)}</h1>
  <p class="guide-lede">${esc(g.intro)}</p>
  <p><a class="btn btn-primary guide-play" href="/#${g.id}">Play ${esc(g.name)} free</a></p>
  <section class="howto">
    <img class="howto-bible" src="/icons/favicon.svg" alt="" width="96" height="96">
    <h2 class="howto-title">How to play?</h2>
    <ol class="howto-steps">${g.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
  </section>
  <p>${esc(g.name)} is one of ${GAMES.length} free Bible games on Bible Playground, made for teens and young adults. There is no sign-up: open it on your phone or computer and play. Scores go on a global leaderboard, and you can share a challenge link with friends from church, youth group or fellowship.</p>
  <h2 class="panel-title">More Bible games</h2>
  ${moreLinks(g.id)}
</main>` + foot;
}

function indexPage() {
  const url = `${SITE}/games`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Free Bible games',
    itemListElement: GAMES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.name, url: `${SITE}/games/${g.slug}` })) };
  return head({ title: 'All Free Bible Games Online | Bible Playground', url, jsonld,
    desc: `${GAMES.length} free Bible games online: Bible quiz, Bible crossword, Bible charades, riddles, verse games, a millionaire-style Bible quiz and more. No sign-up.` }) + `
<main class="guide">
  <h1 class="game-title">Free Bible games</h1>
  <p class="guide-lede">Every game on Bible Playground, free to play on your phone or computer with no sign-up. Made for teens, young adults, youth groups and fellowships.</p>
  <ul class="guide-list">${GAMES.map((g) => `
    <li><a href="/games/${g.slug}"><strong>${esc(g.name)}</strong></a><span>${esc(g.desc)}</span></li>`).join('')}
  </ul>
</main>` + foot;
}

fs.mkdirSync(path.join(ROOT, 'games'), { recursive: true });
for (const g of GAMES) fs.writeFileSync(path.join(ROOT, 'games', g.slug + '.html'), gamePage(g));
fs.writeFileSync(path.join(ROOT, 'games', 'index.html'), indexPage());

const urls = [['/', '1.0'], ['/games', '0.9'], ...GAMES.map((g) => [`/games/${g.slug}`, '0.8'])];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE}/sitemap.xml
`);
console.log(`Wrote ${GAMES.length} game pages, games/index.html, sitemap.xml and robots.txt`);
