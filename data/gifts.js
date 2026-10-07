// Find Your Place: a no-wrong-answers quiz that suggests where a young person could serve.
// Department names follow what many churches call their units and departments.
// Rename any of them to match your church (for example "Technical unit" might be "Media department").
window.GIFT_AREAS = {
  worship: {
    name: 'Choir and music', passion: 'Music and praise',
    about: 'You light up when people sing, play and praise God together. Music is one of the ways you connect with him, and it can help others connect too.',
    serve: ['Teens’ choir', 'Praise and worship team', 'Instrumentalists: keyboard, drums, bass, talking drum'],
    grow: 'Choir and music department: rehearsals, vocal parts, instrument practice and learning to lead praise and worship.',
    person: 'David wrote songs to God as a shepherd boy and later as king.',
    verse: { text: 'Let every thing that hath breath praise the LORD.', ref: 'Psalm 150:6' },
  },
  media: {
    name: 'Technical and media', passion: 'Making and building things',
    about: 'You love to create, whether that’s videos, designs, sound or gadgets. God gives creative skill as a gift, and churches need it every week.',
    serve: ['Technical unit: sound, projection and livestream', 'Media and publicity: flyers, graphics and church socials', 'Photography and video for programmes'],
    grow: 'Technical and media department: learn the mixer, the cameras, the software and how to serve behind the scenes.',
    person: 'Bezalel was filled with God’s Spirit to make beautiful things for the tabernacle.',
    verse: { text: 'I have filled him with the spirit of God, in wisdom, and in understanding, and in knowledge, and in all manner of workmanship.', ref: 'Exodus 31:3' },
  },
  children: {
    name: 'Children’s church', passion: 'Helping younger kids',
    about: 'You’re patient and fun with younger kids, and they look up to you. You can help them love God and church from an early age.',
    serve: ['Children’s church assistant teacher', 'Vacation Bible School (VBS)', 'Crèche'],
    grow: 'Children’s department: teachers’ training, storytelling, memory verses and leading songs and games.',
    person: 'Jesus made time for children when others tried to send them away.',
    verse: { text: 'Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God.', ref: 'Mark 10:14' },
  },
  hospitality: {
    name: 'Ushering and protocol', passion: 'Making people feel at home',
    about: 'You notice new faces and make them feel wanted. A warm welcome is often the reason someone comes back to church.',
    serve: ['Ushering: welcoming, seating and offering time', 'Protocol: looking after guest ministers and special guests', 'Sanctuary team: getting the church ready before service'],
    grow: 'Ushering department: learn to welcome, guide and look after people with excellence.',
    person: 'Lydia opened her home to Paul and his friends.',
    verse: { text: 'Distributing to the necessity of saints; given to hospitality.', ref: 'Romans 12:13' },
  },
  outreach: {
    name: 'Evangelism', passion: 'Sharing your faith',
    about: 'You want your friends to know Jesus, and you’re not shy about inviting them. That boldness is a real gift.',
    serve: ['Evangelism team: outreaches and school fellowships', 'Follow-up of new converts', 'Missions and rural outreach'],
    grow: 'Evangelism and missions department: learn to share your story, and join outreaches and crusades.',
    person: 'Philip told an Ethiopian official about Jesus on a desert road.',
    verse: { text: 'Go ye into all the world, and preach the gospel to every creature.', ref: 'Mark 16:15' },
  },
  prayer: {
    name: 'Prayer band', passion: 'Talking with God for others',
    about: 'You care deeply and you take things to God. Praying for people is quiet work, but it matters more than most people know.',
    serve: ['Prayer band and intercessors', 'Vigils and prayer meetings', 'Praying with people at altar call'],
    grow: 'Prayer department: learn different ways to pray, and pray with others at vigils and before services.',
    person: 'Hannah poured out her heart to God, and God answered her.',
    verse: { text: 'Pray without ceasing.', ref: '1 Thessalonians 5:17' },
  },
  teaching: {
    name: 'Sunday school and Bible study', passion: 'Learning and explaining the Bible',
    about: 'You love to dig into the Bible and help others understand it. When something clicks for a friend because of you, you feel it.',
    serve: ['Teens’ Sunday school assistant teacher', 'Bible quiz team', 'Leading a cell or fellowship group'],
    grow: 'Sunday school and Bible study department: teachers’ classes and cell groups that go deeper into Scripture.',
    person: 'Ezra studied God’s law and taught it to the people.',
    verse: { text: 'Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.', ref: '2 Timothy 2:15' },
  },
  care: {
    name: 'Welfare', passion: 'Helping people who are struggling',
    about: 'You notice when someone is hurting and you want to help. That kind of compassion looks a lot like Jesus.',
    serve: ['Welfare unit: visiting the sick and the bereaved', 'Food and clothing drives', 'Being a buddy to new members'],
    grow: 'Welfare department: learn how to support people well, with help from your pastors.',
    person: 'Dorcas was known for her good works and the clothes she made for widows.',
    verse: { text: 'Bear ye one another’s burdens, and so fulfil the law of Christ.', ref: 'Galatians 6:2' },
  },
  leadership: {
    name: 'Teens’ executives', passion: 'Organizing and leading',
    about: 'You see what needs doing and you get people moving. Good leaders serve the people they lead, and you can grow into that.',
    serve: ['Youth fellowship leader or executive', 'Planning camp, rallies, talent nights and harvest', 'Unit or department coordinator'],
    grow: 'Leadership training: workshops, and a mentor who can help you lead well.',
    person: 'Nehemiah organized the people to rebuild Jerusalem’s walls in 52 days.',
    verse: { text: 'Let no man despise thy youth; but be thou an example of the believers.', ref: '1 Timothy 4:12' },
  },
};

// Each answer adds a point to one area.
window.GIFT_QUESTIONS = [
  { q: 'It’s Saturday and nothing is planned. You’d most likely…', a: [
    ['Make music or sing along loudly', 'worship'], ['Edit a video, draw, or build something', 'media'],
    ['Chat and play with your younger cousins or neighbours', 'children'], ['Invite friends over and make snacks', 'hospitality']] },
  { q: 'Someone new walks into youth fellowship alone. You…', a: [
    ['Go say hi and introduce them to everyone', 'hospitality'], ['Get to know them and tell them what God means to you', 'outreach'],
    ['Quietly pray that they feel at home', 'prayer'], ['Check whether they’re okay or need anything', 'care']] },
  { q: 'Your friends would say you’re the one who…', a: [
    ['Always has a plan', 'leadership'], ['Explains things so they make sense', 'teaching'],
    ['Notices when someone is sad', 'care'], ['Keeps the music playing', 'worship']] },
  { q: 'Pick a project to help with.', a: [
    ['Running sound and projection on Sunday', 'media'], ['A food drive for families', 'care'],
    ['Vacation Bible School for the kids', 'children'], ['Planning the teens’ camp', 'leadership']] },
  { q: 'When you read the Bible, you most enjoy…', a: [
    ['The Psalms and songs', 'worship'], ['Working out what a passage really means', 'teaching'],
    ['The prayers people prayed', 'prayer'], ['Stories of people sharing the good news', 'outreach']] },
  { q: 'It’s harvest thanksgiving. Where would you be?', a: [
    ['At the door with a big smile', 'hospitality'], ['Behind the camera or the sound desk', 'media'],
    ['Praying with the prayer band before it starts', 'prayer'], ['Leading games for the little ones', 'children']] },
  { q: 'What makes you feel most alive?', a: [
    ['Seeing someone understand something because you explained it', 'teaching'], ['A friend coming to church because you invited them', 'outreach'],
    ['Making a plan and watching it come together', 'leadership'], ['Helping someone who is really struggling', 'care']] },
  { q: 'Which superpower would you pick?', a: [
    ['Make anyone feel at home', 'hospitality'], ['Never run out of patience with kids', 'children'],
    ['Lead a whole crowd in praise', 'worship'], ['Know exactly what to pray for anyone', 'prayer']] },
  { q: 'In a group project, you usually…', a: [
    ['Take charge and share out the jobs', 'leadership'], ['Make the slides look amazing', 'media'],
    ['Research and explain the hard parts', 'teaching'], ['Make sure everyone is included and okay', 'care']] },
  { q: 'Which Bible person are you most like?', a: [
    ['David, the songwriter', 'worship'], ['Nehemiah, who organized the rebuilding of a city wall', 'leadership'],
    ['Philip, who told a traveller about Jesus', 'outreach'], ['Hannah, who poured out her heart in prayer', 'prayer']] },
  { q: 'If you could start something new at church, it would be…', a: [
    ['A teens’ choir or band', 'worship'], ['A welcome team for first-timers', 'hospitality'],
    ['A weekly Bible study cell with friends', 'teaching'], ['An outreach to a nearby school or community', 'outreach']] },
  { q: 'Which compliment would mean the most to you?', a: [
    ['“You helped my kid love church.”', 'children'], ['“Your video or design was so good.”', 'media'],
    ['“You were there for me when things were hard.”', 'care'], ['“Your prayers really helped me.”', 'prayer']] },
];
