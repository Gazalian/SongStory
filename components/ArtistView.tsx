import React, { useState } from 'react';
import { ArtistData } from '../types';
import { 
  Award, Music2, Users, Zap, User, Mic2, Instagram, Twitter, Youtube, Globe, Play, Link as LinkIcon
} from 'lucide-react';

interface ArtistViewProps {
  data: ArtistData;
  onBack: () => void;
  onSongClick: (title: string, artist: string) => void;
}

const SECTIONS = [
  { id: 'bio', label: 'Bio', icon: User },
  { id: 'career', label: 'Journey', icon: Award },
  { id: 'style', label: 'Style', icon: Music2 },
  { id: 'discography', label: 'Music', icon: Mic2 },
  { id: 'trivia', label: 'Trivia', icon: Zap },
];

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v5.74c-.05 1.93-.36 3.89-1.38 5.59-1.04 1.73-2.67 3.06-4.59 3.86-2.58 1.08-5.61.9-8.08-.66-2.07-1.3-3.46-3.48-3.79-5.93-.33-2.45.65-4.89 2.59-6.49 1.57-1.3 3.65-1.92 5.68-1.74v4.13c-.87-.16-1.79.02-2.52.56-.73.54-1.16 1.44-1.15 2.33.01.9.45 1.79 1.2 2.3.74.52 1.69.66 2.55.39.86-.27 1.57-.93 1.83-1.79.26-.86.26-1.79.26-2.73V.02h3.29z"/>
  </svg>
);

const ArtistView: React.FC<ArtistViewProps> = ({ data, onBack, onSongClick }) => {
  const [activeSection, setActiveSection] = useState('bio');
  const [imgError, setImgError] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const SocialLink = ({ href, Icon, label }: { href?: string, Icon: any, label: string }) => {
    if (!href) return null;
    return (
      <a href={href} target="_blank" rel="noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white" aria-label={label}>
        <Icon size={20} />
      </a>
    );
  };

  const themeColor = data.themeColor || '#666';
  const name = data.name || 'Artist';
  const careerJourney = data.careerJourney || [];
  const discographyHighlights = data.discographyHighlights || [];
  const trivia = data.trivia || [];
  const sources = data.sources || [];

  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
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

      {/* Hero */}
      <div className="relative h-[60vh] w-full">
         {data.imageUrl && !imgError ? (
           <img 
              src={data.imageUrl}
              alt={name} 
              className="w-full h-full object-cover grayscale-[20%] contrast-110 align-top"
              onError={() => setImgError(true)}
           />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900" style={{ backgroundColor: themeColor }}>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
               <User size={120} className="text-white/20" />
            </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-6 md:p-10 flex flex-col justify-end">
            <h1 className="font-display text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">{name.toUpperCase()}</h1>
            <p className="text-xl md:text-2xl text-white/90 font-serif italic max-w-2xl drop-shadow-md">{data.bio}</p>
         </div>
      </div>

      {/* Socials Bar */}
      {data.socials && (
        <div className="px-6 py-6 bg-black border-b border-white/10 flex justify-center gap-4 flex-wrap">
          <SocialLink href={data.socials?.instagram} Icon={Instagram} label="Instagram" />
          <SocialLink href={data.socials?.twitter} Icon={Twitter} label="Twitter" />
          <SocialLink href={data.socials?.youtube} Icon={Youtube} label="YouTube" />
          <SocialLink href={data.socials?.tiktok} Icon={(props: any) => <TikTokIcon className="w-5 h-5" {...props} />} label="TikTok" />
          <SocialLink href={data.socials?.website} Icon={Globe} label="Website" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 mt-10 space-y-12">
        
        {/* Snapshot */}
        <div className="flex flex-wrap gap-3 justify-center text-sm font-bold uppercase tracking-wider text-white/60 mb-8">
           <span className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">{data.yearsActive || 'Active'}</span>
           <span className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">{data.origin || 'Unknown Origin'}</span>
           <span className="px-5 py-2 rounded-full border border-white/10 text-white bg-white/10">{data.genre || 'Music'}</span>
        </div>

        {/* Bio & Early Life */}
        <section id="bio" className="scroll-mt-24">
          <h3 className="font-display text-3xl font-bold mb-6 flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-full"><User size={24} /></div> The Story
          </h3>
          <div className="glass-card p-8 rounded-3xl space-y-6 border-l-4" style={{borderLeftColor: themeColor}}>
             <div>
                <h4 className="text-xs uppercase tracking-widest text-white/50 mb-3 font-bold">Early Life</h4>
                <p className="text-white/90 leading-relaxed text-lg font-light">{data.earlyLife}</p>
             </div>
          </div>
        </section>

        {/* Career Journey */}
        {careerJourney.length > 0 && (
          <section id="career" className="scroll-mt-24">
             <h3 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
               <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-300"><Award size={24} /></div> Career Journey
             </h3>
             <div className="relative border-l-2 border-white/10 pl-8 space-y-10 ml-3">
                {careerJourney.map((era, i) => (
                  <div key={i} className="relative">
                     <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-black border-4 border-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                     <h4 className="font-bold text-xl text-white mb-2">{era.era}</h4>
                     <p className="text-white/70 leading-relaxed">{era.description}</p>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Style & DNA */}
        <section id="style" className="scroll-mt-24 glass-card p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-transparent">
          <div className="flex items-center gap-3 mb-4 text-purple-300">
            <Music2 size={28} />
            <h3 className="font-bold text-2xl font-display text-white">Musical DNA</h3>
          </div>
          <p className="text-lg text-white/90 leading-relaxed mb-6">{data.musicalStyle}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
             <div>
                <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2 font-bold">Awards</h4>
                <p className="text-sm text-white/80">{data.awards}</p>
             </div>
             <div>
                <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2 font-bold">Collaborations</h4>
                <p className="text-sm text-white/80">{data.collaborations}</p>
             </div>
          </div>
        </section>

        {/* Discography */}
        {discographyHighlights.length > 0 && (
          <section id="discography" className="scroll-mt-24">
             <h3 className="font-display text-3xl font-bold mb-6">Essential Listening</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {discographyHighlights.map((item, i) => (
                   <button 
                      key={i} 
                      onClick={() => onSongClick(item.title, name)}
                      className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer w-full text-left group"
                   >
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 text-white/70 group-hover:text-white transition-colors">
                         {item.type === 'album' ? <DiscIcon /> : <MusicIcon />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-white truncate group-hover:text-blue-300 transition-colors">{item.title}</h4>
                         <span className="text-xs text-white/50 uppercase font-bold tracking-wider">{item.year} • {item.type}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50">
                        <Play size={16} fill="currentColor" />
                      </div>
                   </button>
                ))}
             </div>
          </section>
        )}

        {/* Trivia / Fun Facts */}
        {trivia.length > 0 && (
          <section id="trivia" className="scroll-mt-24 bg-white/5 p-8 rounded-3xl border border-white/5">
             <h3 className="font-display text-2xl font-bold mb-4 flex items-center gap-2 text-white">
               <Zap className="text-orange-400" size={24} /> Fan Lore
             </h3>
             <ul className="space-y-4">
               {trivia.map((fact, i) => (
                 <li key={i} className="glass-card p-4 rounded-xl text-sm text-white/80 border-l-4 border-orange-400/50">
                   {fact}
                 </li>
               ))}
             </ul>
          </section>
        )}

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

const DiscIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
);
const MusicIcon = () => (
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
);

export default ArtistView;
