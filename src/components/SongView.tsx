import React, { useState, useEffect, useRef } from "react";
import { SongData } from "../types";
import {
  Play,
  Headphones,
  Music,
  Globe,
  BookOpen,
  Award,
  Radio,
  Link as LinkIcon,
  Info,
} from "lucide-react";

interface SongViewProps {
  data: SongData;
  onBack: () => void;
  onArtistClick: (artist: string) => void;
  onSongClick: (title: string, artist: string) => void;
}

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const AppleMusicIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="m10.995 0 .573.001q.241 0 .483.007c.35.01.705.03 1.051.093.352.063.68.166.999.329a3.36 3.36 0 0 1 1.47 1.468c.162.32.265.648.328 1 .063.347.084.7.093 1.051q.007.241.007.483l.001.573v5.99l-.001.573q0 .241-.008.483c-.01.35-.03.704-.092 1.05a3.5 3.5 0 0 1-.33 1 3.36 3.36 0 0 1-1.468 1.468 3.5 3.5 0 0 1-1 .33 7 7 0 0 1-1.05.092q-.241.007-.483.008l-.573.001h-5.99l-.573-.001q-.241 0-.483-.008a7 7 0 0 1-1.052-.092 3.6 3.6 0 0 1-.998-.33 3.36 3.36 0 0 1-1.47-1.468 3.6 3.6 0 0 1-.328-1 7 7 0 0 1-.093-1.05Q.002 11.81 0 11.568V5.005l.001-.573q0-.241.007-.483c.01-.35.03-.704.093-1.05a3.6 3.6 0 0 1 .329-1A3.36 3.36 0 0 1 1.9.431 3.5 3.5 0 0 1 2.896.1 7 7 0 0 1 3.95.008Q4.19.002 4.432 0h.573zm-.107 2.518-4.756.959H6.13a.66.66 0 0 0-.296.133.5.5 0 0 0-.16.31c-.004.027-.01.08-.01.16v5.952c0 .14-.012.275-.106.39-.095.115-.21.15-.347.177l-.31.063c-.393.08-.65.133-.881.223a1.4 1.4 0 0 0-.519.333 1.25 1.25 0 0 0-.332.995c.031.297.166.582.395.792.156.142.35.25.578.296.236.047.49.031.858-.043.196-.04.38-.102.555-.205a1.4 1.4 0 0 0 .438-.405 1.5 1.5 0 0 0 .233-.55c.042-.202.052-.386.052-.588V6.347c0-.276.08-.35.302-.404.024-.005 3.954-.797 4.138-.833.257-.049.378.025.378.294v3.524c0 .14-.001.28-.096.396-.094.115-.211.15-.348.178l-.31.062c-.393.08-.649.133-.88.223a1.4 1.4 0 0 0-.52.334 1.26 1.26 0 0 0-.34.994c.03.297.174.582.404.792a1.2 1.2 0 0 0 .578.296c.236.047.49.031.858-.043.196-.04.38-.102.555-.205a1.4 1.4 0 0 0 .438-.405 1.5 1.5 0 0 0 .233-.55c.042-.202.052-.386.052-.588V6.347c0-.276.08-.35.302-.404.024-.005 3.954-.797 4.138-.833.257-.049.378.025.378.294v3.524c0 .14-.001.28-.096.396-.094.115-.211.15-.348.178l-.31.062c-.393.08-.649.133-.88.223a1.4 1.4 0 0 0-.52.334 1.26 1.26 0 0 0-.34.994" />
  </svg>
);

const SECTIONS = [
  { id: "overview",  label: "Overview",  icon: Info      },
  { id: "story",     label: "Story",     icon: BookOpen  },
  { id: "themes",    label: "Themes",    icon: Globe     },
  { id: "studio",    label: "Studio",    icon: Headphones},
  { id: "legacy",    label: "Legacy",    icon: Award     },
];

const RevealOnScroll: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = "", delay = 0,
}) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ElementType; label: string; color?: string }> = ({
  icon: Icon, label, color = "text-white",
}) => (
  <div className="flex items-center gap-3 mb-8">
    <Icon size={18} className={`${color} opacity-70`} />
    <span className={`text-xs font-bold uppercase tracking-[0.2em] ${color} opacity-60`}>{label}</span>
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

const SongView: React.FC<SongViewProps> = ({ data, onBack, onArtistClick, onSongClick }) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [scrollY, setScrollY]             = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [imgError, setImgError]           = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min((y / docH) * 100, 100) : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const themeColor   = data.themeColor || "#6366f1";
  const versions     = data.versions     || [];
  const relatedSongs = data.relatedSongs || [];
  const trivia       = data.trivia       || [];
  const sources      = data.sources      || [];

  const spotifyLink    = `https://open.spotify.com/search/${encodeURIComponent(data.title + " " + data.artist)}`;
  const appleMusicLink = `https://music.apple.com/us/search?term=${encodeURIComponent(data.title + " " + data.artist)}`;

  return (
    <div className="pb-32 min-h-screen">

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-white/[0.06] relative">
        <div className="overflow-x-auto no-scrollbar flex items-center gap-1 px-4 py-2">
          <button
            onClick={onBack}
            className="flex-shrink-0 w-8 h-8 mr-3 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${
                activeSection === s.id
                  ? "bg-white/15 text-white"
                  : "text-white/35 hover:text-white/65"
              }`}
            >
              <s.icon size={10} />
              {s.label}
            </button>
          ))}
        </div>
        {/* Reading-progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
          <div
            className="h-full transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%`, background: themeColor, boxShadow: `0 0 8px ${themeColor}80` }}
          />
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        {data.imageUrl && !imgError ? (
          <div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url(${data.imageUrl})`,
              transform: `translateY(${scrollY * 0.35}px) scale(1.08)`,
              transition: "transform 0.1s linear",
            }}
          >
            <img src={data.imageUrl} className="hidden" onError={() => setImgError(true)} alt="" />
          </div>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeColor}40, #000)` }}
          >
            <Music size={100} className="text-white/10" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 md:px-10 md:pb-10 z-10">
          <RevealOnScroll className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
              style={{ color: themeColor, borderColor: `${themeColor}50`, background: `${themeColor}18` }}
            >
              {data.genre}
            </span>
            <span className="text-white/40 text-xs">{data.year}</span>
            {data.mood && (
              <span className="text-white/40 text-xs italic">· {data.mood}</span>
            )}
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <h1 className="text-4xl md:text-7xl font-black leading-[1.05] text-white mb-3 tracking-tight">
              {data.title}
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={160}>
            <p className="text-lg md:text-xl text-white/60 font-light mb-6">
              by{" "}
              <button
                onClick={() => onArtistClick(data.artist)}
                className="text-white/80 hover:text-white font-medium transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
              >
                {data.artist}
              </button>
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={220} className="flex gap-3">
            <a
              href={spotifyLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black text-sm font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-95"
            >
              <SpotifyIcon /> Spotify
            </a>
            <a
              href={appleMusicLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-black text-sm font-bold rounded-lg transition-all hover:scale-[1.03] active:scale-95"
            >
              <AppleMusicIcon /> Apple Music
            </a>
          </RevealOnScroll>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 space-y-20">

        {/* Overview */}
        <RevealOnScroll>
          <section id="overview" className="scroll-mt-24">
            <SectionHeader icon={Info} label="Overview" />

            {/* Hook */}
            <blockquote
              className="border-l-[3px] pl-5 mb-10 italic text-xl md:text-2xl text-white/85 leading-relaxed font-light"
              style={{ borderColor: themeColor }}
            >
              {data.hook}
            </blockquote>

            {/* Quick-facts grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
              {[
                { label: "Released",  value: data.quickFacts?.releaseDate },
                { label: "Album",     value: data.quickFacts?.album || "Single" },
                { label: "Length",    value: data.quickFacts?.length },
                { label: "Writers",   value: data.quickFacts?.writers },
                { label: "Producers", value: data.quickFacts?.producers },
                { label: "Label",     value: data.quickFacts?.label },
              ].map(({ label, value }) => value ? (
                <div key={label} className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-5 py-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/35 font-semibold mb-1">{label}</div>
                  <div className="text-sm font-semibold text-white/80 leading-snug">{value}</div>
                </div>
              ) : null)}
            </div>
          </section>
        </RevealOnScroll>

        {/* Story */}
        <RevealOnScroll>
          <section id="story" className="scroll-mt-24">
            <SectionHeader icon={BookOpen} label="Origin Story" />
            <div className="space-y-5 text-[17px] leading-[1.8] text-white/70 font-light">
              {data.backstory.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        </RevealOnScroll>

        {/* Themes */}
        <RevealOnScroll>
          <section id="themes" className="scroll-mt-24">
            <SectionHeader icon={Globe} label="Meaning & Themes" color="text-violet-300" />
            <div
              className="rounded-2xl p-7 md:p-9 border border-white/[0.06] space-y-4"
              style={{ background: `linear-gradient(135deg, ${themeColor}12, transparent)` }}
            >
              {data.meaningAndThemes.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i} className="text-[17px] leading-[1.8] text-white/75 font-light">{para}</p>
              ))}
            </div>
          </section>
        </RevealOnScroll>

        {/* Studio */}
        <RevealOnScroll>
          <section id="studio" className="scroll-mt-24">
            <SectionHeader icon={Headphones} label="In the Studio" color="text-emerald-300" />

            <div className="space-y-5 text-[17px] leading-[1.8] text-white/70 font-light mb-8">
              {data.recordingNotes.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {data.artistCommentary && (
              <figure className="rounded-2xl bg-white/[0.04] border border-white/[0.07] px-7 py-6 md:px-9 md:py-8 relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                  style={{ background: themeColor }}
                />
                <figcaption className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">
                  Artist Commentary
                </figcaption>
                <blockquote className="font-light italic text-xl md:text-2xl text-white/80 leading-relaxed">
                  "{data.artistCommentary}"
                </blockquote>
              </figure>
            )}
          </section>
        </RevealOnScroll>

        {/* Legacy */}
        <RevealOnScroll>
          <section id="legacy" className="scroll-mt-24">
            <SectionHeader icon={Award} label="Cultural Legacy" color="text-amber-300" />

            <div className="space-y-5 text-[17px] leading-[1.8] text-white/70 font-light mb-12">
              {data.culturalImpact.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {(versions.length > 0 || relatedSongs.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {versions.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
                    <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/35 font-bold mb-5">
                      <Radio size={12} /> Versions & Covers
                    </h4>
                    <ul className="space-y-3">
                      {versions.slice(0, 4).map((v, i) => (
                        <li key={i} className="flex items-center justify-between gap-3">
                          <button
                            onClick={() => onSongClick(data.title, v.artist)}
                            className="text-sm font-semibold text-white/75 hover:text-white transition-colors text-left truncate"
                          >
                            {v.artist}
                          </button>
                          <span className="text-[11px] text-white/30 whitespace-nowrap shrink-0">
                            {v.type} · {v.year}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {relatedSongs.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
                    <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/35 font-bold mb-5">
                      <Music size={12} /> You Might Also Like
                    </h4>
                    <ul className="space-y-3">
                      {relatedSongs.slice(0, 4).map((s, i) => (
                        <li key={i}>
                          <button
                            onClick={() => onSongClick(s.title, s.artist)}
                            className="flex items-center gap-3 group w-full text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                              <Play size={10} fill="currentColor" className="text-white/50 group-hover:text-white transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white/75 group-hover:text-white transition-colors truncate">{s.title}</div>
                              <div className="text-[11px] text-white/35">{s.artist}</div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </RevealOnScroll>

        {/* Trivia */}
        {trivia.length > 0 && (
          <RevealOnScroll>
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-7 py-8 md:px-9">
              <h3 className="text-[10px] uppercase tracking-[0.22em] text-white/30 font-bold mb-7">Did You Know?</h3>
              <ul className="space-y-5">
                {trivia.map((fact, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-white/20" style={{ background: themeColor, opacity: 0.7 }} />
                    <span className="text-[15px] leading-relaxed text-white/60">{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          </RevealOnScroll>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="pt-6 border-t border-white/[0.06] flex flex-wrap gap-2">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-white/35 hover:text-white/60 transition-colors"
              >
                <LinkIcon size={9} /> {src.title}
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SongView;
