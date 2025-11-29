import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EntityType, SearchResult, SongData, AlbumData, ArtistData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// --- Schemas ---

const searchSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['song', 'album', 'artist'] },
      title: { type: Type.STRING },
      subtitle: { type: Type.STRING },
      context: { type: Type.STRING },
    },
    required: ['id', 'type', 'title', 'subtitle'],
  },
};

const songSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    artist: { type: Type.STRING },
    year: { type: Type.STRING },
    genre: { type: Type.STRING },
    themeColor: { type: Type.STRING, description: "A hex color code matching the song's vibe" },
    quickFacts: {
      type: Type.OBJECT,
      properties: {
        writers: { type: Type.STRING },
        producers: { type: Type.STRING },
        length: { type: Type.STRING },
        album: { type: Type.STRING },
        chartPeak: { type: Type.STRING },
      },
    },
    hook: { type: Type.STRING },
    backstory: { type: Type.STRING },
    lyricsMoments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { line: { type: Type.STRING }, explanation: { type: Type.STRING } }
      }
    },
    recordingNotes: { type: Type.STRING },
    versions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { artist: { type: Type.STRING }, year: { type: Type.STRING }, note: { type: Type.STRING } }
      }
    },
    culturalImpact: { type: Type.STRING },
    quotes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { text: { type: Type.STRING }, source: { type: Type.STRING } }
      }
    },
    fanStories: { type: Type.ARRAY, items: { type: Type.STRING } },
    mood: { type: Type.STRING },
  },
};

const artistSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    yearsActive: { type: Type.STRING },
    genre: { type: Type.STRING },
    themeColor: { type: Type.STRING },
    essence: { type: Type.STRING },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { year: { type: Type.STRING }, event: { type: Type.STRING } }
      }
    },
    musicalDNA: { type: Type.STRING },
    stageNameOrigin: { type: Type.STRING },
    collaborations: { type: Type.STRING },
    controversies: { type: Type.STRING },
    discographyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
    visualStyle: { type: Type.STRING },
    trivia: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

const albumSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    artist: { type: Type.STRING },
    year: { type: Type.STRING },
    genre: { type: Type.STRING },
    themeColor: { type: Type.STRING },
    snapshot: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        producer: { type: Type.STRING },
        coreThemes: { type: Type.STRING },
      }
    },
    artistIntent: { type: Type.STRING },
    trackBlurbs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { track: { type: Type.STRING }, blurb: { type: Type.STRING } }
      }
    },
    coverArtStory: { type: Type.STRING },
    productionTimeline: { type: Type.STRING },
    reception: {
      type: Type.OBJECT,
      properties: { then: { type: Type.STRING }, now: { type: Type.STRING } }
    },
    legacy: { type: Type.STRING },
  },
};


// --- Service Functions ---

export const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for "${query}" in music. Identify if it is a song, artist, or album. 
      If it is a song with multiple famous versions (e.g. Hallelujah, All Along the Watchtower), return the top 3-4 distinct versions as separate entries.
      Return a clean JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: searchSchema,
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SearchResult[];
  } catch (error) {
    console.error("Search error", error);
    return [];
  }
};

export const getSongStory = async (title: string, artist: string): Promise<SongData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write a "SongStory" for the song "${title}" by "${artist}". 
      Focus on emotional storytelling, deep context, and interesting trivia. 
      Do not make things up, but use a narrative tone.
      For the themeColor, provide a hex code that matches the mood of the song cover art or vibe.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: songSchema,
      },
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as SongData;
  } catch (error) {
    console.error("Song detail error", error);
    return null;
  }
};

export const getArtistStory = async (name: string): Promise<ArtistData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write a "SongStory" profile for the artist "${name}".
      Focus on their musical DNA, visual style, and legacy.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: artistSchema,
      },
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ArtistData;
  } catch (error) {
    console.error("Artist detail error", error);
    return null;
  }
};

export const getAlbumStory = async (title: string, artist: string): Promise<AlbumData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write a "SongStory" profile for the album "${title}" by "${artist}".
      Analyze the tracklist, the era, and the cover art.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: albumSchema,
      },
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AlbumData;
  } catch (error) {
    console.error("Album detail error", error);
    return null;
  }
};
