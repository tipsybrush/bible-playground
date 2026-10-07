# Bible Playground

A free, no-sign-up website of retro-style Bible games for teens and young adults (ages 13 to 22), in the spirit of neal.fun.

Games:
- **Bible Quiz**: ten questions from the Old Testament, New Testament or everything.
- **Jacob's Ladder**: a 15-rung "Who Wants to Be a Millionaire" style climb with 50:50, Ask the youth group and Hint lifelines.
- **Story Gaps**: restore famous KJV passages word for word, or fill in the key details of retold Bible stories.
- **Who Am I?**: Bible riddles with three clues each. Solving on an earlier clue scores more, and small typos are forgiven.
- **Bible Charades**: a pass-the-phone party game for groups. Pick cards (people, stories, places and things), difficulty, a 60 or 90 second timer and up to 3 teams.
- **Word of the Day**: guess a 5-letter Bible word in 6 tries, with the same word for everyone each day, a practice mode, and a shareable grid of coloured squares. Words and verses are in `data/words.js`.
- **Books of the Bible Snake**: a modern, glowing take on snake. Eat the books of the Bible in order (Old Testament, New Testament or the whole Bible) while avoiding decoy books. Book list in `data/books.js`.
- **Timeline Rush**: drag Bible events into the order they happened before the clock runs out. Each level adds an event. Events are in `data/timeline.js` (124 so far).
- **Two by Two**: animals keep arriving; tap or drag matching pairs onto the ark before the flood rises, chaining quick pairs for combos. 40 pairs fills the ark.
- **Bible Map Dash**: tap where a Bible place is on an original map (drawn from real coordinates in `js/map.js`). Up to 1,000 points per place by distance. Places are in `data/places.js`.
- **Which Bible Character Are You?**: a 10-question, just-for-fun personality quiz with a shareable result (no leaderboard). Characters and questions are in `data/characters.js`.
- **Bible Crossword**: every puzzle is generated fresh from 250 Bible words (`data/crossword.js`). One shared daily puzzle (9×9) plus unlimited practice in Mini 7×7 or Big 9×9. Hints reveal a letter for 100 points.
- **Where Is It Written?**: read a KJV verse and pick its book from four. Classic rounds get harder, with decoys from the same part of the Bible; streak mode runs until a miss; bonus points for guessing the chapter. Verses are in `data/verses.js` (160).
- **Wilderness Trail**: lead Israel from Egypt to Canaan, managing manna, water, morale and faith through random events. Six possible endings. Stops, events and endings are in `data/trail.js`.
- **Two Truths and a Lie**: three statements about a Bible character; spot the lie. Statements and explanations are in `data/truths.js`.
- **David's Sling**: drag back and sling a stone at Goliath and other targets, with random wind, distance and target size. Each hit wins a Goliath fact (in `js/sling.js`).
- **Department Wars**: a party mode for youth fellowship. Teams named after church departments take turns on random rounds drawn from the other games' data, with wildcard rounds and a big scoreboard for one phone or a projector.
- **Kingdom Career Match**: a no-wrong-answers quiz that suggests three career paths, each with a way to serve God, a Bible person who did similar work, and course ideas. Content is in `data/career.js`.
- **Your Bible Journey Twin**: matches your current season to a Bible person's story, with encouragement and a verse. Content is in `data/twin.js`.
- **Find Your Place**: a 12-question quiz with no wrong answers that suggests a young person's passion, where they could serve at church, and which department can help them grow. Edit the team and department names in `data/gifts.js` to match your church.

Players earn coins in every game, which fill a level bar (Shepherd, Scout, Explorer and up). At the end of a game they can share a score picture or send a "challenge a friend" link that opens the same game with their score to beat.

Every scored game has an optional top-10 leaderboard (the quizzes, Charades and Department Wars don't). Faster play scores more, and on equal scores the quicker time ranks higher. Nobody has to sign up; players who make the top 10 can add a nickname. See `js/config.js` and `supabase.sql` to share the boards between everyone.

## How it's built
Plain HTML, CSS and JavaScript. No build step, no server, no accounts. Scores are saved in the player's own browser.

```
index.html        the home page and the game container
css/style.css     all styling (light and dark mode)
js/player.js      coins, levels and the player bar
js/share.js       score pictures, sharing and challenge links
js/app.js         shared helpers and the page switcher (#quiz, #ladder, #blanks, #riddles, #charades, #word, #snake, #timeline, #ark, #map, #crossword, #verse, #trail, #truths, #sling, #wars, #character, #gifts, #career, #twin)
js/*.js           one file per game
data/questions.js question bank used by both Bible Quiz and Jacob's Ladder
data/stories.js   stories for Story Gaps
data/gifts.js     questions and serving areas for Find Your Place
data/riddles.js   riddles for Who Am I? (answer, accepted alternatives, three clues)
data/charades.js  Bible Charades cards by category and difficulty
js/leaderboard.js the optional top-10 leaderboards
```

## Adding content
- **Questions**: copy a line in `data/questions.js` and edit it. Give it a `level` (1–3) and `cat` (`ot`, `nt` or `gen`).
- **Stories**: copy an entry in `data/stories.js`. Put each missing word in `{curly braces}`.
- **Riddles**: copy an entry in `data/riddles.js`; list clues from hardest to easiest.
- **Charades cards**: add a line to the right list in `data/charades.js`.

## Running it
Open `index.html` in a browser. To put it online for free, upload the folder to GitHub Pages or Netlify.

Bible quotations are from the King James Version (public domain). All illustrations are original.
