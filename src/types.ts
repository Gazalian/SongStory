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
  themeColor?: string;
}

export interface LyricsSegment {
  section: string; // e.g. "Verse 1", "Chorus"
  text: string;    // The lyrics text for this section
  analysis: string; // Detailed interpretation
}

export interface Source {
  title: string;
  url: string;
}

export interface SongData {
  title: string;
  artist: string;
  year: string;
  genre: string;
  themeColor?: string;
  imageUrl?: string;
  quickFacts?: {
    releaseDate: string;
    writers: string;
    producers: string;
    length: string;
    album: string;
    label: string;
  };
  hook: string;
  backstory: string;
  meaningAndThemes: string;
  lyricsMoments?: Array<{ line: string; explanation: string }>;
  recordingNotes: string;
  artistCommentary: string;
  culturalImpact: string;
  versions?: Array<{ artist: string; year: string; type: string }>;
  trivia?: Array<string>;
  relatedSongs?: Array<{ title: string; artist: string }>;
  mood: string;
  fullLyricsBreakdown?: Array<LyricsSegment>;
  sources?: Source[];
}

export interface AlbumData {
  title: string;
  artist: string;
  year: string;
  genre: string;
  themeColor?: string;
  imageUrl?: string;
  snapshot?: {
    releaseDate: string;
    label: string;
    producer: string;
    length: string;
  };
  artistIntent: string;
  tracklist?: Array<{ track: string; description: string }>;
  coverArtStory: string;
  recordingTimeline: string;
  themesAndConcepts: string;
  reception?: {
    then: string;
    now: string;
  };
  tourEra: string;
  collaborators: string;
  culturalImpact: string;
  hiddenDetails: string;
  sources?: Source[];
}

export interface ArtistData {
  name: string;
  yearsActive: string;
  origin: string;
  genre: string;
  themeColor?: string;
  imageUrl?: string;
  bio: string; // One sentence bio
  earlyLife: string;
  careerJourney?: Array<{ era: string; description: string }>;
  musicalStyle: string;
  discographyHighlights?: Array<{ title: string; year: string; type: 'album' | 'song' }>;
  awards: string;
  collaborations: string;
  liveMoments: string;
  quotes?: Array<string>;
  trivia?: Array<string>;
  relatedArtists?: Array<string>;
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };
  visualStyle: string;
  sources?: Source[];
}

export type ViewState = 'search' | 'loading' | 'song' | 'album' | 'artist';
