// Tells the site whether this visitor is in the UK or the EU/EEA, where analytics cookies need a yes first.
// Vercel adds the visitor's country to every request; nothing about the visitor is stored.
const REGULATED = new Set([
  'GB', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
  'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
]);

export async function GET(request) {
  const country = request.headers.get('x-vercel-ip-country') || '';
  return Response.json({ regulated: REGULATED.has(country) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
