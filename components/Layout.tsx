import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  themeColor?: string;
  genre?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, themeColor, genre }) => {
  // Use a default dark color if none provided
  const baseColor = themeColor || '#4c1d95'; // Defaulting to a deep purple if no theme
  
  return (
    <div 
      className="min-h-screen w-full relative overflow-x-hidden text-slate-100 bg-black"
    >
      {/* Animated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Orb 1 - Top Left */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob"
          style={{ backgroundColor: baseColor }}
        />
        {/* Orb 2 - Top Right (Delayed) */}
        <div 
          className="absolute top-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob"
          style={{ 
            backgroundColor: baseColor, 
            animationDelay: '2s',
            animationDirection: 'reverse'
          }}
        />
        {/* Orb 3 - Bottom Left (Delayed more) */}
        <div 
          className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-blob"
          style={{ 
            backgroundColor: baseColor,
            animationDelay: '4s' 
          }}
        />
        
        {/* Noise Texture for that premium grainy feel */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen"></div>
        
        {/* Dark Overlay Gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90"></div>
        
        {/* Dynamic Genre Overlay - Subtle Tint */}
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