import React, { useState } from 'react';
import { AlbumData } from '../types';
import { 
  Disc, Layers, Clock, TrendingUp, History, Mic2, FileText, 
  AlignLeft, PlayCircle, Info, Link as LinkIcon
} from 'lucide-react';

interface AlbumViewProps {
  data: AlbumData;
  onBack: () => void;
  onArtistClick: (artist: string) => void;
  onSongClick: (title: string, artist: string) => void;
}

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 0 5.373 5.373 0 12 0s12 5.373 12 12zM10.954 8.188L9.042 16.5l8.139-4.32-6.227-3.992z"/>
  </svg>
);

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'vision', label: 'Vision', icon: Mic2 },
  { id: 'tracks', label: 'Tracks', icon: ListIcon },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'reception', label: 'Reception', icon: TrendingUp },
];

function ListIcon(props: any) { return <AlignLeft {...props} />; }

const AlbumView: React.FC<AlbumViewProps> = ({ data, onBack, onArtistClick, onSongClick }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [imgError, setImgError] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(data.title + ' ' + data.artist + ' album')}`;
  const appleMusicLink = `https://music.apple.com/us/search?term=${encodeURIComponent(data.title + ' ' + data.artist + ' album')}`;

  const themeColor = data.themeColor || '#444';
  const tracklist = data.tracklist || [];
  const reception = data.reception || { then: '', now: '' };
  const sources = data.sources || [];

  return (
    <div className="pb-32 animate-in fade-in zoom-in-95 duration-500">
      
      {/* TOC Navigation */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 overflow-x-auto no-scrollbar py-3 px-4 flex gap-4">
        <button onClick={onBack} className="flex-shrink-0 p-1.5 bg-white/10 rounded-full mr-2 hover:bg-white/20 transition-colors">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeSection === section.id ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <section.icon size={12} />
            {section.label}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      <div className="pt-8 pb-12 px-6 text-center max-w-4xl mx-auto">
         <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 mb-8 shadow-2xl rounded-md group perspective-1000">
            {data.imageUrl && !imgError ? (
              <img 
                src={data.imageUrl} 
                alt={data.title} 
                className="w-full h-full object-cover rounded-md z-20 relative transition-transform duration-700 group-hover:rotate-y-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                onError={() => setImgError(true)}
              />
            ) : (
               <div className="w-full h-full rounded-md z-20 relative bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center border border-white/10" style={{backgroundColor: themeColor}}>
                  <Disc size={80} className="text-white/20" />
               </div>
            )}
            
            {/* Vinyl sliding out */}
            <div className="absolute top-2 right-2 w-[95%] h-[95%] bg-black rounded-full z-10 transition-transform duration-700 group-hover:translate-x-16 md:group-hover:translate-x-24 flex items-center justify-center shadow-xl">
               <div className="w-24 h-24 bg-red-600 rounded-full border-4 border-black opacity-90"></div>
               {/* Grooves */}
               <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/10 opacity-30 animate-spin-slow"></div>
            </div>
         </div>

         <h1 className="font-display text-4xl md:text-6xl font-bold mb-2 text-white tracking-tight drop-shadow-lg">{data.title}</h1>
         <p className="text-white/60 text-xl font-serif mb-6">
            <button onClick={() => onArtistClick(data.artist)} className="hover:text-white hover:underline decoration-white/50 underline-offset-4 transition-all">{data.artist}</button> • {data.year}
         </p>
         
         {/* Streaming Links */}
         <div className="flex justify-center gap-3">
           <a href={spotifyLink} target="_blank" rel="noreferrer" className="bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-green-900/30">
             <SpotifyIcon /> Listen
           </a>
           <a href={appleMusicLink} target="_blank" rel="noreferrer" className="bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-white/20">
             <AppleMusicIcon /> Listen
           </a>
         </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 space-y-12">
        
        {/* Overview */}
        <section id="overview" className="scroll-mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 glass-card p-6 rounded-2xl border-t-4" style={{borderTopColor: themeColor}}>
           <div><div className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Released</div><div className="text-sm font-medium">{data.snapshot?.releaseDate || 'N/A'}</div></div>
           <div><div className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Label</div><div className="text-sm font-medium truncate">{data.snapshot?.label || 'N/A'}</div></div>
           <div><div className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Producer</div><div className="text-sm font-medium truncate">{data.snapshot?.producer || 'N/A'}</div></div>
           <div><div className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Genre</div><div className="text-sm font-medium">{data.genre}</div></div>
        </section>

        {/* Vision & Concept */}
        <section id="vision" className="scroll-mt-24">
           <h3 className="font-display text-2xl font-bold mb-4 flex items-center gap-2"><Mic2 className="text-white/50" size={20}/> The Concept</h3>
           <div className="glass-card p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: themeColor }}></div>
             <p className="text-lg leading-relaxed text-white/90 mb-4">{data.artistIntent}</p>
             <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2 font-bold">Themes</h4>
                <p className="text-sm text-white/70">{data.themesAndConcepts}</p>
             </div>
           </div>
           
           <div className="mt-4 glass-card p-4 rounded-xl flex gap-4 items-start">
              <div className="p-2 bg-pink-500/20 rounded-lg text-pink-300"><Disc size={20}/></div>
              <div>
                 <h4 className="text-sm font-bold uppercase text-white/80">Cover Art Story</h4>
                 <p className="text-sm text-white/60 mt-1">{data.coverArtStory}</p>
              </div>
           </div>
        </section>

        {/* Tracklist */}
        {tracklist.length > 0 && (
          <section id="tracks" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-6">
              <Layers size={20} className="text-white/70"/>
              <h3 className="font-display text-2xl font-bold">Track by Track</h3>
            </div>
            <div className="space-y-2">
              {tracklist.map((track, i) => (
                <button 
                  key={i} 
                  onClick={() => onSongClick(track.track, data.artist)}
                  className="group w-full text-left p-4 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer"
                >
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-white/30 font-mono text-xs w-6">{(i + 1).toString().padStart(2, '0')}</span>
                    <h4 className="font-bold text-white/90 text-base group-hover:text-blue-200 transition-colors">{track.track}</h4>
                  </div>
                  <p className="text-sm text-white/50 pl-9 group-hover:text-white/70 transition-colors line-clamp-2">{track.description}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Timeline & Reception */}
        <section id="timeline" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 text-green-400">
                 <Clock size={20} />
                 <h4 className="font-bold text-lg">Timeline</h4>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">{data.recordingTimeline}</p>
              <div className="text-xs uppercase text-white/30 font-bold mb-1">Tour Era</div>
              <p className="text-sm text-white/70">{data.tourEra}</p>
           </div>
           
           <div id="reception" className="glass-card p-6 rounded-2xl scroll-mt-24">
              <div className="flex items-center gap-2 mb-3 text-pink-400">
                 <TrendingUp size={20} />
                 <h4 className="font-bold text-lg">Reception</h4>
              </div>
              <div className="space-y-4">
                 <div>
                    <span className="text-xs text-white/40 uppercase font-bold">On Release</span>
                    <p className="text-sm text-white/80 mt-1">{reception.then}</p>
                 </div>
                 <div className="w-full h-px bg-white/10"></div>
                 <div>
                    <span className="text-xs text-white/40 uppercase font-bold">Modern Legacy</span>
                    <p className="text-sm text-white/80 mt-1">{reception.now}</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Collaborators & Details */}
        <section className="glass-card p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-white/10">
           <h3 className="font-bold text-lg mb-3">Credits & Hidden Gems</h3>
           <div className="space-y-3 text-sm">
              <p><span className="text-white/50 font-bold">Collaborators:</span> <span className="text-white/80">{data.collaborators}</span></p>
              <p><span className="text-white/50 font-bold">Easter Eggs:</span> <span className="text-white/80">{data.hiddenDetails}</span></p>
           </div>
        </section>

         {/* Verified Sources */}
         {sources.length > 0 && (
           <div className="pt-8 border-t border-white/10 mt-12 text-center">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Verified Sources</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {sources.map((source, i) => (
                  <a key={i} href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white transition-colors">
                     <LinkIcon size={10} /> {source.title}
                  </a>
                ))}
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default AlbumView;
