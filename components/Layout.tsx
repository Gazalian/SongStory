import React, { useMemo } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  themeColor?: string;
  genre?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, themeColor, genre }) => {
  // Use the theme color if available, otherwise default to deep purple
  const baseColor = themeColor || '#4c1d95'; 
  
  // Generate stable random particles
  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => {
      // Mix different animations for natural movement
      const animType = i % 3;
      let animationClass = 'animate-float'; // Default bobbing
      if (animType === 1) animationClass = 'animate-drift'; // Horizontal drift
      if (animType === 2) animationClass = 'animate-pulse-slow'; // Pulsing

      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1, // 1px to 4px
        opacity: Math.random() * 0.3 + 0.05, // Very subtle
        animationDuration: `${Math.random() * 15 + 15}s`, // Slow: 15-30s
        animationDelay: `${Math.random() * 10}s`,
        animationClass
      };
    });
  }, []);

  return (
    <div 
      className="min-h-screen w-full relative overflow-x-hidden text-slate-100 bg-black transition-colors duration-1000 ease-in-out"
    >
      {/* Animated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Dynamic Theme Gradient - This replaces the flat black */}
        <div 
          className="absolute inset-0 transition-colors duration-1000 ease-in-out"
          style={{ 
            background: `radial-gradient(circle at 50% -20%, ${baseColor}, #050505 80%)` 
          }}
        />
        
        {/* Secondary ambient glow */}
        <div 
           className="absolute bottom-0 left-0 w-full h-1/2 opacity-20"
           style={{
             background: `linear-gradient(to top, ${baseColor}, transparent)`
           }}
        />

        {/* Particle System */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full bg-white ${p.animationClass}`}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              boxShadow: `0 0 ${p.size * 2}px ${baseColor}` // Subtle glow matching theme
            }}
          />
        ))}
        
        {/* Noise Texture for that premium grainy feel */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen"></div>
        
        {/* Genre-based tint overlay */}
        {genre && (
          <div className={`absolute inset-0 opacity-10 mix-blend-overlay
            ${genre.toLowerCase().includes('pop') ? 'bg-gradient-to-tr from-pink-500 to-blue-500' : ''}
            ${genre.toLowerCase().includes('rock') ? 'bg-gradient-to-b from-red-900 to-black' : ''}
            ${genre.toLowerCase().includes('jazz') ? 'bg-gradient-to-tr from-amber-700 to-black' : ''}
            ${genre.toLowerCase().includes('hip') ? 'bg-gradient-to-br from-purple-900 to-yellow-900' : ''}
          `}/>
        )}
      </div>

      {/* Main Content - Full width canvas */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
