// src/services/imageService.ts

interface ItunesResult {
    artworkUrl100: string;
    artworkUrl60: string;
    artistName: string;
    collectionName?: string;
    trackName?: string;
}

interface ItunesResponse {
    resultCount: number;
    results: ItunesResult[];
}

/**
 * Helper to fetch from iTunes API
 */
async function searchItunes(term: string, entity: string, limit: number = 1): Promise<ItunesResult | null> {
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data: ItunesResponse = await response.json();
        if (data.resultCount > 0) {
            return data.results[0];
        }
        return null;
    } catch (error) {
        console.warn(`iTunes search failed for ${term}:`, error);
        return null;
    }
}

/**
 * Get high-res image URL from iTunes result
 * iTunes returns 100x100 by default, we can hack it to get 600x600 or larger
 */
function getHighResUrl(url: string): string {
    if (!url) return '';
    return url.replace('100x100bb.jpg', '600x600bb.jpg');
}

export const imageService = {
    /**
     * Get artist image
     * iTunes doesn't have a direct "artist" image endpoint that's reliable, 
     * so we search for their top album and use that art, or try to find a music video.
     * For better results, we'd need Spotify API (requires auth) or Last.fm.
     * We'll stick to iTunes album art as a proxy for now.
     */
    async getArtistImage(artistName: string): Promise<string | null> {
        // Search for musicArtist first (sometimes has results)
        let result = await searchItunes(artistName, 'musicArtist');

        // If no artist result or no URL (iTunes artist results often lack images), try album
        if (!result || !result.artworkUrl100) {
            result = await searchItunes(artistName, 'album');
        }

        if (result && result.artworkUrl100) {
            return getHighResUrl(result.artworkUrl100);
        }
        return null;
    },

    /**
     * Get album cover art
     */
    async getAlbumImage(albumTitle: string, artistName: string): Promise<string | null> {
        const term = `${artistName} ${albumTitle}`;
        const result = await searchItunes(term, 'album');

        if (result && result.artworkUrl100) {
            return getHighResUrl(result.artworkUrl100);
        }
        return null;
    },

    /**
     * Get song cover art (album art for the song)
     */
    async getSongImage(songTitle: string, artistName: string): Promise<string | null> {
        const term = `${artistName} ${songTitle}`;
        const result = await searchItunes(term, 'song');

        if (result && result.artworkUrl100) {
            return getHighResUrl(result.artworkUrl100);
        }
        return null;
    }
};
