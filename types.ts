export enum EntityType {
  Song = 'song',
  Album = 'album',
  Artist = 'artist',
}

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string; // Artist name or Year
  context?: string; // e.g., "Original Version", "Cover by..."
  imageUrl?: string;
}

export interface SongData {
  title: string;
  artist: string;
  year: string;
  genre: string;
  themeColor: string; // Hex code suggestion
  quickFacts: {
    writers: string;
    producers: string;
    length: string;
    album: string;
    chartPeak: string;
  };
  hook: string;
  backstory: string;
  lyricsMoments: Array<{ line: string; explanation: string }>;
  recordingNotes: string;
  versions: Array<{ artist: string; year: string; note: string }>;
  culturalImpact: string;
  quotes: Array<{ text: string; source: string }>;
  fanStories: Array<string>;
  mood: string;
}

export interface AlbumData {
  title: string;
  artist: string;
  year: string;
  genre: string;
  themeColor: string;
  snapshot: {
    label: string;
    producer: string;
    coreThemes: string;
  };
  artistIntent: string;
  trackBlurbs: Array<{ track: string; blurb: string }>;
  coverArtStory: string;
  productionTimeline: string;
  reception: {
    then: string;
    now: string;
  };
  legacy: string;
}

export interface ArtistData {
  name: string;
  yearsActive: string;
  genre: string;
  themeColor: string;
  essence: string; // One sentence bio
  milestones: Array<{ year: string; event: string }>;
  musicalDNA: string;
  stageNameOrigin: string;
  collaborations: string;
  controversies: string;
  discographyHighlights: Array<string>;
  visualStyle: string;
  trivia: Array<string>;
}

export type ViewState = 'search' | 'loading' | 'song' | 'album' | 'artist';
