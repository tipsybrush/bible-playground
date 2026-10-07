// Settings for the shared leaderboards.
// Leave these empty and the leaderboards are kept in each player's own browser.
// To share them with everyone, create a free Supabase project, run supabase.sql in its
// SQL editor, then paste the project URL and its "anon public" key here. That key is
// meant to be public; the rules in supabase.sql decide what it can do.
// siteUrl: the site's public address (for example https://yourname.github.io/bible-playground/).
// Share and challenge links point here. Leave it empty to use the current page address.
window.BP_CONFIG = {
  siteUrl: 'https://bible-playground.vercel.app/',
  // The site's own shared leaderboards (api/scores.js on Vercel). Every player sees the same top 10.
  scoresApi: '/api/scores',
  supabaseUrl: '',
  supabaseKey: '',
  // Your donation link (a Paystack payment page, Selar, Flutterwave, Patreon…). The footer "Support this site" button shows once this is set.
  coffeeUrl: '',
};
