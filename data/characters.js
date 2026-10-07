// Which Bible Character Are You? A just-for-fun personality quiz. No wrong answers.
// Each answer adds a point to one character. Edit the wording freely.
window.BIBLE_CHARACTERS = {
  david: {
    name: 'David', tag: 'The passionate one',
    about: 'You feel things deeply and you put your whole heart into whatever you love, whether it’s music, sport or your friends. You’re creative and brave, and people follow your energy.',
    strengths: ['Heart that’s all in', 'Creative', 'Brave under pressure'],
    watch: 'Big feelings can lead to big mistakes. David got it badly wrong, then ran back to God instead of away (Psalm 51).',
    jesus: 'Jesus is called the Son of David. He is the King David pointed to, and he is faithful even when we aren’t.',
    verse: { text: 'I will praise thee; for I am fearfully and wonderfully made.', ref: 'Psalm 139:14' },
  },
  esther: {
    name: 'Esther', tag: 'The quiet courage',
    about: 'You don’t need the spotlight, but when it really matters you step up. You think before you act, you read the room, and you’re braver than people expect.',
    strengths: ['Wise timing', 'Calm in a crisis', 'Stands up for others'],
    watch: 'You might wait too long for the “perfect” moment. Sometimes courage means speaking before you feel ready.',
    jesus: 'Esther risked her life to save her people. Jesus didn’t just risk his life for us, he gave it.',
    verse: { text: 'And who knoweth whether thou art come to the kingdom for such a time as this?', ref: 'Esther 4:14' },
  },
  peter: {
    name: 'Peter', tag: 'The bold one',
    about: 'You jump first and think later. You say what everyone else is thinking, you’re loyal to the core, and you’re usually the first one out of the boat.',
    strengths: ['Bold', 'Loyal', 'Honest, even when it’s awkward'],
    watch: 'Speaking fast can mean saying things you regret. Peter learned that, and grew.',
    jesus: 'Peter denied Jesus three times, and Jesus restored him three times. Your failures don’t cancel your calling.',
    verse: { text: 'And he said, Come. And when Peter was come down out of the ship, he walked on the water, to go to Jesus.', ref: 'Matthew 14:29' },
  },
  ruth: {
    name: 'Ruth', tag: 'The loyal friend',
    about: 'When you commit to someone, you mean it. You show up in hard seasons, you work hard without complaining, and people know they can count on you.',
    strengths: ['Loyal', 'Hardworking', 'Kind to people who are hurting'],
    watch: 'You give a lot. Make sure you let others care for you too.',
    jesus: 'Ruth, a foreigner, ended up in the family line of Jesus. God loves to bring outsiders into his family.',
    verse: { text: 'For whither thou goest, I will go; and where thou lodgest, I will lodge: thy people shall be my people, and thy God my God.', ref: 'Ruth 1:16' },
  },
  daniel: {
    name: 'Daniel', tag: 'The one with conviction',
    about: 'You know what you believe and you don’t fold under pressure. You’re disciplined, you’re smart, and you stay respectful even when you disagree.',
    strengths: ['Strong convictions', 'Self-discipline', 'Excellent at what you do'],
    watch: 'High standards are good, but don’t be hard on people who aren’t there yet.',
    jesus: 'Daniel saw a vision of “one like the Son of man” (Daniel 7:13). Jesus took that title for himself.',
    verse: { text: 'But Daniel purposed in his heart that he would not defile himself with the portion of the king’s meat.', ref: 'Daniel 1:8' },
  },
  joseph: {
    name: 'Joseph', tag: 'The resilient dreamer',
    about: 'You’ve got big dreams, and when life knocks you down you get back up. You stay faithful in small things, and you forgive people who don’t deserve it.',
    strengths: ['Resilient', 'Forgiving', 'Plans ahead'],
    watch: 'Not everyone needs to hear your dreams straight away, as Joseph found out.',
    jesus: 'Joseph was rejected by his brothers, then saved them. Jesus was rejected too, and saves all who come to him.',
    verse: { text: 'But as for you, ye thought evil against me; but God meant it unto good.', ref: 'Genesis 50:20' },
  },
  deborah: {
    name: 'Deborah', tag: 'The wise leader',
    about: 'People come to you for advice. You see clearly, you make decisions, and you push others to step into what God has for them.',
    strengths: ['Wise', 'Decisive', 'Brings out the best in others'],
    watch: 'Leaders carry a lot. Don’t forget to rest and to let others lead too.',
    jesus: 'Deborah judged Israel for a season. Jesus is the perfect judge and leader, full of grace and truth.',
    verse: { text: 'And Deborah said unto Barak, Up; for this is the day in which the LORD hath delivered Sisera into thine hand: is not the LORD gone out before thee?', ref: 'Judges 4:14' },
  },
  paul: {
    name: 'Paul', tag: 'The driven one',
    about: 'When you’re convinced about something, you go all in. You love ideas, you love to explain them, and you don’t give up when it gets hard.',
    strengths: ['Driven', 'Great communicator', 'Never gives up'],
    watch: 'Passion can turn into stubbornness. Paul had to learn that his strength was in God, not himself.',
    jesus: 'Jesus turned Paul from his biggest enemy into his greatest messenger. No one is too far gone.',
    verse: { text: 'I can do all things through Christ which strengtheneth me.', ref: 'Philippians 4:13' },
  },
  barnabas: {
    name: 'Barnabas', tag: 'The encourager',
    about: 'You’re the hype person. You notice the new person, you believe in people before others do, and your friends leave feeling better than when they came.',
    strengths: ['Encouraging', 'Generous', 'Sees potential in people'],
    watch: 'You might avoid hard conversations to keep the peace. Real encouragement is honest too.',
    jesus: 'Barnabas vouched for Paul when nobody trusted him. Jesus vouches for us before the Father.',
    verse: { text: 'For he was a good man, and full of the Holy Ghost and of faith: and much people was added unto the Lord.', ref: 'Acts 11:24' },
  },
  mary: {
    name: 'Mary of Bethany', tag: 'The devoted listener',
    about: 'You don’t mind the noise around you as long as you’re close to what matters. You’re thoughtful, you love deeply, and you’d rather be real than impressive.',
    strengths: ['Devoted', 'Thoughtful', 'Knows what matters most'],
    watch: 'Others may not get your quiet way of loving God. That’s okay.',
    jesus: 'Mary sat at Jesus’ feet and later poured out costly perfume on him. Jesus said she had chosen the best thing.',
    verse: { text: 'But one thing is needful: and Mary hath chosen that good part, which shall not be taken away from her.', ref: 'Luke 10:42' },
  },
};

window.CHARACTER_QUESTIONS = [
  { q: 'It’s Friday night. Where are you?', a: [
    ['Leading the music at youth fellowship', 'david'], ['At home with a good book or a deep chat', 'mary'],
    ['Hyping up a friend before their big day', 'barnabas'], ['Planning the next big event', 'deborah']] },
  { q: 'Your group chat is arguing. You…', a: [
    ['Jump in and say it straight', 'peter'], ['Wait, then say the one thing that settles it', 'esther'],
    ['Message the person who seems hurt', 'ruth'], ['Explain your point with three solid reasons', 'paul']] },
  { q: 'Pick a superpower.', a: [
    ['Never giving up, whatever happens', 'joseph'], ['Saying no to anything that compromises you', 'daniel'],
    ['Making anyone feel welcome', 'barnabas'], ['Knowing exactly what to do in a crisis', 'deborah']] },
  { q: 'What do your friends come to you for?', a: [
    ['Advice', 'deborah'], ['Loyalty, no matter what', 'ruth'],
    ['Courage to try something', 'peter'], ['A listening ear', 'mary']] },
  { q: 'Someone treats you unfairly. You…', a: [
    ['Forgive them, even if it takes time', 'joseph'], ['Stay respectful and keep doing right', 'daniel'],
    ['Pour it out to God in a song or a journal', 'david'], ['Look for the right moment to speak up', 'esther']] },
  { q: 'Your ideal Saturday project?', a: [
    ['Writing or recording something creative', 'david'], ['Helping a family member who needs a hand', 'ruth'],
    ['Studying for something you really care about', 'daniel'], ['Starting something new from scratch', 'paul']] },
  { q: 'Which phrase sounds most like you?', a: [
    ['“Let’s go!”', 'peter'], ['“I believe in you.”', 'barnabas'],
    ['“It will work out. Watch.”', 'joseph'], ['“For such a time as this.”', 'esther']] },
  { q: 'In church, you’re most likely…', a: [
    ['On the choir or worship team', 'david'], ['Right at the front, soaking in the message', 'mary'],
    ['Welcoming first-timers at the door', 'barnabas'], ['Running a department or planning the programme', 'deborah']] },
  { q: 'Your biggest strength?', a: [
    ['Discipline', 'daniel'], ['Bounce-back ability', 'joseph'],
    ['Persuading people', 'paul'], ['Sticking with people', 'ruth']] },
  { q: 'What would you risk the most for?', a: [
    ['My people', 'esther'], ['The message I believe in', 'paul'],
    ['Being close to Jesus', 'mary'], ['A friend in trouble', 'peter']] },
];
