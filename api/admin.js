// Admin actions for Timi's dashboard (/admin). Every call needs the admin password, which lives in
// the ADMIN_PASSWORD environment variable on Vercel and is sent in the x-admin-key header.
//   POST { action: 'check' }                          -> { ok: true }
//   POST { action: 'save-settings', settings }        -> { settings }
//   POST { action: 'boards' }                         -> { boards: { game: [top 100 rows] } }
//   POST { action: 'remove-score', game, at, name }   -> { removed }   one leaderboard row
//   POST { action: 'remove-player', id | name }       -> { removed }   that player in every game
import { createHash, timingSafeEqual } from 'node:crypto';
import { readJson, update, json } from './_lib/blob.js';
import { SETTINGS_FILE, EMPTY } from './settings.js';

const BOARDS_FILE = 'leaderboards/boards.json';
const ID = /^[a-z]{2,12}$/;

function allowed(request) {
  const want = process.env.ADMIN_PASSWORD || '';
  const got = request.headers.get('x-admin-key') || '';
  if (!want) return false;
  const h = (s) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(want), h(got));
}

const ids = (list) => (Array.isArray(list) ? [...new Set(list.filter((x) => typeof x === 'string' && ID.test(x)))].slice(0, 60) : []);

function cleanSettings(s) {
  const b = (s && s.banner) || {};
  const link = String(b.link || '').trim();
  return {
    order: ids(s && s.order),
    hidden: ids(s && s.hidden),
    fresh: ids(s && s.fresh),
    banner: {
      on: b.on === true,
      text: String(b.text || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      link: /^(https:\/\/|#|\/)[^\s"<>]{0,200}$/.test(link) ? link : '',
    },
    updatedAt: Date.now(),
  };
}

export async function POST(request) {
  if (!process.env.ADMIN_PASSWORD) return json({ error: 'The admin password has not been set on Vercel yet' }, 503);
  if (!allowed(request)) {
    await new Promise((r) => setTimeout(r, 600)); // slows down guessing
    return json({ error: 'Wrong password' }, 401);
  }
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Bad request' }, 400); }
  try {
    switch (body.action) {
      case 'check':
        return json({ ok: true });
      case 'save-settings': {
        const settings = await update(SETTINGS_FILE, EMPTY, () => cleanSettings(body.settings));
        return json({ settings });
      }
      case 'boards': {
        const { data } = await readJson(BOARDS_FILE, {});
        const boards = {};
        Object.keys(data).forEach((g) => {
          boards[g] = (data[g] || []).slice().sort((a, b) => b.score - a.score || (a.secs ?? 1e9) - (b.secs ?? 1e9)).slice(0, 100)
            .map((r) => ({ name: r.name, score: r.score, secs: r.secs, detail: r.detail, at: r.at, id: r.id || '' }));
        });
        return json({ boards });
      }
      case 'remove-score': {
        let removed = 0;
        await update(BOARDS_FILE, {}, (data) => {
          removed = 0;
          if (!Array.isArray(data[body.game])) return data;
          const rows = data[body.game];
          data[body.game] = rows.filter((r) => {
            const hit = r.at === body.at && r.name === body.name;
            if (hit) removed++;
            return !hit;
          });
          return data;
        });
        return json({ removed });
      }
      case 'remove-player': {
        let removed = 0;
        const name = String(body.name || '').toLowerCase();
        await update(BOARDS_FILE, {}, (data) => {
          removed = 0;
          Object.keys(data).forEach((g) => {
            data[g] = (data[g] || []).filter((r) => {
              const hit = body.id ? r.id === body.id : String(r.name).toLowerCase() === name;
              if (hit) removed++;
              return !hit;
            });
          });
          return data;
        });
        return json({ removed });
      }
      default:
        return json({ error: 'Unknown action' }, 400);
    }
  } catch (e) {
    console.error('admin', body && body.action, e && e.message);
    return json({ error: 'Something went wrong, please try again' }, 500);
  }
}
