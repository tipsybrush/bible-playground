// Shared top-10 leaderboards for every player, kept as one small JSON file in Vercel Blob.
//   GET  /api/scores            -> { boards: { quiz: [top 10], ladder: [...], ... } }
//   GET  /api/scores?game=quiz  -> { board: [top 100] }  (so players outside the top 10 see their rank)
//   GET  /api/scores?overall=1  -> { overall: [top 100 across all games] }
//   POST /api/scores {game, name, score, detail, secs, boost, crown, at}
//        -> { board: [top 100], saved }
// Each player keeps only their best run per game. Players are told apart by a private random id
// their browser sends (stored as a short hash), so two people who pick the same nickname both count.
// Writes use the file's ETag (ifMatch), so two players saving at once never wipe each other out.
import { createHash } from 'node:crypto';
import { get, head, put, BlobNotFoundError, BlobPreconditionFailedError } from '@vercel/blob';

const FILE = 'leaderboards/boards.json';
const SHOW = 10;
const KEEP = 100;
const GAMES = ['quiz', 'ladder', 'blanks', 'riddles', 'word', 'snake', 'timeline', 'ark', 'map', 'crossword', 'verse', 'trail', 'sling', 'truths'];

// Same nickname filter as js/leaderboard.js, repeated here so it can't be skipped.
const BLOCKED_ANYWHERE = ['fuck', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'pussy', 'nigg', 'penis', 'vagina', 'retard', 'hitler', 'bastard', 'porn'];
const BLOCKED_WORDS = ['ass', 'arse', 'sex', 'dick', 'cock', 'fag', 'rape', 'nazi', 'damn', 'boob', 'boobs', 'tits', 'kill', 'satan', 'hell'];

const secsOf = (r) => (typeof r.secs === 'number' ? r.secs : Infinity);
const beats = (a, b) => b.score - a.score || secsOf(a) - secsOf(b) || a.at - b.at;
const keyOf = (r) => r.id || 'n:' + String(r.name).toLowerCase();
const sortTop = (rows, n = KEEP) => {
  const best = new Map();
  rows.slice().sort(beats).forEach((r) => { const k = keyOf(r); if (!best.has(k)) best.set(k, r); });
  return [...best.values()].slice(0, n);
};

// Overall leaderboard: in each game a player earns up to 1000 points, in proportion to the game's
// top score (the leader gets 1000, half the leader's score gets 500). Adding these up keeps games
// with huge scores, like Jacob's Ladder, from outweighing the rest, and rewards playing many games.
function overall(boards, n = KEEP) {
  const acc = new Map();
  GAMES.forEach((g) => {
    const rows = sortTop(boards[g] || []);
    const top = rows.length ? rows[0].score : 0;
    if (top <= 0) return;
    rows.forEach((r) => {
      const k = keyOf(r);
      const a = acc.get(k) || { name: r.name, points: 0, games: 0, crown: false };
      a.points += Math.round((1000 * r.score) / top); a.games++; a.crown = a.crown || !!r.crown;
      acc.set(k, a);
    });
  });
  return [...acc.values()].sort((a, b) => b.points - a.points || b.games - a.games).slice(0, n);
}

function okName(raw) {
  const name = String(raw || '').replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 16 || !/^[\p{L}\p{N} ._'-]+$/u.test(name)) return null;
  const plain = name.toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/[^a-z ]/g, '');
  if (BLOCKED_ANYWHERE.some((w) => plain.replace(/ /g, '').includes(w)) || plain.split(' ').some((w) => BLOCKED_WORDS.includes(w))) return null;
  return name;
}

function clean(body) {
  if (!body || !GAMES.includes(body.game)) return null;
  const name = okName(body.name);
  const score = Math.round(Number(body.score));
  if (!name || !Number.isFinite(score) || score < 1 || score > 1000000) return null;
  const entry = { name, score, detail: String(body.detail || '').slice(0, 60), at: Date.now() };
  const at = Number(body.at);
  if (Number.isFinite(at) && Math.abs(at - entry.at) < 86400000) entry.at = at; // keep the player's own stamp so their row can be highlighted
  const secs = Math.round(Number(body.secs));
  if (body.secs != null && Number.isFinite(secs) && secs >= 0 && secs <= 86400) entry.secs = secs;
  if (typeof body.pid === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(body.pid)) entry.id = playerId(body.pid);
  if (body.boost === true) entry.boost = true;
  if (body.crown === true) entry.crown = true;
  return { game: body.game, entry };
}

// Same hash as playerId() in js/leaderboard.js; the raw id never leaves the player's browser otherwise.
function playerId(pid) { return createHash('sha256').update('bp:' + pid).digest('hex').slice(0, 12); }

// Reads the file the same way as before. If that read finds nothing, head() asks the Blob API
// itself whether the file really is missing; if it isn't, the read was a hiccup, so try again
// instead of treating the boards as empty (which made saves fail as "busy").
async function load() {
  for (let tries = 0; ; tries++) {
    const res = await get(FILE, { access: 'private', useCache: false });
    if (res && res.statusCode === 200) {
      return { boards: JSON.parse(await new Response(res.stream).text()), etag: res.blob.etag };
    }
    let missing = false;
    try { await head(FILE); } catch (e) { missing = e instanceof BlobNotFoundError; }
    if (missing) return { boards: {}, etag: null };
    if (tries >= 4) throw new Error('The leaderboard file could not be read');
    await new Promise((r) => setTimeout(r, 150 * (tries + 1)));
  }
}

// Temporary check of how the storage answers (no scores or secrets in the output). It rewrites
// the file with its own unchanged content to see which version tag a conditional save accepts.
async function diag() {
  const out = {};
  const step = async (k, fn) => { try { out[k] = await fn(); } catch (e) { out[k] = { error: (e && e.constructor && e.constructor.name) + ': ' + String(e && e.message).slice(0, 160) }; } };
  let text = null, getEtag = null, headEtag = null;
  await step('head', async () => { const m = await head(FILE); headEtag = m.etag; return { etag: m.etag, size: m.size }; });
  await step('get', async () => {
    const r = await get(FILE, { access: 'private', useCache: false });
    if (!r) return null;
    text = await new Response(r.stream).text(); getEtag = r.blob.etag;
    return { status: r.statusCode, etag: r.blob.etag, bytes: text.length };
  });
  if (text != null) {
    const opts = { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 };
    await step('putWithGetEtag', async () => { const r = await put(FILE, text, { ...opts, ifMatch: getEtag }); return { ok: true, etag: r.etag }; });
    await step('head2', async () => (await head(FILE)).etag);
    const fresh = out.head2;
    if (typeof fresh === 'string') await step('putWithHeadEtag', async () => { const r = await put(FILE, text, { ...opts, ifMatch: fresh }); return { ok: true, etag: r.etag }; });
  }
  return out;
}

async function save(boards, etag) {
  const opts = { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 };
  if (etag) opts.ifMatch = etag;
  await put(FILE, JSON.stringify(boards), opts);
}

const json = (data, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': cache } });

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    if (params.get('diag')) return json(await diag(), 200);
    const { boards } = await load();
    if (params.get('overall')) return json({ overall: overall(boards) }, 200, 'public, max-age=0, s-maxage=10, stale-while-revalidate=60');
    const game = params.get('game');
    if (game) {
      if (!GAMES.includes(game)) return json({ error: 'Unknown game' }, 400);
      return json({ board: sortTop(boards[game] || []) }, 200, 'public, max-age=0, s-maxage=5, stale-while-revalidate=30');
    }
    const out = {};
    GAMES.forEach((g) => { out[g] = sortTop(boards[g] || [], SHOW); });
    // The CDN answers repeat visits for a few seconds, so busy moments don't hit storage every time.
    return json({ boards: out }, 200, 'public, max-age=0, s-maxage=10, stale-while-revalidate=60');
  } catch (e) {
    console.error('scores GET', e && e.message);
    return json({ error: 'Could not load the leaderboards', detail: String((e && e.message) || e).slice(0, 200) }, 500);
  }
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Bad request' }, 400); }
  const item = clean(body);
  if (!item) return json({ error: 'That score could not be saved' }, 400);
  for (let tries = 0; tries < 12; tries++) {
    if (tries) await new Promise((r) => setTimeout(r, 30 + Math.random() * 120 * tries));
    try {
      const { boards, etag } = await load();
      const me = item.entry;
      let changed = false;
      if (me.id) {
        GAMES.forEach((g) => {
          if (!boards[g]) return;
          boards[g] = boards[g].map((r) => {
            // Rows saved before ids existed are claimed by the first player who saves under that name.
            const mine = r.id === me.id || (g === item.game && !r.id && String(r.name).toLowerCase() === me.name.toLowerCase());
            // A player who changed their nickname shows under the new one everywhere.
            if (mine && (r.id !== me.id || r.name !== me.name)) { changed = true; return { ...r, id: me.id, name: me.name }; }
            return r;
          });
        });
      }
      const board = sortTop([...(boards[item.game] || []), me]);
      if (!board.includes(me)) {
        if (changed) await save(boards, etag);
        return json({ board, saved: false });
      }
      boards[item.game] = board;
      await save(boards, etag);
      return json({ board, saved: true });
    } catch (e) {
      // Someone else saved at the same moment, the file was just created, or a read hiccupped:
      // read again and retry. Anything else is logged so it shows up in the Vercel logs.
      if (!(e instanceof BlobPreconditionFailedError) && !/already exists|precondition/i.test(String(e && e.message))) {
        console.error('scores POST', tries, e && e.message);
      }
    }
  }
  return json({ error: 'The leaderboard is busy, please try again' }, 503);
}
