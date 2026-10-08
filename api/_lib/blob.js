// Small JSON files kept in Vercel Blob, read and written safely.
// Same approach as api/scores.js: the strong version tag comes from head(), the file is used only if
// its tag matches, and writes pass that tag (ifMatch) so two saves at once can't overwrite each other.
import { get, head, put, BlobNotFoundError } from '@vercel/blob';

const sameVersion = (a, b) => String(a || '').replace(/^W\//, '') === String(b || '').replace(/^W\//, '');

export async function readJson(file, fallback) {
  for (let tries = 0; ; tries++) {
    let meta;
    try { meta = await head(file); }
    catch (e) { if (e instanceof BlobNotFoundError) return { data: fallback, etag: null }; throw e; }
    const res = await get(file, { access: 'private', useCache: false });
    if (res && res.statusCode === 200 && sameVersion(res.blob.etag, meta.etag)) {
      return { data: JSON.parse(await new Response(res.stream).text()), etag: meta.etag };
    }
    if (tries >= 5) throw new Error('Could not read ' + file);
    await new Promise((r) => setTimeout(r, 120 * (tries + 1)));
  }
}

export async function writeJson(file, data, etag) {
  const opts = { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 };
  if (etag) opts.ifMatch = etag;
  await put(file, JSON.stringify(data), opts);
}

// Read, change and write back, retrying if someone else saved in between.
export async function update(file, fallback, change) {
  let lastError;
  for (let tries = 0; tries < 8; tries++) {
    if (tries) await new Promise((r) => setTimeout(r, 40 + Math.random() * 120 * tries));
    try {
      const { data, etag } = await readJson(file, fallback);
      const next = change(data);
      await writeJson(file, next, etag);
      return next;
    } catch (e) { lastError = e; }
  }
  throw lastError;
}

export const json = (data, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': cache } });
