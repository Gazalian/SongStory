import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import Loading from './components/Loading';
import SongView from './components/SongView';
import ArtistView from './components/ArtistView';
import AlbumView from './components/AlbumView';
import IntroView from './components/IntroView';
import { searchMusic, getSongStory, getArtistStory, getAlbumStory } from './services/geminiService';
import { SearchResult, SongData, AlbumData, ArtistData, ViewState, EntityType } from './types';
import { Search, Sparkles, X, ChevronRight } from 'lucide-react';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [query, setQuery] = useState('');
  const [viewState, setViewState] = useState<ViewState>('search');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentData, setCurrentData] = useState<SongData | ArtistData | AlbumData | null>(null);
  const [loadingGenre, setLoadingGenre] = useState<string>('pop');
  const [error, setError] = useState<string | null>(null);

  // Derived state for passing to Layout
  const currentGenre = currentData && 'genre' in currentData ? currentData.genre : loadingGenre;
  const currentThemeColor = currentData && 'themeColor' in currentData ? currentData.themeColor : undefined;

  const handleEnterApp = () => {
    setShowIntro(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setViewState('loading');
    setLoadingGenre('pop'); // Default
    setError(null);

    try {
      const results = await searchMusic(query);
      setSearchResults(results);
      setViewState('search'); // Stay on search but show results
    } catch (err) {
      setError("Couldn't find that. Try another tune?");
      setViewState('search');
    }
  };

  const handleSelectResult = async (result: SearchResult) => {
    setViewState('loading');
    // Try to guess genre for loading screen based on subtitle or simple heuristic if possible, otherwise default
    setLoadingGenre(result.type === EntityType.Song ? 'pop' : 'rock'); 
    
    try {
      let data;
      if (result.type === EntityType.Song) {
        data = await getSongStory(result.title, result.subtitle);
      } else if (result.type === EntityType.Artist) {
        data = await getArtistStory(result.title);
      } else if (result.type === EntityType.Album) {
        data = await getAlbumStory(result.title, result.subtitle);
      }

      if (data) {
        setCurrentData(data);
        setViewState(result.type as ViewState);
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      setError("Trouble connecting to the archives. Please try again.");
      setViewState('search');
    }
  };

  const resetSearch = () => {
    setQuery('');
    setSearchResults([]);
    setViewState('search');
    setCurrentData(null);
  };

  const renderContent = () => {
    if (viewState === 'loading') {
      return <Loading genre={loadingGenre} />;
    }

    if (viewState === 'song' && currentData) {
      return <SongView data={currentData as SongData} onBack={() => setViewState('search')} />;
    }

    if (viewState === 'artist' && currentData) {
      return <ArtistView data={currentData as ArtistData} onBack={() => setViewState('search')} />;
    }

    if (viewState === 'album' && currentData) {
      return <AlbumView data={currentData as AlbumData} onBack={() => setViewState('search')} />;
    }

    // Default: Search View
    return (
      <div className="flex flex-col min-h-screen px-6 pt-12 pb-6">
        {/* Header */}
        <div className="mb-8">
           <h1 className="font-display text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
             SongStory <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
           </h1>
           <p className="text-white/60 font-serif italic text-lg">Discover the soul behind the sound.</p>
        </div>

        {/* Search Input */}
        <div className="sticky top-6 z-30 mb-8">
           <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search song, artist, or album..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20} />
              {query && (
                <button type="button" onClick={resetSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                  <X size={18} />
                </button>
              )}
           </form>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 ml-2">Results</h2>
             {searchResults.map((result) => (
               <div 
                  key={result.id} 
                  onClick={() => handleSelectResult(result)}
                  className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 active:scale-98 transition-all group"
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                       result.type === EntityType.Artist ? 'bg-purple-500/20' : 
                       result.type === EntityType.Album ? 'bg-blue-500/20' : 'bg-green-500/20'
                     }`}>
                        {result.type === EntityType.Song && <span className="text-green-300">♪</span>}
                        {result.type === EntityType.Artist && <span className="text-purple-300">A</span>}
                        {result.type === EntityType.Album && <span className="text-blue-300">◎</span>}
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-white leading-tight">{result.title}</h3>
                        <p className="text-sm text-white/60">
                          {result.type === EntityType.Song && result.context ? <span className="text-yellow-300 mr-2 font-xs uppercase tracking-tighter border border-yellow-300/30 px-1 rounded">{result.context}</span> : null}
                          {result.subtitle} • <span className="capitalize">{result.type}</span>
                        </p>
                     </div>
                  </div>
                  <ChevronRight className="text-white/20 group-hover:text-white transition-colors" />
               </div>
             ))}
          </div>
        )}

        {/* Empty State / Suggestions */}
        {searchResults.length === 0 && !error && (
          <div className="flex-1 flex flex-col justify-center items-center text-center opacity-60">
             <Sparkles className="w-12 h-12 text-white/20 mb-4" />
             <p className="text-sm text-white/40 max-w-[200px]">Try searching "Bohemian Rhapsody", "Frank Ocean", or "Thriller"</p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-center text-white/80 text-sm">
            {error}
          </div>
        )}

      </div>
    );
  };

  if (showIntro) {
    return <IntroView onEnter={handleEnterApp} />;
  }

  return (
    <Layout themeColor={currentThemeColor} genre={currentGenre}>
       {renderContent()}
    </Layout>
  );
};

export default App;