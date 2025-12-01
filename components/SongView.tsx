import React, { useState, useEffect, useRef } from 'react';
import { SongData, LyricsSegment, Source } from '../types';
import { getLyricsAnalysis } from '../services/geminiService';
import { 
  Play, Share2, Quote, Radio, Info, Headphones, Music, Globe, ArrowRight,
  List, BookOpen, Mic2, Award, Clock, Sparkles, Loader, Link as LinkIcon, AlertCircle
} from 'lucide-react';

interface SongViewProps {
  data: SongData;
  onBack: () => void;
  onArtistClick: (artist: string) => void;
  onSongClick: (title: string, artist: string) => void;
}

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 0 5.373 5.373 0 12 0s12 5.373 12 12zM10.954 8.188L9.042 16.5l8.139-4.32-6.227-3.992z"/>
  </svg>
);

const SECTIONS = [
  { id: 'snapshot', label: 'Overview', icon: Info },
  { id: 'backstory', label: 'Story', icon: BookOpen },
  { id: 'meaning', label: 'Meaning', icon: Globe },
  { id: 'lyrics', label: 'Lyrics', icon: Quote },
  { id: 'production', label: 'Production', icon: Headphones },
  { id: 'impact', label: 'Impact', icon: Award },
];

const RevealOnScroll: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100 filter-none' 
          : 'opacity-0 translate-y-12 scale-95 blur-sm'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const SongView: React.FC<SongViewProps> = ({ data, onBack, onArtistClick, onSongClick }) => {
  const [activeSection, setActiveSection] = useState('snapshot');
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [imgError, setImgError] = useState(false);
  
  // State for Full Lyrics Analysis
  const [isLyricsAnalysisLoading, setIsLyricsAnalysisLoading] = useState(false);
  const [fullLyrics, setFullLyrics] = useState<LyricsSegment[] | null>(null);
  const [lyricsError, setLyricsError] = useState(false);

  // Parallax & Scroll Progress Handler
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollY(currentY);

      // Calculate Read Progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (currentY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRevealLyrics = async () => {
    if (fullLyrics) return; // Already loaded
    setIsLyricsAnalysisLoading(true);
    setLyricsError(false);
    
    try {
      const result = await getLyricsAnalysis(data.title, data.artist);
      if (result && Array.isArray(result) && result.length > 0) {
        setFullLyrics(result);
      } else {
        setLyricsError(true);
      }
    } catch (e) {
      setLyricsError(true);
    } finally {
      setIsLyricsAnalysisLoading(false);
    }
  };

  const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(data.title + ' ' + data.artist)}`;
  const appleMusicLink = `https://music.apple.com/us/search?term=${encodeURIComponent(data.title + ' ' + data.artist)}`;

  const themeColor = data.themeColor || '#555';

  // Defensive helpers
  const lyricsMoments = data.lyricsMoments || [];
  const versions = data.versions || [];
  const relatedSongs = data.relatedSongs || [];
  const trivia = data.trivia || [];
  const sources = data.sources || [];

  return (
    <div className="pb-32 min-h-screen">
      
      {/* Sticky TOC Navigation Container */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl relative">
        <div className="overflow-x-auto no-scrollbar py-3 px-4 flex gap-4 transition-all duration-300">
          <button onClick={onBack} className="flex-shrink-0 p-1.5 bg-white/10 rounded-full mr-2 hover:bg-white/20 transition-colors">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                activeSection === section.id 
                  ? 'text-white scale-105' 
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <section.icon size={12} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Animated Reading Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
           <div 
              className="h-full relative transition-all duration-100 ease-out"
              style={{ 
                 width: `${scrollProgress}%`, 
                 background: `linear-gradient(90deg, transparent, ${themeColor}, ${themeColor})`,
                 boxShadow: `0 0 10px ${themeColor}60`
              }}
           >
              {/* Glowing Tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white] blur-[0.5px]"></div>
           </div>
        </div>
      </div>

      {/* Parallax Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden group">
        
        {/* Conditional Image Rendering */}
        {data.imageUrl && !imgError ? (
           <div 
             className="absolute inset-0 z-0 bg-cover bg-center will-change-transform"
             style={{ 
               backgroundImage: `url(${data.imageUrl})`,
               transform: `translateY(${scrollY * 0.4}px) scale(1.1)`, // Parallax Movement
               transition: 'transform 0.1s linear' // Smooth out the parallax jank
             }}
           >
             <div className="absolute inset-0 bg-black/30"></div>
             {/* Hidden img tag to catch load errors */}
             <img src={data.imageUrl} className="hidden" onError={() => setImgError(true)} />
           </div>
        ) : (
           /* Fallback Placeholder - Never guess, just show elegant placeholder */
           <div 
             className="absolute inset-0 z-0 flex items-center justify-center will-change-transform" 
             style={{ 
               backgroundColor: themeColor,
               transform: `translateY(${scrollY * 0.4}px)`,
             }}
           >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <Music size={120} className="text-white/20 animate-pulse" />
           </div>
        )}
        
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-6 md:p-12 z-10">
          <RevealOnScroll className="mb-4 flex flex-wrap gap-2">
             <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-white/90 border border-white/10 shadow-lg">{data.genre}</span>
             <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs text-white/70 border border-white/5">{data.year}</span>
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
            <h1 className="font-display text-5xl md:text-8xl font-black leading-none mb-4 text-white drop-shadow-2xl">{data.title}</h1>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <div className="font-serif text-2xl md:text-3xl italic text-white/90 flex items-center gap-2 mb-8">
              by <button onClick={() => onArtistClick(data.artist)} className="hover:text-blue-300 hover:underline decoration-blue-300/50 underline-offset-4 transition-all">{data.artist}</button>
            </div>
          </RevealOnScroll>

          {/* Listen Buttons - Moved inside Hero to prevent overlap */}
          <RevealOnScroll delay={300} className="flex flex-wrap gap-4 pb-2">
            <a href={spotifyLink} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px] max-w-[200px] bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-900/40">
              <SpotifyIcon /> Listen on Spotify
            </a>
            <a href={appleMusicLink} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px] max-w-[200px] bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-white/20">
              <AppleMusicIcon /> Apple Music
            </a>
          </RevealOnScroll>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 relative z-20 space-y-16 pt-10">

        {/* Snapshot & Facts */}
        <RevealOnScroll>
          <section id="snapshot" className="scroll-mt-32">
            <div className="glass-card p-6 md:p-10 rounded-[2rem] border-l-8 overflow-hidden relative group" style={{ borderLeftColor: themeColor }}>
               {/* Decorative background glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-white/10 transition-colors duration-700"></div>

               <h2 className="text-sm uppercase tracking-widest text-white/50 mb-6 font-bold flex items-center gap-2">
                 <div className="w-8 h-[1px] bg-white/30"></div> Key Highlight
               </h2>
               <p className="font-display text-3xl md:text-4xl font-medium leading-tight text-white mb-10 drop-shadow-md relative z-10">{data.hook}</p>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10 relative z-10">
                  <div><div className="text-white/40 text-[10px] uppercase mb-2 font-bold tracking-widest">Album</div><div className="font-bold text-base text-white">{data.quickFacts?.album || 'Single'}</div></div>
                  <div><div className="text-white/40 text-[10px] uppercase mb-2 font-bold tracking-widest">Writers</div><div className="font-bold text-base text-white">{data.quickFacts?.writers || data.artist}</div></div>
                  <div><div className="text-white/40 text-[10px] uppercase mb-2 font-bold tracking-widest">Producers</div><div className="font-bold text-base text-white">{data.quickFacts?.producers || 'Various'}</div></div>
                  <div><div className="text-white/40 text-[10px] uppercase mb-2 font-bold tracking-widest">Length</div><div className="font-bold text-base text-white">{data.quickFacts?.length || '--:--'}</div></div>
               </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* Backstory */}
        <RevealOnScroll>
          <section id="backstory" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-4 bg-white/5 rounded-2xl text-white border border-white/10 shadow-lg"><BookOpen size={24} /></div>
               <h2 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Origin Story</h2>
            </div>
            <div className="prose prose-xl prose-invert text-zinc-300 font-light leading-relaxed max-w-none">
              <p>{data.backstory}</p>
            </div>
          </section>
        </RevealOnScroll>

        {/* Meaning & Themes */}
        <RevealOnScroll>
          <section id="meaning" className="scroll-mt-32">
             <div className="flex items-center gap-4 mb-8">
               <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-300 border border-purple-500/20"><Globe size={24} /></div>
               <h2 className="font-display text-4xl font-bold">Meaning & Themes</h2>
             </div>
             <div className="glass-card p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-purple-900/20 to-transparent border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
               <p className="text-xl leading-relaxed text-zinc-200 relative z-10">{data.meaningAndThemes}</p>
             </div>
          </section>
        </RevealOnScroll>

        {/* Lyrics Deep Dive */}
        <section id="lyrics" className="scroll-mt-32 space-y-8">
            <RevealOnScroll>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-300 border border-blue-500/20"><Quote size={24} /></div>
                <h2 className="font-display text-4xl font-bold">Lyrics Deep Dive</h2>
              </div>
            </RevealOnScroll>

            {/* Highlights */}
            {lyricsMoments.length > 0 ? (
              <div className="space-y-6">
                {lyricsMoments.map((moment, idx) => (
                  <RevealOnScroll key={idx} delay={idx * 100}>
                    <div className="relative pl-8 md:pl-10 border-l-2 border-blue-500/30 py-2 group hover:border-blue-500 transition-colors duration-500">
                      <p className="font-serif italic text-2xl md:text-3xl text-white mb-4 group-hover:text-blue-100 transition-colors">"{moment.line}"</p>
                      <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">{moment.explanation}</p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            ) : (
               /* Fallback if moments are missing */
               <div className="glass-card p-6 rounded-2xl text-center text-white/50 italic">
                 Explore the full lyrics analysis below to uncover the hidden meanings.
               </div>
            )}
            
            {/* Interactive Full Lyrics Analysis Button */}
            <RevealOnScroll className="mt-8">
              {!fullLyrics && !lyricsError && (
                <button 
                  onClick={handleRevealLyrics}
                  disabled={isLyricsAnalysisLoading}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group relative overflow-hidden flex items-center justify-center gap-3"
                >
                  {isLyricsAnalysisLoading ? (
                    <>
                      <Loader className="animate-spin text-blue-400" size={24} />
                      <span className="text-lg font-bold text-white/80">Analysing Verses...</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Sparkles className="text-yellow-400 group-hover:animate-pulse" size={24} />
                      <span className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">Reveal Full Lyrics Analysis</span>
                    </>
                  )}
                </button>
              )}

              {/* Error State */}
              {lyricsError && (
                 <div className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 text-red-200">
                    <AlertCircle size={20} />
                    <span>Couldn't analyze lyrics at this moment. Please try again.</span>
                    <button onClick={handleRevealLyrics} className="underline font-bold hover:text-white">Retry</button>
                 </div>
              )}

              {/* Full Lyrics Breakdown Rendering */}
              {fullLyrics && Array.isArray(fullLyrics) && (
                <div className="mt-10 space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                  {fullLyrics.map((segment, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 pb-12 border-b border-white/5 last:border-0 last:pb-0">
                      {/* Lyrics Column */}
                      <div className="md:w-5/12">
                         <h4 className="text-xs uppercase font-bold tracking-widest text-blue-400 mb-4 sticky top-32">{segment.section}</h4>
                         <p className="font-serif italic text-xl md:text-2xl text-white/90 leading-relaxed whitespace-pre-line">
                           {segment.text}
                         </p>
                      </div>

                      {/* Analysis Column */}
                      <div className="md:w-7/12 relative">
                         {/* Visual connection line */}
                         <div className="hidden md:block absolute -left-6 top-2 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/30 to-transparent"></div>
                         
                         <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                            <h5 className="flex items-center gap-2 font-bold text-white/60 text-sm uppercase tracking-wide mb-3">
                              <Info size={14} /> Interpretation
                            </h5>
                            <p className="text-zinc-300 leading-relaxed text-lg">
                              {segment.analysis}
                            </p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </RevealOnScroll>
        </section>

        {/* Production Notes */}
        <RevealOnScroll>
          <section id="production" className="scroll-mt-32 glass-card p-8 md:p-10 rounded-[2rem] bg-zinc-900/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-green-500/10 rounded-2xl text-green-300 border border-green-500/20"><Headphones size={24} /></div>
              <h3 className="font-display text-3xl font-bold">In The Studio</h3>
            </div>
            <p className="text-xl text-zinc-300 leading-relaxed mb-8">{data.recordingNotes}</p>
            
            {data.artistCommentary && (
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5 relative">
                 <Quote className="absolute top-6 left-6 text-white/10 transform -scale-x-100" size={48} />
                 <div className="text-xs uppercase tracking-widest text-white/40 mb-4 font-bold relative z-10 pl-2">Artist Commentary</div>
                 <p className="font-serif italic text-xl md:text-2xl text-white/90 relative z-10 pl-2">"{data.artistCommentary}"</p>
              </div>
            )}
          </section>
        </RevealOnScroll>

        {/* Cultural Impact */}
        <RevealOnScroll>
          <section id="impact" className="scroll-mt-32">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-300 border border-yellow-500/20"><Award size={24} /></div>
                <h3 className="font-display text-3xl font-bold">Cultural Impact</h3>
             </div>
             <p className="text-xl text-zinc-300 leading-relaxed mb-10 max-w-3xl">{data.culturalImpact}</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Versions */}
                {versions.length > 0 && (
                  <div className="glass-card p-8 rounded-[2rem] hover:bg-white/5 transition-colors duration-500">
                     <h4 className="font-bold mb-6 flex items-center gap-3 text-sm uppercase tracking-widest text-white/50"><Radio size={18}/> Versions & Covers</h4>
                     <ul className="space-y-4">
                        {versions.slice(0, 3).map((v, i) => (
                          <li key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0">
                            <button 
                              onClick={() => onSongClick(data.title, v.artist)}
                              className="font-bold text-white text-lg hover:text-blue-300 hover:underline transition-colors text-left"
                            >
                              {v.artist}
                            </button>
                            <span className="text-zinc-500 font-medium">{v.type} ({v.year})</span>
                          </li>
                        ))}
                     </ul>
                  </div>
                )}

                {/* Related */}
                {relatedSongs.length > 0 && (
                  <div className="glass-card p-8 rounded-[2rem] hover:bg-white/5 transition-colors duration-500">
                     <h4 className="font-bold mb-6 flex items-center gap-3 text-sm uppercase tracking-widest text-white/50"><Music size={18}/> Related Songs</h4>
                     <ul className="space-y-4">
                        {relatedSongs.slice(0, 3).map((s, i) => (
                          <button 
                            key={i} 
                            onClick={() => onSongClick(s.title, s.artist)}
                            className="flex items-center gap-4 text-sm group w-full text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 group-hover:bg-white/20 group-hover:text-white transition-all">
                              <Play size={14} fill="currentColor" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">{s.title}</div>
                              <div className="text-zinc-500">by {s.artist}</div>
                            </div>
                          </button>
                        ))}
                     </ul>
                  </div>
                )}
             </div>
          </section>
        </RevealOnScroll>

        {/* Trivia */}
        {trivia.length > 0 && (
          <RevealOnScroll>
            <section className="bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
               <h3 className="font-display text-2xl font-bold mb-8 text-white relative z-10">Did You Know?</h3>
               <ul className="space-y-6 relative z-10">
                 {trivia.map((t, i) => (
                   <li key={i} className="flex gap-4 text-zinc-400">
                     <span className="text-blue-400 select-none text-2xl leading-none">•</span>
                     <span className="text-lg leading-relaxed">{t}</span>
                   </li>
                 ))}
               </ul>
            </section>
          </RevealOnScroll>
        )}

        {/* Verified Sources */}
        {sources.length > 0 && (
           <div className="pt-8 border-t border-white/10 mt-16 text-center">
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

export default SongView;
