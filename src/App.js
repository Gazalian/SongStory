import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Layout from "./components/Layout"; // Changed from '../components/Layout'
import Loading from "./components/Loading"; // Changed from '../components/Loading'
import SongView from "./components/SongView"; // Changed from '../components/SongView'
import ArtistView from "./components/ArtistView"; // Changed from '../components/ArtistView'
import AlbumView from "./components/AlbumView"; // Changed from '../components/AlbumView'
import IntroView from "./components/IntroView"; // Changed from '../components/IntroView'
import SearchView from "./components/SearchView"; // Changed from '../components/SearchView'
import { searchMusic, getSongStory, getArtistStory, getAlbumStory, } from "./services/geminiService";
import { EntityType, } from "./types";
const App = () => {
    const [showIntro, setShowIntro] = useState(true);
    const [query, setQuery] = useState("");
    const [viewState, setViewState] = useState("search");
    const [searchResults, setSearchResults] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [loadingGenre, setLoadingGenre] = useState("pop");
    const [error, setError] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);
    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem("songstory_recent_searches");
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            }
            catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);
    const addToRecentSearches = (term) => {
        const normalizedTerm = term.trim();
        if (!normalizedTerm)
            return;
        setRecentSearches((prev) => {
            // Remove duplicates (case-insensitive check but keep original casing) and add new to top
            const filtered = prev.filter((item) => item.toLowerCase() !== normalizedTerm.toLowerCase());
            const newRecent = [normalizedTerm, ...filtered].slice(0, 8); // Keep top 8
            localStorage.setItem("songstory_recent_searches", JSON.stringify(newRecent));
            return newRecent;
        });
    };
    // Derived state for passing to Layout
    const currentGenre = currentData && "genre" in currentData ? currentData.genre : loadingGenre;
    const currentThemeColor = currentData && "themeColor" in currentData
        ? currentData.themeColor
        : undefined;
    const performSearch = async (searchTerm) => {
        if (!searchTerm.trim())
            return;
        setQuery(searchTerm); // Update UI input
        addToRecentSearches(searchTerm);
        setViewState("loading");
        setLoadingGenre("pop"); // Default
        setError(null);
        try {
            // Add timeout race condition (Increased to 45 seconds to avoid premature timeouts)
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 45000));
            const results = (await Promise.race([
                searchMusic(searchTerm),
                timeoutPromise,
            ]));
            if (!results || results.length === 0) {
                // AI couldn't find/verify matches
                setError("We couldn't find any music matching that. Try a different spelling or artist.");
                setViewState("search");
                setSearchResults([]);
            }
            else {
                setSearchResults(results);
                setViewState("search"); // Stay on search but show results
            }
        }
        catch (err) {
            console.error(err);
            setError("The archives are taking too long to respond. Please check your connection and try again.");
            setViewState("search");
        }
    };
    const handleEnterApp = (searchTerm) => {
        setShowIntro(false);
        if (searchTerm) {
            performSearch(searchTerm);
        }
    };
    const handleSearchForm = async (e) => {
        e.preventDefault();
        performSearch(query);
    };
    const handleSelectResult = async (result) => {
        setViewState("loading");
        // Try to guess genre for loading screen based on subtitle or simple heuristic if possible, otherwise default
        setLoadingGenre(result.type === EntityType.Song ? "pop" : "rock");
        try {
            // Add timeout race condition (Increased to 60 seconds for detailed story verification)
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 60000));
            let fetchPromise;
            if (result.type === EntityType.Song) {
                fetchPromise = getSongStory(result.title, result.subtitle);
            }
            else if (result.type === EntityType.Artist) {
                fetchPromise = getArtistStory(result.title);
            }
            else if (result.type === EntityType.Album) {
                fetchPromise = getAlbumStory(result.title, result.subtitle);
            }
            else {
                throw new Error("Unknown type");
            }
            const data = await Promise.race([fetchPromise, timeoutPromise]);
            if (data) {
                setCurrentData(data);
                setViewState(result.type);
            }
            else {
                // AI returned null due to verification check
                throw new Error("Data not verified");
            }
        }
        catch (err) {
            console.error(err);
            setError("We couldn't verify the story for that one in time. It might be too new or obscure. Try again?");
            setViewState("search");
        }
    };
    const resetSearch = () => {
        setQuery("");
        setSearchResults([]);
        setViewState("search");
        setCurrentData(null);
    };
    const handleArtistClick = (artistName) => {
        performSearch(artistName);
    };
    const handleSongClick = (title, artist) => {
        performSearch(`${title} ${artist}`);
    };
    const renderContent = () => {
        if (viewState === "loading") {
            return _jsx(Loading, { genre: loadingGenre });
        }
        if (viewState === "song" && currentData) {
            return (_jsx("div", { className: "max-w-2xl mx-auto w-full", children: _jsx(SongView, { data: currentData, onBack: () => setViewState("search"), onArtistClick: handleArtistClick, onSongClick: handleSongClick }) }));
        }
        if (viewState === "artist" && currentData) {
            return (_jsx("div", { className: "max-w-2xl mx-auto w-full", children: _jsx(ArtistView, { data: currentData, onBack: () => setViewState("search"), onSongClick: handleSongClick }) }));
        }
        if (viewState === "album" && currentData) {
            return (_jsx("div", { className: "max-w-2xl mx-auto w-full", children: _jsx(AlbumView, { data: currentData, onBack: () => setViewState("search"), onArtistClick: handleArtistClick, onSongClick: handleSongClick }) }));
        }
        // Default: Search View
        return (_jsx(SearchView, { query: query, setQuery: setQuery, onSearch: handleSearchForm, onReset: resetSearch, results: searchResults, onSelectResult: handleSelectResult, recentSearches: recentSearches, error: error }));
    };
    if (showIntro) {
        return _jsx(IntroView, { onEnter: handleEnterApp });
    }
    return (_jsx(Layout, { themeColor: currentThemeColor, genre: currentGenre, children: renderContent() }));
};
export default App;
