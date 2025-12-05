// src/services/geminiService.ts
import {
  GoogleGenerativeAI,
  GenerativeModel,
} from "@google/generative-ai";
import { SearchResult, SongData, AlbumData, ArtistData, LyricsSegment, Source, EntityType } from "../types";
import { imageService } from "./imageService";

export type GeminiModel =
  | "gemini-1.5-flash"
  | "gemini-1.5-pro"
  | "gemini-1.5-pro-exp"
  | "gemini-2.0-flash-lite-preview"
  | string;

export interface GeminiConfig {
  apiKey: string;
  defaultModel?: GeminiModel;
}

export interface GeminiImage {
  mimeType: string;
  base64Data: string;
}

export class GeminiService {
  private client: GoogleGenerativeAI;
  private defaultModel: GeminiModel;
  private chatSessions = new Map<string, ReturnType<GenerativeModel["startChat"]>>();
  private systemInstruction: string;

  // Model fallback options
  private static readonly MODEL_OPTIONS: GeminiModel[] = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.5-flash',
    'gemini-2.0-pro-exp-02-05',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  private currentModel: GeminiModel;

  constructor(config: GeminiConfig) {
    if (!config.apiKey) {
      console.error("CRITICAL: Gemini API key is missing");
      throw new Error("Gemini API key is missing");
    }

    // DEBUG: Print first few chars of key to verify it's loaded
    console.log("Gemini Service Initialized");
    if (config.apiKey.length > 8) {
      console.log(`API Key loaded: ${config.apiKey.substring(0, 4)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
    } else {
      console.log("API Key loaded (too short to mask safely)");
    }

    if (!config.apiKey.startsWith('AIza')) {
      console.warn("WARNING: API Key does not start with 'AIza'. It might be invalid.");
    }

    // DEBUG: List available models
    this.logAvailableModels(config.apiKey);

    this.client = new GoogleGenerativeAI(config.apiKey);
    this.defaultModel = config.defaultModel || "gemini-2.0-flash";
    this.currentModel = this.defaultModel;

    // System instruction for all music-related queries
    this.systemInstruction = `You are SongStory, a world-class music historian specializing in Global and Nigerian Music.

CRITICAL RULES:
1. **IMAGE SUGGESTIONS**: For any artist/song/album, suggest realistic cover art URLs from:
   - Spotify: i.scdn.co/...
   - Apple Music: mzstatic.com/...
   - Wikipedia: upload.wikimedia.org/...
   - Genius: images.genius.com/...
   - Amazon: m.media-amazon.com/...

2. **THEME COLOR**: For each image, suggest a vibrant hex color that matches the mood.

3. **STRICT JSON**: Always output valid JSON only. No markdown, no extra text.

4. **NO CITATIONS**: Remove all citation marks like [1], [2], etc. from the text.

5. **NIGERIAN FOCUS**: When searching for Nigerian artists (Asake, Wizkid, Burna Boy, Davido, etc.), prioritize accurate local information.`;
  }

  /**
   * Returns a generative model instance with optional system instruction
   */
  private getModel(model?: GeminiModel, systemInstruction?: string): GenerativeModel {
    const params: any = {
      model: model || this.currentModel,
      ...(systemInstruction ? { systemInstruction } : { systemInstruction: this.systemInstruction }),
    };

    return this.client.getGenerativeModel(params);
  }

  /**
   * Try different models if one fails
   */
  private async tryWithModels(prompt: string, customSystemInstruction?: string): Promise<string> {
    for (const modelName of GeminiService.MODEL_OPTIONS) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = this.client.getGenerativeModel({
          model: modelName,
          systemInstruction: customSystemInstruction || this.systemInstruction
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
          console.log(`Success with model: ${modelName}`);
          this.currentModel = modelName;
          return text;
        }
      } catch (error: any) {
        console.error(`Model ${modelName} failed. RAW ERROR:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        continue;
      }
    }
    throw new Error("All models failed");
  }

  /**
   * Clean and parse JSON from Gemini response
   */
  private cleanAndParseJSON<T>(text: string): T | null {
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
  }

  /**
   * Extract sources from response (placeholder - Gemini doesn't have built-in web search)
   */
  private extractSources(response: any): Source[] {
    const sources: Source[] = [];
    // Note: Gemini doesn't have built-in web search citations
    return sources;
  }

  /**
   * Helper function for default images
   */
  private getDefaultImage(type: string | EntityType): string {
    const typeStr = type as string;
    switch (typeStr) {
      case 'song':
      case EntityType.Song:
        return 'https://i.scdn.co/image/ab67616d0000b2732a6d3c6f7c5d8b5d7a3e4f2a';
      case 'album':
      case EntityType.Album:
        return 'https://i.scdn.co/image/ab67616d00001e022a6d3c6f7c5d8b5d7a3e4f2a';
      case 'artist':
      case EntityType.Artist:
        return 'https://i.scdn.co/image/ab6761610000e5eb2a6d3c6f7c5d8b5d7a3e4f2a';
      default:
        return 'https://i.scdn.co/image/ab67616d0000b2732a6d3c6f7c5d8b5d7a3e4f2a';
    }
  }

  /**
   * Helper function for default colors
   */
  private getDefaultColor(type: string | EntityType): string {
    const typeStr = type as string;
    switch (typeStr) {
      case 'song':
      case EntityType.Song:
        return '#1DB954'; // Spotify green
      case 'album':
      case EntityType.Album:
        return '#FF6B6B'; // Vibrant red
      case 'artist':
      case EntityType.Artist:
        return '#4ECDC4'; // Teal
      default:
        return '#1DB954';
    }
  }

  /**
   * Generate text response using a single prompt
   */
  async generateText({
    prompt,
    model,
    systemInstruction,
  }: {
    prompt: string;
    model?: GeminiModel;
    systemInstruction?: string;
  }): Promise<string> {
    try {
      const genModel = this.getModel(model, systemInstruction);
      const result = await genModel.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      throw new Error(`Gemini text generation failed → ${err.message}`);
    }
  }

  /**
   * Generate content with text + image(s)
   */
  async generateWithImages({
    prompt,
    images,
    model,
    systemInstruction,
  }: {
    prompt: string;
    images: GeminiImage[];
    model?: GeminiModel;
    systemInstruction?: string;
  }): Promise<string> {
    try {
      const genModel = this.getModel(model, systemInstruction);

      const parts = [
        { text: prompt },
        ...images.map((img) => ({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64Data,
          },
        })),
      ];

      const result = await genModel.generateContent(parts);
      return result.response.text();
    } catch (err: any) {
      throw new Error(`Gemini image+text generation failed → ${err.message}`);
    }
  }

  /**
   * Start or continue a chat session
   */
  async sendChatMessage({
    sessionId,
    message,
    model,
    systemInstruction,
  }: {
    sessionId: string;
    message: string;
    model?: GeminiModel;
    systemInstruction?: string;
  }): Promise<string> {
    try {
      let chat = this.chatSessions.get(sessionId);

      if (!chat) {
        const genModel = this.getModel(model, systemInstruction);

        chat = genModel.startChat({
          history: [],
        });

        this.chatSessions.set(sessionId, chat);
      }

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (err: any) {
      throw new Error(`Gemini chat message failed → ${err.message}`);
    }
  }

  /**
   * Search for music content
   */
  async searchMusic(query: string): Promise<SearchResult[]> {
    try {
      const prompt = `Search for music content related to: "${query}"
    
    Return a JSON array of search results. Each result should be an object with:
    - id: unique identifier (use format: type-randomnumber)
    - type: "song", "album", or "artist" (use lowercase exactly)
    - title: main title
    - subtitle: artist name (for songs/albums) or description (for artists)
    - context: optional context like "Original Version", "Cover by..."
    - imageUrl: suggested cover art/photo URL
    - themeColor: hex color code based on the image
    
    Prioritize Nigerian music when relevant. Provide 3-5 results.`;

      const text = await this.tryWithModels(prompt);

      if (!text) return [];

      const results = this.cleanAndParseJSON<SearchResult[]>(text) || [];

      console.log(`Parsed ${results.length} results using model: ${this.currentModel}`);

      // Enhance results with real images
      const enhancedResults = await Promise.all(results.map(async (result, index) => {
        let realImageUrl: string | null = null;

        try {
          if (result.type === EntityType.Artist) {
            realImageUrl = await imageService.getArtistImage(result.title);
          } else if (result.type === EntityType.Album) {
            realImageUrl = await imageService.getAlbumImage(result.title, result.subtitle || '');
          } else {
            realImageUrl = await imageService.getSongImage(result.title, result.subtitle || '');
          }
        } catch (e) {
          console.warn("Image fetch failed", e);
        }

        return {
          ...result,
          id: result.id || `${result.type || EntityType.Song}-${index}-${Date.now()}`,
          type: result.type || EntityType.Song,
          title: result.title || 'Unknown',
          subtitle: result.subtitle || '',
          context: result.context || undefined,
          imageUrl: realImageUrl || result.imageUrl || this.getDefaultImage(result.type || EntityType.Song),
          themeColor: result.themeColor || this.getDefaultColor(result.type || EntityType.Song)
        };
      }));

      return enhancedResults;
    } catch (error: any) {
      console.error("All models failed:", error.message);

      // Check for specific errors
      if (error.message?.includes('404')) {
        console.error("MODEL NOT FOUND. Check available models:");
        console.error("1. gemini-1.5-flash");
        console.error("2. gemini-1.0-pro");
        console.error("3. gemini-pro");
      }

      if (error.message?.includes('429')) {
        console.error("QUOTA EXCEEDED");
        console.error("Free tier has very low limits. Solutions:");
        console.error("1. Wait 1 hour for quota reset");
        console.error("2. Enable billing: https://console.cloud.google.com");
      }

      if (error.message?.includes('403')) {
        console.error("API KEY ISSUE");
        console.error("1. Check .env file has correct VITE_GEMINI_API_KEY");
        console.error("2. Enable Gemini API: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com");
      }

      return [];
    }
  }

  /**
   * Get comprehensive song analysis
   */
  async getSongStory(title: string, artist: string): Promise<SongData | null> {
    try {
      const prompt = `Generate a comprehensive song analysis for "${title}" by "${artist}".

    Return a JSON object with this exact structure:
    {
      "title": "${title}",
      "artist": "${artist}",
      "year": "release year",
      "genre": "primary genre",
      "themeColor": "hex color",
      "imageUrl": "suggested cover art URL",
      "quickFacts": {
        "releaseDate": "exact date",
        "writers": "songwriters",
        "producers": "producers",
        "length": "duration",
        "album": "album name",
        "label": "record label"
      },
      "hook": "one standout fact or achievement",
      "backstory": "detailed background story",
      "meaningAndThemes": "thematic analysis",
      "lyricsMoments": [
        {"line": "memorable lyric line", "explanation": "its meaning"},
        {"line": "memorable lyric line", "explanation": "its meaning"},
        {"line": "memorable lyric line", "explanation": "its meaning"}
      ],
      "recordingNotes": "production details",
      "artistCommentary": "what the artist has said about it",
      "culturalImpact": "influence and legacy",
      "versions": [
        {"artist": "artist name", "year": "year", "type": "cover/remix/live"}
      ],
      "trivia": ["interesting fact 1", "interesting fact 2"],
      "relatedSongs": [
        {"title": "related song", "artist": "artist"},
        {"title": "related song", "artist": "artist"}
      ],
      "mood": "emotional tone/vibe"
    }`;

      const text = await this.tryWithModels(prompt);

      if (!text) return null;

      const data = this.cleanAndParseJSON<SongData>(text);
      if (data) {
        // Fetch real image
        const realImage = await imageService.getSongImage(title, artist);
        if (realImage) data.imageUrl = realImage;

        // Add missing required fields
        data.sources = this.extractSources({});
        // Ensure imageUrl and themeColor are set
        if (!data.imageUrl) data.imageUrl = this.getDefaultImage('song');
        if (!data.themeColor) data.themeColor = this.getDefaultColor('song');
        // Initialize optional arrays if not provided
        if (!data.lyricsMoments) data.lyricsMoments = [];
        if (!data.versions) data.versions = [];
        if (!data.trivia) data.trivia = [];
        if (!data.relatedSongs) data.relatedSongs = [];
        // Ensure quickFacts exists
        if (!data.quickFacts) data.quickFacts = {
          releaseDate: '',
          writers: '',
          producers: '',
          length: '',
          album: '',
          label: ''
        };
      }
      return data;
    } catch (error) {
      console.error("Get Song Story error", error);
      return null;
    }
  }

  /**
   * Get comprehensive album analysis
   */
  async getAlbumStory(title: string, artist: string): Promise<AlbumData | null> {
    try {
      const prompt = `Generate a comprehensive album analysis for "${title}" by "${artist}".

    Return a JSON object with this exact structure:
    {
      "title": "${title}",
      "artist": "${artist}",
      "year": "release year",
      "genre": "primary genre",
      "themeColor": "hex color",
      "imageUrl": "suggested album cover URL",
      "snapshot": {
        "releaseDate": "exact date",
        "label": "record label",
        "producer": "main producer",
        "length": "total duration"
      },
      "artistIntent": "artist's vision for the album",
      "tracklist": [
        {"track": "track 1 title", "description": "brief description"},
        {"track": "track 2 title", "description": "brief description"}
      ],
      "coverArtStory": "meaning behind the cover art",
      "recordingTimeline": "recording process and timeline",
      "themesAndConcepts": "overarching themes",
      "reception": {
        "then": "initial critical reception",
        "now": "current critical standing"
      },
      "tourEra": "associated tours and performances",
      "collaborators": "key collaborators",
      "culturalImpact": "influence and legacy",
      "hiddenDetails": "interesting behind-the-scenes facts"
    }`;

      const text = await this.tryWithModels(prompt);

      if (!text) return null;

      const data = this.cleanAndParseJSON<AlbumData>(text);
      if (data) {
        // Fetch real image
        const realImage = await imageService.getAlbumImage(title, artist);
        if (realImage) data.imageUrl = realImage;

        data.sources = this.extractSources({});
        if (!data.imageUrl) data.imageUrl = this.getDefaultImage('album');
        if (!data.themeColor) data.themeColor = this.getDefaultColor('album');
        if (!data.tracklist) data.tracklist = [];
        if (!data.snapshot) data.snapshot = {
          releaseDate: '',
          label: '',
          producer: '',
          length: ''
        };
      }
      return data;
    } catch (error) {
      console.error("Get Album Story error", error);
      return null;
    }
  }

  /**
   * Get comprehensive artist biography
   */
  async getArtistStory(name: string): Promise<ArtistData | null> {
    try {
      const prompt = `Generate a comprehensive artist biography for "${name}".

    Return a JSON object with this exact structure:
    {
      "name": "${name}",
      "yearsActive": "years active",
      "origin": "hometown/country",
      "genre": "primary genre",
      "themeColor": "hex color",
      "imageUrl": "suggested artist photo URL",
      "bio": "one-sentence biography",
      "earlyLife": "early life and background",
      "careerJourney": [
        {"era": "era name (e.g., Early Years)", "description": "description"},
        {"era": "era name (e.g., Breakthrough)", "description": "description"}
      ],
      "musicalStyle": "description of musical style",
      "discographyHighlights": [
        {"title": "album/song title", "year": "year", "type": "album/song"},
        {"title": "album/song title", "year": "year", "type": "album/song"}
      ],
      "awards": "major awards and achievements",
      "collaborations": "notable collaborations",
      "liveMoments": "memorable live performances",
      "quotes": ["famous quote 1", "famous quote 2"],
      "trivia": ["interesting fact 1", "interesting fact 2"],
      "socials": {
        "instagram": "handle or URL",
        "twitter": "handle or URL",
        "youtube": "channel URL",
        "tiktok": "handle or URL",
        "website": "official website"
      },
      "visualStyle": "description of visual aesthetic"
    }`;

      const text = await this.tryWithModels(prompt);

      if (!text) return null;

      const data = this.cleanAndParseJSON<ArtistData>(text);
      if (data) {
        // Fetch real image
        const realImage = await imageService.getArtistImage(name);
        if (realImage) data.imageUrl = realImage;

        data.sources = this.extractSources({});
        if (!data.imageUrl) data.imageUrl = this.getDefaultImage('artist');
        if (!data.themeColor) data.themeColor = this.getDefaultColor('artist');
        if (!data.careerJourney) data.careerJourney = [];
        if (!data.discographyHighlights) data.discographyHighlights = [];
        if (!data.quotes) data.quotes = [];
        if (!data.trivia) data.trivia = [];
        if (!data.relatedArtists) data.relatedArtists = [];
        if (!data.socials) data.socials = {};
      }
      return data;
    } catch (error) {
      console.error("Get Artist Story error", error);
      return null;
    }
  }

  /**
   * Get lyrics analysis (this is the one was missing the export!)
   */
  async getLyricsAnalysis(title: string, artist: string): Promise<LyricsSegment[]> {
    try {
      const prompt = `Analyze the lyrics of "${title}" by "${artist}" section by section.

    Return a STRICT JSON ARRAY (not an object) where each item is:
    {
      "section": "section name (e.g., Verse 1, Chorus, Bridge)",
      "text": "the actual lyrics for this section",
      "analysis": "detailed interpretation and meaning"
    }

    Include all major sections of the song. Do not wrap the array in any object.`;

      const text = await this.tryWithModels(prompt);

      if (!text) return [];

      console.error("DEBUG: Raw Lyrics Response:", text); // Using error to ensure visibility

      const raw = this.cleanAndParseJSON<any>(text);
      console.error("DEBUG: Parsed Lyrics Object:", raw);

      if (Array.isArray(raw)) {
        console.error("DEBUG: Returning array directly");
        return raw;
      }

      // Handle case where model wraps array in an object (e.g. { "lyrics": [...] })
      if (raw && typeof raw === 'object') {
        const values = Object.values(raw);
        const array = values.find(v => Array.isArray(v));
        if (array) {
          console.error("DEBUG: Found array in object wrapper");
          return array as LyricsSegment[];
        }
      }

      console.error("DEBUG: No array found in response");
      return [];
    } catch (error) {
      console.error("Get Lyrics Analysis error", error);
      return [];
    }
  }

  /**
   * Get current model for debugging
   */
  getCurrentModel(): string {
    return this.currentModel;
  }

  /**
   * Debug: List available models for this API key
   */
  private async logAvailableModels(apiKey: string) {
    try {
      console.log("Fetching available models...");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();

      if (data.models) {
        console.log("=== AVAILABLE MODELS ===");
        data.models.forEach((m: any) => {
          if (m.name.includes('gemini')) {
            console.log(`- ${m.name.replace('models/', '')} (${m.version})`);
          }
        });
        console.log("========================");
      } else {
        console.error("Failed to list models. Response:", data);
        if (data.error) {
          console.error("API Error Details:", JSON.stringify(data.error, null, 2));
        }
      }
    } catch (e) {
      console.error("Error listing models:", e);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// CREATE SINGLETON INSTANCE & EXPORT THE FUNCTION SongView expects
// ──────────────────────────────────────────────────────────────

const geminiService = new GeminiService({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
  defaultModel: "gemini-2.0-flash",
});

// This is the named export that fixes your error
export const getLyricsAnalysis = async (
  title: string,
  artist: string
): Promise<LyricsSegment[]> => {
  return await geminiService.getLyricsAnalysis(title, artist);
};

export const searchMusic = async (query: string): Promise<SearchResult[]> => {
  return await geminiService.searchMusic(query);
};

export const getSongStory = async (
  title: string,
  artist: string
): Promise<SongData | null> => {
  return await geminiService.getSongStory(title, artist);
};

export const getArtistStory = async (
  name: string
): Promise<ArtistData | null> => {
  return await geminiService.getArtistStory(name);
};

export const getAlbumStory = async (
  title: string,
  artist: string
): Promise<AlbumData | null> => {
  return await geminiService.getAlbumStory(title, artist);
};

export default geminiService;