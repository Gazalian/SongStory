import React from 'react';
import { AlbumData } from '../types';
import { Disc, Layers, Clock, TrendingUp, History } from 'lucide-react';

interface AlbumViewProps {
  data: AlbumData;
  onBack: () => void;
}

const AlbumView: React.FC<AlbumViewProps> = ({ data, onBack }) => {
  return (
    <div className="pb-24 animate-in fade-in zoom-in-95 duration-500">
      {/* Album Cover & Header */}
      <div className="p-6 pt-12 text-center">
         <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
         </button>
         
         <div className="relative mx-auto w-48 h-48 mb-6 shadow-2xl rounded-md group perspective-1000">
            <img 
              src={`https://picsum.photos/seed/${data.title}/500/500`} 
              alt={data.title} 
              className="w-full h-full object-cover rounded-md z-20 relative transition-transform duration-700 group-hover:rotate-y-12"
            />
            {/* Vinyl record effect sliding out */}
            <div className="absolute top-1 right-1 w-[95%] h-[95%] bg-black rounded-full z-10 transition-transform duration-700 group-hover:translate-x-12 flex items-center justify-center">
               <div className="w-16 h-16 bg-red-500 rounded-full border-4 border-black"></div>
            </div>
         </div>

         <h1 className="font-display text-3xl font-bold mb-1">{data.title}</h1>
         <p className="text-white/60 text-lg mb-4">{data.artist} • {data.year}</p>
         
         <div className="inline-flex gap-4 text-xs font-mono text-white/50 uppercase tracking-wider">
            <span>{data.snapshot.label}</span>
            <span>•</span>
            <span>{data.genre}</span>
         </div>
      </div>

      <div className="px-5 space-y-8">
        
        {/* Artist Intent */}
        <section className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
          <h3 className="font-bold text-lg mb-2">The Vision</h3>
          <p className="text-white/80 leading-relaxed font-serif text-lg">"{data.artistIntent}"</p>
        </section>

        {/* Track by Track */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-white/70"/>
            <h3 className="font-bold uppercase tracking-widest text-sm text-white/70">Track by Track</h3>
          </div>
          <div className="space-y-3">
            {data.trackBlurbs.map((track, i) => (
              <div key={i} className="group p-4 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5">
                <div className="flex items-baseline gap-3 mb-1">
                   <span className="text-white/30 font-mono text-sm">{(i + 1).toString().padStart(2, '0')}</span>
                   <h4 className="font-bold text-white/90">{track.track}</h4>
                </div>
                <p className="text-sm text-white/60 pl-8 group-hover:text-white/80 transition-colors">{track.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Production & Reception */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-green-400">
                 <Clock size={18} />
                 <h4 className="font-bold text-sm uppercase">Making Of</h4>
              </div>
              <p className="text-sm text-white/70">{data.productionTimeline}</p>
           </div>
           
           <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-pink-400">
                 <TrendingUp size={18} />
                 <h4 className="font-bold text-sm uppercase">Reception</h4>
              </div>
              <div className="space-y-2">
                 <div>
                    <span className="text-xs text-white/40 uppercase">Then</span>
                    <p className="text-xs text-white/80">{data.reception.then}</p>
                 </div>
                 <div>
                    <span className="text-xs text-white/40 uppercase">Now</span>
                    <p className="text-xs text-white/80">{data.reception.now}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Legacy */}
        <section className="bg-gradient-to-r from-yellow-500/10 to-transparent p-6 rounded-2xl border border-yellow-500/20">
           <div className="flex items-center gap-2 mb-2 text-yellow-200">
              <History size={20} />
              <h3 className="font-bold text-lg">Legacy</h3>
           </div>
           <p className="text-white/80">{data.legacy}</p>
        </section>

      </div>
    </div>
  );
};

export default AlbumView;
