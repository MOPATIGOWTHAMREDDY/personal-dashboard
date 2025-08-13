import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search, Play, Heart, Star, Film, Newspaper, TrendingUp,
  ChevronRight, Clock, Flame, Eye, Share2, Bookmark, Bell, Calendar,
  ArrowRight, Loader2, Sparkles, Brain, Zap, Bot,
  Cloud, Sun, CloudRain, X, Mic, Palette, Globe, Code,
  MessageCircle, Send, User, CheckCircle, Copy, Target, Settings
} from 'lucide-react';

const THEMES = {
  minimal: {
    name: 'Minimal Dark',
    bg: 'bg-black',
    cardBg: 'bg-white/5',
    cardBorder: 'border-white/10',
    cardHover: 'hover:bg-white/10',
    text: 'text-white',
    textMuted: 'text-white/60',
    accent: 'text-blue-400',
    gradient: 'from-blue-500 to-purple-600'
  },
  glassmorphic: {
    name: 'Glassmorphic',
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900',
    cardBg: 'bg-white/10 backdrop-blur-xl',
    cardBorder: 'border-white/20',
    cardHover: 'hover:bg-white/15',
    text: 'text-white',
    textMuted: 'text-white/70',
    accent: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-600'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    bg: 'bg-gradient-to-br from-black via-cyan-900/10 to-black',
    cardBg: 'bg-cyan-500/5 border-cyan-500/20',
    cardBorder: 'border-cyan-500/30',
    cardHover: 'hover:bg-cyan-500/10 hover:border-cyan-400/40',
    text: 'text-cyan-100',
    textMuted: 'text-cyan-300/70',
    accent: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600'
  },
  nature: {
    name: 'Nature',
    bg: 'bg-gradient-to-br from-green-900 via-emerald-800/30 to-green-900',
    cardBg: 'bg-green-500/10 backdrop-blur-sm',
    cardBorder: 'border-green-500/20',
    cardHover: 'hover:bg-green-500/15',
    text: 'text-green-50',
    textMuted: 'text-green-200/70',
    accent: 'text-emerald-400',
    gradient: 'from-green-500 to-emerald-600'
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-gradient-to-br from-orange-900 via-red-800/20 to-purple-900',
    cardBg: 'bg-orange-500/10 backdrop-blur-sm',
    cardBorder: 'border-orange-500/20',
    cardHover: 'hover:bg-orange-500/15',
    text: 'text-orange-50',
    textMuted: 'text-orange-200/70',
    accent: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600'
  },
  ocean: {
    name: 'Ocean Depth',
    bg: 'bg-gradient-to-br from-blue-900 via-indigo-800/40 to-purple-900',
    cardBg: 'bg-blue-500/10 backdrop-blur-xl',
    cardBorder: 'border-blue-500/30',
    cardHover: 'hover:bg-blue-500/15',
    text: 'text-blue-50',
    textMuted: 'text-blue-200/70',
    accent: 'text-blue-400',
    gradient: 'from-blue-500 to-indigo-600'
  },
  aurora: {
    name: 'Aurora Borealis',
    bg: 'bg-gradient-to-br from-purple-900 via-pink-800/30 to-indigo-900',
    cardBg: 'bg-purple-500/10 backdrop-blur-xl',
    cardBorder: 'border-purple-500/30',
    cardHover: 'hover:bg-purple-500/15',
    text: 'text-purple-50',
    textMuted: 'text-purple-200/70',
    accent: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-600'
  },
  midnight: {
    name: 'Midnight Eclipse',
    bg: 'bg-gradient-to-br from-gray-900 via-slate-800/50 to-black',
    cardBg: 'bg-white/5 backdrop-blur-xl',
    cardBorder: 'border-white/10',
    cardHover: 'hover:bg-white/10',
    text: 'text-gray-50',
    textMuted: 'text-gray-300/70',
    accent: 'text-gray-400',
    gradient: 'from-gray-500 to-slate-600'
  }
};

export default function Home({ setActiveCategory, initialMovies = [], initialNews = [] }) {
  const [currentTheme, setCurrentTheme] = useState('glassmorphic');
  const [now, setNow] = useState(new Date('2025-08-13T19:15:04Z'));// Using current UTC time
  const [movies, setMovies] = useState(initialMovies);
  const [news, setNews] = useState(initialNews);
  const [loading, setLoading] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const theme = THEMES[currentTheme];

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute instead of every second
    
    // Only fetch if no initial data
    if (initialMovies.length === 0 && initialNews.length === 0) {
      fetchAll();
    }
    
    return () => clearInterval(timer);
  }, [initialMovies.length, initialNews.length]);

  const fetchAll = async () => {
    if (loading) return;
    
    setLoading(true);
    try { 
      await Promise.all([getMovies(), getNews()]); 
    } finally { 
      setLoading(false); 
    }
  };

  const getMovies = async () => {
    if (movies.length > 0) return;
    
    const key = process.env.NEXT_PUBLIC_TMDB_KEY ?? 'd20da4614eefb21107f726bae23e6994';
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=1`);
      const data = await res.json();
      setMovies(data.results?.slice(0, 8) ?? []);
    } catch (error) {
      console.error('Movies fetch error:', error);
      setMovies([]);
    }
  };

  const getNews = async () => {
    if (news.length > 0) return;
    
    const key = process.env.NEXT_PUBLIC_NEWS_KEY ?? '1238cc84e5c748aaa00cda1d60a877e0';
    try {
      const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=general&pageSize=6&apiKey=${key}`);
      const data = await res.json();
      setNews(data.articles?.slice(0, 6) ?? []); // Get more news for grid
    } catch (error) {
      console.error('News fetch error:', error);
      setNews([]);
    }
  };

  if (loading && movies.length === 0 && news.length === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className={`w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin`}></div>
          </div>
          <div className="text-center">
            <h3 className={`text-2xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent mb-2`}>
              Loading Dashboard
            </h3>
            <p className={`${theme.textMuted} text-sm`}>Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} relative overflow-hidden`}>
      
      {/* Theme Selector */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={`p-3 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl ${theme.cardHover} transition-all duration-200 shadow-lg`}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <Palette size={20} className={theme.accent} />
          </button>
          
          {showThemeSelector && (
            <div 
              className={`absolute top-16 right-0 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl shadow-2xl p-4 w-72`}
              style={{ backdropFilter: 'blur(30px)' }}
            >
              <h3 className={`${theme.text} font-semibold mb-3`}>Choose Theme</h3>
              <div className="space-y-2">
                {Object.entries(THEMES).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentTheme(key);
                      setShowThemeSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      currentTheme === key 
                        ? `bg-gradient-to-r ${themeOption.gradient} text-white` 
                        : `${theme.cardHover} ${theme.text}`
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeOption.gradient}`}></div>
                    <span className="font-medium">{themeOption.name}</span>
                    {currentTheme === key && <CheckCircle size={16} className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed height container to prevent infinite scroll */}
      <div className="h-screen overflow-y-auto pb-32 pt-6">

        {/* Content Cards - Only AI, Movies, News */}
        <section className="px-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* AI Assistant */}
            <button
              onClick={() => setActiveCategory('ai')}
              className={`md:col-span-2 group p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-3xl 
                        ${theme.cardHover} transition-all duration-300 hover:scale-[1.02] shadow-lg`}
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg`}>
                  <Brain size={28} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-xl font-bold ${theme.text} group-hover:${theme.accent} transition-colors mb-2`}>
                    AI Assistant
                  </h3>
                  <p className={`${theme.textMuted} text-sm mb-3`}>
                    Chat with advanced AI models including GPT-4, Claude, and more
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-xs font-medium">Online • 100+ Models</span>
                  </div>
                </div>
                <ArrowRight size={20} className={`${theme.textMuted} group-hover:${theme.text} group-hover:translate-x-1 transition-all`} />
              </div>
            </button>

            {/* News with quick preview */}
            <button
              onClick={() => setActiveCategory('news')}
              className={`group p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-3xl 
                        ${theme.cardHover} transition-all duration-300 hover:scale-[1.02] shadow-lg`}
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="text-center mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg w-fit mx-auto mb-3`}>
                  <Newspaper size={20} className="text-white" />
                </div>
                <h3 className={`text-lg font-bold ${theme.text} group-hover:${theme.accent} transition-colors mb-1`}>
                  Latest News
                </h3>
                <div className="flex items-center justify-center gap-1">
                  <Flame size={10} className="text-red-400" />
                  <span className="text-red-300 text-xs font-medium">LIVE</span>
                </div>
              </div>

              {/* News preview grid inside the card */}
              <div className="grid grid-cols-2 gap-2">
                {news.slice(0, 4).map((article, i) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden relative">
                    <Image
                      src={article.urlToImage || 
                           `https://via.placeholder.com/200x120/1f2937/ffffff?text=${encodeURIComponent(article.source?.name || 'News')}`}
                      alt={article.title}
                      width={100}
                      height={60}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end"
                      style={{ backdropFilter: 'blur(1px)' }}
                    >
                      <p className="text-white text-xs font-medium p-2 leading-tight line-clamp-2">
                        {article.title.slice(0, 40)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </button>
          </div>
        </section>

        {/* Movies Section with Quick Preview */}
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-2xl font-bold ${theme.text} flex items-center gap-3`}>
              <Film size={24} className={theme.accent} />
              Trending Movies
            </h2>
            <button
              onClick={() => setActiveCategory('movies')}
              className={`flex items-center gap-2 px-4 py-2 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl 
                        ${theme.cardHover} transition-all duration-200 shadow-lg`}
              style={{ backdropFilter: 'blur(20px)' }}
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Movie Grid Preview */}
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {movies.slice(0, 8).map((movie, idx) => (
              <div 
                key={movie.id} 
                className="group cursor-pointer"
                onClick={() => setActiveCategory('movies')}
              >
                <div 
                  className={`aspect-[2/3] rounded-xl overflow-hidden ${theme.cardBg} ${theme.cardBorder} border shadow-lg relative`}
                  style={{ backdropFilter: 'blur(20px)' }}
                >
                  <Image
                    src={movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : `https://via.placeholder.com/200x300/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}`}
                    alt={movie.title}
                    width={150}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play size={20} className="text-white" fill="currentColor" />
                  </div>
                  <div 
                    className="absolute top-2 right-2 bg-black/80 rounded-lg px-2 py-1"
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400 fill-current" />
                      <span className="text-white text-xs font-bold">
                        {movie.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* More News in Grid Format */}
        <section className="px-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-2xl font-bold ${theme.text} flex items-center gap-3`}>
              <Newspaper size={24} className={theme.accent} />
              More Stories
            </h2>
            <button
              onClick={() => setActiveCategory('news')}
              className={`flex items-center gap-2 px-4 py-2 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl 
                        ${theme.cardHover} transition-all duration-200 shadow-lg`}
              style={{ backdropFilter: 'blur(20px)' }}
            >
              Read More
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.slice(0, 6).map((article, i) => (
              <article
                key={i}
                className={`group p-4 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl
                          ${theme.cardHover} transition-all duration-300 hover:scale-[1.02] 
                          cursor-pointer shadow-lg`}
                onClick={() => setActiveCategory('news')}
                style={{ backdropFilter: 'blur(20px)' }}
              >
                <div className="aspect-video rounded-xl overflow-hidden mb-3 relative">
                  <Image
                    src={article.urlToImage || 
                         `https://via.placeholder.com/400x200/1f2937/ffffff?text=${encodeURIComponent(article.source?.name || 'News')}`}
                    alt={article.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div 
                    className="absolute top-2 left-2 px-3 py-1 bg-black/80 rounded-lg"
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {article.source?.name || 'Breaking'}
                    </span>
                  </div>
                </div>

                <h3 className={`font-bold text-sm mb-2 group-hover:${theme.accent} transition-colors 
                              leading-tight ${theme.text} line-clamp-2`}>
                  {article.title}
                </h3>
                
                <div className="flex justify-between items-center">
                  <div className={`flex items-center gap-2 text-xs ${theme.textMuted}`}>
                    <Clock size={10} />
                    {new Date(article.publishedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <ArrowRight size={12} className={`${theme.textMuted} group-hover:${theme.text} group-hover:translate-x-1 transition-all`} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}