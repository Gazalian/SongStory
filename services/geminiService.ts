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
        return JSON.parse(cleaned) as T;
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
You are SongStory, a world-class music historian and researcher with GLOBAL expertise.
IMPORTANT: You have specialized, deep knowledge of Nigerian Music (Afrobeats, Highlife, Fuji, Hip-Hop, Alte, Gospel) and African music history.

RULES FOR VISUALS & ACCURACY:
1. USE GOOGLE SEARCH to verify EVERY fact and EVERY image.
2. IMAGE URLS - STRICT REQUIREMENT:
   - You MUST provide a **direct image file URL** (ending in .jpg, .png, .jpeg, .webp).
   - **PRIORITY SOURCE**: Wikipedia / Wikimedia Commons (URLs usually containing 'upload.wikimedia.org').
   - **ALTERNATIVE**: Official Music CDNs (Spotify 'i.scdn.co', Apple 'mzstatic.com').
   - DO NOT return a generic webpage URL. It MUST be the actual image file.
   - If no valid image file is found, return this placeholder: 'https://placehold.co/600x600/101010/FFF?text=No+Image'
3. THEME COLOR: Extract a hex color from the album art or artist's visual brand.
4. NIGERIAN CONTEXT: When discussing Nigerian/African music, explain Pidgin slang, cultural references, and local impact accurately.
5. STRICT JSON: Your output must be a VALID JSON string. Do not include conversational text outside the JSON.
`;

// --- Service Functions ---

export const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for "${query}" in the music world.
      
      Instructions:
      1. Use Google Search to find the most relevant Song, Artist, or Album.
      2. If the user searches for a Nigerian artist/song (e.g. Asake, Wizkid, Burna Boy), prioritize them.
      3. **IMAGES**: For EACH result, find the **Wikimedia/Wikipedia image URL** (upload.wikimedia.org) or a high-quality streaming CDN URL.
      4. Return a JSON array of objects with fields: id, type (song|album|artist), title, subtitle, imageUrl, themeColor.
      `,
      config: {
        tools: [{ googleSearch: {} }], // Enable search for grounding
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
      1. **Quick Facts**: You MUST search for and fill in: 'album', 'writers', 'producers', 'length', 'releaseDate'. Do NOT use "N/A". Search specifically for credits.
      2. **Lyrics Moments**: You MUST provide an array 'lyricsMoments' with at least 3 items. Each item must have:
         - 'line': A key lyric from the song.
         - 'explanation': A deep analysis of what that line means in context.
      3. **Hook**: This MUST be a single, standout FACT, AWARD, CHART STAT, or MILESTONE. Do NOT summarize the song meaning or lyrics. Focus on: Awards won, Chart positions (e.g. 'Spent 14 weeks at #1'), Records broken, or Unique achievements.
      4. **Image**: Find the OFFICIAL cover art URL. **PRIORITY: upload.wikimedia.org** or Spotify CDN.
      
      Expected JSON Structure:
      {
        "title": "string",
        "artist": "string",
        "year": "string",
        "genre": "string",
        "imageUrl": "url_string",
        "themeColor": "hex_string",
        "quickFacts": {
          "album": "string",
          "writers": "string", 
          "producers": "string",
          "length": "string (e.g. 3:45)",
          "label": "string",
          "releaseDate": "string"
        },
        "hook": "string",
        "backstory": "string",
        "meaningAndThemes": "string",
        "lyricsMoments": [
          { "line": "string", "explanation": "string" }
        ],
        "recordingNotes": "string",
        "artistCommentary": "string",
        "culturalImpact": "string",
        "versions": [{ "artist": "string", "year": "string", "type": "string" }],
        "trivia": ["string"],
        "relatedSongs": [{ "title": "string", "artist": "string" }],
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
    console.error("Song detail error", error);
    return null;
  }
};

export const getArtistStory = async (name: string): Promise<ArtistData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a detailed ArtistStory JSON for "${name}".
      
      Requirements:
      1. Use Google Search to verify bio, career milestones, and discography.
      2. Find a high-quality, verified photo of the artist (imageUrl). **PRIORITY: upload.wikimedia.org**.
      3. Return a JSON object matching the Expected Structure below.
      4. Include official social media links in the 'socials' object if found.

      Expected JSON Structure:
      {
        "name": "string",
        "yearsActive": "string",
        "origin": "string",
        "genre": "string",
        "themeColor": "hex_string",
        "imageUrl": "url_string",
        "bio": "string",
        "earlyLife": "string",
        "careerJourney": [
          { "era": "string", "description": "string" }
        ],
        "musicalStyle": "string",
        "discographyHighlights": [
          { "title": "string", "year": "string", "type": "album or song" }
        ],
        "awards": "string",
        "collaborations": "string",
        "liveMoments": "string",
        "trivia": ["string"],
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
    console.error("Artist detail error", error);
    return null;
  }
};

export const getAlbumStory = async (title: string, artist: string): Promise<AlbumData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a detailed AlbumStory JSON for "${title}" by "${artist}".
      
      CRITICAL REQUIREMENTS:
      1. Use Google Search to verify EVERY fact.
      2. **Snapshot**: You MUST search for release date, label, producers.
      3. **Tracklist**: List the tracks with a short 1-sentence vibe description for each.
      4. **Reception**: Contrast 'then' (initial reviews) vs 'now' (legacy).
      5. **Image**: Find the OFFICIAL album cover art URL. **PRIORITY: upload.wikimedia.org** or Spotify CDN.
      
      Expected JSON Structure:
      {
        "title": "string",
        "artist": "string",
        "year": "string",
        "genre": "string",
        "themeColor": "hex_string",
        "imageUrl": "url_string",
        "snapshot": {
          "releaseDate": "string",
          "label": "string",
          "producer": "string",
          "length": "string"
        },
        "artistIntent": "string",
        "tracklist": [
          { "track": "string", "description": "string" }
        ],
        "coverArtStory": "string",
        "recordingTimeline": "string",
        "themesAndConcepts": "string",
        "reception": {
          "then": "string",
          "now": "string"
        },
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
    console.error("Album detail error", error);
    return null;
  }
};

export const getLyricsAnalysis = async (title: string, artist: string): Promise<LyricsSegment[] | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide a detailed lyrics analysis JSON for "${title}" by "${artist}".
      
      Requirements:
      1. Return a JSON array of objects with: section, text, analysis.
      2. Use search to ensure lyric accuracy.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    const text = response.text;
    if (!text) return null;
    return cleanAndParseJSON<LyricsSegment[]>(text);
  } catch (error) {
    console.error("Lyrics analysis error", error);
    return null;
  }
};