import { GoogleGenAI } from "@google/genai";
import { SearchResult, SongData, AlbumData, ArtistData, LyricsSegment, Source } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// --- Helper Functions ---

const cleanAndParseJSON = <T>(text: string): T | null => {
  try {
    // 1. Remove markdown code blocks (```json ... ```)
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '');
    
    // 2. Find the JSON object/array boundaries
    const firstOpenBrace = cleaned.indexOf('{');
    const firstOpenBracket = cleaned.indexOf('[');
    
    // Determine where the JSON likely starts (object or array)
    let start = -1;
    if (firstOpenBrace !== -1 && firstOpenBracket !== -1) {
      start = Math.min(firstOpenBrace, firstOpenBracket);
    } else {
      start = firstOpenBrace !== -1 ? firstOpenBrace : firstOpenBracket;
    }

    // Determine end based on what we found
    let end = -1;
    if (start !== -1) {
      const isArray = cleaned[start] === '[';
      end = cleaned.lastIndexOf(isArray ? ']' : '}') + 1;
    }

    if (start !== -1 && end !== 0) {
        cleaned = cleaned.substring(start, end);
        
        // Parse with a reviver function to clean citations from all strings
        return JSON.parse(cleaned, (key, value) => {
            if (typeof value === 'string') {
                // Regex to remove [1], [12], [1, 2] etc.
                return value.replace(/\[\d+(?:,\s*\d+)*\]/g, '').replace(/\s+([,.])/g, '$1').trim();
            }
            return value;
        }) as T;
    }
    
    return null;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return null;
  }
};

const extractSources = (response: any): Source[] => {
  const sources: Source[] = [];
  try {
    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].groundingMetadata?.groundingChunks) {
      candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            url: chunk.web.uri
          });
        }
      });
    }
  } catch (e) {
    console.warn("Failed to extract sources", e);
  }
  // Remove duplicates based on URL
  return Array.from(new Map(sources.map(s => [s.url, s])).values());
};

const SYSTEM_INSTRUCTION_BASE = `
You are SongStory, a world-class music historian.
IMPORTANT: You have specialized knowledge of Global and Nigerian Music.

RULES FOR VISUALS & ACCURACY:
1. **IMAGE SOURCING**: You MUST provide a **valid, direct image URL** (jpg/png/webp).
   - **PRIORITY SOURCES**: Search specifically for URLs from:
     - \`i.scdn.co\` (Spotify)
     - \`mzstatic.com\` (Apple Music)
     - \`upload.wikimedia.org\` (Wikipedia)
     - \`images.genius.com\`
     - \`m.media-amazon.com\`
   - **DO NOT** return an empty string or null for "imageUrl". SEARCH UNTIL YOU FIND ONE.
2. **THEME COLOR**: Extract a vibrant hex color from the album art (e.g., #FF5733).
3. **STRICT JSON**: Output ONLY valid JSON.
4. **CLEAN TEXT**: Do NOT include citation numbers (e.g. [1], [2]) in text.
`;

// --- Service Functions ---

export const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for "${query}" in the music world.
      
      Instructions:
      1. Use Google Search to find the most relevant Song, Artist, or Album.
      2. If the user searches for a Nigerian artist/song (e.g. Asake, Wizkid), prioritize them.
      3. **IMAGES**: For EACH result, find a valid cover art URL from Spotify/Apple/Wiki/Genius. **THIS IS MANDATORY**.
      4. Return a JSON array of objects with fields: id, type (song|album|artist), title, subtitle, imageUrl, themeColor.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    const text = response.text;
    if (!text) return [];
    return cleanAndParseJSON<SearchResult[]>(text) || [];
  } catch (error) {
    console.error("Search error", error);
    return [];
  }
};

export const getSongStory = async (title: string, artist: string): Promise<SongData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a detailed SongStory JSON for "${title}" by "${artist}".
      
      CRITICAL REQUIREMENTS:
      1. **Image**: Find the official cover art URL (Spotify/Apple/Wiki/Genius).
      2. **Quick Facts**: Search for 'album', 'writers', 'producers', 'length', 'releaseDate'.
      3. **Lyrics Moments**: Provide an array 'lyricsMoments' with at least 3 items (line + explanation).
      4. **Hook**: This MUST be a single, standout FACT, AWARD, or MILESTONE.
      
      Expected JSON Structure:
      {
        "title": "string",
        "artist": "string",
        "year": "string",
        "genre": "string",
        "imageUrl": "url_string",
        "themeColor": "hex_string",
        "quickFacts": {
          "releaseDate": "string",
          "writers": "string", 
          "producers": "string", 
          "length": "string", 
          "album": "string", 
          "label": "string"
        },
        "hook": "string",
        "backstory": "string",
        "meaningAndThemes": "string",
        "lyricsMoments": [ { "line": "string", "explanation": "string" } ],
        "recordingNotes": "string",
        "artistCommentary": "string",
        "culturalImpact": "string",
        "versions": [ { "artist": "string", "year": "string", "type": "string" } ],
        "trivia": [ "string" ],
        "relatedSongs": [ { "title": "string", "artist": "string" } ],
        "mood": "string"
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const data = cleanAndParseJSON<SongData>(text);
    if (data) {
      data.sources = extractSources(response);
    }
    return data;
  } catch (error) {
    console.error("Get Song Story error", error);
    return null;
  }
};

export const getAlbumStory = async (title: string, artist: string): Promise<AlbumData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a detailed AlbumStory JSON for "${title}" by "${artist}".
      
      CRITICAL REQUIREMENTS:
      1. **Image**: Find the official album cover URL (Spotify/Apple/Wiki).
      2. **Tracklist**: Search for the full tracklist.
      3. **Snapshot**: Fill in releaseDate, label, producer, length.
      
      Expected JSON Structure:
      {
        "title": "string",
        "artist": "string",
        "year": "string",
        "genre": "string",
        "imageUrl": "url_string",
        "themeColor": "hex_string",
        "snapshot": {
            "releaseDate": "string",
            "label": "string",
            "producer": "string",
            "length": "string"
        },
        "artistIntent": "string",
        "tracklist": [ { "track": "string", "description": "string" } ],
        "coverArtStory": "string",
        "recordingTimeline": "string",
        "themesAndConcepts": "string",
        "reception": { "then": "string", "now": "string" },
        "tourEra": "string",
        "collaborators": "string",
        "culturalImpact": "string",
        "hiddenDetails": "string"
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const data = cleanAndParseJSON<AlbumData>(text);
    if (data) {
      data.sources = extractSources(response);
    }
    return data;
  } catch (error) {
    console.error("Get Album Story error", error);
    return null;
  }
};

export const getArtistStory = async (name: string): Promise<ArtistData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a detailed ArtistStory JSON for "${name}".
      
      CRITICAL REQUIREMENTS:
      1. **Image**: Find the official artist photo URL (Spotify/Apple/Wiki).
      2. **Socials**: Search for official social media handles.
      3. **Career**: Include major eras.
      
      Expected JSON Structure:
      {
        "name": "string",
        "yearsActive": "string",
        "origin": "string",
        "genre": "string",
        "imageUrl": "url_string",
        "themeColor": "hex_string",
        "bio": "string",
        "earlyLife": "string",
        "careerJourney": [ { "era": "string", "description": "string" } ],
        "musicalStyle": "string",
        "discographyHighlights": [ { "title": "string", "year": "string", "type": "album|song" } ],
        "awards": "string",
        "collaborations": "string",
        "liveMoments": "string",
        "quotes": [ "string" ],
        "trivia": [ "string" ],
        "socials": {
          "instagram": "url",
          "twitter": "url",
          "youtube": "url",
          "tiktok": "url",
          "website": "url"
        },
        "visualStyle": "string"
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const data = cleanAndParseJSON<ArtistData>(text);
    if (data) {
      data.sources = extractSources(response);
    }
    return data;
  } catch (error) {
    console.error("Get Artist Story error", error);
    return null;
  }
};

export const getLyricsAnalysis = async (title: string, artist: string): Promise<LyricsSegment[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Perform a detailed line-by-line or section-by-section analysis of the lyrics for "${title}" by "${artist}".
      
      Return ONLY a JSON Array.
      Each item in the array should be:
      {
        "section": "Verse 1",
        "text": "The actual lyrics text...",
        "analysis": "Deep explanation of the meaning."
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const raw = cleanAndParseJSON<any>(text);
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
        const values = Object.values(raw);
        for (const val of values) {
            if (Array.isArray(val)) return val as LyricsSegment[];
        }
    }
    
    return [];
  } catch (error) {
    console.error("Get Lyrics Analysis error", error);
    return [];
  }
};
