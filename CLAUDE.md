# SongStory — AI Assistant Guide

## Project Overview

SongStory is a mobile-first React + TypeScript web app that uses the Google Gemini API to generate immersive musical backstories for songs, albums, and artists. Users search for music and receive rich editorial content: recording history, lyrical analysis, cultural impact, and more.

## Environment Setup

**Prerequisites:** Node.js 18+, npm

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` in the project root (never commit this):
   ```
   VITE_GEMINI_API_KEY=AIza...
   ```
   Get a key at [Google AI Studio](https://aistudio.google.com/apikey). The key must start with `AIza`.

3. Start the dev server:
   ```bash
   npm run dev   # → http://localhost:3000 (auto-opens browser)
   ```

## Available Commands

```bash
npm run dev      # Vite dev server on port 3000 with HMR
npm run build    # TypeScript check (tsc) + Vite production build → dist/
npm run preview  # Serve the production build locally
```

No test framework or linter is configured. TypeScript (`tsc`) is the only static check.

## Directory Structure

```
SongStory/
├── index.html               # HTML shell — root div, imports /src/main.tsx
├── src/
│   ├── main.tsx             # React DOM entry point
│   ├── App.tsx              # Root component: all state, view routing, search logic
│   ├── types.ts             # All TypeScript interfaces (source of truth for data shapes)
│   ├── index.css            # Global styles + Tailwind directives
│   ├── vite-env.d.ts        # Vite env type augmentation
│   ├── components/
│   │   ├── Layout.tsx       # Animated background, particle system, theme color injection
│   │   ├── IntroView.tsx    # Welcome/splash screen
│   │   ├── SearchView.tsx   # Search bar, results list, recent searches
│   │   ├── SongView.tsx     # Tabbed song detail view with scroll-reveal
│   │   ├── AlbumView.tsx    # Album details and tracklist
│   │   ├── ArtistView.tsx   # Artist biography and discography
│   │   └── Loading.tsx      # Loading animation with genre-based visuals
│   └── services/
│       ├── geminiService.ts # Gemini API client, model fallback, JSON parsing
│       └── imageService.ts  # iTunes API wrapper for album/artist artwork
├── vite.config.ts           # Path aliases, port 3000, source maps
├── tailwind.config.cjs      # Tailwind content paths
├── tsconfig.json            # Strict TypeScript, ESNext, path aliases
├── metadata.json            # AI Studio app metadata
└── test_lyrics.js           # Manual test script (see Security Notes)
```

## Architecture

### State & View Routing

All application state lives in `App.tsx` via React hooks. There is no router library — views are rendered conditionally based on `ViewState`:

```
'search' → SearchView
'loading' → Loading
'song'   → SongView
'album'  → AlbumView
'artist' → ArtistView
```

`showIntro: boolean` gates the initial `IntroView` splash screen.

**Key state variables in App.tsx:**
- `query` — current search text
- `viewState` — active view
- `searchResults` — array of `SearchResult` from Gemini
- `currentData` — `SongData | AlbumData | ArtistData | null`
- `loadingGenre` — genre string passed to Loading for themed animations
- `recentSearches` — persisted to `localStorage`

Timeouts: 45 s for search, 60 s for detailed story fetches (implemented as `Promise.race`).

### API Integration

**Gemini service** (`src/services/geminiService.ts`):
- Singleton `GeminiService` instance exported at the bottom of the file
- Named function exports (`searchMusic`, `getSongStory`, `getAlbumStory`, `getArtistStory`, `getLyricsAnalysis`) wrap the singleton — always import these, not the class directly
- Model fallback order: `gemini-2.0-flash` → `gemini-2.0-flash-lite-preview-02-05` → `gemini-2.5-flash` → `gemini-2.0-pro-exp-02-05` → `gemini-1.5-flash` → `gemini-1.5-pro`
- `cleanAndParseJSON<T>()` strips markdown fences, finds JSON boundaries, and removes citation markers like `[1]`
- System instruction emphasizes Nigerian music accuracy (Asake, Wizkid, Burna Boy, Davido)

**iTunes image service** (`src/services/imageService.ts`):
- Fetches artwork via the public iTunes Search API (no auth required)
- Converts low-res thumbnails to 600×600 by replacing `100x100bb` with `600x600bb` in the URL
- Methods: `getArtistImage(name)`, `getAlbumImage(title, artist)`, `getSongImage(title, artist)`

### Lyrics Analysis

`getLyricsAnalysis(title, artist)` in `geminiService.ts` makes a separate API call to fetch `LyricsSegment[]` (section + text + analysis). This is called on-demand from `SongView` when the user opens the **Lyrics** tab. The `fullLyricsBreakdown` field on `SongData` is populated by this call, not by `getSongStory`.

**Known limitation:** Gemini cannot reproduce copyrighted song lyrics verbatim. The `text` field in each `LyricsSegment` will contain paraphrased or representative lines rather than exact lyrics.

## Data Models (`src/types.ts`)

All types live here — treat this as the source of truth.

| Type | Description |
|------|-------------|
| `EntityType` | Enum: `Song \| Album \| Artist` |
| `ViewState` | Union: `'search' \| 'loading' \| 'song' \| 'album' \| 'artist'` |
| `SearchResult` | id, type, title, subtitle, context?, imageUrl?, themeColor? |
| `SongData` | Full song analysis: quickFacts, backstory, lyricsMoments, fullLyricsBreakdown, etc. |
| `AlbumData` | Full album analysis: tracklist, coverArtStory, reception, etc. |
| `ArtistData` | Full artist bio: careerJourney, discographyHighlights, socials, etc. |
| `LyricsSegment` | section, text, analysis |
| `Source` | title, url |

## Key Conventions

**TypeScript:** Strict mode is on. Do not use `any` unless absolutely necessary and comment why.

**Path aliases** (configured in both `vite.config.ts` and `tsconfig.json`):
```typescript
import Foo from '@components/Foo'   // → src/components/Foo
import { bar } from '@services/bar' // → src/services/bar
import { Baz } from '@/*'           // → src/*
```

**Styling:** Tailwind CSS only — no CSS Modules, no inline `style` props except for dynamic theme colors (e.g., `style={{ background: themeColor }}`). Custom animations are declared in `tailwind.config.cjs`.

**Component structure:** Components are functional with hooks. No class components. Keep view logic in `App.tsx`; keep display logic in the component files.

**Gemini responses:** All prompts must request strict JSON output. The `cleanAndParseJSON` helper handles common failure modes (markdown fences, extra text). If adding a new prompt, follow the pattern in `geminiService.ts` and use `tryWithModels` for resilience.

**Images:** Always go through `imageService` first, fall back to Gemini-suggested URL, then to `getDefaultImage(type)`. Never hardcode image URLs in components.

## Deployment

Target platform: **Vercel**

```bash
npm run build   # outputs to dist/
```

Vercel picks up the `dist/` folder automatically. Ensure `VITE_GEMINI_API_KEY` is set as an environment variable in the Vercel project settings (not in `.env.local` — that's local only).

## Security Notes

- `test_lyrics.js` contains a **hardcoded Gemini API key** — this file must not be committed to any public repository. Consider deleting it or moving it to `.gitignore`.
- `.env.local` is correctly gitignored. Never commit API keys.
- The app calls external APIs (Gemini, iTunes) directly from the browser; the Gemini API key is exposed in the client bundle. This is acceptable for prototypes but should be proxied through a server-side function for production deployments.
