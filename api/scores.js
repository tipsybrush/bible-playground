// Shared top-10 leaderboards for every player, kept as one small JSON file in Vercel Blob.
//   GET  /api/scores            -> { boards: { quiz: [top 10], ladder: [...], ... } }
//   GET  /api/scores?game=quiz  -> { board: [top 100] }  (so players outside the top 10 see their rank)
//   POST /api/scores {game, name, score, detail, secs, boost, crown, at}
//        -> { board: [top 100], saved }
// Each nickname keeps only its best run per game.
// Writes use the file's ETag (ifMatch), so two players saving at once never wipe each other out.
import { get, put, BlobPreconditionFailedError } from '@vercel/blob';

const FILE = 'leaderboards/boards.json';
const SHOW = 10;
const KEEP = 100;
const GAMES = ['quiz', 'ladder', 'blanks', 'riddles', 'word', 'snake', 'timeline', 'ark', 'map', 'crossword', 'verse', 'trail', 'sling', 'truths'];

// Same nickname filter as js/leaderboard.js, repeated here so it can't be skipped.
const BLOCKED_ANYWHERE = ['fuck', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'pussy', 'nigg', 'penis', 'vagina', 'retard', 'hitler', 'bastard', 'porn'];
const BLOCKED_WORDS = ['ass', 'arse', 'sex', 'dick', 'cock', 'fag', 'rape', 'nazi', 'damn', 'boob', 'boobs', 'tits', 'kill', 'satan', 'hell'];

const secsOf = (r) => (typeof r.secs === 'number' ? r.secs : Infinity);
const beats = (a, b) => b.score - a.score || secsOf(a) - secsOf(b) || a.at - b.at;
const sortTop = (rows, n = KEEP) => {
  const best = new Map();
  rows.slice().sort(beats).forEach((r) => { const k = String(r.name).toLowerCase(); if (!best.has(k)) best.set(k, r); });
  return [...best.values()].slice(0, n);
};

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
  const score = Number(body.score);
  if (!name || !Number.isInteger(score) || score < 1 || score > 1000000) return null;
  const entry = { name, score, detail: String(body.detail || '').slice(0, 60), at: Date.now() };
  const at = Number(body.at);
  if (Number.isFinite(at) && Math.abs(at - entry.at) < 86400000) entry.at = at; // keep the player's own stamp so their row can be highlighted
  const secs = Number(body.secs);
  if (Number.isInteger(secs) && secs >= 0 && secs <= 86400) entry.secs = secs;
  if (body.boost === true) entry.boost = true;
  if (body.crown === true) entry.crown = true;
  return { game: body.game, entry };
}

async function load() {
  const res = await get(FILE, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200) return { boards: {}, etag: null };
  const boards = JSON.parse(await new Response(res.stream).text());
  return { boards, etag: res.blob.etag };
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
    const { boards } = await load();
    const game = new URL(request.url).searchParams.get('game');
    if (game) {
      if (!GAMES.includes(game)) return json({ error: 'Unknown game' }, 400);
      return json({ board: sortTop(boards[game] || []) }, 200, 'public, max-age=0, s-maxage=5, stale-while-revalidate=30');
    }
    const out = {};
    GAMES.forEach((g) => { out[g] = sortTop(boards[g] || [], SHOW); });
    // The CDN answers repeat visits for a few seconds, so busy moments don't hit storage every time.
    return json({ boards: out }, 200, 'public, max-age=0, s-maxage=10, stale-while-revalidate=60');
  } catch (e) {
    return json({ error: 'Could not load the leaderboards' }, 500);
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
      const before = boards[item.game] || [];
      const board = sortTop([...before, item.entry]);
      if (!board.includes(item.entry)) return json({ board, saved: false });
      boards[item.game] = board;
      await save(boards, etag);
      return json({ board, saved: true });
    } catch (e) {
      // Someone else saved at the same moment (or the file was just created): read again and retry.
      if (!(e instanceof BlobPreconditionFailedError) && !/already exists|precondition/i.test(String(e && e.message))) {
        return json({ error: 'Could not save your score' }, 500);
      }
    }
  }
  return json({ error: 'The leaderboard is busy, please try again' }, 503);
}
