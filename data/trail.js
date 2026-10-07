// Wilderness Trail content: the stops on the road from Egypt to Canaan, the events that can happen,
// and the endings. Deltas are [low, high] ranges, rolled fresh every time.
// Event fields: at [first stop, last stop], land (a landmark event at the stop itself),
// choices[].out = outcomes { w weight, faith (weight grows with faith), t text, d deltas, kadesh }.
window.TRAIL_STOPS = [
  { name: 'Rameses', short: 'Egypt', days: [0, 0] },
  { name: 'The Red Sea', short: 'Red Sea', days: [3, 5], road: 'The pillar of cloud leads you out of Egypt toward the sea.' },
  { name: 'Marah', short: 'Marah', days: [3, 3], road: 'Three days into the wilderness of Shur, and not a drop of water.' },
  { name: 'Wilderness of Sin', short: 'Sin', days: [12, 20], road: 'The bread you carried out of Egypt is running out.' },
  { name: 'Rephidim', short: 'Rephidim', days: [6, 12], road: 'The cloud moves on through dry, rocky country.' },
  { name: 'Mount Sinai', short: 'Sinai', days: [8, 14], road: 'The mountain of God rises out of the desert.' },
  { name: 'Kadesh', short: 'Kadesh', days: [330, 360], road: 'After almost a year camped at Sinai, the cloud lifts. On to the wilderness of Paran.' },
  { name: 'The Jordan', short: 'Canaan', days: [28, 45], road: 'The camp believed! You march on toward the river Jordan.' },
];

window.TRAIL_EVENTS = [
  // ---------- 1. Red Sea ----------
  {
    id: 'redsea', at: [1, 1], land: true, title: 'Trapped at the Red Sea', ref: 'Exodus 14',
    text: 'The sea is in front of you. Pharaoh’s chariots are thundering up behind. The whole camp is shaking.',
    choices: [
      { label: 'Stand still and see the salvation of the LORD', out: [
        { w: 3, t: 'Moses stretches out his hand. A strong east wind blows all night and you cross on dry ground. On the far side the people sing!', d: { faith: [14, 20], morale: [12, 18] } },
        { w: 1, t: 'Some are still trembling, but you all walk through on dry ground between walls of water.', d: { faith: [8, 12], morale: [4, 8] } } ] },
      { label: 'Shout at Moses: “Were there no graves in Egypt?”', out: [
        { w: 2, t: 'The sea opens anyway. God is faithful even when we complain, but your words have stung the camp.', d: { faith: [2, 5], morale: [-8, -4] } },
        { w: 1, t: 'Your panic spreads. People drop their water skins as they run through the sea.', d: { water: [-14, -8], morale: [-6, -2], faith: [0, 3] } } ] },
      { label: 'Pack fast and try to run along the shore', out: [
        { w: 1, t: 'There is no way around. You lose time and water before the cloud moves behind you and the sea opens.', d: { water: [-10, -6], morale: [-4, 0], faith: [4, 8] } } ] },
    ],
  },
  {
    id: 'pillar', at: [1, 1], land: true, title: 'A Night Between Two Armies', ref: 'Exodus 14:19-22',
    text: 'The pillar of cloud moves behind the camp. On Egypt’s side it is darkness; on your side it gives light all night. Ahead, the sea.',
    choices: [
      { label: 'Gather your family in the light and pray', out: [
        { w: 3, t: 'By morning the waters are divided and you walk across on dry ground. Faith rises in every tent.', d: { faith: [12, 16], morale: [8, 12] } },
        { w: 1, t: 'It is a long, cold night, but at dawn you cross on dry ground.', d: { faith: [8, 10], morale: [2, 6] } } ] },
      { label: 'Keep watch all night with a spear', out: [
        { w: 1, t: 'Nobody comes near. God was guarding the camp all along. You cross the sea tired and thirsty.', d: { water: [-8, -5], morale: [2, 5], faith: [3, 6] } } ] },
      { label: 'Sneak back to see what Egypt is doing', out: [
        { w: 1, t: 'You see only darkness and hear chariot wheels. You run back terrified and the fear spreads.', d: { morale: [-10, -6], faith: [2, 4] } } ] },
    ],
  },

  // ---------- 2. Marah ----------
  {
    id: 'marah', at: [2, 2], land: true, title: 'Bitter Water at Marah', ref: 'Exodus 15:22-26',
    text: 'You finally find water, but it is bitter. Children are crying. The people murmur: “What shall we drink?”',
    choices: [
      { label: 'Cry out to the LORD with Moses', out: [
        { w: 3, t: 'The LORD shows Moses a tree. He casts it into the water and the water is made sweet. Everybody drinks!', d: { water: [32, 40], faith: [8, 12], morale: [6, 10] } },
        { w: 1, t: 'The water is made sweet. God calls Himself “the LORD that healeth thee.”', d: { water: [28, 34], faith: [10, 12] } } ] },
      { label: 'Murmur against Moses with everyone else', out: [
        { w: 1, t: 'Moses still prays and the water is healed, but the grumbling leaves a bitter taste in the camp.', d: { water: [25, 32], morale: [-10, -6], faith: [-6, -3] } } ] },
      { label: 'Send young men to search for another spring', out: [
        { w: 1, t: 'They come back empty and tired. By then Moses has prayed and the water is sweet.', d: { water: [18, 24], morale: [-6, -3] } },
        { w: 1, t: 'They find a muddy trickle, and then the water at Marah is made sweet too.', d: { water: [30, 38], morale: [0, 3] } } ] },
    ],
  },

  // ---------- 3. Wilderness of Sin ----------
  {
    id: 'manna', at: [3, 3], land: true, title: 'Bread from Heaven', ref: 'Exodus 16:14-20',
    text: 'One morning the ground is covered with small white flakes. People ask, “What is it?” Moses says, “This is the bread which the LORD hath given you.”',
    choices: [
      { label: 'Gather just enough for today', out: [
        { w: 3, t: 'An omer for each person. It tastes like wafers made with honey, and nobody lacks.', d: { manna: [26, 32], faith: [6, 10], morale: [4, 6] } },
        { w: 1, t: 'Whoever gathered much had nothing over, and whoever gathered little had no lack.', d: { manna: [24, 28], faith: [8, 10] } } ] },
      { label: 'Gather extra and hide it for tomorrow', out: [
        { w: 2, t: 'By morning it has bred worms and it stinks. Moses is angry.', d: { manna: [8, 12], morale: [-8, -5], faith: [-8, -5] } },
        { w: 1, t: 'The whole tent smells of rotten manna. Lesson learnt the hard way.', d: { manna: [10, 14], morale: [-6, -3], faith: [-5, -3] } } ] },
      { label: 'Complain that Egypt had pots of meat', out: [
        { w: 1, t: 'That evening quails cover the camp anyway. God hears even complaints, but the grumbling spreads.', d: { manna: [18, 24], morale: [2, 5], faith: [-6, -3] } } ] },
    ],
  },
  {
    id: 'quail', at: [3, 3], land: true, title: 'Quails at Evening', ref: 'Exodus 16:2-13',
    text: 'The whole camp murmurs: “In Egypt we sat by the flesh pots!” God answers: at evening you will eat meat, and in the morning you will be filled with bread.',
    choices: [
      { label: 'Thank God and share the quail fairly', out: [
        { w: 3, t: 'Quails cover the camp at evening, and manna lies on the ground in the morning. Everyone eats.', d: { manna: [22, 28], morale: [8, 12], faith: [5, 8] } },
        { w: 1, t: 'Sharing is slow, but nobody goes to bed hungry.', d: { manna: [20, 24], morale: [10, 12], faith: [4, 6] } } ] },
      { label: 'Grab as much as your family can carry', out: [
        { w: 1, t: 'Your tent is full, but your neighbours saw everything.', d: { manna: [26, 32], morale: [-10, -6], faith: [-6, -3] } } ] },
      { label: 'Doubt it: how can God feed this many people out here?', out: [
        { w: 1, t: 'The quails come anyway. You eat, a little ashamed.', d: { manna: [18, 22], faith: [-8, -6] } } ] },
    ],
  },

  // ---------- 4. Rephidim ----------
  {
    id: 'rock', at: [4, 4], land: true, title: 'Water from the Rock', ref: 'Exodus 17:1-7',
    text: 'No water again. The people chide with Moses and some are ready to stone him. God tells Moses to strike the rock in Horeb.',
    choices: [
      { label: 'Follow Moses to the rock and trust God', out: [
        { w: 3, t: 'Moses strikes the rock and water gushes out, enough for the whole camp and the animals too.', d: { water: [36, 45], faith: [8, 12], morale: [4, 8] } },
        { w: 1, t: 'The walk is long and hot, but the rock pours out water.', d: { water: [32, 38], faith: [6, 8] } } ] },
      { label: 'Join the crowd: “Is the LORD among us, or not?”', out: [
        { w: 1, t: 'Water flows from the rock, but the place gets a sad name: Massah and Meribah, testing and quarrelling.', d: { water: [30, 36], morale: [-8, -4], faith: [-12, -8] } } ] },
      { label: 'Quietly ration the last drops in your tent', out: [
        { w: 1, t: 'Your family is thirsty but calm. Soon the rock is struck and everyone drinks.', d: { water: [28, 34], morale: [2, 5], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'amalek', at: [4, 4], land: true, title: 'Amalek Attacks', ref: 'Exodus 17:8-13',
    text: 'Joshua leads the fighters. Moses climbs the hill with the rod of God. When his hands are up, Israel wins. When they drop, Amalek wins. His arms are getting heavy.',
    choices: [
      { label: 'Climb up with Aaron and Hur to hold his hands', out: [
        { w: 3, faith: true, t: 'You set a stone under him and hold his hands steady until the sun goes down. Joshua wins! Moses builds an altar: Jehovah-nissi, the LORD is my banner.', d: { morale: [10, 14], faith: [10, 14] } },
        { w: 1, t: 'Your arms burn but you hold on. The battle is won, though it is costly.', d: { morale: [0, 4], faith: [6, 8], manna: [-6, -4] } } ] },
      { label: 'Grab a sword and run to Joshua’s line', out: [
        { w: 1, t: 'You fight bravely, but every time Moses’ hands drop the line breaks. Victory comes at sunset, with many wounded.', d: { morale: [-8, -4], water: [-10, -6], faith: [2, 4] } } ] },
      { label: 'Hide the food stores at the back of the camp', out: [
        { w: 1, t: 'Amalek strikes the weak and tired at the back first, right where you hid the stores.', d: { manna: [-12, -8], morale: [-10, -6] } } ] },
    ],
  },

  // ---------- 5. Sinai ----------
  {
    id: 'calf', at: [5, 5], land: true, title: 'The Golden Calf', ref: 'Exodus 32',
    text: 'Moses has been on the mountain for forty days. People say, “We wot not what is become of him.” Aaron is collecting gold earrings.',
    choices: [
      { label: 'Refuse, and wait for Moses', out: [
        { w: 2, faith: true, t: 'When Moses comes down and calls, “Who is on the LORD’s side?”, you step forward.', d: { faith: [14, 18], morale: [-8, -4] } },
        { w: 1, t: 'You stand almost alone for days. It is lonely, but your faith grows.', d: { faith: [10, 14], morale: [-12, -8] } } ] },
      { label: 'Give your earrings, just to keep the peace', out: [
        { w: 1, t: 'The dancing is loud. Then Moses comes down, sees it, and breaks the tablets of stone. A plague follows.', d: { faith: [-30, -22], morale: [-14, -10] } } ] },
      { label: 'Pray for the people, like Moses did', out: [
        { w: 1, t: 'Moses pleads with God for the people, and God hears. You pray with him in your tent.', d: { faith: [10, 14], morale: [2, 6] } } ] },
    ],
  },
  {
    id: 'jethro', at: [5, 5], land: true, title: 'Jethro’s Advice', ref: 'Exodus 18:13-24',
    text: 'Moses sits from morning till evening judging every quarrel. His father-in-law Jethro says, “Thou wilt surely wear away.”',
    choices: [
      { label: 'Back Jethro’s plan: leaders over thousands, hundreds, fifties and tens', out: [
        { w: 1, t: 'Able men who fear God take the small cases. Moses gets to rest and the camp is calmer.', d: { morale: [14, 18], faith: [2, 4] } } ] },
      { label: 'Volunteer to help lead your group of fifty', out: [
        { w: 2, t: 'It is hard work, but people trust you. The queues at Moses’ tent disappear.', d: { morale: [10, 14], faith: [4, 8] } },
        { w: 1, t: 'Your first quarrel is about a goat. You survive it. Barely.', d: { morale: [6, 10], faith: [4, 6] } } ] },
      { label: 'Insist that only Moses can judge', out: [
        { w: 1, t: 'The line outside Moses’ tent grows every day, and so does the frustration.', d: { morale: [-12, -8] } } ] },
    ],
  },
  {
    id: 'offering', at: [5, 5], land: true, title: 'Gifts for the Tabernacle', ref: 'Exodus 35-36',
    text: 'Moses asks for willing offerings to build the tabernacle: gold, blue linen, acacia wood. Bezaleel and Aholiab are ready to build.',
    choices: [
      { label: 'Give freely with a willing heart', out: [
        { w: 1, t: 'So many people give that Moses has to tell them to stop bringing! The camp is full of joy.', d: { faith: [10, 14], morale: [6, 10] } } ] },
      { label: 'Give a little and keep the rest', out: [
        { w: 1, t: 'You give something. It feels good, but you wonder what a full heart would feel like.', d: { faith: [2, 4], morale: [2, 4] } } ] },
      { label: 'Keep everything for the road ahead', out: [
        { w: 1, t: 'Your bags are heavy and your heart feels heavier.', d: { faith: [-8, -4], morale: [-4, -2] } } ] },
    ],
  },

  // ---------- 6. Kadesh: the big decision ----------
  {
    id: 'spies', at: [6, 6], land: true, title: 'The Twelve Spies', ref: 'Numbers 13-14',
    text: 'After forty days the spies return, carrying a cluster of grapes on a staff between two men. Ten say, “We were in our own sight as grasshoppers.” Caleb says, “Let us go up at once.”',
    choices: [
      { label: 'Stand with Joshua and Caleb', hint: 'Needs strong faith and a willing camp', out: [{ w: 1, kadesh: 'go', t: '' }] },
      { label: 'Listen to the ten spies', out: [{ w: 1, kadesh: 'ten', t: '' }] },
      { label: 'Make a captain and return to Egypt', out: [{ w: 1, kadesh: 'egypt', t: '' }] },
    ],
  },

  // ---------- 7. Jordan ----------
  {
    id: 'jordan', at: [7, 7], land: true, title: 'Crossing the Jordan', ref: 'Joshua 3-4',
    text: 'The Jordan is in flood. The priests lift the ark of the covenant and walk toward the water. Joshua says, “Sanctify yourselves.”',
    choices: [
      { label: 'Follow the ark, about two thousand cubits behind', out: [
        { w: 1, t: 'The moment the priests’ feet touch the water, the river stands up in a heap. You cross on dry ground.', d: { faith: [8, 12], morale: [8, 12] } } ] },
      { label: 'Carry one of the twelve memorial stones', out: [
        { w: 1, t: 'You lift a stone from the riverbed. One day your children will ask what it means.', d: { faith: [10, 14], morale: [4, 8] } } ] },
      { label: 'Wait on the bank until the flood goes down', out: [
        { w: 1, t: 'The river stops for the ark, not for your patience. You hurry across with the last families.', d: { morale: [-4, 0], faith: [2, 4] } } ] },
    ],
  },

  // ---------- On the road ----------
  {
    id: 'miriam', at: [2, 2], title: 'Miriam’s Song', ref: 'Exodus 15:20-21',
    text: 'On the far side of the sea, Miriam takes a timbrel and the women follow with dancing: “Sing ye to the LORD, for he hath triumphed gloriously.”',
    choices: [
      { label: 'Dance and sing with them', out: [
        { w: 1, t: 'The whole camp joins in. It is thirsty work, but nobody cares!', d: { morale: [10, 14], faith: [4, 6], water: [-5, -3] } } ] },
      { label: 'Save your strength for the march', out: [
        { w: 1, t: 'You walk on quietly while the singing fades behind you.', d: { morale: [0, 2] } } ] },
    ],
  },
  {
    id: 'elim', at: [3, 3], title: 'Twelve Wells at Elim', ref: 'Exodus 15:27',
    text: 'You reach Elim: twelve wells of water and seventy palm trees. The camp wants to stay forever.',
    choices: [
      { label: 'Rest in the shade for a few days', out: [
        { w: 1, t: 'Full water skins, cool shade, happy children. The rest costs a little food.', d: { water: [30, 40], morale: [10, 14], manna: [-6, -3] } } ] },
      { label: 'Fill the skins and keep moving', out: [
        { w: 1, t: 'You drink deep, fill up and follow the cloud.', d: { water: [24, 30], morale: [2, 5] } } ] },
    ],
  },
  {
    id: 'stragglers', at: [1, 5], title: 'Stragglers at the Back', ref: 'Deuteronomy 25:17-18',
    text: 'The old, the sick and the mothers with babies are falling behind. Raiders like to strike the feeble at the back of a march.',
    choices: [
      { label: 'Slow down and help carry the weak', out: [
        { w: 1, t: 'It costs you water and sweat, but nobody is left behind.', d: { morale: [8, 12], faith: [2, 4], water: [-8, -4] } } ] },
      { label: 'Keep pace with the cloud', out: [
        { w: 1, t: 'Somehow everyone keeps up today.', d: { morale: [0, 2] } },
        { w: 1, t: 'Raiders pick off the stragglers at the back. The camp is grieving.', d: { morale: [-12, -8], manna: [-8, -4] } } ] },
    ],
  },
  {
    id: 'heat', at: [1, 7], title: 'Noon Sun', ref: 'Psalm 105:39',
    text: 'The sun is merciless. The family in the next tent has run out of water and their little boy is crying.',
    choices: [
      { label: 'Share your water with them', out: [
        { w: 1, t: 'Your skins are lighter, but the little boy is smiling. People notice kindness.', d: { water: [-8, -6], morale: [8, 10], faith: [3, 5] } } ] },
      { label: 'Guard your own water skins', out: [
        { w: 1, t: 'You keep your water. The silence from the next tent is loud.', d: { water: [-3, -2], morale: [-6, -4] } } ] },
    ],
  },
  {
    id: 'grumble', at: [1, 7], title: 'Grumbling in the Tents', ref: 'Numbers 14:2',
    text: 'Your neighbours are talking: “Moses brought us out here to die. Would God we had died in Egypt!”',
    choices: [
      { label: 'Remind them what God has already done', out: [
        { w: 2, faith: true, t: 'You tell the story of the sea and the manna. Faces soften. Someone starts a song.', d: { morale: [6, 10], faith: [4, 6] } },
        { w: 1, t: 'They roll their eyes, but a few of them are listening.', d: { morale: [0, 3], faith: [2, 4] } } ] },
      { label: 'Say nothing and walk away', out: [
        { w: 1, t: 'The talk spreads to the next tents.', d: { morale: [-6, -4] } } ] },
      { label: 'Join in. It does feel hopeless.', out: [
        { w: 1, t: 'Complaining feels good for a minute, then everything feels worse.', d: { morale: [-12, -8], faith: [-12, -8] } } ] },
    ],
  },
  {
    id: 'fever', at: [2, 7], title: 'Fever in the Camp', ref: 'Exodus 15:26',
    text: 'A fever is going round. A widow two tents down is too weak to fetch water or gather food.',
    choices: [
      { label: 'Bring her water and food every day', out: [
        { w: 2, t: 'She recovers, and she prays for your family by name every night.', d: { water: [-8, -5], manna: [-5, -3], morale: [8, 10], faith: [4, 6] } },
        { w: 1, t: 'It takes a week, but she gets better. Others start helping too.', d: { water: [-6, -4], manna: [-4, -2], morale: [10, 12], faith: [2, 4] } } ] },
      { label: 'Pray for her, but keep your distance', out: [
        { w: 1, t: 'You pray. Others bring her water. You wonder if you should have.', d: { faith: [0, 2], morale: [-4, -2] } } ] },
    ],
  },
  {
    id: 'firenight', at: [2, 6], title: 'Night Under the Pillar of Fire', ref: 'Exodus 13:21-22',
    text: 'At night the pillar of fire lights up the whole camp. The children cannot sleep. What will you do with the evening?',
    choices: [
      { label: 'Tell them the story of the Passover', out: [
        { w: 1, t: 'The blood on the doorposts, the angel passing over. Their eyes are wide. So is your faith.', d: { faith: [8, 12], morale: [2, 4] } } ] },
      { label: 'Sing and drum around the fire', out: [
        { w: 1, t: 'The whole row of tents comes out to sing. Best night in weeks.', d: { morale: [8, 12], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'sabbath', at: [4, 7], title: 'Sixth Day, Double Portion', ref: 'Exodus 16:22-30',
    text: 'It is the sixth day. Moses says tomorrow is the Sabbath, a holy rest, and no manna will fall.',
    choices: [
      { label: 'Gather twice as much today and rest tomorrow', out: [
        { w: 1, t: 'The extra manna stays fresh overnight, just as God said. A whole day of rest!', d: { manna: [10, 14], morale: [8, 12], faith: [8, 12] } } ] },
      { label: 'Gather the usual amount and look again tomorrow', out: [
        { w: 1, t: 'You go out on the seventh day and find nothing at all. A hungry, awkward Sabbath.', d: { manna: [-8, -4], faith: [-6, -4], morale: [-4, -2] } } ] },
    ],
  },
  {
    id: 'taberah', at: [6, 6], title: 'Fire at Taberah', ref: 'Numbers 11:1-3',
    text: 'The people complain, and fire from the LORD burns at the edges of the camp.',
    choices: [
      { label: 'Run to Moses and ask him to pray', out: [
        { w: 1, t: 'Moses prays and the fire dies down. The place is called Taberah, burning.', d: { faith: [6, 10], morale: [2, 4] } } ] },
      { label: 'Fight the fire with your water skins', out: [
        { w: 1, t: 'You save a few tents but empty your skins. Then Moses prays and the fire is quenched.', d: { water: [-14, -10], morale: [2, 4] } } ] },
      { label: 'Keep complaining. This proves the point.', out: [
        { w: 1, t: 'Tents and food stores burn before Moses prays and the fire stops.', d: { faith: [-12, -8], morale: [-8, -6], manna: [-6, -4] } } ] },
    ],
  },
  {
    id: 'craving', at: [6, 6], title: 'We Remember the Fish', ref: 'Numbers 11:4-6, 31-34',
    text: 'The mixed multitude start craving: “We remember the fish, the cucumbers, the melons, the leeks, the onions and the garlick! Now there is nothing but this manna.”',
    choices: [
      { label: 'Be content with the manna', out: [
        { w: 1, t: 'Bread from heaven every morning. You decide that is enough.', d: { faith: [6, 10], morale: [0, 4] } } ] },
      { label: 'Join the craving for meat', out: [
        { w: 1, t: 'Quails come by the million, but so does a plague. The place gets a sad name: Kibroth-hattaavah.', d: { manna: [14, 18], faith: [-14, -10], morale: [-8, -6] } } ] },
    ],
  },
  {
    id: 'elders', at: [6, 6], title: 'Seventy Elders', ref: 'Numbers 11:14-25',
    text: 'Moses tells God, “I am not able to bear all this people alone.” God tells him to gather seventy elders to share the load.',
    choices: [
      { label: 'Support the seventy elders', out: [
        { w: 1, t: 'The Spirit rests on the elders and they prophesy. The camp feels held together again.', d: { morale: [10, 14], faith: [4, 6] } } ] },
      { label: 'Grumble that it’s Moses’ job, not theirs', out: [
        { w: 1, t: 'You miss what God is doing right in front of you.', d: { morale: [-6, -4], faith: [-4, -2] } } ] },
    ],
  },
  {
    id: 'edom', at: [7, 7], title: 'Edom Says No', ref: 'Numbers 20:14-21',
    text: 'Moses politely asks the king of Edom to let Israel pass along the king’s highway. Edom refuses and comes out with an army.',
    choices: [
      { label: 'Turn away in peace and take the long road', out: [
        { w: 1, t: 'It is a long, hot detour, but no blood is spilt between brothers.', d: { water: [-12, -8], morale: [-4, -2], faith: [4, 6] } } ] },
      { label: 'Argue at the border for days', out: [
        { w: 1, t: 'Edom will not move. You take the long road anyway, more tired and thirsty.', d: { water: [-12, -8], morale: [-10, -6] } } ] },
    ],
  },
  {
    id: 'serpent', at: [7, 7], title: 'Fiery Serpents', ref: 'Numbers 21:4-9',
    text: 'The people speak against God: “Our soul loatheth this light bread.” Fiery serpents bite them. Moses makes a serpent of brass and sets it on a pole.',
    choices: [
      { label: 'Look at the serpent on the pole', out: [
        { w: 1, t: 'Whoever looks, lives. You look, and the burning stops.', d: { faith: [10, 14], morale: [4, 8] } } ] },
      { label: 'Carry the bitten to where they can see the pole', out: [
        { w: 1, t: 'You help dozens of people look up and live. You will never forget their faces.', d: { faith: [8, 10], morale: [10, 12], water: [-5, -3] } } ] },
      { label: 'Treat bites with herbs and stay away from the pole', out: [
        { w: 1, t: 'The herbs do nothing. People suffer while the cure is standing in the middle of the camp.', d: { morale: [-12, -8], faith: [-8, -6] } } ] },
    ],
  },

  // ---------- More landmark variants (one is picked at each stop, so every run feels different) ----------
  // Red Sea
  {
    id: 'entangled', at: [1, 1], land: true, title: 'Shut In by the Wilderness', ref: 'Exodus 14:1-4',
    text: 'God tells Moses to turn back and camp by Pi-hahiroth, between Migdol and the sea. Pharaoh thinks, “They are entangled in the land, the wilderness hath shut them in.” Now his army is coming.',
    choices: [
      { label: 'Trust that God led you here on purpose', out: [
        { w: 3, faith: true, t: 'It was a set-up, but for Egypt, not for you. That night the sea opens and you cross on dry ground.', d: { faith: [12, 16], morale: [8, 12] } },
        { w: 1, t: 'You are still nervous, but you cross with everyone else on dry ground.', d: { faith: [8, 10], morale: [2, 6] } } ] },
      { label: 'Ask why Moses took such a strange route', out: [
        { w: 1, t: 'Questions fly around the camp until the sea opens. Then everyone goes very quiet and walks.', d: { faith: [2, 6], morale: [-4, 0] } } ] },
      { label: 'Start digging defences in the sand', out: [
        { w: 1, t: 'Hot, thirsty work for nothing. The LORD fights for you and the sea opens anyway.', d: { water: [-10, -6], morale: [-2, 2], faith: [4, 6] } } ] },
    ],
  },
  {
    id: 'wheels', at: [1, 1], land: true, title: 'Wheels Coming Off', ref: 'Exodus 14:23-25',
    text: 'You are halfway across the sea bed when the Egyptian chariots charge in after you. In the morning watch the LORD troubles them and takes off their chariot wheels.',
    choices: [
      { label: 'Keep walking, and keep the children moving', out: [
        { w: 3, t: 'Behind you the Egyptians cry, “Let us flee from the face of Israel; for the LORD fighteth for them.” You reach the far shore safe.', d: { faith: [10, 14], morale: [10, 14] } },
        { w: 1, t: 'A little one drops a sandal and you go back for it. You still make it across in time.', d: { faith: [8, 10], morale: [6, 8] } } ] },
      { label: 'Stop and stare at the stuck chariots', out: [
        { w: 1, t: 'Someone grabs your arm and pulls you on. You drop a water skin in the rush.', d: { water: [-8, -5], faith: [6, 8], morale: [2, 4] } } ] },
      { label: 'Run ahead and leave your group behind', out: [
        { w: 1, t: 'You are first on the shore, but your family arrives frightened and cross with you.', d: { morale: [-8, -4], faith: [4, 6] } } ] },
    ],
  },
  {
    id: 'seashore', at: [1, 1], land: true, title: 'The Song of the Sea', ref: 'Exodus 14:30-15:2',
    text: 'Safe on the far shore, Israel sees the Egyptians dead on the seashore. The people fear the LORD and believe Him. Moses starts a song: “I will sing unto the LORD, for he hath triumphed gloriously.”',
    choices: [
      { label: 'Sing with all your heart', out: [
        { w: 3, t: '“The LORD is my strength and song, and he is become my salvation.” The whole camp sings until they are hoarse.', d: { faith: [12, 16], morale: [12, 16], water: [-4, -2] } },
        { w: 1, t: 'You do not know the words yet, but you clap along. It is the happiest day of your life.', d: { faith: [8, 10], morale: [12, 14] } } ] },
      { label: 'Gather useful things washed up on the shore', out: [
        { w: 1, t: 'You find a few water jars. Useful, but you missed the song.', d: { water: [8, 12], morale: [-2, 2], faith: [0, 2] } } ] },
      { label: 'Sit quietly and thank God in your own words', out: [
        { w: 1, t: 'A quiet prayer by the water. You will remember this place forever.', d: { faith: [10, 14], morale: [4, 6] } } ] },
    ],
  },
  // Marah
  {
    id: 'marahname', at: [2, 2], land: true, title: 'They Called It Bitter', ref: 'Exodus 15:22-25',
    text: 'Three days without water in the wilderness of Shur, then a pool! But nobody can drink it. Someone names the place Marah: bitter.',
    choices: [
      { label: 'Pray instead of complaining', out: [
        { w: 3, faith: true, t: 'Moses cries to the LORD and is shown a tree. He casts it into the water and the water turns sweet.', d: { water: [32, 40], faith: [10, 12], morale: [4, 8] } },
        { w: 1, t: 'The wait feels long, but then the water is made sweet. You drink and drink.', d: { water: [28, 34], faith: [6, 8] } } ] },
      { label: 'Try boiling the water yourself', out: [
        { w: 1, t: 'Still bitter, and now it is hot as well. Then God makes the pool sweet for everyone.', d: { water: [24, 30], morale: [-4, 0], manna: [-4, -2] } } ] },
      { label: 'Say the whole trip was a mistake', out: [
        { w: 1, t: 'God sweetens the water anyway, but your words leave the camp sour.', d: { water: [26, 32], morale: [-8, -4], faith: [-6, -4] } } ] },
    ],
  },
  {
    id: 'marahstatute', at: [2, 2], land: true, title: 'A Promise at Marah', ref: 'Exodus 15:25-26',
    text: 'After the water is made sweet, God makes a statute for the people and proves them: if they will listen to His voice and do what is right, He says, “I am the LORD that healeth thee.”',
    choices: [
      { label: 'Promise to listen and obey', out: [
        { w: 2, t: 'You drink the sweet water with a new promise in your heart.', d: { water: [28, 34], faith: [10, 14], morale: [4, 6] } },
        { w: 1, t: 'Easy to promise, harder to do. But it is a good start.', d: { water: [26, 30], faith: [6, 8] } } ] },
      { label: 'Teach the promise to the children', out: [
        { w: 1, t: 'They chant “the LORD that healeth thee” all the way back to the tent.', d: { water: [26, 30], faith: [8, 10], morale: [6, 8] } } ] },
      { label: 'Drink, and forget about the promise', out: [
        { w: 1, t: 'Your thirst is gone. So, sadly, is the lesson.', d: { water: [30, 36], faith: [-4, -2] } } ] },
    ],
  },
  // Wilderness of Sin
  {
    id: 'glory', at: [3, 3], land: true, title: 'Glory in the Cloud', ref: 'Exodus 16:1-10',
    text: 'It is the fifteenth day of the second month since leaving Egypt. The camp is hungry and angry. As Aaron speaks, everyone looks toward the wilderness, and the glory of the LORD appears in the cloud.',
    choices: [
      { label: 'Bow down and listen', out: [
        { w: 3, t: 'God has heard the murmuring. Quails that evening, and bread from heaven in the morning.', d: { manna: [24, 30], faith: [10, 12], morale: [6, 8] } },
        { w: 1, t: 'You are shaking, but you listen. The next morning the ground is white with manna.', d: { manna: [22, 26], faith: [8, 10] } } ] },
      { label: 'Keep complaining about the food', out: [
        { w: 1, t: 'God feeds the camp anyway. You eat, but you feel small next to that glory.', d: { manna: [20, 24], faith: [-8, -4], morale: [-2, 0] } } ] },
      { label: 'Run to tell the families at the edge of camp', out: [
        { w: 1, t: 'Nobody misses it. You are hungry and out of breath, but happy.', d: { manna: [20, 24], morale: [8, 10], faith: [4, 6] } } ] },
    ],
  },
  {
    id: 'earlymorning', at: [3, 3], land: true, title: 'Before the Sun Gets Hot', ref: 'Exodus 16:21, 31',
    text: 'The manna is like coriander seed, white, and tastes like wafers made with honey. But when the sun waxes hot, it melts. Your family loves to sleep in.',
    choices: [
      { label: 'Get everyone up early to gather', out: [
        { w: 3, t: 'Yawning children, full baskets. Breakfast is sweet.', d: { manna: [26, 32], morale: [2, 6], faith: [4, 6] } },
        { w: 1, t: 'Grumpy faces at dawn, but everyone eats well.', d: { manna: [24, 28], morale: [-2, 2], faith: [4, 6] } } ] },
      { label: 'Sleep a little longer', out: [
        { w: 1, t: 'By the time you get out, most of it has melted. Thin pickings today.', d: { manna: [8, 12], morale: [-4, -2] } } ] },
      { label: 'Gather early for your neighbours too', out: [
        { w: 1, t: 'Your back aches, but three families eat because of you.', d: { manna: [20, 24], morale: [8, 12], faith: [4, 6] } } ] },
    ],
  },
  {
    id: 'omerjar', at: [3, 3], land: true, title: 'A Jar for the Children', ref: 'Exodus 16:32-35',
    text: 'God says to keep an omer of manna in a pot for the generations to come, so they can see the bread He fed you with in the wilderness.',
    choices: [
      { label: 'Help fill the jar and tell the story', out: [
        { w: 1, t: 'One day your grandchildren will see that jar and ask what it means.', d: { manna: [20, 26], faith: [10, 12], morale: [4, 6] } } ] },
      { label: 'Wonder why anyone needs to remember bread', out: [
        { w: 1, t: 'Gather today, forget tomorrow. That is how people drift away.', d: { manna: [22, 26], faith: [-2, 0] } } ] },
      { label: 'Start a family habit of thanking God at every meal', out: [
        { w: 1, t: 'Every breakfast starts with thanks. The whole tent feels different.', d: { manna: [20, 24], faith: [8, 10], morale: [6, 8] } } ] },
    ],
  },
  // Rephidim
  {
    id: 'rockelders', at: [4, 4], land: true, title: 'Take the Elders With You', ref: 'Exodus 17:5-6',
    text: 'God tells Moses to take some of the elders and the rod he struck the river with. “I will stand before thee there upon the rock in Horeb.”',
    choices: [
      { label: 'Go with the elders to see', out: [
        { w: 3, t: 'You watch Moses strike the rock. Water bursts out right in front of the elders.', d: { water: [36, 44], faith: [10, 12], morale: [4, 6] } },
        { w: 1, t: 'The climb is hard on the old men, but water pours out of the rock.', d: { water: [32, 38], faith: [8, 10] } } ] },
      { label: 'Stay and keep the camp calm', out: [
        { w: 1, t: 'You hand out the last drops and hush the angry voices until the water arrives.', d: { water: [30, 36], morale: [6, 10], faith: [4, 6] } } ] },
      { label: 'Say a rock can’t give water', out: [
        { w: 1, t: 'It can when God is standing on it. You drink and say nothing more.', d: { water: [30, 36], faith: [-6, -4] } } ] },
    ],
  },
  {
    id: 'chooseus', at: [4, 4], land: true, title: 'Choose Us Out Men', ref: 'Exodus 17:9-10',
    text: 'Amalek is coming. Moses tells a young man named Joshua, “Choose us out men, and go out, fight with Amalek: to morrow I will stand on the top of the hill with the rod of God in mine hand.”',
    choices: [
      { label: 'Step forward for Joshua', out: [
        { w: 2, faith: true, t: 'Joshua defeats Amalek while Moses’ hands are held up on the hill. You come home tired but proud.', d: { morale: [10, 14], faith: [8, 10], water: [-6, -4] } },
        { w: 1, t: 'A long day of fighting. The battle is won, but you need plenty of rest and water.', d: { morale: [4, 8], faith: [4, 6], water: [-10, -6] } } ] },
      { label: 'Carry water to the fighters', out: [
        { w: 1, t: 'Not glamorous, but Joshua’s men fight better with water in them. Victory at sunset.', d: { water: [-8, -6], morale: [10, 12], faith: [4, 6] } } ] },
      { label: 'Stay in your tent and wait', out: [
        { w: 1, t: 'Others win the day. You feel left out of the story.', d: { morale: [-6, -2] } } ] },
    ],
  },
  {
    id: 'memorial', at: [4, 4], land: true, title: 'Write It in a Book', ref: 'Exodus 17:14-15',
    text: 'After Amalek is beaten, God tells Moses, “Write this for a memorial in a book, and rehearse it in the ears of Joshua.” Moses builds an altar and calls it Jehovah-nissi.',
    choices: [
      { label: 'Help build the altar', out: [
        { w: 1, t: 'Stone on stone: “The LORD is my banner.” It is the best feeling after the worst day.', d: { faith: [10, 14], morale: [8, 10] } } ] },
      { label: 'Tell the story to the young ones tonight', out: [
        { w: 1, t: 'You act out Moses’ heavy arms. The children hold each other’s arms up and giggle.', d: { faith: [8, 10], morale: [8, 12] } } ] },
      { label: 'Go looking for left-behind enemy supplies', out: [
        { w: 1, t: 'You find a little food, but you miss the altar.', d: { manna: [8, 12], faith: [-2, 0] } } ] },
    ],
  },
  // Sinai
  {
    id: 'eagles', at: [5, 5], land: true, title: 'On Eagles’ Wings', ref: 'Exodus 19:1-8',
    text: 'In the third month you camp before Mount Sinai. God says, “Ye have seen... how I bare you on eagles’ wings, and brought you unto myself.” He wants you to be His own treasure.',
    choices: [
      { label: 'Answer with everyone: “All that the LORD hath spoken we will do”', out: [
        { w: 2, t: 'Your voice is one of thousands. It echoes off the mountain.', d: { faith: [12, 16], morale: [8, 10] } },
        { w: 1, t: 'You mean it, though you wonder if you can keep it.', d: { faith: [8, 10], morale: [4, 6] } } ] },
      { label: 'Stay quiet. Promises are scary.', out: [
        { w: 1, t: 'God’s offer still stands. You think about it for a long time.', d: { faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'sanctify', at: [5, 5], land: true, title: 'Get Ready for the Third Day', ref: 'Exodus 19:10-15',
    text: 'God will come down on the mountain in the sight of all the people. For two days everyone must wash their clothes and get ready. Bounds are set round the mountain: nobody may touch it.',
    choices: [
      { label: 'Wash, prepare and stay behind the line', out: [
        { w: 3, t: 'Clean clothes and a quiet heart. You are ready.', d: { faith: [10, 14], morale: [4, 8], water: [-6, -4] } },
        { w: 1, t: 'Washing clothes in the desert uses a lot of water, but it is worth it.', d: { faith: [8, 10], water: [-10, -6] } } ] },
      { label: 'Help the elderly with their washing', out: [
        { w: 1, t: 'Your arms are sore and your water is low, but the old ones bless you.', d: { faith: [8, 10], morale: [8, 10], water: [-10, -8] } } ] },
      { label: 'Creep up to the line for a closer look', out: [
        { w: 1, t: 'A watchman sends you back. Some lines are there to protect you.', d: { faith: [-4, -2], morale: [-4, -2] } } ] },
    ],
  },
  {
    id: 'thunder', at: [5, 5], land: true, title: 'Thunder on the Mountain', ref: 'Exodus 19:16-19; 20:18-21',
    text: 'Thunder, lightning, a thick cloud and a trumpet so loud the whole camp trembles. Mount Sinai smokes. The people say to Moses, “Speak thou with us... but let not God speak with us, lest we die.”',
    choices: [
      { label: 'Stand with Moses as he draws near the darkness', out: [
        { w: 1, t: 'Moses says, “Fear not,” God has come to prove you, so that you will not sin. Your fear becomes awe.', d: { faith: [12, 16], morale: [2, 6] } } ] },
      { label: 'Stand afar off with the people', out: [
        { w: 1, t: 'From a distance you hear the words that will shape your whole life.', d: { faith: [6, 8], morale: [0, 2] } } ] },
      { label: 'Hide in your tent with your hands over your ears', out: [
        { w: 1, t: 'The thunder is not the scariest thing. Missing what God said is.', d: { faith: [-2, 2], morale: [-6, -4] } } ] },
    ],
  },
  {
    id: 'covenant', at: [5, 5], land: true, title: 'The Book of the Covenant', ref: 'Exodus 24:3-8',
    text: 'Moses writes down all the words of the LORD, builds an altar with twelve pillars, one for each tribe, and reads the book of the covenant aloud.',
    choices: [
      { label: 'Say: “All that the LORD hath said will we do, and be obedient”', out: [
        { w: 2, t: 'Moses sprinkles the blood and says, “Behold the blood of the covenant.” You belong to God’s people.', d: { faith: [12, 16], morale: [8, 10] } },
        { w: 1, t: 'You say it loudly, then quietly pray for help to keep it.', d: { faith: [10, 12], morale: [4, 6] } } ] },
      { label: 'Find your tribe’s pillar and stand by it', out: [
        { w: 1, t: 'Twelve tribes, one God. Standing with your people feels good.', d: { morale: [10, 12], faith: [6, 8] } } ] },
      { label: 'Get bored and wander off', out: [
        { w: 1, t: 'You miss the most important day since the sea.', d: { faith: [-6, -4], morale: [-2, 0] } } ] },
    ],
  },
  {
    id: 'shine', at: [5, 5], land: true, title: 'Moses’ Shining Face', ref: 'Exodus 34:29-35',
    text: 'Moses comes down from the mountain with the two tables of the testimony. The skin of his face shines so brightly that Aaron and the people are afraid to come near him.',
    choices: [
      { label: 'Come close and listen anyway', out: [
        { w: 1, t: 'Moses calls you near and gives you all the commandments the LORD spoke. Then he puts a veil on his face.', d: { faith: [12, 14], morale: [6, 8] } } ] },
      { label: 'Ask the elders to tell you what he says', out: [
        { w: 1, t: 'You get the message second-hand. Still good news.', d: { faith: [6, 8], morale: [2, 4] } } ] },
      { label: 'Run away scared', out: [
        { w: 1, t: 'You hear about it later. Next time you will be braver.', d: { faith: [0, 2], morale: [-4, -2] } } ] },
    ],
  },
  {
    id: 'reared', at: [5, 5], land: true, title: 'The Tabernacle Is Raised', ref: 'Exodus 40:17, 34-38',
    text: 'On the first day of the first month of the second year, the tabernacle is set up. The cloud covers the tent, and the glory of the LORD fills it.',
    choices: [
      { label: 'Celebrate with your tribe', out: [
        { w: 1, t: 'God is living in the middle of the camp! Music, food and tears of joy.', d: { morale: [12, 16], faith: [10, 12], manna: [-4, -2] } } ] },
      { label: 'Thank God quietly at your tent door', out: [
        { w: 1, t: 'From your tent you can see the cloud resting over His house. You feel safe.', d: { faith: [12, 14], morale: [4, 6] } } ] },
      { label: 'Worry that this means a long stay', out: [
        { w: 1, t: 'You will move when the cloud moves. Worrying will not change that.', d: { morale: [-4, -2], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'blessing', at: [5, 5], land: true, title: 'The Priestly Blessing', ref: 'Numbers 6:22-27',
    text: 'God gives Aaron and his sons words to bless the people: “The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee.”',
    choices: [
      { label: 'Stand with your family to receive it', out: [
        { w: 1, t: '“The LORD lift up his countenance upon thee, and give thee peace.” You walk away lighter.', d: { faith: [10, 14], morale: [10, 12] } } ] },
      { label: 'Learn the words and bless your little brother', out: [
        { w: 1, t: 'He pretends to be annoyed, but he asks you to say it again at bedtime.', d: { faith: [8, 10], morale: [10, 14] } } ] },
      { label: 'Skip it to gather extra manna', out: [
        { w: 1, t: 'A full basket and an empty feeling.', d: { manna: [6, 10], faith: [-4, -2] } } ] },
    ],
  },
  // Jordan
  {
    id: 'rahab', at: [7, 7], land: true, title: 'The Scarlet Cord', ref: 'Joshua 2',
    text: 'Joshua secretly sends two spies from Shittim to Jericho. They come back with news: Rahab hid them and asked them to save her family. She tied a line of scarlet thread in her window.',
    choices: [
      { label: 'Cheer their report: “The LORD hath delivered into our hands all the land”', out: [
        { w: 1, t: 'What a difference from the spies at Kadesh! The camp is ready to cross.', d: { faith: [10, 14], morale: [10, 14] } } ] },
      { label: 'Ask why God would save a woman of Jericho', out: [
        { w: 1, t: 'Because she trusted the LORD. God’s mercy is bigger than you thought.', d: { faith: [8, 12], morale: [4, 6] } } ] },
      { label: 'Worry about Jericho’s walls', out: [
        { w: 1, t: 'The walls are high. Your God is higher. You cross the Jordan anyway.', d: { morale: [-4, 0], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'bestrong', at: [7, 7], land: true, title: 'Be Strong and of a Good Courage', ref: 'Joshua 1:1-11',
    text: 'God speaks to Joshua: “Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.” Three days, and you cross.',
    choices: [
      { label: 'Prepare food for the crossing', out: [
        { w: 1, t: 'Joshua tells everyone to prepare victuals. Your bags are packed and your heart is ready.', d: { manna: [10, 14], faith: [6, 8], morale: [6, 8] } } ] },
      { label: 'Repeat the promise to yourself all night', out: [
        { w: 1, t: '“Whithersoever thou goest.” You fall asleep smiling.', d: { faith: [12, 14], morale: [6, 8] } } ] },
      { label: 'Lie awake worrying', out: [
        { w: 1, t: 'A long night. At dawn the trumpets sound and you go anyway.', d: { morale: [-6, -2], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'gilgal', at: [7, 7], land: true, title: 'Passover at Gilgal', ref: 'Joshua 5:10-12',
    text: 'Across the Jordan, Israel camps at Gilgal and keeps the Passover on the plains of Jericho. The next day they eat the produce of the land, and the manna stops.',
    choices: [
      { label: 'Taste the first grain of the land', out: [
        { w: 1, t: 'Forty years of manna, and God never missed a morning. Now He feeds you from the land.', d: { manna: [14, 20], faith: [10, 12], morale: [8, 12] } } ] },
      { label: 'Tell the youngest what Passover means', out: [
        { w: 1, t: 'Blood on the doorposts, a night of rescue, and now a new home. The story has come full circle.', d: { faith: [12, 14], morale: [6, 8] } } ] },
      { label: 'Miss the manna a little', out: [
        { w: 1, t: 'Funny, after all that complaining. You laugh at yourself and eat.', d: { morale: [4, 6], manna: [10, 14] } } ] },
    ],
  },
  {
    id: 'nebo', at: [7, 7], land: true, title: 'The View from Nebo', ref: 'Deuteronomy 34:1-9',
    text: 'Moses climbs Mount Nebo, to the top of Pisgah, and the LORD shows him all the land. He is a hundred and twenty years old, his eye not dim. Moses has laid his hands on Joshua, who is full of the spirit of wisdom.',
    choices: [
      { label: 'Follow Joshua, as Moses taught', out: [
        { w: 1, t: 'The people listen to Joshua, just as the LORD commanded Moses. On to the river!', d: { faith: [10, 12], morale: [6, 10] } } ] },
      { label: 'Mourn for Moses with the camp', out: [
        { w: 1, t: 'Israel weeps for Moses thirty days. Then it is time to move.', d: { morale: [-4, 0], faith: [8, 10] } } ] },
      { label: 'Say nobody can replace Moses', out: [
        { w: 1, t: 'Nobody has to. The same God goes with Joshua.', d: { morale: [-6, -2], faith: [0, 2] } } ] },
    ],
  },

  // ---------- More road events ----------
  {
    id: 'josephbones', at: [1, 2], title: 'Joseph’s Bones', ref: 'Exodus 13:19; Genesis 50:25',
    text: 'Moses is carrying a coffin. Inside are the bones of Joseph. Long ago Joseph made Israel swear to take his bones with them when God brought them out.',
    choices: [
      { label: 'Offer to help carry it', out: [
        { w: 1, t: 'A heavy load, but a promise four hundred years old is being kept. God keeps His word.', d: { faith: [8, 10], morale: [4, 6], water: [-5, -3] } } ] },
      { label: 'Ask an elder to tell you Joseph’s story', out: [
        { w: 1, t: 'A coat of many colours, a pit, a prison and a palace. The walk flies by.', d: { faith: [6, 8], morale: [6, 8] } } ] },
    ],
  },
  {
    id: 'dough', at: [1, 1], title: 'Dough in the Kneading Trough', ref: 'Exodus 12:34, 39',
    text: 'You left Egypt so fast that the dough never rose. It is bound up in clothes on your shoulders. Tonight you bake unleavened cakes.',
    choices: [
      { label: 'Bake enough for the family next door too', out: [
        { w: 1, t: 'Flat bread, warm hearts. They bring you a jar of water in return.', d: { manna: [-4, -2], water: [4, 6], morale: [6, 8] } } ] },
      { label: 'Save the dough for later', out: [
        { w: 1, t: 'You eat a small supper and keep the rest. Careful, but a bit grumpy.', d: { manna: [4, 6], morale: [-4, -2] } } ] },
    ],
  },
  {
    id: 'jewels', at: [1, 4], title: 'Gold from Egypt', ref: 'Exodus 12:35-36',
    text: 'Before you left, the Egyptians gave Israel jewels of silver and gold and clothing. Your bag clinks with every step.',
    choices: [
      { label: 'Carry it carefully: God may have a use for it', out: [
        { w: 1, t: 'Heavy, but you keep it safe. One day it will be used for God’s house.', d: { faith: [4, 6], water: [-4, -2] } } ] },
      { label: 'Trade some for water from a passing herdsman', out: [
        { w: 1, t: 'A fair trade. Your skins are fuller and your bag is lighter.', d: { water: [8, 12], morale: [2, 4] } } ] },
      { label: 'Show it off around the campfire', out: [
        { w: 1, t: 'Jealous looks and an argument. Not your best evening.', d: { morale: [-8, -4], faith: [-2, 0] } } ] },
    ],
  },
  {
    id: 'sandals', at: [2, 7], title: 'Sandals That Never Wear Out', ref: 'Deuteronomy 8:4; 29:5',
    text: 'Your cousin notices something strange: after all this walking, your clothes are not worn out and your feet are not swollen.',
    choices: [
      { label: 'Thank God for the little miracles', out: [
        { w: 1, t: 'Once you notice them, you see them everywhere. The walk feels lighter.', d: { faith: [8, 10], morale: [6, 8] } } ] },
      { label: 'Say it must be good leather', out: [
        { w: 1, t: 'Maybe. But it is the same leather your cousin wore out in Egypt in a year.', d: { faith: [0, 2], morale: [2, 4] } } ] },
    ],
  },
  {
    id: 'cloudtarries', at: [2, 7], title: 'The Cloud Stays Put', ref: 'Numbers 9:17-23',
    text: 'The cloud has not moved for days. Whether it stays two days, a month or a year, Israel rests while it rests and moves when it moves. People are restless.',
    choices: [
      { label: 'Rest and wait for God’s timing', out: [
        { w: 1, t: 'Rested legs, mended sandals, and a calmer camp.', d: { morale: [8, 10], faith: [6, 8], manna: [-4, -2] } } ] },
      { label: 'Scout ahead on your own', out: [
        { w: 1, t: 'You get lost for a day and come back thirsty. The cloud had not moved at all.', d: { water: [-10, -6], morale: [-4, -2] } } ] },
      { label: 'Start a game for the bored children', out: [
        { w: 1, t: 'Races, riddles and a lot of laughing. Waiting is easier together.', d: { morale: [10, 12], water: [-3, -2] } } ] },
    ],
  },
  {
    id: 'trumpets', at: [6, 7], title: 'Two Silver Trumpets', ref: 'Numbers 10:1-10',
    text: 'Two trumpets of silver now call the camp. One kind of blast gathers the people; another sets the camps moving. The trumpets sound while you are still packing.',
    choices: [
      { label: 'Pack fast and take your place in line', out: [
        { w: 1, t: 'Your tribe moves out in good order. Everyone notices.', d: { morale: [6, 8], faith: [2, 4] } } ] },
      { label: 'Finish breakfast first', out: [
        { w: 1, t: 'You end up near the back, eating dust all day.', d: { water: [-8, -4], morale: [-4, -2] } } ] },
    ],
  },
  {
    id: 'arkahead', at: [6, 6], title: '“Rise Up, LORD”', ref: 'Numbers 10:33-36',
    text: 'The ark of the covenant goes ahead of the camp for three days, searching out a resting place. Whenever it sets out, Moses says, “Rise up, LORD, and let thine enemies be scattered.”',
    choices: [
      { label: 'Say it with Moses each morning', out: [
        { w: 1, t: 'It becomes the camp’s morning cheer. Courage grows every day.', d: { faith: [8, 10], morale: [6, 8] } } ] },
      { label: 'Keep your eyes on your feet', out: [
        { w: 1, t: 'Three long days. You arrive, but you missed the view.', d: { morale: [-2, 0], water: [-4, -2] } } ] },
    ],
  },
  {
    id: 'hobab', at: [6, 6], title: 'Be Our Eyes', ref: 'Numbers 10:29-32',
    text: 'Moses begs his relative Hobab to come along: he knows where to camp in the wilderness and could be “to us instead of eyes.” Hobab wants to go home.',
    choices: [
      { label: 'Make Hobab feel welcome', out: [
        { w: 1, t: 'You share your food and your stories. Moses promises to share the LORD’s goodness with him.', d: { manna: [-4, -2], morale: [8, 10], faith: [2, 4] } } ] },
      { label: 'Ask Hobab where the best water is', out: [
        { w: 1, t: 'He knows a spring off the path. Very useful!', d: { water: [8, 12], morale: [2, 4] } } ] },
    ],
  },
  {
    id: 'eldad', at: [6, 6], title: 'Eldad and Medad', ref: 'Numbers 11:26-29',
    text: 'Two of the seventy elders stayed in the camp, and the Spirit rests on them too. Joshua says, “My lord Moses, forbid them.”',
    choices: [
      { label: 'Agree with Moses: “Would God that all the LORD’s people were prophets!”', out: [
        { w: 1, t: 'No jealousy here. God can use anyone He chooses.', d: { faith: [8, 12], morale: [6, 8] } } ] },
      { label: 'Side with Joshua: rules are rules', out: [
        { w: 1, t: 'Moses gently corrects you. A lesson in not being jealous for someone else.', d: { faith: [2, 4], morale: [-2, 0] } } ] },
    ],
  },
  {
    id: 'miriamaaron', at: [6, 6], title: 'Seven Days for Miriam', ref: 'Numbers 12',
    text: 'Miriam and Aaron speak against Moses, the meekest man on earth. Miriam becomes leprous and must stay outside the camp seven days. Moses cries, “Heal her now, O God.”',
    choices: [
      { label: 'Wait for Miriam with the whole camp', out: [
        { w: 1, t: 'The people do not journey on until Miriam is brought back in. Nobody is left behind.', d: { morale: [8, 10], faith: [6, 8], manna: [-4, -2] } } ] },
      { label: 'Gossip about it', out: [
        { w: 1, t: 'You have just watched where gossip leads. Your words sting someone else now.', d: { morale: [-8, -6], faith: [-6, -4] } } ] },
      { label: 'Pray for her like Moses did', out: [
        { w: 1, t: 'Moses prayed for the sister who hurt him. You learn what mercy looks like.', d: { faith: [10, 12], morale: [4, 6] } } ] },
    ],
  },
  {
    id: 'tassels', at: [6, 7], title: 'A Ribbon of Blue', ref: 'Numbers 15:38-40',
    text: 'God tells Israel to put fringes on the borders of their garments with a ribbon of blue, “that ye may look upon it, and remember all the commandments of the LORD.”',
    choices: [
      { label: 'Sew them on for the whole family', out: [
        { w: 1, t: 'Every flick of blue is a reminder. Your little sister keeps twirling hers.', d: { faith: [8, 10], morale: [4, 6] } } ] },
      { label: 'Do it later', out: [
        { w: 1, t: 'Later turns into never. You keep forgetting things.', d: { faith: [-4, -2] } } ] },
    ],
  },
  {
    id: 'korah', at: [7, 7], title: 'Korah’s Rebellion', ref: 'Numbers 16',
    text: 'Korah, Dathan, Abiram and two hundred and fifty princes rise up against Moses and Aaron: “Ye take too much upon you!” Moses tells the people to move away from their tents.',
    choices: [
      { label: 'Move away from the rebels’ tents, as Moses says', out: [
        { w: 1, t: 'The ground opens and swallows the rebels. You are safe because you listened.', d: { faith: [8, 12], morale: [-4, 0] } } ] },
      { label: 'Stay close to see what happens', out: [
        { w: 1, t: 'You run when the ground shakes, and lose your water skins in the panic.', d: { water: [-12, -8], morale: [-8, -6], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'almonds', at: [7, 7], title: 'The Rod That Budded', ref: 'Numbers 17:1-10',
    text: 'Twelve rods, one for each tribe, are laid in the tabernacle overnight. In the morning Aaron’s rod has budded, bloomed blossoms and yielded almonds!',
    choices: [
      { label: 'Go and see it with your own eyes', out: [
        { w: 1, t: 'Dead wood with fresh almonds. God can bring life out of anything.', d: { faith: [10, 12], morale: [6, 8] } } ] },
      { label: 'Say it must be a trick', out: [
        { w: 1, t: 'Twelve tribes were watching. No trick. You feel a bit silly.', d: { faith: [-4, -2], morale: [-2, 0] } } ] },
    ],
  },
  {
    id: 'meribah2', at: [7, 7], title: 'Speak to the Rock', ref: 'Numbers 20:2-13',
    text: 'Miriam has died at Kadesh, and there is no water. God tells Moses to speak to the rock. Instead, angry, Moses strikes it twice. Water comes out abundantly.',
    choices: [
      { label: 'Drink, and thank God for His patience', out: [
        { w: 1, t: 'God gave water even when His servant got it wrong. Mercy upon mercy.', d: { water: [24, 30], faith: [6, 8] } } ] },
      { label: 'Blame the people who made Moses angry', out: [
        { w: 1, t: 'Pointing fingers fills no water skins. Still, you drink.', d: { water: [20, 26], morale: [-6, -4] } } ] },
    ],
  },
  {
    id: 'mounthor', at: [7, 7], title: 'Aaron on Mount Hor', ref: 'Numbers 20:23-29',
    text: 'Aaron climbs Mount Hor with Moses and his son Eleazar. Only Moses and Eleazar come down, and Eleazar is wearing Aaron’s priestly garments. Aaron has died.',
    choices: [
      { label: 'Mourn with the camp for thirty days', out: [
        { w: 1, t: 'A long, sad month. But grieving together holds people together.', d: { morale: [4, 6], faith: [4, 6], manna: [-6, -4] } } ] },
      { label: 'Welcome Eleazar as the new high priest', out: [
        { w: 1, t: 'God always has someone ready. The work goes on.', d: { faith: [6, 8], morale: [2, 4] } } ] },
    ],
  },
  {
    id: 'arad', at: [7, 7], title: 'King Arad Attacks', ref: 'Numbers 21:1-3',
    text: 'King Arad the Canaanite fights Israel and takes some prisoners. Israel makes a vow to the LORD and asks for help.',
    choices: [
      { label: 'Join in the vow and pray', out: [
        { w: 1, t: 'The LORD hears and gives Israel the victory. The place is called Hormah.', d: { faith: [8, 10], morale: [8, 10] } } ] },
      { label: 'Hide your food and hope for the best', out: [
        { w: 1, t: 'Israel wins without you. You feel you missed something.', d: { morale: [-4, -2], manna: [2, 4] } } ] },
    ],
  },
  {
    id: 'beer', at: [7, 7], title: 'Spring Up, O Well', ref: 'Numbers 21:16-18',
    text: 'At Beer, God says, “Gather the people together, and I will give them water.” The princes dig with their staves while Israel sings, “Spring up, O well; sing ye unto it.”',
    choices: [
      { label: 'Sing the well song', out: [
        { w: 1, t: 'Water bubbles up as the whole camp sings. Best concert ever.', d: { water: [20, 26], morale: [8, 12], faith: [4, 6] } } ] },
      { label: 'Grab a staff and help dig', out: [
        { w: 1, t: 'Dusty, sweaty, then soaking wet. Totally worth it.', d: { water: [22, 28], morale: [4, 6] } } ] },
    ],
  },
  {
    id: 'sihon', at: [7, 7], title: 'Let Us Pass', ref: 'Numbers 21:21-24',
    text: 'Israel asks Sihon king of the Amorites for permission to pass along the king’s highway, without touching his fields or wells. He refuses and attacks.',
    choices: [
      { label: 'Stand firm with the fighting men', out: [
        { w: 1, t: 'Israel wins and takes the land from Arnon to Jabbok. You find good water there.', d: { water: [10, 14], morale: [6, 8], faith: [4, 6] } } ] },
      { label: 'Protect the families at the back', out: [
        { w: 1, t: 'Nobody gets hurt on your watch. The camp thanks you.', d: { morale: [8, 10], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'balaam', at: [7, 7], title: 'A Curse That Became a Blessing', ref: 'Numbers 22-24',
    text: 'News reaches camp: Balak king of Moab hired a prophet, Balaam, to curse Israel. But every time Balaam opens his mouth, a blessing comes out: “How goodly are thy tents, O Jacob, and thy tabernacles, O Israel!”',
    choices: [
      { label: 'Laugh and praise God: nobody can curse what He blesses', out: [
        { w: 1, t: '“How shall I curse, whom God hath not cursed?” Even Balaam had to admit it.', d: { faith: [10, 12], morale: [10, 12] } } ] },
      { label: 'Worry that the next try might work', out: [
        { w: 1, t: 'You lose sleep over a curse that was never going to land.', d: { morale: [-6, -4], faith: [0, 2] } } ] },
      { label: 'Laugh at the story of Balaam’s talking donkey', out: [
        { w: 1, t: 'The donkey saw the angel before the prophet did! Best story at the campfire.', d: { morale: [10, 12], faith: [4, 6] } } ] },
    ],
  },
  {
    id: 'zelophehad', at: [7, 7], title: 'Five Brave Sisters', ref: 'Numbers 27:1-7',
    text: 'Mahlah, Noah, Hoglah, Milcah and Tirzah stand before Moses. Their father died with no sons. Should their family lose its share of the land?',
    choices: [
      { label: 'Stand with the sisters', out: [
        { w: 1, t: 'Moses asks the LORD, who says, “The daughters of Zelophehad speak right.” They get their inheritance.', d: { morale: [10, 12], faith: [6, 8] } } ] },
      { label: 'Say it has always been sons only', out: [
        { w: 1, t: 'God sides with the sisters. You learn God sees everyone.', d: { morale: [-2, 0], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'commission', at: [7, 7], title: 'A New Leader', ref: 'Numbers 27:15-23',
    text: 'Moses asks God for a leader so the people will not be “as sheep which have no shepherd.” God chooses Joshua, and Moses lays his hands on him before Eleazar and all the people.',
    choices: [
      { label: 'Promise to follow Joshua', out: [
        { w: 1, t: 'A good shepherd for a new season. The camp feels steady.', d: { morale: [8, 10], faith: [6, 8] } } ] },
      { label: 'Say he is too young', out: [
        { w: 1, t: 'Joshua has been faithful for forty years. God knows what He is doing.', d: { morale: [-4, -2], faith: [-2, 0] } } ] },
    ],
  },
  {
    id: 'reuben', at: [7, 7], title: 'Shall Your Brethren Go to War?', ref: 'Numbers 32',
    text: 'Reuben and Gad have lots of cattle and want to stay in the good grazing land east of the Jordan. Moses asks, “Shall your brethren go to war, and shall ye sit here?”',
    choices: [
      { label: 'Suggest they cross over and help first', out: [
        { w: 1, t: 'They agree to go over armed with their brothers. Unity wins.', d: { morale: [10, 12], faith: [4, 6] } } ] },
      { label: 'Say everyone should look after themselves', out: [
        { w: 1, t: 'Moses warns, “Be sure your sin will find you out.” The mood sours.', d: { morale: [-8, -6], faith: [-4, -2] } } ] },
    ],
  },
  {
    id: 'shema', at: [5, 7], title: 'Hear, O Israel', ref: 'Deuteronomy 6:4-7',
    text: '“Hear, O Israel: The LORD our God is one LORD: And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might.” You are to talk of these words as you walk by the way.',
    choices: [
      { label: 'Turn it into a walking song with the kids', out: [
        { w: 1, t: 'By sunset every child in your row knows it by heart.', d: { faith: [10, 12], morale: [6, 8] } } ] },
      { label: 'Walk in silence today', out: [
        { w: 1, t: 'Quiet roads are fine, but a good word would have made it shorter.', d: { morale: [-2, 0] } } ] },
    ],
  },
  {
    id: 'scorpions', at: [2, 7], title: 'Scorpions in the Rocks', ref: 'Deuteronomy 8:15',
    text: 'This is that great and terrible wilderness, with fiery serpents, scorpions and drought. A scorpion scuttles out right next to your little brother’s bare feet.',
    choices: [
      { label: 'Pull him back and check every bedroll tonight', out: [
        { w: 1, t: 'Careful hands, safe children. You thank God for keeping you.', d: { morale: [4, 6], faith: [4, 6] } } ] },
      { label: 'Shrug it off and march on', out: [
        { w: 1, t: 'Someone gets stung that night. A painful lesson for the whole row.', d: { morale: [-8, -4], water: [-4, -2] } } ] },
    ],
  },
  {
    id: 'enemyox', at: [5, 7], title: 'Your Enemy’s Donkey', ref: 'Exodus 23:4-5',
    text: 'You spot a donkey wandering off, and it belongs to a man who has been rude to you for weeks. God’s law says: bring it back to him.',
    choices: [
      { label: 'Return the donkey to him', out: [
        { w: 2, t: 'He looks shocked, then thanks you. Maybe the two of you can start again.', d: { morale: [10, 12], faith: [6, 8], water: [-3, -2] } },
        { w: 1, t: 'He just grunts. But you did the right thing, and God saw it.', d: { morale: [2, 4], faith: [8, 10] } } ] },
      { label: 'Let it wander. Not your problem.', out: [
        { w: 1, t: 'He spends a whole day looking for it. The bad blood gets worse.', d: { morale: [-8, -6], faith: [-4, -2] } } ] },
    ],
  },
  {
    id: 'stranger', at: [5, 7], title: 'A Stranger in the Camp', ref: 'Exodus 23:9',
    text: 'A traveller from another people has joined the camp. Some are unkind to him. God said, “Ye know the heart of a stranger, seeing ye were strangers in the land of Egypt.”',
    choices: [
      { label: 'Invite him to eat with your family', out: [
        { w: 1, t: 'He tells amazing stories of faraway places. You make a friend for life.', d: { manna: [-4, -2], morale: [10, 12], faith: [4, 6] } } ] },
      { label: 'Keep your distance', out: [
        { w: 1, t: 'He eats alone. You remember being the outsider in Egypt.', d: { morale: [-4, -2], faith: [-2, 0] } } ] },
    ],
  },
  {
    id: 'carried', at: [1, 7], title: 'Carried Like a Child', ref: 'Deuteronomy 1:31',
    text: 'A small boy is too tired to take another step. His father hoists him onto his shoulders. Moses once said God bore Israel “as a man doth bear his son, in all the way that ye went.”',
    choices: [
      { label: 'Carry another tired child for a while', out: [
        { w: 1, t: 'Your shoulders ache, but you are smiling. You know how it feels to be carried.', d: { morale: [8, 10], faith: [6, 8], water: [-4, -2] } } ] },
      { label: 'Walk ahead at your own pace', out: [
        { w: 1, t: 'You arrive first and wait alone.', d: { morale: [-2, 0] } } ] },
    ],
  },
  {
    id: 'childasks', at: [1, 7], title: '“What Does This Mean?”', ref: 'Exodus 13:14',
    text: 'A curious child asks why your family still talks about the night you left Egypt.',
    choices: [
      { label: 'Answer: “By strength of hand the LORD brought us out from Egypt”', out: [
        { w: 1, t: 'The child asks a hundred more questions. You answer every one.', d: { faith: [8, 10], morale: [6, 8] } } ] },
      { label: 'Say “Ask your grandmother”', out: [
        { w: 1, t: 'Grandmother tells it beautifully. You wish you had.', d: { morale: [2, 4], faith: [2, 4] } } ] },
    ],
  },
  {
    id: 'mannacakes', at: [4, 7], title: 'Manna Cakes', ref: 'Numbers 11:7-8',
    text: 'People grind manna in mills, beat it in mortars, bake it in pans and make cakes. It tastes like fresh oil. Your aunt has a new recipe she wants to try.',
    choices: [
      { label: 'Help her cook for everyone', out: [
        { w: 1, t: 'Crispy manna cakes! Neighbours drift over and the evening turns into a feast.', d: { morale: [10, 12], manna: [-4, -2], faith: [2, 4] } } ] },
      { label: 'Eat it plain and go to bed', out: [
        { w: 1, t: 'Simple and filling. Nothing wrong with that.', d: { manna: [2, 4] } } ] },
    ],
  },
  {
    id: 'honour', at: [5, 7], title: 'Honour Thy Father and Mother', ref: 'Exodus 20:12',
    text: 'Your father wants to camp near the well; you think the shade by the rocks is better. The argument is getting loud.',
    choices: [
      { label: 'Respect his choice and say sorry', out: [
        { w: 1, t: 'The well turns out to be handy. And your father hugs you that night.', d: { morale: [8, 10], faith: [6, 8], water: [4, 6] } } ] },
      { label: 'Storm off to the rocks alone', out: [
        { w: 1, t: 'Nice shade, cold dinner, and a sulky night.', d: { morale: [-8, -6], faith: [-4, -2] } } ] },
    ],
  },
  {
    id: 'notbybread', at: [4, 7], title: 'Not by Bread Only', ref: 'Deuteronomy 8:2-3',
    text: 'Someone asks why God lets them get hungry at all. Moses said God humbled them and fed them with manna, to teach “that man doth not live by bread only.”',
    choices: [
      { label: 'Talk it through around the fire', out: [
        { w: 1, t: 'Hunger teaches you to trust the One who feeds you. Good talk.', d: { faith: [10, 12], morale: [4, 6] } } ] },
      { label: 'Say you just want more food', out: [
        { w: 1, t: 'Fair enough. But the question stays with you.', d: { faith: [0, 2], morale: [-2, 0] } } ] },
    ],
  },
];

// Endings. tone: good / mid / bad. base: points for reaching it.
window.TRAIL_ENDINGS = {
  promised: {
    title: 'The Promised Land', tone: 'good', base: 1200, coins: 60,
    story: 'Joshua and Caleb lead the way across the Jordan into a land flowing with milk and honey. The next morning the manna stops, because you are eating the fruit of the land.',
    lesson: 'Joshua’s name is the Hebrew form of the name Jesus. Joshua led Israel into the land; Jesus leads us into God’s true rest, a rest no enemy can take away.',
    verse: { text: 'There remaineth therefore a rest to the people of God.', ref: 'Hebrews 4:9' },
  },
  remnant: {
    title: 'The Faithful Remnant', tone: 'good', base: 900, coins: 45,
    story: 'The crowd would not go up. You stood with Joshua and Caleb while others picked up stones. The camp turns back into the desert, but God remembers the few who followed Him fully, and your children will walk into the land.',
    lesson: 'Through every mile, Israel drank from a Rock that went with them. Paul says that Rock was Christ. He stays with the faithful, even when the crowd turns away.',
    verse: { text: 'And did all drink the same spiritual drink: for they drank of that spiritual Rock that followed them: and that Rock was Christ.', ref: '1 Corinthians 10:4' },
  },
  wander: {
    title: 'Forty Years of Wandering', tone: 'mid', base: 500, coins: 30,
    story: 'Fear spread from the ten spies to every tent. God said the spies searched the land forty days, so Israel would wander forty years, a year for each day.',
    lesson: 'Yet manna still fell every single morning of those forty years. God kept feeding a people who doubted Him. Jesus is the true bread from heaven.',
    verse: { text: 'And Jesus said unto them, I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.', ref: 'John 6:35' },
  },
  egypt: {
    title: 'Back to Egypt', tone: 'bad', base: 250, coins: 15,
    story: 'The camp has had enough. “Let us make a captain, and let us return into Egypt.” You turn your back on the promise and walk toward the old chains.',
    lesson: 'Egypt looked like fish and onions, but it was slavery. Going back never sets anyone free. Only Jesus does.',
    verse: { text: 'If the Son therefore shall make you free, ye shall be free indeed.', ref: 'John 8:36' },
  },
  thirst: {
    title: 'Fainted in the Wilderness', tone: 'bad', base: 250, coins: 15,
    story: 'The water skins are empty and the food is gone. The camp can go no further. The desert has won this time.',
    lesson: 'Our bodies need bread and water, but our souls need Jesus. He stood up in a crowd and called every thirsty person to come to Him.',
    verse: { text: 'In the last day, that great day of the feast, Jesus stood and cried, saying, If any man thirst, let him come unto me, and drink.', ref: 'John 7:37' },
  },
  idol: {
    title: 'Look and Live', tone: 'bad', base: 250, coins: 15,
    story: 'With faith gone, the camp turns to idols and the journey falls apart. But even when Israel sinned, God gave a way back: a serpent lifted on a pole. Whoever looked, lived.',
    lesson: 'Jesus was lifted up on the cross so that anyone who looks to Him in faith can live. It is never too late to look up.',
    verse: { text: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up: That whosoever believeth in him should not perish, but have eternal life.', ref: 'John 3:14-15' },
  },
};
window.TRAIL_ENDING_ORDER = ['promised', 'remnant', 'wander', 'egypt', 'thirst', 'idol'];
