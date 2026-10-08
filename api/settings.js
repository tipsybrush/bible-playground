// Public site settings that the admin page edits: game order, hidden games, "New" badges and the
// announcement banner. The home page reads them on every visit.
//   GET /api/settings -> { order: [...], hidden: [...], fresh: [...], banner: { on, text, link }, updatedAt }
import { readJson, json } from './_lib/blob.js';

export const SETTINGS_FILE = 'site/settings.json';
export const EMPTY = { order: [], hidden: [], fresh: [], banner: { on: false, text: '', link: '' }, updatedAt: 0 };

export async function GET() {
  try {
    const { data } = await readJson(SETTINGS_FILE, EMPTY);
    // The CDN keeps this for a few seconds so busy moments don't hit storage on every visit.
    return json({ ...EMPTY, ...data }, 200, 'public, max-age=0, s-maxage=5, stale-while-revalidate=30');
  } catch (e) {
    console.error('settings GET', e && e.message);
    return json(EMPTY, 200, 'no-store');
  }
}
