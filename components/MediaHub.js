import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Heart, Bookmark, Clock, Star, Play, X,
  Grid3X3, List, ChevronRight, Film, Tv, Gamepad2,
  TrendingUp, Monitor, AlertTriangle, Sparkles
} from 'lucide-react';

import VideoPlayerModal from './VideoPlayerModal';
import ContentGrid from './content/ContentGrid';
import ContentDetails from './content/ContentDetails';
import { useContent } from '../hooks/useContent';
import { videoSources } from '../utils/videoSources';
import { CONTENT_TYPES } from '../utils/constants';
import { useEpisodeAlerts } from '../hooks/useEpisodeAlerts';

// Small, self-contained top-right toggle that always shows
function AppToggle({ showClassicDashboard = false, onToggleView }) {
  const handleClick = () => {
    if (typeof onToggleView === 'function') {
      onToggleView(!showClassicDashboard);
      return;
    }
    try {
      const next = !showClassicDashboard;
      localStorage.setItem('cinema_view_pref', next ? 'classic' : 'cinema');
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <div className="fixed mt-20 right-4 z-[60]" style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}>
      <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-2">
        <button
          onClick={handleClick}
          className={`p-3 rounded-xl transition-all duration-300 ${
            showClassicDashboard
              ? 'bg-white/20 text-white'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
          }`}
          title={showClassicDashboard ? 'Switch to CinemaStream' : 'Switch to Classic Dashboard'}
          type="button"
        >
          {showClassicDashboard ? (
            <div className="flex items-center space-x-2">
              <Sparkles size={20} />
              <span className="hidden sm:inline text-sm font-medium">Cinema</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Monitor size={20} />
              <span className="hidden sm:inline text-sm font-medium">Classic</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

const MediaHub = ({ showClassicDashboard = false, onToggleView }) => {
  // Core state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('cinemastream_viewmode') || 'grid'; } catch { return 'grid'; }
  });
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentDetails, setShowContentDetails] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New UI preferences
  const [sortBy, setSortBy] = useState(() => {
    try { return localStorage.getItem('cinemastream_sortby') || 'trending'; } catch { return 'trending'; }
  });
  const [minRating, setMinRating] = useState(() => {
    try { return Number(localStorage.getItem('cinemastream_minrating') || 0); } catch { return 0; }
  });

  // User data state
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);

  // Content hook
  const {
    content,
    isLoading,
    error,
    contentType,
    changeContentType,
    searchContent,
    loadMore,
    hasMore
  } = useContent();

  // Initialize client-side data
  useEffect(() => {
    setMounted(true);

    try {
      const savedFavorites = localStorage.getItem('cinemastream_favorites');
      const savedWatchlist = localStorage.getItem('cinemastream_watchlist');
      const savedContinue = localStorage.getItem('cinemastream_continue');

      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
      if (savedContinue) setContinueWatching(JSON.parse(savedContinue));
    } catch (e) {
      console.warn('Failed to load user data from localStorage');
    }
  }, []);

  // Persist prefs
  useEffect(() => {
    try { localStorage.setItem('cinemastream_viewmode', viewMode); } catch {}
  }, [viewMode]);
  useEffect(() => {
    try { localStorage.setItem('cinemastream_sortby', sortBy); } catch {}
  }, [sortBy]);
  useEffect(() => {
    try { localStorage.setItem('cinemastream_minrating', String(minRating)); } catch {}
  }, [minRating]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Run search
  useEffect(() => {
    if (!mounted) return;
    if (debouncedSearch) {
      searchContent(debouncedSearch, contentType);
      setActiveTab('browse');
    }
  }, [debouncedSearch, contentType, mounted, searchContent]);

  // Episode alerts (NEW EPISODES)
  const { alerts, totalNew } = useEpisodeAlerts(continueWatching);

  // User actions
  const addToContinueWatching = (content, progress = 0, season = null, episode = null) => {
    if (!mounted) return;

    setContinueWatching(prev => {
      const existingIndex = prev.findIndex(item => item.id === content.id);
      const newItem = {
        ...content,
        progress,
        season,
        episode,
        timestamp: Date.now(),
        lastWatched: new Date().toISOString()
      };

      let newContinue;
      if (existingIndex !== -1) {
        newContinue = [...prev];
        newContinue[existingIndex] = newItem;
      } else {
        newContinue = [newItem, ...prev].slice(0, 20);
      }

      try { localStorage.setItem('cinemastream_continue', JSON.stringify(newContinue)); } catch {}
      return newContinue;
    });
  };

  const removeContinueWatching = (contentId) => {
    setContinueWatching(prev => {
      const newContinue = prev.filter(item => item.id !== contentId);
      try { localStorage.setItem('cinemastream_continue', JSON.stringify(newContinue)); } catch {}
      return newContinue;
    });
  };

  const toggleFavorite = (contentId) => {
    if (!mounted) return;
    setFavorites(prev => {
      const next = prev.includes(contentId) ? prev.filter(id => id !== contentId) : [...prev, contentId];
      try { localStorage.setItem('cinemastream_favorites', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleWatchlist = (contentId) => {
    if (!mounted) return;
    setWatchlist(prev => {
      const next = prev.includes(contentId) ? prev.filter(id => id !== contentId) : [...prev, contentId];
      try { localStorage.setItem('cinemastream_watchlist', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Handlers
  const handlePlay = (content, season = null, episode = null) => {
    setSelectedContent(content);
    setShowVideoPlayer(true);
    addToContinueWatching(content, 0, season, episode);
  };
  const handleShowDetails = (content) => {
    setSelectedContent(content);
    setShowContentDetails(true);
  };
  const handleSearchChange = (query) => setSearchTerm(query);

  // Recommendations (SMART)
  const recommended = useMemo(() => {
    const seed = [...favorites, ...watchlist, ...continueWatching.map((c) => c.id)];
    const seedSet = new Set(seed);
    const seedItems = content.filter((c) => seedSet.has(c.id));
    const genreScore = new Map();
    const typeBias = contentType;

    seedItems.forEach((item, idx) => {
      const weight = 1 + (seedItems.length - idx) * 0.1;
      const genres = item.genre_ids || item.genres?.map((g) => g.id) || [];
      genres.forEach((g) => genreScore.set(g, (genreScore.get(g) || 0) + weight));
    });

    const scored = content
      .filter((item) => !seedSet.has(item.id))
      .map((item) => {
        const genres = item.genre_ids || item.genres?.map((g) => g.id) || [];
        const gScore = genres.reduce((sum, g) => sum + (genreScore.get(g) || 0), 0);
        const pop = item.popularity || 0;
        const vote = item.vote_average || 0;
        const typeBoost =
          (typeBias === CONTENT_TYPES.TV && item.first_air_date ? 1.1 : 1) *
          (typeBias === CONTENT_TYPES.MOVIE && item.release_date ? 1.1 : 1);
        const score = gScore * 1.5 + pop * 0.7 + vote * 1.2;
        return { item, score: score * typeBoost };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 18)
      .map((x) => x.item);

    return scored;
  }, [content, favorites, watchlist, continueWatching, contentType]);

  // Active tab filtering + sorting
  const displayContent = useMemo(() => {
    let base = content;

    if (activeTab === 'favorites') {
      base = base.filter((item) => favorites.includes(item.id));
    } else if (activeTab === 'watchlist') {
      base = base.filter((item) => watchlist.includes(item.id));
    } else if (activeTab === 'continue') {
      return [...continueWatching].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    if (minRating > 0) {
      base = base.filter((item) => (item.vote_average || 0) >= minRating);
    }

    const sorted = [...base];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const ad = a.release_date || a.first_air_date || '1900-01-01';
          const bd = b.release_date || b.first_air_date || '1900-01-01';
          return new Date(bd) - new Date(ad);
        });
        break;
      case 'alpha':
        sorted.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
        break;
      default:
        sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
    return sorted;
  }, [content, favorites, watchlist, continueWatching, activeTab, sortBy, minRating]);

  // Safe area padding
  const safeTop = { paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' };
  const safeBottom = { paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' };
  const safeSides = {
    paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
    paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)',
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ ...safeTop, ...safeBottom, ...safeSides }}>
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500/30 border-b-purple-500 rounded-full animate-spin animation-delay-1000 m-2"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">🎬 CinemaStream</h2>
          <p className="text-gray-400 text-sm sm:text-base">Loading your entertainment hub...</p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs sm:text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400">All {videoSources.length} sources ready</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ ...safeTop, ...safeBottom, ...safeSides }}>
      {/* Always show the top-right toggle */}
      <AppToggle showClassicDashboard={showClassicDashboard} onToggleView={onToggleView} />

      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-2xl" style={safeTop}>
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          

          {/* Search + Controls */}
          <div className="relative mb-3 sm:mb-4 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <div className="relative bg-gray-800/70 backdrop-blur-xl rounded-lg sm:rounded-xl border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder={`🔍 Search from ${videoSources.length} premium sources...`}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-20 sm:pr-28 py-3 sm:py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDebouncedSearch(searchTerm.trim());
                    setActiveTab('browse');
                  }
                }}
                aria-label="Search content"
              />
              {/* Right side controls in search bar */}
              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-white bg-gray-700/50 px-2 py-1 rounded-md text-xs"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
                <div className="hidden sm:flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-700/60 border border-gray-600/60 text-gray-200 rounded-md text-xs px-2 py-1"
                    aria-label="Sort by"
                    title="Sort by"
                  >
                    <option value="trending">Trending</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest</option>
                    <option value="alpha">A → Z</option>
                  </select>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="bg-gray-700/60 border border-gray-600/60 text-gray-200 rounded-md text-xs px-2 py-1"
                    aria-label="Min rating"
                    title="Minimum Rating"
                  >
                    <option value={0}>All</option>
                    <option value={6}>6.0+</option>
                    <option value={7}>7.0+</option>
                    <option value={8}>8.0+</option>
                  </select>
                </div>
              </div>
              {/* Helper text */}
              {/* <div className="absolute right-3 sm:right-4 bottom-[-1.6rem] text-[11px] sm:text-xs text-gray-500">
                {debouncedSearch ? `${content.length} results` : 'Movies, TV, Anime...'}
              </div> */}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <div className="text-lg font-bold text-red-400">{favorites.length}</div>
                  <div className="text-xs text-gray-400">Favorites</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                  <div className="text-lg font-bold text-blue-400">{watchlist.length}</div>
                  <div className="text-xs text-gray-400">Watchlist</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 relative">
                  <div className="text-lg font-bold text-green-400">{continueWatching.length}</div>
                  <div className="text-xs text-gray-400">Continue</div>
                  {totalNew > 0 && (
                    <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                      {totalNew} new
                    </div>
                  )}
                </div>
              </div>

              {activeTab === 'browse' && (
                <div className="flex space-x-2">
                  {[
                    { type: CONTENT_TYPES.MOVIE, icon: Film, label: 'Movies' },
                    { type: CONTENT_TYPES.TV, icon: Tv, label: 'TV Shows' },
                    { type: CONTENT_TYPES.ANIME, icon: Gamepad2, label: 'Anime' }
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => {
                        changeContentType(type);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex-1 flex flex-col items-center space-y-1 p-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                        contentType === type
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="col-span-2 bg-gray-700/60 border border-gray-600/60 text-gray-200 rounded-md text-xs px-2 py-2"
                >
                  <option value="trending">Trending</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                  <option value="alpha">A → Z</option>
                </select>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="bg-gray-700/60 border border-gray-600/60 text-gray-200 rounded-md text-xs px-2 py-2"
                >
                  <option value={0}>All</option>
                  <option value={6}>6.0+</option>
                  <option value={7}>7.0+</option>
                  <option value={8}>8.0+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between mt-3">
            <div className="flex items-center space-x-1 bg-gray-800/70 backdrop-blur-sm rounded-xl p-1 border border-gray-700/50">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'browse'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Search size={14} />
                <span>Browse</span>
              </button>

              <button
                onClick={() => setActiveTab('continue')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'continue'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Clock size={14} />
                <span>Continue</span>
                {continueWatching.length > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {continueWatching.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('watchlist')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'watchlist'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Bookmark size={14} />
                <span>Watchlist</span>
                {watchlist.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {watchlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'favorites'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Heart size={14} />
                <span>Favorites</span>
                {favorites.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex bg-gray-800/70 backdrop-blur-sm rounded-xl p-1 border border-gray-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 lg:p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 lg:p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        <div style={safeBottom} />
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-6">
        {/* Continue Watching Section */}
        {activeTab !== 'continue' && continueWatching.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Clock size={14} className="sm:hidden text-white" />
                  <Clock size={18} className="hidden sm:block text-white" />
                </div>
                <span>Continue Watching</span>
                <div className="bg-green-500/20 text-green-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {continueWatching.length} items
                </div>
                {totalNew > 0 && (
                  <div className="bg-emerald-600/20 text-emerald-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {totalNew} new episodes
                  </div>
                )}
              </h2>
              <button
                onClick={() => setActiveTab('continue')}
                className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium flex items-center space-x-1 bg-blue-500/10 px-3 sm:px-4 py-2 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {continueWatching.slice(0, 8).map((item) => (
                <ContinueWatchingCard
                  key={item.id}
                  item={item}
                  alerts={alerts}
                  onPlay={handlePlay}
                  onRemove={removeContinueWatching}
                />
              ))}
            </div>
          </section>
        )}

        {/* Smart Recommendations Section */}
        {recommended.length > 0 && (
          <section className="mb-6 sm:mb-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Star size={16} className="text-white" />
                </div>
                <span>Recommended for you</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {recommended.map((item) => (
                <div key={item.id} className="group bg-gray-900/60 border border-gray-800/60 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all">
                  <button
                    onClick={() => handleShowDetails(item)}
                    className="w-full text-left"
                    title={item.title || item.name}
                  >
                    <div className="aspect-[16/9] bg-gray-800">
                      {item.backdrop_path || item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                      )}
                    </div>
                    <div className="p-2 sm:p-3">
                      <div className="text-xs text-gray-400 mb-1">
                        {(item.release_date || item.first_air_date || '').slice(0, 4)} • {item.vote_average?.toFixed(1) || '—'}
                      </div>
                      <div className="text-sm font-semibold line-clamp-2">{item.title || item.name}</div>
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlay(item);
                          }}
                          className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg"
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={16} />
              </div>
              <div>
                <h3 className="text-red-300 font-semibold text-sm sm:text-lg">Connection Error</h3>
                <p className="text-red-200/80 text-sm">{error}</p>
                <p className="text-red-200/60 text-xs mt-1">Please check your internet connection and try again.</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <ContentGrid
          content={displayContent}
          contentType={contentType}
          isLoading={isLoading}
          hasMore={hasMore}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onLoadMore={loadMore}
          onPlay={handlePlay}
          onToggleWatchlist={toggleWatchlist}
          onShowDetails={handleShowDetails}
          watchlist={watchlist}
          watched={[]}
        />
      </main>

      {/* Content Details Modal */}
      <ContentDetails
        content={selectedContent}
        contentType={contentType}
        isOpen={showContentDetails}
        onClose={() => {
          setShowContentDetails(false);
          setSelectedContent(null);
        }}
        onPlay={handlePlay}
        onToggleWatchlist={toggleWatchlist}
        isInWatchlist={selectedContent ? watchlist.includes(selectedContent.id) : false}
        videoSources={videoSources}
      />

      {/* Player Modal */}
      <VideoPlayerModal
        content={selectedContent}
        contentType={contentType}
        isOpen={showVideoPlayer}
        onClose={() => {
          setShowVideoPlayer(false);
          setSelectedContent(null);
        }}
      />

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800/50 px-4 sm:px-6 py-8 sm:py-12 mt-12 sm:mt-20" style={safeBottom}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Film className="text-white" size={16} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CinemaStream
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4 text-sm sm:text-base">
                Ultimate streaming with premium sources, built by @rishimopati.
              </p>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-green-400 font-medium">Live & Updated Daily</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
                <Star className="text-yellow-400" size={14} />
                <span>Features</span>
              </h4>
              <ul className="text-gray-400 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li>• {videoSources.length} Streaming Sources</li>
                <li>• {videoSources.filter(s => s.featured).length} Ad-Free Sources</li>
                <li>• 4K/HD Quality Available</li>
                <li>• Mobile & Desktop Ready</li>
                <li>• Personal Collections</li>
                <li>• Smart Recommendations</li>
                <li>• New Episode Alerts</li>
                <li>• Auto Next Episode</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
                <Monitor className="text-blue-400" size={14} />
                <span>Top Sources</span>
              </h4>
              <ul className="text-gray-400 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                {videoSources.filter(s => s.featured).slice(0, 4).map(source => (
                  <li key={source.key} className="flex items-center space-x-2">
                    <span className="text-yellow-400">⭐</span>
                    <span>{source.name}</span>
                    <span className="text-green-400 text-xs font-bold">HD</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
                <TrendingUp className="text-green-400" size={14} />
                <span>Your Stats</span>
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400">❤️ Favorites:</span>
                  <span className="text-red-400 font-bold">{favorites.length}</span>
                </li>
                <li className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400">📚 Watchlist:</span>
                  <span className="text-blue-400 font-bold">{watchlist.length}</span>
                </li>
                <li className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400">⏰ Continue:</span>
                  <span className="text-green-400 font-bold">{continueWatching.length}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-500">
            <p className="mb-2 text-sm sm:text-lg">© {new Date().getFullYear()} CinemaStream • Built with ❤️ by
              <span className="text-blue-400 font-semibold"> @rishimopati</span>
            </p>
            <p className="text-xs sm:text-sm">
              Powered by TMDB API • {videoSources.length} Premium Sources • Updated: {new Date().toISOString().slice(0,10)}
            </p>
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-4 text-xs text-gray-600 flex-wrap">
              <span>🎬 Movies</span>
              <span>📺 TV Shows</span>
              <span>🎌 Anime</span>
              <span>⚡ Instant Stream</span>
              <span>🔄 Auto-Switch</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Continue Watching Card with New Episode badge support
const ContinueWatchingCard = ({ item, onPlay, onRemove, alerts = {} }) => {
  const title = item.title || item.name;
  const progressPercentage = Math.min((item.progress || Math.random() * 0.7 + 0.1) * 100, 95);

  const hasNew = alerts[item.id]?.hasNew;
  const nextMeta = alerts[item.id]?.next;

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(item, item.season, item.episode);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.id);
  };

  return (
    <div className="relative flex-shrink-0 w-72 sm:w-96 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden group border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:scale-105 shadow-xl">
      {hasNew && (
        <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
          NEW EP{nextMeta ? ` • S${nextMeta.season}E${nextMeta.episode}` : ''}
        </div>
      )}

      <div className="flex">
        <div className="w-28 h-20 sm:w-36 sm:h-24 relative flex-shrink-0">
          {item.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w400${item.backdrop_path}`}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <Film size={20} className="text-gray-400" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-gray-600/50">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <button
            onClick={handlePlay}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10"
            type="button"
            aria-label="Play"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/90 rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play size={18} className="text-white ml-1" fill="currentColor" />
            </div>
          </button>
        </div>

        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">{title}</h3>
            <p className="text-gray-400 text-xs mb-1 sm:mb-2">
              {item.season && item.episode ? `S${item.season} E${item.episode}` : 'Movie'}
              {' • '}
              {Math.round(progressPercentage)}% watched
            </p>
            {hasNew && nextMeta && (
              <p className="text-emerald-300 text-[11px]">Next: S{nextMeta.season}E{nextMeta.episode}{nextMeta.air_date ? ` • ${nextMeta.air_date}` : ''}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs">
              {new Date(item.lastWatched || Date.now()).toLocaleDateString()}
            </p>
            <button
              onClick={handleRemove}
              className="p-1.5 bg-black/40 hover:bg-red-500/80 rounded-full transition-all duration-300 backdrop-blur-sm"
              type="button"
              aria-label="Remove from Continue Watching"
              title="Remove"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaHub;