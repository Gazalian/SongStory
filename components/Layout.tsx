import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  themeColor?: string;
  genre?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, themeColor, genre }) => {
  // Default to a dark sleek look if no color provided
  const bgColor = themeColor || '#1a1a1a';
  
  // Determine gradient overlay based on genre/vibe roughly
  let overlayGradient = 'bg-gradient-to-br from-black/60 via-transparent to-black/80';
  
  if (genre?.toLowerCase().includes('pop')) {
    overlayGradient = 'bg-gradient-to-tr from-pink-500/20 via-transparent to-blue-500/20';
  } else if (genre?.toLowerCase().includes('jazz')) {
    overlayGradient = 'bg-gradient-to-tr from-amber-700/30 via-transparent to-black';
  } else if (genre?.toLowerCase().includes('rock')) {
    overlayGradient = 'bg-gradient-to-b from-red-900/20 via-black/50 to-black';
  } else if (genre?.toLowerCase().includes('hip')) {
    overlayGradient = 'bg-gradient-to-br from-purple-900/30 via-black to-yellow-500/10';
  }

  return (
    <div 
      className="min-h-screen w-full transition-colors duration-1000 ease-in-out relative overflow-x-hidden text-slate-100"
      style={{ backgroundColor: bgColor }}
    >
      {/* Dynamic Background Elements */}
      <div className={`absolute inset-0 pointer-events-none ${overlayGradient} mix-blend-overlay`} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
      
      {/* Floating Orbs for ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-black/40 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col shadow-2xl bg-black/10 backdrop-blur-[2px]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
