import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Search, X, Clock, ChevronRight, Music, Mic2, Disc, Guitar, Radio, Piano, Drum, Music2, Music4, ArrowRight, } from "lucide-react";
import { EntityType } from "../types";
const FloatingIcon = ({ Icon, className, style }) => (_jsx("div", { className: `absolute text-white/5 pointer-events-none ${className}`, style: style, children: _jsx(Icon, {}) }));
const SearchView = ({ query, setQuery, onSearch, onReset, results, onSelectResult, recentSearches, error, }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [imgErrors, setImgErrors] = useState({});
    const hasResults = results.length > 0;
    const handleResultClick = (result) => {
        if (selectedId)
            return; // Prevent double clicks
        setSelectedId(result.id);
        // Wait for the animation to play out before triggering the actual selection logic
        setTimeout(() => {
            onSelectResult(result);
            // Reset after a delay so if we navigate back (unlikely but possible), it's reset
            setTimeout(() => setSelectedId(null), 500);
        }, 500);
    };
    const handleImageError = (id) => {
        setImgErrors((prev) => ({ ...prev, [id]: true }));
    };
    return (_jsxs("div", { className: "flex-1 flex flex-col relative w-full h-full overflow-hidden min-h-screen", children: [_jsxs("div", { className: `absolute inset-0 transition-opacity duration-1000 ${hasResults ? "opacity-20" : "opacity-100"}`, children: [_jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" }), _jsx(FloatingIcon, { Icon: Guitar, className: "top-[15%] left-[10%] w-24 h-24 animate-drift", style: { animationDuration: "25s" } }), _jsx(FloatingIcon, { Icon: Piano, className: "top-[25%] right-[15%] w-32 h-32 animate-drift-reverse", style: { animationDuration: "30s" } }), _jsx(FloatingIcon, { Icon: Disc, className: "bottom-[30%] left-[20%] w-20 h-20 animate-spin-slow opacity-10" }), _jsx(FloatingIcon, { Icon: Mic2, className: "top-[40%] right-[30%] w-16 h-16 animate-float" }), _jsx(FloatingIcon, { Icon: Drum, className: "bottom-[20%] right-[10%] w-24 h-24 animate-drift", style: { animationDuration: "28s" } }), _jsx(FloatingIcon, { Icon: Radio, className: "top-[10%] left-[40%] w-12 h-12 animate-float-fast" }), Array.from({ length: 8 }).map((_, i) => (_jsx(FloatingIcon, { Icon: i % 2 === 0 ? Music2 : Music4, className: "animate-float", style: {
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 20 + 20}px`,
                            height: `${Math.random() * 20 + 20}px`,
                            opacity: 0.05,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 5 + 5}s`,
                        } }, `note-${i}`))), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-40 flex items-end justify-center gap-[2px] opacity-30 pointer-events-none px-4", children: Array.from({ length: 50 }).map((_, i) => {
                            // Generate varied colors for a vibrant vibe
                            const colors = [
                                "bg-indigo-500",
                                "bg-purple-500",
                                "bg-pink-500",
                                "bg-blue-500",
                                "bg-white",
                            ];
                            const color = colors[i % colors.length];
                            return (_jsx("div", { className: `w-1.5 md:w-3 ${color}/40 rounded-t-full animate-wave`, style: {
                                    height: `${Math.random() * 50 + 10}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${Math.random() * 1 + 0.6}s`,
                                } }, `wave-${i}`));
                        }) })] }), _jsxs("div", { className: `relative z-20 flex-1 flex flex-col transition-all duration-700 w-full max-w-5xl mx-auto px-4 sm:px-6 ${hasResults ? "pt-6 pb-20" : "justify-center items-center pb-32"}`, children: [_jsxs("div", { className: `transition-all duration-700 ${hasResults
                            ? "opacity-0 h-0 overflow-hidden"
                            : "opacity-100 mb-10 text-center"}`, children: [_jsx("h1", { className: "font-display text-5xl md:text-8xl font-black tracking-tighter mb-6 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6", children: _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-slate-400 drop-shadow-2xl animate-pulse-slow", children: "SongStory" }) }), _jsx("p", { className: "text-zinc-400 font-sans text-lg md:text-xl max-w-lg mx-auto leading-relaxed", children: "Uncover the deep cuts, the hidden meanings, and the stories that made the music." })] }), _jsxs("div", { className: `w-full transition-all duration-700 z-30 ${hasResults ? "max-w-full" : "max-w-xl"}`, children: [_jsxs("form", { onSubmit: onSearch, className: "relative group", children: [_jsx("div", { className: `absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-50 transition duration-1000 ${hasResults ? "opacity-20" : ""}` }), _jsxs("div", { className: "relative flex items-center", children: [_jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search artist, song, or album...", className: `
                    w-full pl-14 pr-24 rounded-2xl 
                    bg-zinc-900/90 backdrop-blur-xl border border-white/10 
                    text-white placeholder-zinc-500 
                    focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent
                    transition-all font-medium shadow-2xl
                    ${hasResults ? "h-14 text-base" : "h-16 text-lg"}
                  `, autoFocus: !hasResults }), _jsx(Search, { className: "absolute left-5 text-zinc-400 group-focus-within:text-white transition-colors", size: hasResults ? 20 : 24 }), _jsxs("div", { className: "absolute right-3 flex items-center gap-2", children: [query && (_jsx("button", { type: "button", onClick: onReset, className: "p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors", "aria-label": "Clear", children: _jsx(X, { size: 18 }) })), _jsx("button", { type: "submit", className: "p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all group-hover:translate-x-1 active:scale-95", "aria-label": "Search", children: _jsx(ArrowRight, { size: 24, strokeWidth: 2 }) })] })] })] }), _jsx("div", { className: `mt-4 text-center transition-opacity duration-300 ${hasResults ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`, children: _jsx("p", { className: "text-white font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse-slow drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", children: "By: Ghazali" }) })] }), hasResults && (_jsxs("div", { className: "mt-8 pb-12 w-full animate-in slide-in-from-bottom-8 duration-700", children: [_jsxs("div", { className: `flex items-center justify-between mb-4 px-1 transition-opacity duration-300 ${selectedId ? "opacity-0" : "opacity-100"}`, children: [_jsx("h2", { className: "text-xs font-bold uppercase tracking-widest text-zinc-500", children: "Matches Found" }), _jsxs("span", { className: "text-xs font-medium text-zinc-600 bg-white/5 px-2 py-1 rounded-md border border-white/5", children: [results.length, " results"] })] }), _jsx("div", { className: "flex flex-col gap-3", children: results.map((result) => {
                                    const isSelected = selectedId === result.id;
                                    const isOthersSelected = selectedId !== null && !isSelected;
                                    const showImage = result.imageUrl && !imgErrors[result.id];
                                    return (_jsx("div", { onClick: () => handleResultClick(result), className: `
                        group relative w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900/80 cursor-pointer
                        transition-all duration-300 ease-out
                        ${isSelected
                                            ? "scale-[1.02] bg-zinc-800 ring-1 ring-white/30 z-20"
                                            : "hover:bg-zinc-800 hover:border-white/20 hover:shadow-lg"}
                        ${isOthersSelected
                                            ? "opacity-0 scale-95 pointer-events-none"
                                            : "opacity-100"}
                      `, children: _jsxs("div", { className: "flex items-center p-3 sm:p-4 gap-4", children: [_jsx("div", { className: `
                          flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-md flex items-center justify-center overflow-hidden
                          bg-zinc-800 text-white/50 border border-white/5
                          group-hover:bg-white/10 group-hover:text-white transition-colors
                          ${isSelected ? "bg-white/20 text-white" : ""}
                        `, children: showImage ? (_jsx("img", { src: result.imageUrl, alt: result.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110", onError: () => handleImageError(result.id) })) : (_jsxs(_Fragment, { children: [result.type === EntityType.Song && (_jsx(Music, { size: 24 })), result.type === EntityType.Artist && (_jsx(Mic2, { size: 24 })), result.type === EntityType.Album && (_jsx(Disc, { size: 24 }))] })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "flex items-center gap-2 mb-1", children: _jsx("span", { className: `
                                text-[10px] uppercase font-bold tracking-wider px-1.5 rounded border
                                ${isSelected
                                                                    ? "bg-white text-black border-white"
                                                                    : "bg-white/5 text-white/40 border-white/10 group-hover:border-white/20"}
                              `, children: result.type }) }), _jsx("h3", { className: "font-display font-bold text-base sm:text-lg text-white truncate leading-tight group-hover:text-blue-100 transition-colors", children: result.title }), _jsx("p", { className: "text-sm text-zinc-400 truncate", children: result.subtitle })] }), _jsx("div", { className: `
                          text-white/20 group-hover:text-white transition-transform duration-300
                          ${isSelected
                                                        ? "translate-x-1 opacity-0"
                                                        : "group-hover:translate-x-1"}
                        `, children: _jsx(ChevronRight, { size: 20 }) })] }) }, result.id));
                                }) })] })), !hasResults && !query && recentSearches.length > 0 && (_jsxs("div", { className: "mt-16 text-center animate-in fade-in zoom-in duration-1000 delay-300", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6", children: [_jsx(Clock, { size: 12 }), _jsx("span", { children: "Jump Back In" })] }), _jsx("div", { className: "flex flex-wrap justify-center gap-3 max-w-lg mx-auto", children: recentSearches.map((term, index) => (_jsx("button", { onClick: () => {
                                        setQuery(term);
                                        onSearch({ preventDefault: () => { } });
                                    }, className: "px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 transition-all text-zinc-300 text-sm font-medium hover:text-white hover:scale-105 hover:shadow-lg active:scale-95", children: term }, `${term}-${index}`))) })] })), error && (_jsx("div", { className: "mt-8 mx-auto max-w-md w-full p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-xl text-center text-red-200 text-sm animate-in shake font-medium", children: error }))] })] }));
};
export default SearchView;
