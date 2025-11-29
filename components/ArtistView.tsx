import React from 'react';
import { ArtistData } from '../types';
import { Award, Music2, Users, Zap, User } from 'lucide-react';

interface ArtistViewProps {
  data: ArtistData;
  onBack: () => void;
}

const ArtistView: React.FC<ArtistViewProps> = ({ data, onBack }) => {
  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero */}
      <div className="relative h-96 w-full">
         <img 
            src={`https://picsum.photos/seed/${data.name}/800/1000`}
            alt={data.name} 
            className="w-full h-full object-cover grayscale contrast-125"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/80">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="font-display text-5xl font-black text-white tracking-tighter mb-2">{data.name.toUpperCase()}</h1>
            <p className="text-lg text-white/80 font-serif italic">{data.essence}</p>
         </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-6">
        
        {/* Stats strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="px-4 py-2 glass-card rounded-full whitespace-nowrap text-sm font-bold">{data.yearsActive}</div>
          <div className="px-4 py-2 glass-card rounded-full whitespace-nowrap text-sm font-bold">{data.genre}</div>
        </div>

        {/* Musical DNA */}
        <section className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-3 text-purple-300">
            <Music2 size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Musical DNA</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{data.musicalDNA}</p>
        </section>

        {/* Milestones Timeline */}
        <section>
          <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="text-yellow-400" size={20} /> Career Peaks
          </h3>
          <div className="space-y-0 pl-4 border-l border-white/10">
            {data.milestones.map((m, i) => (
              <div key={i} className="relative pl-6 pb-6 last:pb-0 group">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-white rounded-full ring-4 ring-black group-hover:bg-yellow-400 transition-colors"></div>
                <span className="text-xs font-mono text-white/50 mb-1 block">{m.year}</span>
                <p className="text-white/90 font-medium">{m.event}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Origin & Collaborations Grid */}
        <div className="grid grid-cols-1 gap-4">
           <div className="glass-card p-5 rounded-xl">
             <div className="flex items-center gap-2 mb-2 text-blue-300">
               <User size={18} />
               <h4 className="font-bold text-sm uppercase">The Name</h4>
             </div>
             <p className="text-sm text-white/70">{data.stageNameOrigin}</p>
           </div>
           <div className="glass-card p-5 rounded-xl">
             <div className="flex items-center gap-2 mb-2 text-green-300">
               <Users size={18} />
               <h4 className="font-bold text-sm uppercase">Crew & Collabs</h4>
             </div>
             <p className="text-sm text-white/70">{data.collaborations}</p>
           </div>
        </div>

        {/* Trivia / Fun Facts */}
        <section>
           <h3 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
             <Zap className="text-orange-400" size={20} /> Did You Know?
           </h3>
           <ul className="space-y-3">
             {data.trivia.map((fact, i) => (
               <li key={i} className="glass-card p-4 rounded-lg text-sm text-white/80 border-l-4 border-orange-400/50">
                 {fact}
               </li>
             ))}
           </ul>
        </section>

        {/* Visual Style */}
        <section className="bg-white/5 p-6 rounded-2xl">
           <h3 className="font-bold text-white/50 text-xs uppercase mb-2 tracking-widest">Aesthetic</h3>
           <p className="font-serif text-lg leading-relaxed">{data.visualStyle}</p>
        </section>
      </div>
    </div>
  );
};

export default ArtistView;
