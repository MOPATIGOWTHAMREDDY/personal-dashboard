// components/Home.js
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search, Play, Heart, Star, Film, Music, Newspaper, TrendingUp, Trophy,
  ChevronRight, Clock, Flame, Eye, Share2, Bookmark,
  Volume2, PlayCircle, ArrowRight, Loader2, Calendar, DollarSign
} from 'lucide-react';

export default function Home({ setActiveCategory }) {
  const [greeting, setGreeting] = useState('');
  const [now, setNow] = useState(new Date());
  const [movies, setMovies] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=1`);
      const data = await res.json();
      setMovies(data.results?.slice(0, 6) ?? []);
    } catch (error) {
      console.error('Movies fetch error:', error);
      setMovies([]);
    }
  };

  const getNews = async () => {
    const key = process.env.NEXT_PUBLIC_NEWS_KEY ?? '1238cc84e5c748aaa00cda1d60a877e0';
    try {
      const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=general&pageSize=5&apiKey=${key}`);
      const data = await res.json();
      setNews(data.articles?.slice(0, 4) ?? []);
    } catch (error) {
      console.error('News fetch error:', error);
      setNews([]);
    }
  };

  const quickActions = [
    { id: 'ai', title: 'AI Chat', icon: '🤖', grad: 'from-purple-600 to-pink-600' },
    { id: 'movies', title: 'Movies', icon: '🎬', grad: 'from-red-600 to-pink-600' },
    { id: 'music', title: 'Music', icon: '🎵', grad: 'from-green-600 to-emerald-600' },
    { id: 'news', title: 'News', icon: '📰', grad: 'from-blue-600 to-cyan-600' },
    { id: 'stocks', title: 'Stocks', icon: '📈', grad: 'from-yellow-600 to-amber-600' },
    { id: 'budget', title: 'Budget', icon: '💰', grad: 'from-indigo-600 to-purple-600' }
  ];

  const trendingMusic = [
    { title: 'Anti-Hero', artist: 'Taylor Swift', image: 'https://via.placeholder.com/100x100/ff69b4/ffffff?text=AS', plays: '2.1B', duration: '3:20' },
    { title: 'Flowers', artist: 'Miley Cyrus', image: 'https://via.placeholder.com/100x100/9932cc/ffffff?text=MC', plays: '1.8B', duration: '3:37' },
    { title: 'Unholy', artist: 'Sam Smith', image: 'https://via.placeholder.com/100x100/00bcd4/ffffff?text=SS', plays: '1.5B', duration: '2:56' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <span className="text-sm">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      <div className="w-full max-w-full mx-auto overflow-x-hidden">
        {/* Header */}
        <header className="px-4 py-6 pt-12">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight">
                {greeting}
              </h1>
              <p className="text-gray-400 text-sm mt-1 leading-tight">Welcome back to your dashboard</p>
              <p className="text-gray-500 text-xs mt-1">
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button className="p-3 bg-white/10 backdrop-blur-lg rounded-full shadow-lg hover:shadow-xl border border-white/20 transition-all">
              <Search size={20} className="text-gray-300" />
            </button>
          </div>
        </header>

        {/* Quick Actions */}
        <section className="px-4 mb-8">
          <h2 className="text-lg font-bold mb-4 text-white">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveCategory(action.id)}
                className={`relative group flex flex-col items-center justify-center h-24 rounded-2xl
                          border border-white/20 bg-gradient-to-br ${action.grad} text-white shadow-lg
                          overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-xl`}>
                <span className="text-2xl mb-1">{action.icon}</span>
                <span className="font-semibold text-sm">{action.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending Movies */}
        <section className="px-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Film size={20} className="text-red-500" />
              Trending Movies
            </h2>
            <button
              onClick={() => setActiveCategory('movies')}
              className="text-red-400 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30
                       px-3 py-1.5 rounded-full text-xs font-medium transition-colors">
              View All <ArrowRight size={12} className="inline ml-1" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {movies.map((movie, idx) => (
              <div key={movie.id} className="w-28 shrink-0 snap-start group">
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-800">
                  <Image
                    src={movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}`}
                    alt={movie.title}
                    width={112}
                    height={160}
                    className="h-40 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 right-1.5 bg-black/70 text-white text-xs px-1 py-0.5 rounded
                                  flex items-center gap-0.5">
                    <Star size={8} className="text-yellow-400" />
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
                <h3 className="mt-2 text-xs font-medium leading-tight line-clamp-2 text-gray-300">{movie.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Top Music */}

        {/* Breaking News */}
        <section className="px-4 mb-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Newspaper size={20} className="text-blue-500" />
              Breaking News
            </h2>
            <button
              onClick={() => setActiveCategory('news')}
              className="text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30
                       px-3 py-1.5 rounded-full text-xs font-medium transition-colors">
              All News <ArrowRight size={12} className="inline ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {news.slice(0, 3).map((article, i) => (
              <div key={i}
                   className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20
                             hover:bg-white/15 transition-colors group shadow-lg">
                <div className="flex">
                  <div className="w-20 h-20 shrink-0">
                    <Image
                      src={article.urlToImage || 
                           `https://via.placeholder.com/200x200/1a1a1a/ffffff?text=${encodeURIComponent(article.source?.name || 'News')}`}
                      alt={article.title}
                      width={80}
                      height={80}
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

                    <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-400 transition line-clamp-2 leading-tight text-white">
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
    </div>
  );
}