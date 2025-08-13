import React, { useState, useEffect } from 'react';
import {
  Home, Search, Film, TrendingUp, Newspaper, Brain, 
  DollarSign, StickyNote, HardDrive, Trophy, User, 
  Gamepad2, X, Send, Loader2, Bot, CheckCircle, Copy,
  MessageCircle, ArrowRight, Zap, Globe, Target, Star, Clock, Play,
  Flame
} from 'lucide-react';

export default function Navigation({ active, setActive }) {
  const [isHomeExpanded, setIsHomeExpanded] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAISearch, setShowAISearch] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sample trending data
  const trendingMovies = [
    'The Matrix Resurrections',
    'Spider-Man: No Way Home',
    'Dune: Part Two',
    'Avatar: The Way of Water'
  ];

  const trendingNews = [
    'AI Revolution 2025',
    'Space Exploration Update',
    'Tech Giants Merger',
    'Climate Change Solutions'
  ];

  const trendingAI = [
    'How to use ChatGPT effectively?',
    'What is machine learning?',
    'Explain quantum computing',
    'Best AI tools for productivity'
  ];

  // Sample data for search
  const [movies] = useState([
    { id: 1, title: 'The Matrix', type: 'movie', rating: 8.7 },
    { id: 2, title: 'Inception', type: 'movie', rating: 8.8 },
    { id: 3, title: 'Interstellar', type: 'movie', rating: 8.6 },
  ]);
  
  const [news] = useState([
    { id: 1, title: 'AI Revolution in 2025', type: 'news', source: 'TechCrunch' },
    { id: 2, title: 'Space Exploration Update', type: 'news', source: 'NASA' },
  ]);

  const apps = [
    { id: 'home', label: 'Home', icon: Home, color: 'blue' },
    { id: 'ai', label: 'AI Assistant', icon: Brain, color: 'purple' },
    { id: 'movies', label: 'Movies', icon: Film, color: 'red' },
    { id: 'news', label: 'News', icon: Newspaper, color: 'cyan' },
    { id: 'notes', label: 'Notes', icon: StickyNote, color: 'amber' },
    { id: 'drives', label: 'Cloud', icon: HardDrive, color: 'gray' },
    { id: 'sports', label: 'Sports', icon: Trophy, color: 'orange' },
    { id: 'games', label: 'Games', icon: Gamepad2, color: 'pink' },
    { id: 'profile', label: 'Profile', icon: User, color: 'indigo' },
  ];

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-panel')) {
        setIsHomeExpanded(false);
        setIsSearchExpanded(false);
      }
    };

    if (isHomeExpanded || isSearchExpanded) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isHomeExpanded, isSearchExpanded]);

  // Enhanced search function
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowAISearch(false);
      return;
    }

    // Search through local content
    const movieResults = movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    ).map(movie => ({ ...movie, category: 'Entertainment' }));
    
    const newsResults = news.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase())
    ).map(article => ({ ...article, category: 'Information' }));

    const appResults = apps.filter(app => 
      app.label.toLowerCase().includes(query.toLowerCase())
    ).map(app => ({ ...app, type: 'app', category: 'Application' }));

    const allResults = [...appResults, ...movieResults, ...newsResults];
    setSearchResults(allResults);

    // Determine if AI search should be shown
    const needsAI = allResults.length === 0 || 
                    query.includes('?') || 
                    ['what', 'how', 'why', 'when', 'where', 'explain', 'tell me', 'calculate'].some(word => 
                      query.toLowerCase().includes(word)
                    );

    setShowAISearch(needsAI);
  };

  // AI search function - FIXED SYNTAX ERROR
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    
    setAiLoading(true);
    setAiResponse('');

    try {
      if (typeof window !== 'undefined' && window.puter?.ai) {
        let fullResponse = '';
        const response = await window.puter.ai.chat(
          `Please provide a helpful answer to: "${searchQuery}". Keep it concise but informative.`,
          { model: 'openrouter:openai/gpt-4o', stream: true }
        );

        // FIXED: Changed "the chunk" to "const chunk"
        for await (const chunk of response) {
          if (chunk?.text) {
            fullResponse += chunk.text;
            setAiResponse(fullResponse);
          }
        }
      } else {
        setAiResponse(`I'd love to help with "${searchQuery}", but AI services are loading. Try the AI Assistant app for full capabilities.`);
      }
    } catch (error) {
      console.error('AI Search Error:', error);
      setAiResponse(`Sorry, I couldn't process that query. Visit the AI Assistant for advanced capabilities.`);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleTrendingClick = (item, type) => {
    if (type === 'ai') {
      setSearchQuery(item);
      handleSearch(item);
    } else if (type === 'movie') {
      setSearchQuery(item);
      handleSearch(item);
    } else if (type === 'news') {
      setSearchQuery(item);
      handleSearch(item);
    }
  };

  return (
    <>
      {/* Backdrop with iOS-style blur */}
      {(isHomeExpanded || isSearchExpanded) && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-all duration-300"
          style={{ backdropFilter: 'blur(20px)' }}
        />
      )}

      {/* Home Panel - Full Glassmorphic iOS Style */}
      {isHomeExpanded && (
        <div className="nav-panel fixed bottom-24 left-4 right-4 z-50">
          <div 
            className="bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
            style={{ backdropFilter: 'blur(40px)' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Navigation</h3>
                <button
                  onClick={() => setIsHomeExpanded(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} className="text-white/60" />
                </button>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {apps.map((app) => {
                  const Icon = app.icon;
                  const isActive = active === app.id;
                  
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        setActive(app.id);
                        setIsHomeExpanded(false);
                      }}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-500/20 border border-blue-500/30 scale-105' 
                          : 'hover:bg-white/10 active:scale-95'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        isActive 
                          ? `bg-gradient-to-br from-${app.color}-500 to-${app.color}-600` 
                          : 'bg-white/20'
                      }`}
                        style={{ backdropFilter: 'blur(10px)' }}
                      >
                        <Icon 
                          size={20} 
                          className={`${isActive ? 'text-white' : `text-${app.color}-400`} transition-colors`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                        {app.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Curved attachment to center */}
            <div 
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-white/10 rounded-b-full border-l border-r border-b border-white/20"
              style={{ backdropFilter: 'blur(40px)' }}
            ></div>
          </div>
        </div>
      )}

      {/* Search Panel with Trending Suggestions */}
      {isSearchExpanded && (
        <div className="nav-panel fixed bottom-24 left-4 right-4 z-50">
          <div 
            className="bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
            style={{ backdropFilter: 'blur(40px)' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Search size={20} className="text-purple-400" />
                  Smart Search
                </h3>
                <button
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setAiResponse('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} className="text-white/60" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search apps, movies, news or ask AI..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/25 transition-all duration-200"
                  style={{ backdropFilter: 'blur(20px)' }}
                  autoFocus
                />
              </div>

              {/* Trending Suggestions - Show when no search query */}
              {!searchQuery && (
                <div className="mb-6 space-y-6">
                  {/* Trending Movies */}
                  <div>
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <Film size={14} className="text-red-400" />
                      Trending Movies
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {trendingMovies.map((movie, i) => (
                        <button
                          key={i}
                          onClick={() => handleTrendingClick(movie, 'movie')}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-left group"
                        >
                          <Play size={14} className="text-red-400" />
                          <span className="text-white/90 text-sm group-hover:text-red-300 transition-colors">
                            {movie}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending News */}
                  <div>
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <Flame size={14} className="text-orange-400" />
                      Trending News
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {trendingNews.map((newsItem, i) => (
                        <button
                          key={i}
                          onClick={() => handleTrendingClick(newsItem, 'news')}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-left group"
                        >
                          <Clock size={14} className="text-blue-400" />
                          <span className="text-white/90 text-sm group-hover:text-blue-300 transition-colors">
                            {newsItem}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending AI Questions */}
                  <div>
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <Brain size={14} className="text-purple-400" />
                      Popular AI Questions
                    </h4>
                    <div className="space-y-2">
                      {trendingAI.map((aiItem, i) => (
                        <button
                          key={i}
                          onClick={() => handleTrendingClick(aiItem, 'ai')}
                          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-left group"
                        >
                          <Zap size={14} className="text-purple-400" />
                          <span className="text-white/90 text-sm group-hover:text-purple-300 transition-colors">
                            {aiItem}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                    <Target size={14} />
                    Found Results
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => {
                      const IconComponent = result.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (result.type === 'app') {
                              setActive(result.id);
                            } else if (result.type === 'movie') {
                              setActive('movies');
                            } else if (result.type === 'news') {
                              setActive('news');
                            }
                            setIsSearchExpanded(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-left group"
                        >
                          <div 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                              result.type === 'app' 
                                ? `bg-gradient-to-br from-${result.color}-500 to-${result.color}-600`
                                : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            }`}
                          >
                            {result.type === 'movie' && <Film size={18} className="text-white" />}
                            {result.type === 'news' && <Newspaper size={18} className="text-white" />}
                            {result.type === 'app' && IconComponent && <IconComponent size={18} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium group-hover:text-purple-300 transition-colors">
                              {result.title || result.label}
                            </p>
                            <p className="text-white/60 text-sm">
                              {result.category} {result.rating && `• ⭐ ${result.rating}`} {result.source && `• ${result.source}`}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Search Section */}
              {showAISearch && (
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Brain size={14} className="text-purple-400" />
                      AI Assistant
                    </h4>
                    {!aiResponse && (
                      <button
                        onClick={handleAISearch}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-xl text-sm font-medium transition-all duration-200"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <Zap size={14} />
                            Ask AI
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {aiLoading && (
                    <div 
                      className="flex items-center gap-3 p-4 bg-purple-500/20 rounded-xl border border-purple-500/30"
                      style={{ backdropFilter: 'blur(20px)' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-purple-400" />
                          <span className="text-purple-300 font-medium">AI is processing...</span>
                        </div>
                        <p className="text-purple-200/60 text-sm mt-1">Query: &ldquo;{searchQuery}&ldquo;</p>
                      </div>
                    </div>
                  )}

                  {aiResponse && (
                    <div className="space-y-4">
                      <div 
                        className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30"
                        style={{ backdropFilter: 'blur(20px)' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white/90 text-sm leading-relaxed">
                              {aiResponse}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyToClipboard(aiResponse)}
                          className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition-colors"
                          style={{ backdropFilter: 'blur(10px)' }}
                        >
                          {copied ? (
                            <>
                              <CheckCircle size={14} className="text-green-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setActive('ai');
                            setIsSearchExpanded(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-sm font-medium transition-all duration-200"
                        >
                          <MessageCircle size={14} />
                          Continue in AI Chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No results message */}
              {searchQuery && searchResults.length === 0 && !showAISearch && (
                <div className="text-center py-8">
                  <div className="text-white/40 mb-2">No results found</div>
                  <p className="text-white/60 text-sm">Try searching for apps, movies, or ask a question</p>
                </div>
              )}
            </div>
            
            {/* Curved attachment to center */}
            <div 
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-white/10 rounded-b-full border-l border-r border-b border-white/20"
              style={{ backdropFilter: 'blur(40px)' }}
            ></div>
          </div>
        </div>
      )}

      {/* iOS-Style Pure Glassmorphic Navigation Bar - Only Icons */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-4">
          <div 
            className="bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
            style={{ backdropFilter: 'blur(40px)' }}
          >
            <div className="flex h-16">
              {/* Home Button - Takes Half Space */}
              <button
                onClick={() => {
                  setIsHomeExpanded(!isHomeExpanded);
                  setIsSearchExpanded(false);
                }}
                className={`nav-panel flex-1 h-full flex items-center justify-center transition-all duration-300 rounded-l-3xl ${
                  isHomeExpanded || active === 'home'
                    ? 'bg-blue-500/30 border-r border-blue-500/40 text-blue-300'
                    : 'text-white/80 hover:bg-white/10 border-r border-white/20'
                }`}
              >
                <Home size={28} className="transition-colors" strokeWidth={2.5} />
              </button>

              {/* Search Button - Takes Half Space */}
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  setIsHomeExpanded(false);
                }}
                className={`nav-panel flex-1 h-full flex items-center justify-center transition-all duration-300 rounded-r-3xl ${
                  isSearchExpanded
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Search size={28} className="transition-colors" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}