// components/Home.js
import { useState, useEffect } from 'react';
import {
  Search, Play, Heart, Star, Film, Music, Newspaper, Tv, Zap, Trophy,
  ChevronRight, Clock, TrendingUp, Flame, Eye, Share2, Bookmark,
  Volume2, PlayCircle, ArrowRight, Loader2, Sparkles, Brain, 
  Image as ImageIcon, Bot, Cpu, Code, Wand2, Calendar, DollarSign
} from 'lucide-react';

export default function Home({ setActiveCategory }) {
  /* ─────────── state ─────────── */
  const [greeting, setGreeting] = useState('');
  const [now, setNow] = useState(new Date());
  const [movies, setMovies] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ─────────── effects ─────────── */
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try { 
      await Promise.all([getMovies(), getNews()]); 
    } finally { 
      setLoading(false); 
    }
  };

  const getMovies = async () => {
    const key = process.env.NEXT_PUBLIC_TMDB_KEY ?? 'd20da4614eefb21107f726bae23e6994';
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=1`);
    const data = await res.json();
    setMovies(data.results?.slice(0, 6) ?? []);
  };

  const getNews = async () => {
    const key = process.env.NEXT_PUBLIC_NEWS_KEY ?? '1238cc84e5c748aaa00cda1d60a877e0';
    const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=general&pageSize=5&apiKey=${key}`);
    const data = await res.json();
    setNews(data.articles?.slice(0, 4) ?? []);
  };

  /* ─────────── static data ─────────── */
  const quickActions = [
    { id: 'ai', title: 'AI Chat', icon: Brain, grad: 'from-purple-500/80 to-pink-600/80', badge: '🤖', isNew: true },
    { id: 'movies', title: 'Movies', icon: Film, grad: 'from-red-500/80 to-pink-600/80', badge: '🎬' },
    { id: 'music', title: 'Music', icon: Music, grad: 'from-green-500/80 to-emerald-600/80', badge: '🎵' },
    { id: 'news', title: 'News', icon: Newspaper, grad: 'from-blue-500/80 to-cyan-600/80', badge: '📰' },
    { id: 'budget', title: 'Budget', icon: DollarSign, grad: 'from-yellow-500/80 to-orange-600/80', badge: '💰' },
    { id: 'notes', title: 'Notes', icon: Calendar, grad: 'from-indigo-500/80 to-blue-600/80', badge: '📝' }
  ];

  const aiModels = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: Brain, color: 'green' },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', icon: Sparkles, color: 'orange' },
    { id: 'grok-4', name: 'Grok 4', provider: 'xAI', icon: Zap, color: 'cyan' },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', icon: ImageIcon, color: 'purple' }
  ];

  const quickPrompts = [
    { text: "Write Python code", icon: Code, model: 'gpt-4o', color: 'blue' },
    { text: "Generate image", icon: ImageIcon, model: 'dall-e-3', color: 'purple', isImage: true },
    { text: "Explain AI concepts", icon: Sparkles, model: 'claude-sonnet-4', color: 'orange' },
    { text: "Plan business strategy", icon: Brain, model: 'gpt-4o', color: 'green' }
  ];

  const trendingMusic = [
    { title: 'Anti-Hero', artist: 'Taylor Swift', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', plays: '2.1B', duration: '3:20' },
    { title: 'Flowers', artist: 'Miley Cyrus', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', plays: '1.8B', duration: '3:37' },
    { title: 'Unholy', artist: 'Sam Smith', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop', plays: '1.5B', duration: '2:56' }
  ];

  /* ─────────── loading placeholder ─────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <span className="text-sm">Loading your AI-powered hub…</span>
        </div>
      </div>
    );
  }

  /* ─────────── handle AI prompt selection ─────────── */
  const launchAIWithPrompt = (prompt) => {
    localStorage.setItem('quickPrompt', JSON.stringify(prompt));
    setActiveCategory('ai');
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white
                    pt-safe-top pb-safe-bottom">

      {/* ── AI Spotlight Hero Banner ── */}
      <section className="mx-3 mb-6 mt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/50 via-purple-600/50 to-pink-600/50 
                        border border-white/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
          
          <div className="relative p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-lg font-black mb-1 flex items-center gap-2">
                  <Sparkles className="text-yellow-300 animate-pulse" size={20} />
                  AI Playground
                  <span className="px-1.5 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded-full">FREE</span>
                </h2>
                <p className="text-xs text-gray-300 leading-tight">
                  GPT-5 • Claude • Grok • DALL-E 3 • 200+ models
                </p>
              </div>
              
              <button
                onClick={() => setActiveCategory('ai')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold text-sm
                         border border-white/20 backdrop-blur-sm transition-all duration-200
                         hover:scale-105 flex items-center gap-1.5">
                <Bot size={16} />
                Chat
              </button>
            </div>

            {/* Quick AI Prompts */}
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => launchAIWithPrompt(prompt)}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-black/40 border border-white/20 
                             hover:bg-black/50 transition-all text-left group hover:scale-105">
                    <Icon size={14} className={`text-${prompt.color}-400 group-hover:animate-bounce flex-shrink-0`} />
                    <span className="text-xs font-medium truncate">{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Header ── */}
      <header className="px-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight">
              {greeting}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5 leading-tight">Ready to explore? Your AI assistant is standing by.</p>
            <p className="text-gray-500 text-xs mt-1">
              {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button className="p-2.5 bg-white/10 rounded-full backdrop-blur-xl hover:bg-white/20 border border-white/15 flex-shrink-0">
            <Search size={18} />
          </button>
        </div>
      </header>

      {/* ── AI Models Explorer ── */}
      <section className="px-4 mb-8">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Brain size={20} className="text-green-400" />
          Popular AI Models
        </h2>
        <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {aiModels.map((model) => {
            const Icon = model.icon;
            return (
              <button
                key={model.id}
                onClick={() => launchAIWithPrompt({ prompt: '', model: model.id })}
                className="shrink-0 snap-start flex items-center gap-2.5 p-3 rounded-xl 
                         bg-white/10 border border-white/20 hover:bg-white/15 transition-all
                         min-w-[160px] group hover:scale-105">
                <Icon size={18} className={`text-${model.color}-400 flex-shrink-0`} />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm truncate">{model.name}</div>
                  <div className="text-xs text-gray-400 truncate">{model.provider}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Enhanced Quick Actions ── */}
      <section className="px-4 mb-8">
        <h2 className="text-lg font-bold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => setActiveCategory(action.id)}
                className={`relative group flex flex-col items-center justify-center h-24 rounded-2xl
                          border border-white/20 bg-gradient-to-br ${action.grad} backdrop-blur-xl
                          overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200`}>
                
                <Icon size={20} className="mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-sm">{action.title}</span>
                
                {/* Badge */}
                <span className="absolute top-2 right-2 text-base">{action.badge}</span>
                
                {/* New indicator */}
                {action.isNew && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white 
                                 text-[10px] font-bold rounded-full animate-pulse">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Trending Movies ── */}
      <section className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Film size={20} className="text-red-500" />
            Trending Movies
          </h2>
          <button
            onClick={() => setActiveCategory('movies')}
            className="text-red-400 border border-red-500/30 bg-red-500/20
                     px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-500/30 transition-colors">
            View All <ArrowRight size={12} className="inline ml-1" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {movies.map((movie, idx) => (
            <div key={movie.id} className="w-28 shrink-0 snap-start group">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                {/* // eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  src={movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : 'https://images.unsplash.com/photo-1489599510068-3ba4c8d8d39b?w=300&h=450&fit=crop'}
                  alt={movie.title}
                  className="h-40 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent
                               opacity-0 group-hover:opacity-100 transition" />
                <span className="absolute top-1.5 right-1.5 bg-black/70 text-white text-xs px-1 py-0.5 rounded
                                flex items-center gap-0.5">
                  <Star size={8} className="text-yellow-400" />
                  {movie.vote_average?.toFixed(1)}
                </span>
                {idx < 3 && (
                  <span className="absolute top-1.5 left-1.5 bg-red-500 text-xs font-bold px-1 py-0.5 rounded
                                  flex items-center gap-0.5">
                    #{idx + 1}
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-xs font-medium leading-tight line-clamp-2">{movie.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── Top Music ── */}
      <section className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Music size={20} className="text-green-500" />
            Top Charts
          </h2>
          <button
            onClick={() => setActiveCategory('music')}
            className="text-green-400 border border-green-500/30 bg-green-500/20
                     px-3 py-1.5 rounded-full text-xs font-medium hover:bg-green-500/30 transition-colors">
            View All <ArrowRight size={12} className="inline ml-1" />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
          {trendingMusic.map((track, i) => (
            <div key={i}
                 className="flex items-center p-3 border-b border-white/10 last:border-b-0
                           hover:bg-white/5 transition-colors group">
              <div className="w-6 text-center mr-3">
                <span className={`text-sm font-bold ${i < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {i + 1}
                </span>
              </div>

              <div className="relative mr-3">
                <img
                  loading="lazy"
                  src={track.image}
                  alt={track.title}
                  className="w-10 h-10 object-cover rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0
                               group-hover:opacity-100 transition flex items-center justify-center">
                  <PlayCircle size={16} className="text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm group-hover:text-green-400 transition truncate">
                  {track.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">{track.artist}</p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold">{track.plays}</p>
                <p className="text-xs text-gray-400">{track.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Breaking News ── */}
      <section className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Newspaper size={20} className="text-blue-500" />
            Breaking News
          </h2>
          <button
            onClick={() => setActiveCategory('news')}
            className="text-blue-400 border border-blue-500/30 bg-blue-500/20
                     px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-500/30 transition-colors">
            All News <ArrowRight size={12} className="inline ml-1" />
          </button>
        </div>

        <div className="space-y-3">
          {news.slice(0, 3).map((article, i) => (
            <div key={i}
                 className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20
                           hover:bg-white/15 transition-colors group">
              <div className="flex">
                <div className="w-20 h-20 shrink-0">
                  <img
                    loading="lazy"
                    src={article.urlToImage ??
                         'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-500 to-purple-500 text-white truncate max-w-20">
                      {article.source?.name ?? 'News'}
                    </span>
                    <span className="flex items-center gap-0.5 text-gray-400 flex-shrink-0">
                      <Clock size={8} />
                      {new Date(article.publishedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-400 transition line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">3 min read</span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 flex items-center hover:text-blue-300 flex-shrink-0">
                      Read <ChevronRight size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
