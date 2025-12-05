import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Music, Disc, Mic2, Activity, Radio, Guitar, Drum, Piano, Speaker, Headphones, Music2, Music4, Binary, Waves, Keyboard, Zap } from 'lucide-react';
const Loading = ({ genre = 'pop' }) => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Connecting story...");
    const g = genre.toLowerCase();
    // Determine vibes based on genre
    const getTheme = () => {
        if (g.includes('hip') || g.includes('rap'))
            return { color: 'text-yellow-400', bg: 'bg-yellow-400', glow: 'shadow-yellow-500/50', icon: Activity };
        if (g.includes('rock') || g.includes('metal'))
            return { color: 'text-red-500', bg: 'bg-red-500', glow: 'shadow-red-500/50', icon: Guitar };
        if (g.includes('jazz') || g.includes('soul'))
            return { color: 'text-blue-400', bg: 'bg-blue-400', glow: 'shadow-blue-500/50', icon: Mic2 };
        if (g.includes('afro') || g.includes('niger'))
            return { color: 'text-green-400', bg: 'bg-green-400', glow: 'shadow-green-500/50', icon: Radio };
        if (g.includes('electronic') || g.includes('dance'))
            return { color: 'text-cyan-400', bg: 'bg-cyan-400', glow: 'shadow-cyan-500/50', icon: Zap };
        return { color: 'text-purple-400', bg: 'bg-purple-400', glow: 'shadow-purple-500/50', icon: Music };
    };
    const theme = getTheme();
    const Icon = theme.icon;
    useEffect(() => {
        // Simulate a realistic loading progress curve for an API call
        // Fast start, then slow down, asymptotically approach 95%
        const interval = setInterval(() => {
            setProgress((prev) => {
                // Never auto-complete to 100%, wait for unmount/data
                if (prev >= 95)
                    return 95;
                let increment = 0;
                if (prev < 30)
                    increment = Math.random() * 3 + 1; // Fast start
                else if (prev < 60)
                    increment = Math.random() * 1.5; // Steady middle
                else if (prev < 80)
                    increment = Math.random() * 0.4; // Slowing down
                else
                    increment = Math.random() * 0.1; // Crawl at the end
                return Math.min(prev + increment, 95);
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        // Dynamic messages based on time/progress
        if (progress < 20)
            setLoadingText("Connecting to archives...");
        else if (progress < 40)
            setLoadingText("Analyzing rhythm & lyrics...");
        else if (progress < 60)
            setLoadingText("Tracing cultural roots...");
        else if (progress < 80)
            setLoadingText("Compiling backstory...");
        else if (progress < 90)
            setLoadingText("Mastering the story...");
        else
            setLoadingText("Digging deep into the archives..."); // Message for long waits
    }, [progress]);
    // Configuration for floating background elements
    const floatingElements = [
        { Icon: Guitar, top: '15%', left: '10%', anim: 'animate-float', size: 48, opacity: 0.15 },
        { Icon: Piano, bottom: '20%', right: '15%', anim: 'animate-float-fast', size: 64, opacity: 0.1 },
        { Icon: Drum, top: '25%', right: '10%', anim: 'animate-drift', size: 50, opacity: 0.15 },
        { Icon: Disc, bottom: '15%', left: '20%', anim: 'animate-spin-slow', size: 80, opacity: 0.08 },
        { Icon: Mic2, top: '60%', left: '5%', anim: 'animate-pulse-slow', size: 40, opacity: 0.2 },
        { Icon: Headphones, top: '10%', left: '40%', anim: 'animate-bounce', size: 36, opacity: 0.12 },
        { Icon: Speaker, bottom: '40%', right: '5%', anim: 'animate-pulse', size: 56, opacity: 0.15 },
        { Icon: Radio, top: '75%', left: '80%', anim: 'animate-float', size: 44, opacity: 0.18 },
        { Icon: Music2, top: '40%', left: '60%', anim: 'animate-drift-reverse', size: 32, opacity: 0.1 },
        { Icon: Music4, bottom: '10%', left: '50%', anim: 'animate-float-fast', size: 60, opacity: 0.08 },
        { Icon: Keyboard, top: '85%', left: '15%', anim: 'animate-float', size: 52, opacity: 0.1 },
        { Icon: Waves, top: '50%', right: '40%', anim: 'animate-wave', size: 100, opacity: 0.05 },
        { Icon: Binary, top: '30%', left: '30%', anim: 'animate-pulse', size: 24, opacity: 0.2 },
    ];
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-black text-white", children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: `absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] ${theme.bg} rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse-slow` }), _jsx("div", { className: `absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-white rounded-full mix-blend-overlay filter blur-[120px] opacity-5 animate-float` }), floatingElements.map((el, idx) => (_jsx("div", { className: `absolute text-white ${el.anim}`, style: {
                            top: el.top,
                            left: el.left,
                            right: el.right,
                            bottom: el.bottom,
                            opacity: el.opacity,
                            animationDuration: `${10 + idx * 2}s` // Vary animation speeds
                        }, children: _jsx(el.Icon, { size: el.size }) }, idx))), _jsx("div", { className: "absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" })] }), _jsxs("div", { className: "relative z-10 flex flex-col items-center w-full max-w-md px-8", children: [_jsxs("div", { className: "mb-16 relative group", children: [_jsx("div", { className: `absolute -inset-8 ${theme.bg} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse` }), _jsxs("div", { className: "relative w-32 h-32 flex items-center justify-center", children: [_jsx(Icon, { className: `w-16 h-16 ${theme.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20`, strokeWidth: 1.5 }), _jsx("div", { className: "absolute inset-0 border border-white/20 rounded-full animate-spin-slow shadow-[0_0_20px_rgba(255,255,255,0.1)]" }), _jsx("div", { className: "absolute inset-[-12px] border border-white/10 rounded-full animate-spin-slow", style: { animationDirection: 'reverse', animationDuration: '8s' } }), _jsx("div", { className: "absolute inset-[-24px] border border-white/5 rounded-full animate-spin-slow", style: { animationDuration: '15s' } }), _jsx("div", { className: "absolute inset-0 rounded-full overflow-hidden opacity-30", children: _jsx("div", { className: "w-full h-[200%] bg-gradient-to-b from-transparent via-white/40 to-transparent animate-[scan_3s_linear_infinite]" }) })] })] }), _jsxs("div", { className: "text-center mb-10 h-16 flex flex-col justify-end", children: [_jsx("h2", { className: "font-display text-2xl md:text-4xl font-bold text-white tracking-tight animate-pulse leading-none transition-all duration-300", children: loadingText }), _jsx("p", { className: "text-white/40 font-mono text-xs mt-3 uppercase tracking-[0.3em]", children: "System Processing" })] }), _jsxs("div", { className: "w-full relative", children: [_jsx("div", { className: "w-full h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10", children: _jsx("div", { className: `h-full ${theme.bg} transition-all duration-300 ease-out relative`, style: { width: `${progress}%` }, children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-full -translate-x-full animate-[shimmer_1.5s_infinite]" }) }) }), _jsxs("div", { className: "absolute top-4 transition-all duration-300 font-mono text-xs font-bold text-white/50", style: { left: `calc(${progress}% - 10px)` }, children: [Math.floor(progress), "%"] })] })] })] }));
};
export default Loading;
