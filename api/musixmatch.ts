// Vercel serverless function — proxies Musixmatch API requests server-side
// so the browser never calls api.musixmatch.com directly (CORS restriction).
//
// Incoming URL:  /api/musixmatch/<endpoint>?<params>
// Outgoing URL:  https://api.musixmatch.com/ws/1.1/<endpoint>?<params>
//
// The VITE_MUSIXMATCH_API_KEY env var must be set in Vercel project settings.

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req;
  if (!url) {
    res.status(400).json({ error: 'Missing URL' });
    return;
  }

  // Strip the leading /api/musixmatch prefix
  const path = url.replace(/^\/api\/musixmatch/, '');
  const upstream = `https://api.musixmatch.com/ws/1.1${path}`;

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (err: any) {
    res.status(502).json({ error: 'Upstream fetch failed', detail: err?.message });
  }
}
