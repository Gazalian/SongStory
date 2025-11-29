import React from 'react';
import { SongData } from '../types';
import { Play, Share2, Quote, Radio, Info, Headphones } from 'lucide-react';

interface SongViewProps {
  data: SongData;
  onBack: () => void;
}

const SongView: React.FC<SongViewProps> = ({ data, onBack }) => {
  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero Section */}
      <div className="relative w-full aspect-square md:aspect-video mb-6 overflow-hidden group">
        <img 
          src={`https://picsum.photos/seed/${data.title + data.artist}/800/800`} 
          alt="Song Cover Art" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
          <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:bg-white/20 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          
          <div className="mb-2">
             <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-bold uppercase tracking-widest text-white/90 shadow-sm border border-white/10">{data.genre}</span>
             <span className="ml-2 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-md text-xs text-white/70">{data.year}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-1 text-white drop-shadow-md">{data.title}</h1>
          <p className="font-serif text-xl italic text-white/80">{data.artist}</p>
        </div>
      </div>

      <div className="px-5 space-y-8">
        
        {/* The Hook */}
        <section className="glass-card p-6 rounded-2xl border-l-4 border-l-white/50">
          <h2 className="text-xs uppercase tracking-widest text-white/50 mb-3 font-semibold">The Essence</h2>
          <p className="font-display text-2xl font-medium leading-relaxed text-white">"{data.hook}"</p>
        </section>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-xl">
             <div className="text-white/40 text-xs uppercase mb-1">Peak Chart</div>
             <div className="font-mono text-lg">{data.quickFacts.chartPeak}</div>
          </div>
          <div className="glass-card p-4 rounded-xl">
             <div className="text-white/40 text-xs uppercase mb-1">Writers</div>
             <div className="font-mono text-sm leading-tight truncate">{data.quickFacts.writers}</div>
          </div>
        </div>

        {/* Backstory */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-white/10 rounded-full"><Info size={16} /></div>
             <h2 className="font-display text-xl font-bold">The Origin Story</h2>
          </div>
          <div className="prose prose-invert prose-p:text-white/80 prose-p:font-light prose-p:leading-7">
            <p>{data.backstory}</p>
          </div>
        </section>

        {/* Lyric Moments */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/10 rounded-full"><Quote size={16} /></div>
            <h2 className="font-display text-xl font-bold">Lyrical Deep Dive</h2>
          </div>
          {data.lyricsMoments.map((moment, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-white/20">
               <p className="font-serif italic text-lg text-white/90 mb-2">"{moment.line}"</p>
               <p className="text-sm text-white/60">{moment.explanation}</p>
            </div>
          ))}
        </section>

        {/* Recording Notes */}
        <section className="glass-card p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Headphones size={18} className="text-white/70" />
            <h3 className="font-bold text-lg">In The Studio</h3>
          </div>
          <p className="text-white/70 leading-relaxed text-sm">{data.recordingNotes}</p>
        </section>

        {/* Versions */}
        {data.versions.length > 0 && (
           <section>
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Radio size={18} /> Notable Versions
              </h3>
              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {data.versions.map((v, i) => (
                  <div key={i} className="min-w-[200px] glass-card p-4 rounded-xl flex-shrink-0 hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="font-bold text-base">{v.artist}</p>
                    <span className="text-xs text-white/40 block mb-2">{v.year}</span>
                    <p className="text-xs text-white/60 line-clamp-3">{v.note}</p>
                  </div>
                ))}
              </div>
           </section>
        )}

        {/* Share Card */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10 text-center">
           <p className="font-display font-bold text-xl mb-2">Love this story?</p>
           <button className="flex items-center justify-center gap-2 mx-auto bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
             <Share2 size={18} /> Share Card
           </button>
        </div>

      </div>
    </div>
  );
};

export default SongView;
