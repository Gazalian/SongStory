// Lyrics fetching service.
// Priority: Musixmatch (if VITE_MUSIXMATCH_API_KEY is set) → lyrics.ovh (free, no key, CORS-friendly)
//
// Musixmatch requires a CORS proxy because browsers cannot call api.musixmatch.com directly:
//   - Dev:        Vite proxy at /api/musixmatch (see vite.config.ts)
//   - Production: Vercel serverless function at api/musixmatch.ts
//
// lyrics.ovh works from the browser without any proxy and returns full lyrics.

interface LyricsOvhResponse {
  lyrics?: string;
  error?: string;
}

async function fetchFromLyricsOvh(title: string, artist: string): Promise<string | null> {
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data: LyricsOvhResponse = await res.json();
    return data.lyrics?.trim() || null;
  } catch {
    return null;
  }
}

async function fetchFromMusixmatch(title: string, artist: string, apiKey: string): Promise<string | null> {
  try {
    // Search for the track
    const searchUrl =
      `/api/musixmatch/track.search` +
      `?q_track=${encodeURIComponent(title)}` +
      `&q_artist=${encodeURIComponent(artist)}` +
      `&f_has_lyrics=1` +
      `&s_track_rating=desc` +
      `&apikey=${apiKey}`;

    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const trackList = searchData?.message?.body?.track_list;
    if (!Array.isArray(trackList) || trackList.length === 0) return null;

    const trackId: number = trackList[0].track.track_id;

    // Fetch lyrics for that track
    const lyricsUrl =
      `/api/musixmatch/track.lyrics.get` +
      `?track_id=${trackId}` +
      `&apikey=${apiKey}`;

    const lyricsRes = await fetch(lyricsUrl, { signal: AbortSignal.timeout(10000) });
    if (!lyricsRes.ok) return null;

    const lyricsData = await lyricsRes.json();
    const body: string | undefined = lyricsData?.message?.body?.lyrics?.lyrics_body;
    if (!body?.trim()) return null;

    // Musixmatch free tier appends a "******* This Lyrics is NOT for Commercial use *******" footer
    const cleaned = body.replace(/\*{3,}.*$/s, '').trim();
    return cleaned || null;
  } catch {
    return null;
  }
}

/**
 * Fetch song lyrics.
 * Returns the full lyrics string or null if unavailable from all sources.
 */
export async function fetchLyrics(title: string, artist: string): Promise<string | null> {
  const musixmatchKey = import.meta.env.VITE_MUSIXMATCH_API_KEY as string | undefined;

  if (musixmatchKey) {
    const lyrics = await fetchFromMusixmatch(title, artist, musixmatchKey);
    if (lyrics) return lyrics;
  }

  return fetchFromLyricsOvh(title, artist);
}
