// Riddles for "Who Am I?". Each riddle gives three clues, from hardest to easiest.
//   answer:  shown when revealed
//   point:   one line on why it matters, shown after the answer
//   accept:  other answers that count as right (lowercase; "the" and punctuation are ignored)
window.BIBLE_RIDDLES = [
  { answer: 'Jonah', accept: [], ref: 'Jonah 1–2', point: 'Jesus called his three days in the grave “the sign of the prophet Jonas” (Matthew 12:40). God’s mercy reached even Nineveh.',
    clues: [
    'I was given a mission and bought a ticket the other way.',
    'Three days and nights I spent where no light could reach.',
    'A great fish carried me back to the job I ran from.'] },
  { answer: 'Lazarus', accept: [], ref: 'John 11', point: 'Before he called Lazarus out, Jesus said, “I am the resurrection, and the life” (John 11:25). He has power over death itself.',
    clues: [
    'My sisters sent a message, and my friend waited two more days.',
    'For four days I lay sealed behind a stone.',
    'One loud call, and I walked out still wrapped in grave clothes.'] },
  { answer: 'Manna', accept: [], ref: 'Exodus 16', point: 'Jesus said, “I am the bread of life” (John 6:35). Manna fed people for a day. He satisfies for good.',
    clues: [
    'I came down with the dew, but I was not rain.',
    'Gather me daily. Keep me overnight and I rot, except on the sixth day.',
    'People looked at me and asked, “What is it?” That became my name.'] },
  { answer: 'Moses’ staff', accept: ['staff', 'rod', 'moses staff', 'moses rod', 'aarons rod', 'aaron rod', 'shepherds staff'], ref: 'Exodus 4 and 14', point: 'God used an ordinary tool in surrendered hands to set a nation free. He still uses ordinary people.',
    clues: [
    'I was an ordinary shepherd’s tool in a desert land.',
    'Thrown down, I hissed. Picked up by the tail, I was wood again.',
    'Stretched out over the sea, I helped open a road through it.'] },
  { answer: 'Peter', accept: ['simon peter', 'simon', 'cephas'], ref: 'Luke 22; John 21', point: 'Jesus restored Peter after his worst failure and gave him work to do (John 21:17). Failure isn’t the end of your story.',
    clues: [
    'I was named after a rock, yet I once sank like one.',
    'A rooster’s crow broke my heart.',
    'Three times I denied him, and three times he asked if I loved him.'] },
  { answer: 'The burning bush', accept: ['burning bush', 'bush'], ref: 'Exodus 3', point: 'Jesus later said, “Before Abraham was, I am” (John 8:58), claiming the name God spoke from the bush.',
    clues: [
    'I was on fire, yet nothing of me was used up.',
    'The man who came near had to take off his shoes.',
    'From me a voice said, “I AM THAT I AM.”'] },
  { answer: 'Samson', accept: [], ref: 'Judges 14–16', point: 'Samson’s strength came from God, not his hair. His story shows the cost of treating God’s gifts lightly.',
    clues: [
    'I once told a riddle about honey found in a lion’s carcass.',
    'The secret of my strength was a vow no razor could touch.',
    'My last act brought a temple crashing down.'] },
  { answer: 'The ark of the covenant', accept: ['ark of the covenant', 'ark', 'covenant ark'], ref: 'Exodus 25; 2 Samuel 6', point: 'The ark held God’s presence with his people. In Jesus, God came to dwell with us in person (John 1:14).',
    clues: [
    'I was carried on poles so no one would touch me.',
    'Inside me were stone tablets, a pot of manna and a rod that budded.',
    'Uzzah reached out to steady me, and it cost him his life.'] },
  { answer: 'Zacchaeus', accept: ['zaccheus'], ref: 'Luke 19', point: '“The Son of man is come to seek and to save that which was lost” (Luke 19:10). Jesus chose the man everyone else wrote off.',
    clues: [
    'I was rich, and my whole town resented how I got that way.',
    'I had to climb to see past the crowd.',
    'I promised to pay back four times what I had taken.'] },
  { answer: 'The Tower of Babel', accept: ['tower of babel', 'babel', 'babel tower'], ref: 'Genesis 11', point: 'People tried to reach heaven on their own. In Jesus, God came down to reach us instead.',
    clues: [
    'I was made of brick and tar by people who wanted a name for themselves.',
    'My builders meant for my top to reach the heavens.',
    'The project ended when no one could understand anyone else.'] },
  { answer: 'Thomas', accept: ['doubting thomas', 'didymus'], ref: 'John 11:16; 20:24–29', point: 'Jesus met Thomas’s doubt with his wounds, not a rebuke. Thomas answered, “My Lord and my God” (John 20:28).',
    clues: [
    'I once told my friends, “Let us also go, that we may die with him.”',
    'I missed one very important evening.',
    'I said I would not believe unless I saw the nail prints.'] },
  { answer: 'Myrrh', accept: [], ref: 'Matthew 2:11; Mark 15:23; John 19:39', point: 'From his birth to his burial, myrrh followed Jesus. He was born to give his life for us.',
    clues: [
    'I am bitter, fragrant and expensive.',
    'Wise men brought me to a child.',
    'I was offered again at his death, and used again at his burial.'] },
  { answer: 'Esther', accept: ['hadassah', 'queen esther'], ref: 'Esther 2–4', point: 'Esther risked her life to stand between her people and death. Jesus did that for us and didn’t stop at the risk.',
    clues: [
    'I hid who I really was to live in a palace.',
    'My cousin raised me after my parents died.',
    '“If I perish, I perish,” I said, and walked in to see the king uninvited.'] },
  { answer: 'Goliath', accept: [], ref: '1 Samuel 17', point: 'David won with God’s strength, not his own. Jesus beat our biggest enemies, sin and death, for us.',
    clues: [
    'I stood six cubits and a span.',
    'For forty days I made an entire army afraid.',
    'A shepherd boy’s stone found the one place my armor didn’t cover.'] },
  { answer: 'Jacob', accept: ['israel'], ref: 'Genesis 25–32', point: 'God kept his promises to a schemer and changed his name. Grace is God working with people who don’t deserve it.',
    clues: [
    'I was born holding my brother’s heel.',
    'I wore goatskins to take a blessing that wasn’t meant for me.',
    'I wrestled until dawn and walked away limping with a new name.'] },
  { answer: 'Rahab', accept: [], ref: 'Joshua 2 and 6', point: 'A foreign woman with a past ended up in the family line of Jesus (Matthew 1:5). No one is too far gone.',
    clues: [
    'My house was built into the wall of a doomed city.',
    'I hid two spies under stalks of flax on my roof.',
    'A scarlet cord in my window saved my whole family.'] },
  { answer: 'The prodigal son', accept: ['prodigal son', 'prodigal', 'lost son'], ref: 'Luke 15', point: 'Jesus told this story to show what God is like: a Father who runs to meet anyone who comes home.',
    clues: [
    'I asked for my inheritance while my father was still alive.',
    'I ended up jealous of what the pigs were eating.',
    'I came home rehearsing an apology, and my father ran to meet me.'] },
  { answer: 'Salt', accept: [], ref: 'Matthew 5:13; Genesis 19:26', point: 'Jesus said, “Ye are the salt of the earth” (Matthew 5:13). His followers are meant to make a difference you’d notice.',
    clues: [
    'You hardly notice me in a meal, but you notice when I’m missing.',
    'If I lose my savour, I’m good for nothing.',
    'Lot’s wife became a pillar of me.'] },
  { answer: 'Nicodemus', accept: [], ref: 'John 3; John 19:39', point: 'Jesus told Nicodemus, “Ye must be born again” (John 3:7), then spoke John 3:16. Nicodemus came at night but later honored Jesus openly.',
    clues: [
    'I was a respected teacher of Israel.',
    'I came by night and asked how a grown man could be born again.',
    'Later I brought about a hundred pounds of spices for a burial.'] },
  { answer: 'Elijah', accept: ['elias'], ref: '1 Kings 17–18; 2 Kings 2', point: 'Elijah appeared with Jesus at the transfiguration (Matthew 17:3), pointing to Jesus as the one the prophets waited for.',
    clues: [
    'Ravens brought me my meals.',
    'I soaked an altar with water and prayed for fire anyway.',
    'I left this world in a whirlwind, not a grave.'] },
  // ---------- Beginnings: Genesis ----------
  { answer: 'Adam', accept: [], ref: 'Genesis 2:7, 19-20; 3', point: 'Paul calls Jesus “the last Adam” (1 Corinthians 15:45). What the first Adam lost, Jesus came to restore.',
    clues: [
    'I gave names to every animal, but none of them was the partner I needed.',
    'I was formed from the dust, and God breathed into my nostrils.',
    'I was the first man, and I lived in the garden of Eden.'] },
  { answer: 'Eve', accept: [], ref: 'Genesis 2:22; 3:1-20', point: 'Right after the fall, God promised that the woman’s seed would bruise the serpent’s head (Genesis 3:15). That promise pointed to Jesus.',
    clues: [
    'My husband named me because I was the mother of all living.',
    'I was made from a rib.',
    'A serpent talked me into eating from the one tree that was off limits.'] },
  { answer: 'Enoch', accept: [], ref: 'Genesis 5:21-24; Hebrews 11:5', point: 'Enoch “walked with God”. Through Jesus, anyone can walk with God every day.',
    clues: [
    'My son lived longer than any other person in the Bible.',
    'I lived three hundred sixty and five years.',
    'I walked with God, and I was not, for God took me.'] },
  { answer: 'Methuselah', accept: ['methusaleh'], ref: 'Genesis 5:21-27', point: 'Even the longest life ends. Jesus offers a life that never ends (John 10:28).',
    clues: [
    'My father walked with God and was taken.',
    'My grandson built an ark.',
    'I lived nine hundred sixty and nine years, longer than anyone recorded.'] },
  { answer: 'Noah', accept: ['noe'], ref: 'Genesis 6–9', point: '“Noah found grace in the eyes of the LORD” (Genesis 6:8). Grace is still how anyone is rescued, through Jesus.',
    clues: [
    'I sent out a raven before I sent out a dove.',
    'I was six hundred years old when the rain came.',
    'I built a huge boat of gopher wood for my family and the animals.'] },
  { answer: 'Abraham', accept: ['abram'], ref: 'Genesis 12–22; Hebrews 11:8', point: 'God promised that in Abraham’s seed all nations would be blessed. Paul says that seed is Christ (Galatians 3:16).',
    clues: [
    'I left Ur of the Chaldees, not knowing where I was going.',
    'God told me to count the stars, if I could.',
    'I was a hundred years old when my son Isaac was born.'] },
  { answer: 'Sarah', accept: ['sarai'], ref: 'Genesis 17:15-17; 18:12-15; 21:1-5', point: '“Is any thing too hard for the LORD?” (Genesis 18:14). God keeps his promises, and Jesus is the greatest promise kept.',
    clues: [
    'I laughed behind a tent door, then said I hadn’t.',
    'God changed my name from Sarai.',
    'I became a mother at ninety, and named my son Isaac.'] },
  { answer: 'Hagar', accept: [], ref: 'Genesis 16; 21:9-19', point: 'Hagar learned that God sees the overlooked. Jesus kept seeking out the people others ignored.',
    clues: [
    'I was an Egyptian maid in a tent family.',
    'In the wilderness I called the LORD “Thou God seest me.”',
    'I was sent away with my son Ishmael, some bread and a bottle of water.'] },
  { answer: 'Melchizedek', accept: ['melchisedec', 'melchisedek', 'melchizedec'], ref: 'Genesis 14:18-20; Hebrews 7', point: 'Hebrews says of Jesus, “Thou art a priest for ever after the order of Melchisedec” (Hebrews 7:17).',
    clues: [
    'I was king of Salem and priest of the most high God.',
    'I brought out bread and wine to Abram, and he gave me tithes of all.',
    'A whole chapter of Hebrews compares Jesus’ priesthood to mine.'] },
  { answer: 'Lot', accept: [], ref: 'Genesis 13; 19', point: 'The angels took Lot by the hand and pulled him out, “the LORD being merciful unto him” (Genesis 19:16). Rescue is God’s mercy.',
    clues: [
    'I chose the well-watered plain of Jordan for my flocks.',
    'Two angels took me by the hand and pulled me out of a doomed city.',
    'I was Abraham’s nephew, and I escaped from Sodom.'] },
  { answer: 'Isaac', accept: [], ref: 'Genesis 21–22; Romans 8:32', point: 'A father, a beloved son, wood on his back and a hill: Isaac’s story points to the cross, where God “spared not his own Son” (Romans 8:32).',
    clues: [
    'I asked my father, “Where is the lamb for a burnt offering?”',
    'I carried the wood up a mountain in the land of Moriah.',
    'I was the son born to Abraham and Sarah in their old age.'] },
  { answer: 'Ishmael', accept: [], ref: 'Genesis 16:11-12; 21:9-21', point: 'God heard Ishmael’s cry in the wilderness (Genesis 21:17). He still hears the cry of anyone who feels pushed out.',
    clues: [
    'An angel told my mother I would be a wild man.',
    'I was seen mocking at my little brother’s weaning feast.',
    'I was Abraham’s firstborn son, by Hagar.'] },
  { answer: 'Rebekah', accept: ['rebecca', 'rebekka'], ref: 'Genesis 24; 27', point: 'Rebekah said, “I will go” (Genesis 24:58). Following God often starts with a brave yes.',
    clues: [
    'I drew water for a stranger’s ten thirsty camels.',
    'When asked if I would leave home with a stranger, I said, “I will go.”',
    'I married Isaac and became mother of twins, Esau and Jacob.'] },
  { answer: 'Esau', accept: ['edom'], ref: 'Genesis 25:25-34; 27; 33', point: 'Esau later ran to meet Jacob and embraced him (Genesis 33:4). Forgiveness can heal even the deepest family hurt.',
    clues: [
    'I came out red, and hairy all over like a garment.',
    'I sold my birthright for a bowl of red pottage.',
    'My twin brother tricked our blind father into blessing him instead of me.'] },
  { answer: 'Rachel', accept: [], ref: 'Genesis 29:18-20; 31:34; 35:16-19', point: 'Rachel died near Bethlehem, the town where Jesus, the hope of every grieving family, would be born.',
    clues: [
    'I hid my father’s images under a camel’s saddle and sat on them.',
    'A man worked seven years for me, and they felt like a few days.',
    'I died giving birth to Benjamin.'] },
  { answer: 'Leah', accept: [], ref: 'Genesis 29:16-35', point: 'Overlooked Leah became the mother of Judah, the tribe Jesus came from. God sees the unloved.',
    clues: [
    'The Bible says my eyes were tender.',
    'I was given in marriage in my younger sister’s place.',
    'I was Jacob’s first wife and the mother of Judah and Levi.'] },
  { answer: 'Joseph (son of Jacob)', accept: ['joseph'], ref: 'Genesis 37–50', point: '“Ye thought evil against me; but God meant it unto good” (Genesis 50:20). God can turn the worst into rescue, as he did at the cross.',
    clues: [
    'In prison I explained the dreams of a butler and a baker.',
    'My brothers sold me for twenty pieces of silver.',
    'My father gave me a coat of many colours.'] },
  { answer: 'Benjamin', accept: [], ref: 'Genesis 35:18; 44', point: 'Judah offered himself in Benjamin’s place (Genesis 44:33). Jesus, from Judah’s line, took our place for real.',
    clues: [
    'My dying mother named me Benoni.',
    'A silver cup was found in my sack of grain.',
    'I was the youngest of Jacob’s twelve sons.'] },
  // ---------- Exodus to Joshua ----------
  { answer: 'Moses', accept: [], ref: 'Exodus 2–34; Numbers 20', point: 'The law was given by Moses, “but grace and truth came by Jesus Christ” (John 1:17).',
    clues: [
    'I struck a rock when I was told to speak to it.',
    'A princess named me because she drew me out of the water.',
    'I came down a mountain carrying two tables of stone.'] },
  { answer: 'Aaron', accept: [], ref: 'Exodus 4:14-16; 28; 32', point: 'Aaron had to offer sacrifices for his own sins. Jesus is the high priest who never needed to (Hebrews 7:26-27).',
    clues: [
    'I made a golden calf, then claimed it just came out of the fire.',
    'I was the first high priest of Israel.',
    'I spoke for my younger brother Moses before Pharaoh.'] },
  { answer: 'Miriam', accept: [], ref: 'Exodus 15:20-21; Numbers 12', point: 'Miriam’s first response to rescue was a song. Praise is still a fitting answer to what God has done in Jesus.',
    clues: [
    'I was shut out of the camp for seven days after speaking against my brother.',
    'I am called a prophetess, and I had a timbrel in my hand.',
    'I led the women in song after Israel crossed the Red Sea.'] },
  { answer: 'Jethro', accept: ['reuel', 'raguel'], ref: 'Exodus 2:16-21; 18', point: 'Jethro saw Moses wearing himself out and gave wise advice. God often helps us through the people around us.',
    clues: [
    'I had seven daughters who watered their father’s flock.',
    'I told my son-in-law he would wear himself out judging the people alone.',
    'I was a priest of Midian and Moses’ father-in-law.'] },
  { answer: 'Shiphrah and Puah', accept: ['shiphrah', 'puah', 'hebrew midwives', 'midwives'], ref: 'Exodus 1:15-21', point: 'Two women feared God more than Pharaoh and saved babies’ lives. God remembered them and gave them families of their own.',
    clues: [
    'A king gave us an order we would not obey.',
    'We told Pharaoh the Hebrew women were lively and gave birth before we arrived.',
    'We were the Hebrew midwives who let the baby boys live.'] },
  { answer: 'Frogs', accept: ['frog', 'plague of frogs'], ref: 'Exodus 8:1-15', point: 'Each plague showed that the LORD alone is God. Jesus later showed the same power over creation.',
    clues: [
    'We got into ovens, beds and kneading troughs.',
    'Pharaoh’s magicians could bring more of us, but not take us away.',
    'We were the second plague on Egypt.'] },
  { answer: 'The Passover lamb', accept: ['passover lamb', 'lamb', 'passover', 'paschal lamb'], ref: 'Exodus 12; 1 Corinthians 5:7', point: '“Christ our passover is sacrificed for us” (1 Corinthians 5:7). His blood covers everyone who trusts him.',
    clues: [
    'I had to be a male of the first year, without blemish.',
    'Not one of my bones could be broken.',
    'My blood on the doorposts meant death would pass over that house.'] },
  { answer: 'The pillar of cloud', accept: ['pillar of cloud', 'pillar of fire', 'cloud', 'pillar of cloud and fire', 'pillar'], ref: 'Exodus 13:21-22; 14:19-20', point: 'God led his people day and night. Jesus said, “I am the light of the world: he that followeth me shall not walk in darkness” (John 8:12).',
    clues: [
    'By day I looked one way, and by night another.',
    'I moved behind Israel and stood between them and the Egyptians.',
    'I went before Israel to lead them through the wilderness, and at night I was fire.'] },
  { answer: 'The Red Sea', accept: ['red sea'], ref: 'Exodus 14', point: 'God made a way where there was no way. Jesus said, “I am the way” (John 14:6).',
    clues: [
    'A strong east wind blew on me all night.',
    'My waters stood like a wall on the right hand and on the left.',
    'Israel walked through me on dry ground, and Pharaoh’s army did not make it.'] },
  { answer: 'Quails', accept: ['quail'], ref: 'Exodus 16:13; Numbers 11:31', point: 'God answered grumbling with food. He is patient with us, and Jesus is the bread that truly satisfies.',
    clues: [
    'A wind from the LORD brought me in from the sea.',
    'I covered the camp in the evening; manna came in the morning.',
    'Israel complained for meat in the wilderness, and God sent birds.'] },
  { answer: 'Mount Sinai', accept: ['sinai', 'horeb', 'mount horeb'], ref: 'Exodus 19–20', point: 'At Sinai people trembled at a distance. Through Jesus, we can “come boldly unto the throne of grace” (Hebrews 4:16).',
    clues: [
    'I quaked greatly and smoked like a furnace.',
    'Anyone who touched me, even an animal, was to die.',
    'God gave the Ten Commandments on top of me.'] },
  { answer: 'The Ten Commandments', accept: ['ten commandments', 'commandments', 'tables of stone', 'tablets of stone', 'stone tablets', 'law', 'tablets'], ref: 'Exodus 20; 31:18; 32:19', point: 'Jesus summed up the law in two commands: love God and love your neighbour (Matthew 22:37-39), and he kept it perfectly for us.',
    clues: [
    'My first copy was smashed at the foot of a mountain.',
    'I was written with the finger of God.',
    'I am ten commands written on two tables of stone.'] },
  { answer: 'The golden calf', accept: ['golden calf', 'calf'], ref: 'Exodus 32', point: 'People traded the living God for something they made. Only Jesus is worth our worship.',
    clues: [
    'I was made from melted golden earrings.',
    'Moses burnt me, ground me to powder and made Israel drink it.',
    'Israel danced around me at the foot of Sinai.'] },
  { answer: 'Bezaleel', accept: ['bezalel'], ref: 'Exodus 31:1-5; 37:1', point: 'God filled Bezaleel with his Spirit for craftsmanship. Every gift, even art and building, can be used for God’s glory.',
    clues: [
    'I was of the tribe of Judah, son of Uri, son of Hur.',
    'God filled me with his Spirit to work in gold, silver and brass.',
    'I was the craftsman who made the ark of the covenant.'] },
  { answer: 'Korah', accept: ['core'], ref: 'Numbers 16', point: 'Korah grabbed for honour God had not given him. Jesus did the opposite: he “humbled himself” (Philippians 2:8).',
    clues: [
    'I was a Levite who wanted the priesthood too.',
    'I gathered two hundred and fifty princes against Moses and Aaron.',
    'The ground opened and swallowed up the rebels who followed me.'] },
  { answer: 'The brass serpent', accept: ['brass serpent', 'bronze serpent', 'brazen serpent', 'serpent of brass', 'bronze snake', 'snake on a pole', 'serpent'], ref: 'Numbers 21:8-9; 2 Kings 18:4; John 3:14', point: 'Jesus said, “As Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up” (John 3:14).',
    clues: [
    'Centuries later, King Hezekiah broke me in pieces.',
    'I was set up on a pole in the wilderness.',
    'Anyone bitten by a fiery serpent who looked at me lived.'] },
  { answer: 'Balaam', accept: [], ref: 'Numbers 22–24', point: 'Balaam was hired to curse but could only bless. No one can curse those God has blessed.',
    clues: [
    'A king paid me to curse Israel, but blessings kept coming out.',
    'An angel with a drawn sword stood in my path.',
    'My donkey spoke to me.'] },
  { answer: 'Joshua', accept: ['oshea', 'hoshea', 'jehoshua'], ref: 'Numbers 13:16; Joshua 3; 6; 10:12-13', point: 'Joshua and Jesus share the same name, meaning the LORD saves. Hebrews 4:8 in the KJV even calls Joshua “Jesus”.',
    clues: [
    'Moses changed my name from Oshea.',
    'I asked the sun to stand still over Gibeon.',
    'I led Israel across the Jordan and around the walls of Jericho.'] },
  { answer: 'Caleb', accept: [], ref: 'Numbers 13:30; Joshua 14:6-14', point: 'Caleb “wholly followed the LORD God of Israel” (Joshua 14:14). A whole-hearted faith never gets old.',
    clues: [
    'At eighty-five I said I was as strong as I was at forty.',
    'I said, “Give me this mountain.”',
    'I was one of the twelve spies, and I said, “We are well able to overcome it.”'] },
  { answer: 'Achan', accept: [], ref: 'Joshua 7', point: 'One hidden sin troubled a whole nation. Jesus brings what’s hidden into the light, and forgives.',
    clues: [
    'Because of me, Israel lost the battle of Ai.',
    'The lot fell on me, tribe by tribe and family by family.',
    'I hid a Babylonish garment, silver and a wedge of gold under my tent.'] },
  { answer: 'The walls of Jericho', accept: ['walls of jericho', 'jericho', 'jericho walls', 'wall of jericho'], ref: 'Joshua 6', point: 'The walls fell by faith, not force (Hebrews 11:30). God fights for his people.',
    clues: [
    'For six days people walked around me in silence.',
    'On the seventh day they went around me seven times.',
    'A great shout and trumpets of rams’ horns brought me down flat.'] },
  { answer: 'The Jordan', accept: ['jordan', 'river jordan', 'jordan river'], ref: 'Joshua 3; 2 Kings 5:14; Matthew 3:13', point: 'At the Jordan, the Father said of Jesus, “This is my beloved Son, in whom I am well pleased” (Matthew 3:17).',
    clues: [
    'When the priests’ feet touched me, my waters stood up in a heap.',
    'A Syrian captain dipped in me seven times.',
    'John baptized Jesus in me.'] },
  // ---------- Judges, Ruth and Samuel ----------
  { answer: 'Ehud', accept: [], ref: 'Judges 3:15-26', point: 'God used a left-handed man nobody expected. He loves to work through the overlooked.',
    clues: [
    'Being left-handed was my secret weapon.',
    'I made a dagger a cubit long and hid it on my right thigh.',
    'I told fat King Eglon, “I have a message from God unto thee.”'] },
  { answer: 'Deborah', accept: [], ref: 'Judges 4–5', point: 'God raised up judges to rescue his people again and again. Jesus is the rescuer who never fails.',
    clues: [
    'I sat under a palm tree between Ramah and Bethel.',
    'I told Barak the honour would go to a woman.',
    'I was a prophetess and a judge of Israel, and I sang a victory song.'] },
  { answer: 'Jael', accept: [], ref: 'Judges 4:17-22; 5:24', point: 'Deborah’s song called Jael “blessed above women in the tent” (Judges 5:24). God brings victory through unlikely people.',
    clues: [
    'A thirsty general asked me for water and I gave him milk.',
    'I had a tent, a hammer and a nail.',
    'Sisera ran into my tent to hide and never left it.'] },
  { answer: 'Gideon', accept: ['jerubbaal'], ref: 'Judges 6–7', point: 'God cut Gideon’s army down so no one could boast. Salvation is always God’s work, not ours.',
    clues: [
    'I was threshing wheat by the winepress to hide it.',
    'I put out a fleece of wool, twice.',
    'With three hundred men, trumpets and lamps in pitchers, I routed Midian.'] },
  { answer: 'Jephthah', accept: ['jephthae'], ref: 'Judges 11', point: 'Jephthah’s rash vow cost him dearly. Think before you promise, and trust the God who keeps every promise.',
    clues: [
    'My half-brothers drove me out of the family.',
    'I made a rash vow before going to war with Ammon.',
    'My only daughter came out to meet me with timbrels and dances.'] },
  { answer: 'Naomi', accept: [], ref: 'Ruth 1; 4:14-17', point: 'Naomi came home bitter, and God filled her arms with a grandson in David’s line, the line of Jesus.',
    clues: [
    'I went to Moab with a husband and two sons and came back without them.',
    'I said, “Call me not Naomi, call me Mara.”',
    'My Moabite daughter-in-law said, “Whither thou goest, I will go.”'] },
  { answer: 'Ruth', accept: [], ref: 'Ruth 1–4; Matthew 1:5', point: 'A foreigner who trusted God became great-grandmother of King David and part of Jesus’ family line.',
    clues: [
    'I lay down at a man’s feet on a threshing floor.',
    'I gleaned barley in a field near Bethlehem.',
    'I told my mother-in-law, “Thy people shall be my people, and thy God my God.”'] },
  { answer: 'Boaz', accept: ['booz'], ref: 'Ruth 2–4', point: 'Boaz was a kinsman who paid to redeem. Jesus is our Redeemer who paid with his own life.',
    clues: [
    'I told my reapers to let some handfuls fall on purpose.',
    'I bought a field from Naomi at the city gate before witnesses.',
    'I married Ruth and became great-grandfather of David.'] },
  { answer: 'Hannah', accept: [], ref: '1 Samuel 1–2', point: 'Hannah poured out her soul before the LORD (1 Samuel 1:15). God hears honest prayer.',
    clues: [
    'Every year my husband’s other wife provoked me.',
    'The priest thought I was drunk while I prayed.',
    'I prayed for a son, named him Samuel and gave him back to the LORD.'] },
  { answer: 'Eli', accept: [], ref: '1 Samuel 3; 4:15-18', point: 'Eli taught young Samuel how to answer God. Pointing others to God’s voice is a gift.',
    clues: [
    'I was ninety-eight and my eyes were dim.',
    'I fell backward off my seat when I heard the ark was taken.',
    'A boy kept running to me in the night, saying, “Here am I.”'] },
  { answer: 'Samuel', accept: [], ref: '1 Samuel 2:19; 3; 10:1; 16:13', point: 'Samuel learned to listen early. God still speaks, most clearly through his Son (Hebrews 1:1-2).',
    clues: [
    'Every year my mother brought me a little coat.',
    'I anointed Israel’s first two kings.',
    'As a boy I answered, “Speak; for thy servant heareth.”'] },
  { answer: 'Saul', accept: ['king saul'], ref: '1 Samuel 9; 10:22; 18:10-11', point: 'Saul began humble but stopped obeying. God wants a heart that keeps trusting him, not just a good start.',
    clues: [
    'I was out looking for my father’s lost donkeys when I met a prophet.',
    'When they came to make me king, I was hiding among the baggage.',
    'I was Israel’s first king, and I threw a javelin at my young harpist.'] },
  { answer: 'Jonathan', accept: [], ref: '1 Samuel 14:13; 18:1-4', point: 'Jonathan gave up his claim to the throne out of love. Jesus is the friend who laid down his life (John 15:13).',
    clues: [
    'I climbed a cliff on hands and feet with only my armourbearer.',
    'I gave my friend my robe, my sword and my bow.',
    'I was King Saul’s son and David’s best friend.'] },
  { answer: 'Jesse', accept: [], ref: '1 Samuel 16; 17:12; Isaiah 11:1', point: 'Isaiah promised a rod “out of the stem of Jesse” (Isaiah 11:1). Jesus came from his family tree.',
    clues: [
    'My grandfather was Boaz.',
    'I had eight sons, and the youngest was out with the sheep.',
    'A prophet came to my home in Bethlehem and anointed my youngest son, David.'] },
  { answer: 'Abigail', accept: [], ref: '1 Samuel 25', point: 'Abigail stepped between David and revenge. “Blessed are the peacemakers” (Matthew 5:9).',
    clues: [
    'My husband’s name meant fool, and it suited him.',
    'I loaded donkeys with bread, wine, sheep, raisins and figs to stop a war.',
    'I was Nabal’s wife, and later I married David.'] },
  // ---------- Kings and prophets ----------
  { answer: 'David', accept: [], ref: '1 Samuel 16–17; 2 Samuel 5', point: 'Jesus was called “the son of David” (Matthew 1:1), the King whose kingdom has no end.',
    clues: [
    'I was the youngest of eight brothers.',
    'I played the harp to calm a troubled king.',
    'With a sling and a stone, I faced a giant.'] },
  { answer: 'Mephibosheth', accept: [], ref: '2 Samuel 4:4; 9', point: 'Mephibosheth ate at the king’s table for someone else’s sake. That is grace: we are welcomed for Jesus’ sake.',
    clues: [
    'My nurse dropped me when I was five, and I was lame from then on.',
    'I called myself a dead dog.',
    'King David let me eat at his table for my father Jonathan’s sake.'] },
  { answer: 'Absalom', accept: [], ref: '2 Samuel 14:25-26; 15:6; 18', point: 'David cried, “Would God I had died for thee” (2 Samuel 18:33). What David wished, Jesus did: he died for rebels.',
    clues: [
    'When I cut my hair each year, it weighed two hundred shekels.',
    'I stole the hearts of the men of Israel at the city gate.',
    'My head caught in an oak tree as my mule ran on without me.'] },
  { answer: 'Nathan', accept: ['nathan the prophet'], ref: '2 Samuel 7; 12; 1 Kings 1', point: 'Through Nathan, God promised David a throne for ever (2 Samuel 7:16). Jesus is that King.',
    clues: [
    'I helped make sure Solomon, not Adonijah, was crowned.',
    'God sent me to promise David a kingdom that would last for ever.',
    'I told King David a story about a poor man’s ewe lamb, then said, “Thou art the man.”'] },
  { answer: 'Solomon', accept: ['jedidiah'], ref: '2 Samuel 12:24-25; 1 Kings 3', point: 'Solomon’s wisdom was a gift. In Christ “are hid all the treasures of wisdom and knowledge” (Colossians 2:3).',
    clues: [
    'A prophet also named me Jedidiah.',
    'I asked God for an understanding heart, not riches.',
    'I called for a sword to settle which woman was a baby’s real mother.'] },
  { answer: 'The queen of Sheba', accept: ['queen of sheba', 'sheba', 'queen of the south'], ref: '1 Kings 10:1-10; Matthew 12:42', point: 'Jesus said she travelled far to hear Solomon, and “a greater than Solomon is here” (Matthew 12:42).',
    clues: [
    'I came with camels carrying spices, gold and precious stones.',
    'I said, “The half was not told me.”',
    'I travelled to Jerusalem to test Solomon with hard questions.'] },
  { answer: 'Rehoboam', accept: ['roboam'], ref: '1 Kings 12', point: 'Rehoboam ignored wise counsel and lost most of a kingdom. Jesus said the greatest is the one who serves (Luke 22:26).',
    clues: [
    'I listened to the young men instead of the old men.',
    'I said my little finger would be thicker than my father’s loins.',
    'I was Solomon’s son, and ten tribes broke away from me.'] },
  { answer: 'Jeroboam', accept: [], ref: '1 Kings 11:29-31; 12:28-29; 13:4', point: 'Jeroboam made worship easy and wrong. Jesus said true worshippers worship “in spirit and in truth” (John 4:24).',
    clues: [
    'My hand dried up when I stretched it out against a man of God.',
    'A prophet tore his new garment into twelve pieces and gave me ten.',
    'I set up golden calves at Bethel and Dan.'] },
  { answer: 'Elisha', accept: ['eliseus'], ref: '1 Kings 19:19; 2 Kings 2:9; 4:42-44; 6:5-6', point: 'Elisha fed a hundred men with twenty loaves (2 Kings 4:42-44). Jesus later fed thousands with even less.',
    clues: [
    'I was ploughing with twelve yoke of oxen when a mantle landed on me.',
    'I asked for a double portion of my master’s spirit.',
    'I made a borrowed axe head float.'] },
  { answer: 'The Shunammite woman', accept: ['shunammite', 'shunammite woman', 'woman of shunem', 'great woman of shunem'], ref: '2 Kings 4:8-37', point: 'She said, “It is well,” and ran to God’s prophet. In grief, run to God, not away from him.',
    clues: [
    'I built a little room on the wall with a bed, table, stool and candlestick.',
    'I said, “It is well,” on the day my son died.',
    'Elisha promised me a son and later raised him back to life.'] },
  { answer: 'Naaman', accept: [], ref: '2 Kings 5; Luke 4:27', point: 'Jesus mentioned Naaman (Luke 4:27). God’s grace reaches outsiders who humble themselves.',
    clues: [
    'A little captive maid in my house told my wife about a prophet.',
    'I was furious that the prophet didn’t even come out to meet me.',
    'I was a Syrian captain who dipped seven times in the Jordan and was healed of leprosy.'] },
  { answer: 'Gehazi', accept: [], ref: '2 Kings 4:14; 5:20-27', point: 'Grace cannot be sold. Jesus said, “freely ye have received, freely give” (Matthew 10:8).',
    clues: [
    'I pointed out that the Shunammite had no child and her husband was old.',
    'I ran after a healed Syrian to collect silver and clothes.',
    'I was Elisha’s servant, and I left his presence a leper as white as snow.'] },
  { answer: 'Ahab', accept: ['king ahab'], ref: '1 Kings 18:17; 21:4; 22:30-37', point: 'Ahab heard God’s warnings and still went his own way. God’s word is meant to be obeyed, not just heard.',
    clues: [
    'I called God’s prophet the troubler of Israel.',
    'I lay on my bed and wouldn’t eat because a man wouldn’t sell me his vineyard.',
    'I disguised myself in battle, but an arrow shot at random found me.'] },
  { answer: 'Jezebel', accept: [], ref: '1 Kings 19:2; 21:8; 2 Kings 9:30-33', point: 'Jezebel’s power ended suddenly. God’s justice is sure, and his mercy in Jesus is open to anyone who turns.',
    clues: [
    'I wrote letters in my husband’s name and sealed them with his seal.',
    'I painted my face and looked out of a window.',
    'I was Ahab’s queen, and I swore to kill Elijah.'] },
  { answer: 'Naboth', accept: [], ref: '1 Kings 21', point: 'Naboth died through false witnesses. So did Jesus, the innocent one (Mark 14:56).',
    clues: [
    'I said, “The LORD forbid it me, that I should give the inheritance of my fathers.”',
    'Two false witnesses said I blasphemed God and the king.',
    'I was stoned so King Ahab could have my vineyard.'] },
  { answer: 'Jehu', accept: [], ref: '2 Kings 9', point: 'God’s word about Ahab’s house came true to the letter. What God says, he does.',
    clues: [
    'A young prophet anointed me king in an inner room, then ran.',
    'The watchman said I drove furiously.',
    'I ordered Jezebel thrown down from a window.'] },
  { answer: 'Joash', accept: ['jehoash'], ref: '2 Kings 11–12', point: 'God protected David’s royal line through one hidden baby, the line Jesus would be born from.',
    clues: [
    'My aunt Jehosheba rescued me from a murderous grandmother.',
    'I was hidden in the house of the LORD for six years.',
    'I was crowned king at seven years old.'] },
  { answer: 'Uzziah', accept: ['azariah', 'ozias'], ref: '2 Chronicles 26; Isaiah 6:1', point: 'In the year Uzziah died, Isaiah saw the Lord on his throne (Isaiah 6:1). Kings come and go; God reigns.',
    clues: [
    'I became king at sixteen, and I loved farming.',
    'I went into the temple to burn incense, which only priests could do.',
    'Leprosy rose up in my forehead, and I lived apart until I died.'] },
  { answer: 'Hezekiah', accept: ['ezekias'], ref: '2 Kings 18:4; 19:14; 20:1-11', point: 'Hezekiah took his trouble straight to God. We can too, through Jesus, who “ever liveth to make intercession” (Hebrews 7:25).',
    clues: [
    'I broke in pieces the brass serpent Moses had made.',
    'I spread a threatening letter out before the LORD.',
    'God added fifteen years to my life, and a shadow went back ten degrees.'] },
  { answer: 'Josiah', accept: ['josias'], ref: '2 Kings 22–23', point: 'When Josiah heard God’s word, he tore his clothes and changed the nation. God’s word still changes people.',
    clues: [
    'I became king when I was eight years old.',
    'During temple repairs, the book of the law was found.',
    'When the book was read to me, I tore my clothes and led the people back to God.'] },
  { answer: 'Isaiah', accept: ['esaias'], ref: 'Isaiah 6; 9:6; 53', point: 'Isaiah wrote of one “wounded for our transgressions” (Isaiah 53:5): Jesus.',
    clues: [
    'A seraph touched my lips with a live coal.',
    'I said, “Here am I; send me.”',
    'I wrote, “For unto us a child is born, unto us a son is given.”'] },
  { answer: 'Jeremiah', accept: ['jeremias', 'jeremy'], ref: 'Jeremiah 1:6-7; 18; 31:31; 32; 38:6-13', point: 'Jeremiah promised a new covenant (Jeremiah 31:31). Jesus said, “This cup is the new testament in my blood” (Luke 22:20).',
    clues: [
    'I watched a potter remake a marred vessel on the wheels.',
    'I bought a field while Babylon’s army surrounded the city.',
    'I was let down into a muddy dungeon and pulled out with old rags and cords.'] },
  { answer: 'Ezekiel', accept: [], ref: 'Ezekiel 3:3; 4:4-9; 37', point: 'Only God can make dry bones live. Jesus gives new life to people who are dead in sin (Ephesians 2:5).',
    clues: [
    'I lay on my side for three hundred and ninety days as a sign.',
    'I ate a scroll, and it tasted as sweet as honey.',
    'I prophesied to a valley of dry bones, and they came together.'] },
  { answer: 'Daniel', accept: ['belteshazzar'], ref: 'Daniel 1; 5; 6', point: 'Daniel kept praying when it was illegal. The God who shut the lions’ mouths also raised Jesus from the dead.',
    clues: [
    'I asked for pulse and water instead of the king’s food.',
    'I read the writing on the wall when no one else could.',
    'I spent a night in a den of lions.'] },
  { answer: 'Nebuchadnezzar', accept: ['nebuchadrezzar'], ref: 'Daniel 2; 3; 4', point: 'The proudest king in the world ended up praising “the King of heaven” (Daniel 4:37). Every knee will bow to Jesus.',
    clues: [
    'I dreamed of a great image with a head of gold.',
    'For a time I ate grass like oxen.',
    'I threw three men into a burning furnace and saw four walking in it.'] },
  { answer: 'Belshazzar', accept: [], ref: 'Daniel 5', point: 'God’s verdict was “Thou art weighed in the balances, and art found wanting” (Daniel 5:27). In Jesus we are given a righteousness that never falls short.',
    clues: [
    'I drank from gold cups taken from God’s temple at my feast.',
    'My knees knocked together when I saw a hand writing.',
    'MENE, MENE, TEKEL, UPHARSIN was the message written on my wall.'] },
  { answer: 'Shadrach, Meshach and Abed-nego', accept: ['shadrach meshach and abednego', 'shadrach meshach abednego', 'shadrach meshach and abed nego', 'hananiah mishael and azariah', 'three hebrews', 'three hebrew boys', 'three hebrew men'], ref: 'Daniel 1:7; 3', point: 'They trusted God even if he didn’t rescue them. In the fire, they were not alone, and neither are we.',
    clues: [
    'We were given new names in Babylon.',
    'We told the king our God was able to deliver us, “But if not,” we still would not bow.',
    'We walked in a burning fiery furnace with a fourth man.'] },
  { answer: 'Mordecai', accept: ['mardochaeus'], ref: 'Esther 2:7, 21-23; 3:2; 6', point: 'Mordecai’s faithfulness was remembered at just the right time. God is never late.',
    clues: [
    'I found out about a plot against the king, and it was written in a book.',
    'I would not bow down to Haman.',
    'I raised my cousin Esther, and I rode through the city on the king’s horse.'] },
  { answer: 'Haman', accept: [], ref: 'Esther 3:7; 6:6; 7:10', point: 'Haman’s pride built his own downfall. “God resisteth the proud, but giveth grace unto the humble” (James 4:6).',
    clues: [
    'I cast Pur, the lot, to choose a day.',
    'I thought the king wanted to honour me, so I described a royal parade.',
    'I was hanged on the gallows I built for Mordecai.'] },
  { answer: 'Nehemiah', accept: ['neemias'], ref: 'Nehemiah 1–2; 6:15', point: 'Nehemiah prayed and then got to work. Faith and hard work go together.',
    clues: [
    'I was the king’s cupbearer in Shushan.',
    'Before answering the king, I prayed to the God of heaven.',
    'I led the rebuilding of Jerusalem’s wall in fifty-two days.'] },
  { answer: 'Ezra', accept: ['esdras'], ref: 'Ezra 7:6; 8:21-23; Nehemiah 8', point: 'When Ezra read the law, the people wept and then rejoiced. God’s word is meant to be understood and lived.',
    clues: [
    'I was ashamed to ask the king for soldiers to guard our journey.',
    'I was a ready scribe in the law of Moses.',
    'I stood on a wooden pulpit and read the law to the people from morning until midday.'] },
  { answer: 'Job', accept: [], ref: 'Job 1–2; 19:25', point: 'Job said, “I know that my redeemer liveth” (Job 19:25). Jesus is that living Redeemer.',
    clues: [
    'Three friends sat with me for seven days without saying a word.',
    'I sat in ashes and scraped myself with a piece of broken pottery.',
    'I lost everything and said, “The LORD gave, and the LORD hath taken away.”'] },
  { answer: 'Hosea', accept: ['osee'], ref: 'Hosea 1:2-9; 3:1-2', point: 'Hosea bought back an unfaithful wife. God loves his people like that, and Jesus paid the price to bring us home.',
    clues: [
    'My children’s names were messages: Lo-ruhamah and Lo-ammi.',
    'I bought my wife back for fifteen pieces of silver and some barley.',
    'I was a prophet told to marry Gomer.'] },
  { answer: 'Amos', accept: [], ref: 'Amos 7:7-14; 5:24', point: 'Amos called for justice to “run down as waters”. Jesus cared for the poor, and so should his people.',
    clues: [
    'I was a herdman and a gatherer of sycomore fruit.',
    'I saw the Lord standing on a wall with a plumbline.',
    'I said, “Let judgment run down as waters, and righteousness as a mighty stream.”'] },
  { answer: 'Nineveh', accept: ['ninevah'], ref: 'Jonah 3–4', point: 'God cared about a city full of enemies. Jesus came for the whole world (John 3:16).',
    clues: [
    'I was a great city of three days’ journey.',
    'Even my cattle were covered with sackcloth.',
    'A runaway prophet finally preached to me, and I repented.'] },
  // ---------- The Gospels ----------
  { answer: 'Zacharias', accept: ['zachariah', 'zechariah', 'zacharias the priest'], ref: 'Luke 1:5-22, 59-64', point: 'When Zacharias could speak again, he praised God for raising up “an horn of salvation” (Luke 1:69). His son would prepare the way for Jesus.',
    clues: [
    'I was burning incense in the temple when an angel stood by the altar.',
    'I could not speak for months because I didn’t believe the message.',
    'I wrote on a writing table, “His name is John.”'] },
  { answer: 'Elisabeth', accept: ['elizabeth'], ref: 'Luke 1:24, 36, 41-43, 57', point: 'Elisabeth called Mary “the mother of my Lord” (Luke 1:43) before Jesus was even born.',
    clues: [
    'I hid myself for five months.',
    'My baby leaped in my womb when my cousin greeted me.',
    'I was Zacharias’ wife and the mother of John the Baptist.'] },
  { answer: 'Mary, mother of Jesus', accept: ['mary', 'mary mother of jesus', 'virgin mary', 'mary of nazareth'], ref: 'Luke 1:26-38, 46-47; 2:7', point: 'Mary said, “Be it unto me according to thy word” (Luke 1:38). Trust like hers makes room for God to work.',
    clues: [
    'I asked an angel, “How shall this be, seeing I know not a man?”',
    'I sang, “My soul doth magnify the Lord.”',
    'I wrapped my firstborn son in swaddling clothes and laid him in a manger.'] },
  { answer: 'Joseph, husband of Mary', accept: ['joseph', 'joseph of nazareth', 'joseph the carpenter'], ref: 'Matthew 1:19-25; 2:13-23; 13:55', point: 'Joseph obeyed quietly and quickly every time God spoke. Jesus grew up in the home of a man who listened.',
    clues: [
    'I planned to end my engagement quietly, without shaming anyone.',
    'Dreams told me when to marry, when to flee to Egypt and when to come home.',
    'I was a carpenter, and Jesus grew up in my home in Nazareth.'] },
  { answer: 'The shepherds', accept: ['shepherds', 'shepherd'], ref: 'Luke 2:8-20', point: 'The first to hear the good news were ordinary workers on a night shift. Jesus came for everyday people.',
    clues: [
    'We were working the night shift in the fields.',
    'A multitude of angels sang, “Glory to God in the highest.”',
    'We found a baby lying in a manger in Bethlehem and told everyone.'] },
  { answer: 'The star', accept: ['star', 'star of bethlehem', 'christmas star', 'his star'], ref: 'Matthew 2:2, 9-10', point: 'Even the sky pointed travellers to Jesus. Revelation calls him “the bright and morning star” (Revelation 22:16).',
    clues: [
    'I was first seen in the east.',
    'I went before travellers and stood still over where the young child was.',
    'Wise men followed me to find the King of the Jews.'] },
  { answer: 'King Herod', accept: ['herod', 'herod the great'], ref: 'Matthew 2:1-16', point: 'Herod feared losing his throne to a baby. Jesus is a King who came to serve, not to grab power.',
    clues: [
    'When I heard of a newborn king, I was troubled, and all Jerusalem with me.',
    'I told the wise men to come back and tell me, “that I may come and worship him also.”',
    'I ordered every boy in Bethlehem two years old and under to be killed.'] },
  { answer: 'Simeon', accept: [], ref: 'Luke 2:25-35', point: 'Simeon held the baby Jesus and said, “Mine eyes have seen thy salvation” (Luke 2:30).',
    clues: [
    'It was revealed to me that I would not die before seeing the Lord’s Christ.',
    'The Spirit led me into the temple on just the right day.',
    'I took the baby Jesus in my arms and said, “Lord, now lettest thou thy servant depart in peace.”'] },
  { answer: 'Anna', accept: ['anna the prophetess'], ref: 'Luke 2:36-38', point: 'Anna waited for decades and then couldn’t stop talking about Jesus. He is worth the wait.',
    clues: [
    'I was of the tribe of Aser.',
    'I was a widow of about fourscore and four years.',
    'A prophetess who never left the temple, I spoke of baby Jesus to everyone looking for redemption.'] },
  { answer: 'John the Baptist', accept: ['john baptist', 'baptist', 'john the baptizer'], ref: 'Luke 1:41; Matthew 3:4; John 1:29', point: 'John pointed away from himself: “He must increase, but I must decrease” (John 3:30).',
    clues: [
    'I leaped for joy before I was even born.',
    'I wore camel’s hair and ate locusts and wild honey.',
    'I saw Jesus coming and said, “Behold the Lamb of God.”'] },
  { answer: 'Andrew', accept: [], ref: 'John 1:40-42; 6:8-9', point: 'Andrew’s gift was bringing people to Jesus. That is a gift anyone can use.',
    clues: [
    'I used to be a disciple of John the Baptist.',
    'I pointed out a lad with five barley loaves and two small fishes.',
    'I found my brother Simon and told him, “We have found the Messias.”'] },
  { answer: 'Philip', accept: ['philip the apostle'], ref: 'John 1:43-46; 6:5-7; 14:8-9', point: 'Jesus told Philip, “he that hath seen me hath seen the Father” (John 14:9). Want to know what God is like? Look at Jesus.',
    clues: [
    'I said, “Lord, shew us the Father, and it sufficeth us.”',
    'I worked out that two hundred pennyworth of bread would not be enough.',
    'I found Nathanael and told him, “Come and see.”'] },
  { answer: 'Nathanael', accept: ['nathaniel'], ref: 'John 1:45-51', point: 'Nathanael doubted Nazareth, but Jesus already knew him. Jesus knows you before you come to him.',
    clues: [
    'I asked, “Can there any good thing come out of Nazareth?”',
    'Jesus said he saw me under the fig tree.',
    'Jesus called me “an Israelite indeed, in whom is no guile.”'] },
  { answer: 'Matthew', accept: ['levi', 'matthew levi'], ref: 'Matthew 9:9; Luke 5:27-29', point: 'Jesus called a tax collector and ate with sinners. He said he came “to call... sinners to repentance” (Luke 5:32).',
    clues: [
    'I was sitting at the receipt of custom when I was called.',
    'I threw a great feast for Jesus with a crowd of publicans.',
    'A tax collector turned apostle, I have a Gospel named after me.'] },
  { answer: 'James', accept: ['james son of zebedee', 'james the son of zebedee'], ref: 'Mark 3:17; 10:35-37; Acts 12:2', point: 'James asked for a seat of glory and learned to drink Jesus’ cup instead. Following Jesus is worth everything.',
    clues: [
    'My brother and I asked to sit on Jesus’ right and left in his glory.',
    'Jesus surnamed my brother and me Boanerges, the sons of thunder.',
    'I was the son of Zebedee, killed with the sword by King Herod.'] },
  { answer: 'John', accept: ['john the apostle', 'apostle john', 'john son of zebedee'], ref: 'Luke 22:8; Acts 3:1-8; Revelation 1:9-17', point: 'On Patmos, John saw Jesus in glory and heard, “Fear not; I am the first and the last” (Revelation 1:17).',
    clues: [
    'Peter and I were sent ahead to prepare the Passover.',
    'Peter and I healed a lame man at the temple gate called Beautiful.',
    'On the isle of Patmos I saw visions and wrote them down.'] },
  { answer: 'Mary Magdalene', accept: ['magdalene', 'mary magdalen', 'mary of magdala'], ref: 'Mark 16:9; John 20:11-18', point: 'The first person to see the risen Jesus was a woman he had set free. He called her by her name.',
    clues: [
    'Jesus had cast seven devils out of me.',
    'I stood by the cross and went to the tomb early, while it was still dark.',
    'I thought the risen Jesus was the gardener until he said my name.'] },
  { answer: 'Martha', accept: [], ref: 'Luke 10:38-42; John 11:20-27', point: 'Martha told Jesus, “I believe that thou art the Christ, the Son of God” (John 11:27). Busy hands can have believing hearts.',
    clues: [
    'I went out to meet Jesus while my sister stayed in the house.',
    'Jesus said I was careful and troubled about many things.',
    'I was cumbered about much serving while my sister sat at Jesus’ feet.'] },
  { answer: 'Mary of Bethany', accept: ['mary', 'mary sister of martha', 'mary sister of lazarus'], ref: 'Luke 10:39-42; John 11:1-2; 12:3', point: 'Jesus said Mary had “chosen that good part” (Luke 10:42): time at his feet is never wasted.',
    clues: [
    'Jesus said I had chosen the good part.',
    'My brother walked out of a tomb.',
    'I anointed Jesus’ feet with costly spikenard and wiped them with my hair.'] },
  { answer: 'Bartimaeus', accept: ['bartimeus', 'blind bartimaeus'], ref: 'Mark 10:46-52', point: 'People told him to be quiet, so he shouted louder. Jesus stopped for him. He still stops for those who call.',
    clues: [
    'I threw away my garment and jumped up.',
    'I sat begging by the roadside outside Jericho.',
    'I was blind, and I cried out, “Jesus, thou Son of David, have mercy on me.”'] },
  { answer: 'Jairus', accept: [], ref: 'Mark 5:22-43', point: 'Jesus told Jairus, “Be not afraid, only believe” (Mark 5:36). Even death is not too late for him.',
    clues: [
    'I was a ruler of the synagogue.',
    'On the way to my house, messengers said, “Why troublest thou the Master any further?”',
    'Jesus took my twelve-year-old daughter by the hand and said, “Talitha cumi.”'] },
  { answer: 'Legion', accept: ['gadarene demoniac', 'demoniac', 'gadarene', 'man with legion'], ref: 'Mark 5:1-20', point: 'The man nobody could tame sat clothed and in his right mind. Jesus sent him home to tell his friends.',
    clues: [
    'I lived among the tombs, and no chains could hold me.',
    'About two thousand pigs ran into the sea after the spirits left me.',
    'Asked my name, I said, “My name is Legion: for we are many.”'] },
  { answer: 'Malchus', accept: [], ref: 'Luke 22:50-51; John 18:10', point: 'Even while being arrested, Jesus healed one of the men who came for him. That is how he treats enemies.',
    clues: [
    'I was a servant of the high priest.',
    'I came to a garden at night with lanterns and weapons.',
    'Peter cut off my right ear, and Jesus touched it and healed me.'] },
  { answer: 'Barabbas', accept: ['barabas'], ref: 'Mark 15:6-15', point: 'A guilty man went free while an innocent man died in his place. That is the gospel in one picture.',
    clues: [
    'I was in prison for insurrection and murder.',
    'The governor offered the crowd a choice at the feast.',
    'The crowd shouted for me to be released, and Jesus was crucified.'] },
  { answer: 'Pontius Pilate', accept: ['pilate', 'pontius pilot', 'pilot'], ref: 'Matthew 27:19, 24; John 18:38', point: 'Pilate asked, “What is truth?” while Truth stood in front of him (John 14:6).',
    clues: [
    'I asked, “What is truth?”',
    'My wife sent me a message about a dream.',
    'I washed my hands in front of the crowd.'] },
  { answer: 'Simon of Cyrene', accept: ['simon', 'simon the cyrenian', 'cyrenian'], ref: 'Mark 15:21', point: 'Simon carried the cross for a while. Jesus carried our sin all the way.',
    clues: [
    'I was coming in from the country.',
    'My sons were Alexander and Rufus.',
    'Soldiers compelled me to carry Jesus’ cross.'] },
  { answer: 'Joseph of Arimathaea', accept: ['joseph of arimathea', 'joseph'], ref: 'Mark 15:43-46; Matthew 27:57-60', point: 'Joseph came out of hiding to honour Jesus. In the end, love for Jesus is worth the risk.',
    clues: [
    'I was a rich man and an honourable counsellor.',
    'I went in boldly to Pilate and asked for a body.',
    'I laid Jesus in my own new tomb.'] },
  { answer: 'Peter’s mother-in-law', accept: ['peters mother in law', 'mother in law', 'simons wifes mother', 'simons mother in law'], ref: 'Mark 1:29-31; Luke 4:38-39', point: 'She was healed and immediately served. Being made well by Jesus makes us want to help others.',
    clues: [
    'I lay sick in a house in Capernaum.',
    'Jesus rebuked my fever, and it left me.',
    'As soon as I was healed, I got up and served them. My son-in-law was a fisherman named Simon.'] },
  // ---------- Things, places and creatures in the Gospels ----------
  { answer: 'Bethlehem', accept: ['bethlehem ephratah', 'bethlehem judah'], ref: 'Micah 5:2; Genesis 35:19; Luke 2:4', point: 'Micah named the little town centuries early (Micah 5:2). God plans the details.',
    clues: [
    'Rachel was buried on the way to me.',
    'Micah said I was little among the thousands of Judah.',
    'I am the city of David, where Jesus was born.'] },
  { answer: 'Nazareth', accept: [], ref: 'John 1:46; Luke 4:16-30', point: 'Jesus came from a town people looked down on. God is not impressed by reputation.',
    clues: [
    'Someone asked if any good thing could come out of me.',
    'My synagogue crowd tried to throw Jesus off the brow of a hill.',
    'Jesus grew up in me.'] },
  { answer: 'The Mount of Olives', accept: ['mount of olives', 'olivet', 'mount olivet'], ref: 'Matthew 24:3; 26:30; Acts 1:9-12', point: 'From Olivet Jesus was taken up, and the angels said he will come again “in like manner” (Acts 1:11).',
    clues: [
    'Jesus sat on me and told his disciples about the end of the age.',
    'After the Last Supper they sang a hymn and went out to me.',
    'Jesus ascended to heaven from me, near Bethany.'] },
  { answer: 'Gethsemane', accept: ['garden of gethsemane', 'gethsemene'], ref: 'Matthew 26:36-49; Luke 22:42', point: 'Jesus prayed, “not my will, but thine, be done” (Luke 22:42), and then went to the cross for us.',
    clues: [
    'Three disciples kept falling asleep in me.',
    'Jesus prayed in me, “not my will, but thine, be done.”',
    'Judas came to me with a crowd and a kiss.'] },
  { answer: 'The Last Supper', accept: ['last supper', 'lords supper', 'passover meal', 'communion'], ref: 'Mark 14:15-25; John 13:30', point: 'Jesus said, “This is my body” and “This is my blood of the new testament” (Mark 14:22, 24). He was about to give both.',
    clues: [
    'It was held in a large upper room, furnished and prepared.',
    'One guest dipped with Jesus in the dish and went out into the night.',
    'Jesus took bread, broke it and said, “Take, eat: this is my body.”'] },
  { answer: 'The cross', accept: ['cross', 'the tree'], ref: 'Mark 15:21; John 19:17-20', point: 'Jesus “bare our sins in his own body on the tree” (1 Peter 2:24).',
    clues: [
    'A man from Cyrene was made to carry me.',
    'A title in Hebrew, Greek and Latin hung above me.',
    'Jesus died on me at Golgotha.'] },
  { answer: 'The crown of thorns', accept: ['crown of thorns', 'thorns', 'crown'], ref: 'Matthew 27:29; John 19:5', point: 'Thorns came with the curse in Genesis 3:18. Jesus wore them as he carried the curse for us.',
    clues: [
    'Soldiers plaited me together.',
    'I came with a purple robe and a reed.',
    'I was pressed onto the head of the King of the Jews.'] },
  { answer: 'Thirty pieces of silver', accept: ['30 pieces of silver', 'thirty silver pieces', 'silver', 'pieces of silver'], ref: 'Zechariah 11:12-13; Matthew 26:15; 27:3-7', point: 'Jesus was sold for the price of a slave (Exodus 21:32), so that we could be bought back.',
    clues: [
    'Zechariah wrote about me being cast to the potter.',
    'I was thrown down on the temple floor, and I bought a field.',
    'Judas was paid me to betray Jesus.'] },
  { answer: 'The veil of the temple', accept: ['veil', 'temple veil', 'veil of the temple', 'curtain', 'temple curtain'], ref: 'Exodus 26:31-33; Matthew 27:51; Hebrews 10:19-20', point: 'Through Jesus there is “a new and living way” into God’s presence (Hebrews 10:20).',
    clues: [
    'Cherubims were worked into me with blue, purple and scarlet.',
    'I divided the holy place from the most holy.',
    'When Jesus died, I was torn from the top to the bottom.'] },
  { answer: 'The empty tomb', accept: ['empty tomb', 'tomb', 'sepulchre', 'grave', 'empty grave'], ref: 'Matthew 27:60-66; John 20:1-7', point: '“He is not here: for he is risen, as he said” (Matthew 28:6). Everything hangs on this.',
    clues: [
    'A great stone was rolled to my door, and it was sealed and guarded.',
    'Linen clothes lay inside me, and a napkin folded in a place by itself.',
    'On the first day of the week, women found me empty.'] },
  { answer: 'The cock', accept: ['cock', 'rooster', 'cockerel', 'chicken'], ref: 'Matthew 26:34, 74-75', point: 'Peter wept bitterly, but Jesus restored him. The sound of failure is not the end of the story.',
    clues: [
    'I am a bird, and a prophecy depended on my timing.',
    'Jesus said I would not sound before three denials.',
    'When I crew, Peter remembered and wept bitterly.'] },
  { answer: 'The dove', accept: ['dove', 'doves', 'pigeon'], ref: 'Genesis 8:11; Matthew 10:16; 3:16', point: 'At Jesus’ baptism the Spirit came down like a dove, and the Father said, “This is my beloved Son” (Matthew 3:17).',
    clues: [
    'I once came back with an olive leaf in my mouth.',
    'Jesus told his disciples to be harmless like me.',
    'The Spirit of God came down like me at Jesus’ baptism.'] },
  { answer: 'Ravens', accept: ['raven'], ref: 'Genesis 8:7; Luke 12:24; 1 Kings 17:6', point: 'Jesus said God feeds the ravens, and “how much more are ye better than the fowls?” (Luke 12:24).',
    clues: [
    'One of us flew to and fro from the ark until the waters dried up.',
    'Jesus said we neither sow nor reap, yet God feeds us.',
    'We brought bread and flesh to Elijah by the brook Cherith.'] },
  { answer: 'The donkey', accept: ['donkey', 'ass', 'colt', 'foal', 'ass colt'], ref: 'Zechariah 9:9; Luke 19:30-35', point: 'Jesus came as a humble King, “lowly, and riding upon an ass” (Zechariah 9:9).',
    clues: [
    'Zechariah said a king would come riding on me.',
    'Two disciples untied me and said, “The Lord hath need of him.”',
    'Jesus rode me into Jerusalem while people spread their clothes on the road.'] },
  { answer: 'The fig tree', accept: ['fig tree', 'fig', 'figtree'], ref: 'Genesis 3:7; John 1:48; Mark 11:13-14', point: 'Jesus looks for real fruit, not just leaves. He wants a living faith, not a show.',
    clues: [
    'Adam and Eve sewed my leaves into aprons.',
    'Jesus said he saw Nathanael under me.',
    'Jesus found me with leaves but no fruit, and I withered.'] },
  { answer: 'The mustard seed', accept: ['mustard seed', 'mustard', 'grain of mustard seed'], ref: 'Matthew 13:31-32; 17:20', point: 'Jesus said faith the size of a mustard seed can move mountains. A small faith in a great God goes far.',
    clues: [
    'I am the least of all seeds.',
    'I grow into a tree where birds lodge in my branches.',
    'Jesus said faith as small as me could move a mountain.'] },
  { answer: 'The lost sheep', accept: ['lost sheep', 'sheep'], ref: 'Luke 15:3-7', point: 'Jesus is the Good Shepherd who goes looking. There is joy in heaven over one sinner who repents.',
    clues: [
    'I am one, and ninety and nine were left behind in the wilderness.',
    'Someone carried me home on his shoulders, rejoicing.',
    'In Jesus’ story, the shepherd searched until he found me.'] },
  { answer: 'The Good Samaritan', accept: ['good samaritan', 'samaritan'], ref: 'Luke 10:30-37', point: 'Jesus told this to show who our neighbour is. He went even further, saving us when we were his enemies.',
    clues: [
    'A priest and a Levite passed by before I did.',
    'I paid two pence to an innkeeper and promised more.',
    'I poured oil and wine on a stranger’s wounds on the road to Jericho.'] },
  { answer: 'The widow’s mites', accept: ['widows mites', 'two mites', 'mites', 'widows mite', 'mite', 'widow'], ref: 'Mark 12:41-44', point: 'Jesus measured the gift by the heart, not the amount. She gave “all that she had”.',
    clues: [
    'Two of me make a farthing.',
    'I was dropped into the treasury next to big gifts from rich people.',
    'Jesus said I was more than everyone else gave, because it was all she had.'] },
  { answer: 'The Lord’s Prayer', accept: ['lords prayer', 'our father', 'the our father'], ref: 'Matthew 6:9-13', point: 'Jesus taught us to call God “Our Father”. Through him we really can.',
    clues: [
    'I ask for daily bread.',
    'I ask God to forgive us as we forgive others.',
    'Jesus taught me to his disciples: “Our Father which art in heaven.”'] },
  { answer: 'The Sermon on the Mount', accept: ['sermon on the mount', 'beatitudes'], ref: 'Matthew 5–7', point: 'The people were astonished, for Jesus taught “as one having authority” (Matthew 7:29).',
    clues: [
    'I end with two builders, one on rock and one on sand.',
    'I include “Ye are the light of the world.”',
    'I begin with “Blessed are the poor in spirit,” and Jesus preached me on a mountain.'] },
  // ---------- Acts and the early church ----------
  { answer: 'The day of Pentecost', accept: ['pentecost', 'day of pentecost'], ref: 'Acts 2', point: 'Jesus kept his promise to send the Holy Spirit (Acts 1:8). The church was born preaching Christ crucified and risen.',
    clues: [
    'A sound like a rushing mighty wind filled a house.',
    'Visitors from many nations heard the disciples in their own languages.',
    'Peter preached, and about three thousand were added in one day.'] },
  { answer: 'Matthias', accept: ['mathias'], ref: 'Acts 1:21-26', point: 'Matthias had followed Jesus from the start without fame. Faithfulness in the background is seen by God.',
    clues: [
    'I had been with the disciples since John’s baptism.',
    'My name was put forward alongside Joseph called Barsabas.',
    'The lot fell on me, and I took Judas’ place among the apostles.'] },
  { answer: 'Stephen', accept: [], ref: 'Acts 6:5, 15; 7:55-60', point: 'Like Jesus, Stephen prayed for those who killed him. He saw Jesus standing at God’s right hand.',
    clues: [
    'I was one of seven chosen to serve the widows’ tables.',
    'My face looked like the face of an angel.',
    'While being stoned, I prayed, “Lord, lay not this sin to their charge.”'] },
  { answer: 'The Ethiopian eunuch', accept: ['ethiopian eunuch', 'ethiopian', 'eunuch'], ref: 'Acts 8:26-39', point: 'Philip “preached unto him Jesus” from Isaiah 53. The whole Bible points to him.',
    clues: [
    'I was treasurer to Candace, queen of the Ethiopians.',
    'I was reading Isaiah aloud in my chariot.',
    'Philip ran up to my chariot, explained the scripture, and then baptized me.'] },
  { answer: 'Simon the sorcerer', accept: ['simon magus', 'simon', 'sorcerer', 'simon the magician'], ref: 'Acts 8:9-24', point: 'God’s gifts cannot be bought. Peter said, “thy heart is not right in the sight of God” (Acts 8:21).',
    clues: [
    'People in Samaria called me “the great power of God.”',
    'I believed, was baptized and followed Philip around.',
    'I offered the apostles money for the power to give the Holy Ghost.'] },
  { answer: 'Ananias of Damascus', accept: ['ananias'], ref: 'Acts 9:10-18', point: 'Ananias called his former enemy “Brother Saul”. Jesus turns enemies into family.',
    clues: [
    'I was afraid when I heard who I was being sent to.',
    'I was told to go to the street called Straight.',
    'I laid hands on Saul, and something like scales fell from his eyes.'] },
  { answer: 'Ananias and Sapphira', accept: ['sapphira', 'ananias and saphira', 'ananias & sapphira'], ref: 'Acts 5:1-11', point: 'God takes honesty seriously. We can always come to him as we really are.',
    clues: [
    'We sold a piece of land.',
    'We kept back part of the price but said it was all of it.',
    'Peter asked how we had agreed together to tempt the Spirit of the Lord.'] },
  { answer: 'Barnabas', accept: ['joses'], ref: 'Acts 4:36-37; 9:27; 13:2', point: 'Barnabas, the son of consolation, kept believing in people. Encouragement is a ministry anyone can have.',
    clues: [
    'The apostles gave me a name meaning “The son of consolation.”',
    'I sold land and laid the money at the apostles’ feet.',
    'When everyone feared Saul, I brought him to the apostles, and later I travelled with him.'] },
  { answer: 'Dorcas', accept: ['tabitha'], ref: 'Acts 9:36-41', point: 'Dorcas was “full of good works”. Kindness done for Jesus is never forgotten.',
    clues: [
    'I lived in Joppa.',
    'Widows showed the coats and garments I had made.',
    'Peter knelt, prayed and said, “Tabitha, arise.”'] },
  { answer: 'Cornelius', accept: [], ref: 'Acts 10', point: 'Peter learned “God is no respecter of persons” (Acts 10:34). The good news of Jesus is for every nation.',
    clues: [
    'I was a centurion of the band called the Italian band.',
    'An angel told me to send to Joppa for a man named Simon Peter.',
    'While Peter preached in my house, the Holy Ghost fell on us Gentiles.'] },
  { answer: 'Rhoda', accept: ['rhode'], ref: 'Acts 12:12-16', point: 'The church prayed for Peter and then couldn’t believe God answered. God often answers bigger than we expect.',
    clues: [
    'I was a damsel in the house of Mary, John Mark’s mother.',
    'I was so glad that I forgot to open the gate.',
    'I heard Peter knocking after an angel freed him, and they told me I was mad.'] },
  { answer: 'Lydia', accept: [], ref: 'Acts 16:13-15', point: '“The Lord opened” Lydia’s heart (Acts 16:14). God is the one who draws people to Jesus.',
    clues: [
    'I was from the city of Thyatira.',
    'I was a seller of purple.',
    'By a riverside in Philippi, the Lord opened my heart to Paul’s words.'] },
  { answer: 'The Philippian jailer', accept: ['philippian jailer', 'philippian jailor', 'jailer', 'jailor', 'keeper of the prison'], ref: 'Acts 16:25-34', point: '“Believe on the Lord Jesus Christ, and thou shalt be saved” (Acts 16:31). The simplest answer to the biggest question.',
    clues: [
    'I put two prisoners in the inner prison with their feet in the stocks.',
    'An earthquake opened every door, and I drew my sword to kill myself.',
    'I asked, “Sirs, what must I do to be saved?”'] },
  { answer: 'Silas', accept: ['silvanus'], ref: 'Acts 15:22, 40; 16:25', point: 'Silas sang in chains. Joy in Jesus does not depend on circumstances.',
    clues: [
    'I was chosen to carry a letter from Jerusalem to Antioch.',
    'Paul chose me as his partner after he parted from Barnabas.',
    'At midnight in a Philippian prison, Paul and I prayed and sang praises.'] },
  { answer: 'Timothy', accept: ['timotheus'], ref: 'Acts 16:1; 2 Timothy 1:5; 3:15; 1 Timothy 4:12', point: 'Paul told Timothy, “Let no man despise thy youth” (1 Timothy 4:12). Young people can lead the way in faith.',
    clues: [
    'My grandmother Lois and my mother Eunice had sincere faith.',
    'From a child I had known the holy scriptures.',
    'Paul wrote two letters to me and told me not to let anyone despise my youth.'] },
  { answer: 'Priscilla and Aquila', accept: ['aquila and priscilla', 'priscilla', 'aquila', 'prisca and aquila'], ref: 'Acts 18:1-3, 24-26', point: 'This couple opened their home and taught others. Ordinary homes can be places of ministry.',
    clues: [
    'We had to leave Rome when Claudius commanded all Jews to leave.',
    'We were tentmakers, and Paul worked with us.',
    'We took Apollos aside and explained the way of God more perfectly.'] },
  { answer: 'Apollos', accept: [], ref: 'Acts 18:24-28; 1 Corinthians 3:6', point: 'Paul said, “I have planted, Apollos watered; but God gave the increase” (1 Corinthians 3:6).',
    clues: [
    'I was born at Alexandria and was mighty in the scriptures.',
    'I knew only the baptism of John until a couple taught me more.',
    'Paul said, “I have planted,” and I watered.'] },
  { answer: 'Eutychus', accept: ['eutichus'], ref: 'Acts 20:7-12', point: 'God brought Eutychus back to life. Even a sleepy moment couldn’t stop God’s kindness that night.',
    clues: [
    'I was sitting in a window during a very long sermon.',
    'Paul preached until midnight, and I fell into a deep sleep.',
    'I fell from the third loft and was taken up dead, then brought back alive.'] },
  { answer: 'Onesimus', accept: [], ref: 'Philemon 10-16', point: 'Paul sent a runaway slave back “a brother beloved”. In Christ, the old labels lose their power.',
    clues: [
    'Paul joked that I was once unprofitable but now profitable.',
    'I ran away from my master.',
    'Paul sent me back to Philemon, not as a servant but as a brother.'] },
  { answer: 'Damascus', accept: [], ref: 'Acts 9:3-25; 2 Corinthians 11:32-33', point: 'On the road to Damascus, Jesus turned his fiercest enemy into his greatest messenger.',
    clues: [
    'A street called Straight runs through me.',
    'A man escaped from me in a basket let down through a window in the wall.',
    'On the road to me, Saul was blinded by a light and heard Jesus’ voice.'] },
  { answer: 'Paul', accept: ['saul', 'saul of tarsus', 'apostle paul'], ref: 'Acts 7:58; 9:1-9; 22:3', point: 'Paul called himself the chief of sinners, saved by grace (1 Timothy 1:15). No one is beyond Jesus’ reach.',
    clues: [
    'I was born in Tarsus and taught at the feet of Gamaliel.',
    'Witnesses laid their clothes at my feet at a stoning.',
    'A light from heaven blinded me on the road to Damascus.'] },
  { answer: 'Patmos', accept: ['isle of patmos', 'island of patmos'], ref: 'Revelation 1:9-11', point: 'In exile on Patmos, John saw Jesus in glory, holding the keys of death (Revelation 1:18).',
    clues: [
    'I am a small island.',
    'A man was here “for the word of God, and for the testimony of Jesus Christ.”',
    'John saw the visions of Revelation while on me.'] },
];
