import React, { useState, useEffect } from 'react';
import { Play, Disc, Music2, Mic2, Radio, Headphones, Sparkles } from 'lucide-react';

interface IntroViewProps {
  onEnter: (searchTerm?: string) => void;
}

// Using specific, reliable images for the intro to demonstrate accuracy. 
// These are sourced from reliable creative commons or official-like placeholders.
const SLIDES = [
  { 
    name: 'Asake', 
    subtitle: 'Mr. Money With The Vibe', 
    image: 'https://upload.wikimedia.org/wikipedia/en/2/23/Asake_-_Mr._Money_With_The_Vibe.png' // Album cover
  },
  { 
    name: 'Billie Eilish', 
    subtitle: 'Hit Me Hard and Soft', 
    image: 'https://upload.wikimedia.org/wikipedia/en/a/aa/Billie_Eilish_-_Hit_Me_Hard_and_Soft.png' // Album cover
  },
  { 
    name: 'Frank Ocean', 
    subtitle: 'Blonde', 
    image: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg' 
  },
  { 
    name: 'Kendrick Lamar', 
    subtitle: 'To Pimp A Butterfly', 
    image: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png' 
  },
  { 
    name: 'Fleetwood Mac', 
    subtitle: 'Rumours', 
    image: 'https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG' 
  },
];

const FLOATING_ICONS = [
  { Icon: Music2, delay: '0s', left: '10%', top: '20%' },
  { Icon: Disc, delay: '2s', left: '80%', top: '15%' },
  { Icon: Mic2, delay: '4s', left: '15%', top: '70%' },
  { Icon: Radio, delay: '1s', left: '70%', top: '80%' },
  { Icon: Headphones, delay: '3s', left: '85%', top: '50%' },
  { Icon: Sparkles, delay: '5s', left: '5%', top: '40%' },
];

const IntroView: React.FC<IntroViewProps> = ({ onEnter }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const playInteractionSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // A pleasant "pop" sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const handleInteraction = (shouldSearch: boolean = false) => {
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    
    playInteractionSound();
    
    // Small delay to allow feedback before transition
    setTimeout(() => {
      const slide = SLIDES[currentSlide];
      // If clicking the play/enter button on a specific slide, search for that artist + title
      // If shouldSearch is false (default), we pass undefined to go to empty search page
      const searchTerm = shouldSearch ? `${slide.name} ${slide.subtitle}` : undefined;
      onEnter(searchTerm);
    }, 200);
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-sans">
      
      {/* Dynamic Background Slideshow */}
      {SLIDES.map((s, i) => (
         <div 
            key={i}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${i === currentSlide ? 'opacity-40' : 'opacity-0'}`}
         >
            <img 
               src={s.image} 
               alt={s.name}
               className="w-full h-full object-cover animate-zoom-pulse"
               onError={(e) => {
                 // Fallback if Wikimedia link fails
                 (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/222/FFF?text=Music';
               }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[3px]" />
         </div>
      ))}

      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_ICONS.map((item, idx) => (
          <div 
            key={idx}
            className="absolute text-white/10 animate-float"
            style={{ 
              left: item.left, 
              top: item.top, 
              animationDelay: item.delay,
              transform: `scale(${Math.random() * 0.5 + 0.8})`
            }}
          >
            <item.Icon size={48} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center justify-center min-h-[500px]">
        
        {/* Lively Site Title */}
        <div className="mb-8 animate-wiggle">
          <h1 className="font-display text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-tight">
            SongStory
          </h1>
        </div>

        {/* Minimal Player Card */}
        <div 
            className="w-full group relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500 hover:bg-black/50"
        >
             {/* Glow Effect */}
             <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

             {/* Top Metadata */}
             <div className="flex justify-between items-center text-white/50 text-[10px] tracking-[0.2em] uppercase font-bold mb-8">
                <span>Now Playing</span>
                <div className="flex items-center gap-1.5 bg-black/50 border border-white/5 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span> 
                  <span className="text-white/80">On Air</span>
                </div>
             </div>

             {/* Center Art - Spinning Vinyl Effect */}
             <div className="flex justify-center mb-8 relative">
                 {/* Decorative rings */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
                 
                 <div className="relative w-48 h-48 rounded-full bg-black border-[6px] border-white/10 flex items-center justify-center shadow-2xl">
                    <img 
                      src={slide.image} 
                      className="absolute inset-0 w-full h-full object-cover rounded-full opacity-70 animate-spin-slow"
                      onError={(e) => {
                         (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/222/FFF?text=Music';
                      }}
                    />
                    {/* Center hole of vinyl */}
                    <div className="relative z-10 w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                        <div className="w-4 h-4 bg-black rounded-full border border-white/20"></div>
                    </div>
                 </div>
             </div>

             {/* Song Info */}
             <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-display font-bold text-white leading-none tracking-tight drop-shadow-md min-h-[1.2em]">
                   {slide.name}
                </h2>
                <p className="text-white/70 font-serif italic text-lg tracking-wide min-h-[1.5em]">
                  {slide.subtitle}
                </p>
             </div>

             {/* Active Progress Bar */}
             <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-gradient-to-r from-white/80 to-white/40 w-1/3 rounded-full animate-[width_3s_ease-in-out_infinite_alternate]" style={{ width: '40%' }}></div>
             </div>

             {/* Primary Interaction Button */}
             <div className="flex justify-center">
                <button
                   onClick={() => handleInteraction(false)}
                   className="relative group/btn flex flex-col items-center gap-4 focus:outline-none"
                >
                   <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] animate-pulse hover:scale-110 active:scale-95 transition-transform duration-300">
                      <Play size={32} fill="currentColor" className="ml-1.5" />
                   </div>
                   <span className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase group-hover/btn:text-white transition-colors">
                      Tap to Enter
                   </span>
                </button>
             </div>
        </div>

        {/* Footer Credit */}
        <div className="mt-8 text-center">
           <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] cursor-default animate-pulse-slow">
              By: Ghazali
           </p>
        </div>

      </div>
    </div>
  );
};

export default IntroView;