import React from 'react';
import { Music, Disc, Mic2, Activity } from 'lucide-react';

interface LoadingProps {
  genre?: string;
}

const Loading: React.FC<LoadingProps> = ({ genre = 'pop' }) => {
  const g = genre.toLowerCase();

  const getIcon = () => {
    if (g.includes('hip') || g.includes('rap')) return <Activity className="w-12 h-12 text-neon-green" />;
    if (g.includes('rock') || g.includes('metal')) return <Disc className="w-12 h-12 animate-spin" />;
    if (g.includes('jazz') || g.includes('soul')) return <Mic2 className="w-12 h-12 animate-bounce" />;
    return <Music className="w-12 h-12 animate-pulse" />;
  };

  const getText = () => {
    if (g.includes('hip')) return "Dropping the beat...";
    if (g.includes('rock')) return "Tuning up...";
    if (g.includes('jazz')) return "Improvising...";
    return "Composing story...";
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse-slow"></div>
        <div className="relative text-white/90 drop-shadow-lg">
          {getIcon()}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <h3 className="font-display text-xl font-medium tracking-wide animate-pulse">{getText()}</h3>
        <p className="text-sm text-white/50 font-sans">Digging through the crates</p>
      </div>
    </div>
  );
};

export default Loading;
