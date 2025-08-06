// pages/Home.js
import { useState, useEffect } from 'react';
import {
  Search, Play, Heart, Star, Film, Music, Newspaper, Tv, Zap, Trophy,
  ChevronRight, Clock, TrendingUp, Flame, Eye, Share2, Bookmark,
  Volume2, PlayCircle, ArrowRight, ChevronUp
} from 'lucide-react';

/* ────────────────────────────── HOME ────────────────────────────── */
const Home = ({ setActiveCategory }) => {
  /* ─────────── state ─────────── */
  const [greeting, setGreeting] = useState('');
  const [now, setNow]           = useState(new Date());
  const [movies, setMovies]     = useState([]);
  const [news, setNews]         = useState([]);
  const [loading, setLoading]   = useState(true);

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
    try { await Promise.all([getMovies(), getNews()]); } finally { setLoading(false); }
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
  const quick = [
    { id:'movies', title:'Movies', icon:Film,     grad:'from-red-500/80    to-pink-600/80',    count:'2.1k'},
    { id:'music',  title:'Music',  icon:Music,    grad:'from-green-500/80  to-emerald-600/80', count:'12k'},
    { id:'news',   title:'News',   icon:Newspaper,grad:'from-blue-500/80   to-cyan-600/80',    count:'89'},
    { id:'series', title:'TV',     icon:Tv,       grad:'from-purple-500/80 to-violet-600/80',  count:'856'},
    { id:'anime',  title:'Anime',  icon:Zap,      grad:'from-orange-500/80 to-yellow-600/80',  count:'432'},
    { id:'sports', title:'Sports', icon:Trophy,   grad:'from-indigo-500/80 to-blue-600/80',    count:'156'}
  ];

  const trendingMusic = [
    { title:'Anti-Hero', artist:'Taylor Swift',  image:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', plays:'2.1B', duration:'3:20', album:'Midnights',      trending:true  },
    { title:'Flowers',   artist:'Miley Cyrus',   image:'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', plays:'1.8B', duration:'3:37', album:'Endless Summer', trending:false },
    { title:'Unholy',    artist:'Sam Smith',     image:'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop', plays:'1.5B', duration:'2:56', album:'Gloria',         trending:true  },
    { title:'As It Was', artist:'Harry Styles',  image:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', plays:'2.5B', duration:'2:47', album:"Harry's House",  trending:false }
  ];

  const live = [
    { title:'NBA Finals G7', teams:['GSW','LAL'], scores:[112,115], status:'LIVE',  time:'Q4 2:45', viewers:'12.5M' },
    { title:'Grammy Awards', status:'SOON',        time:'8 PM ET', viewers:'8.2M exp.' }
  ];

  /* ─────────── loading placeholder ─────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <span className="h-12 w-12 border-2 border-b-transparent rounded-full animate-spin border-blue-500"/>
          Loading your hub…
        </div>
      </div>
    );
  }

  /* ─────────── UI ─────────── */
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white
                 pt-[calc(env(safe-area-inset-top)+1.25rem)]
                 pb-[calc(env(safe-area-inset-bottom)+5rem)]"
    >
      {/* ── Header ── */}
      <header className="px-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Discover
            </h1>
            <p className="text-gray-400">{greeting}! What’s your mood today?</p>
            <p className="text-gray-500 text-sm">
              {now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
          </div>
          <button className="p-3 bg-white/10 rounded-full backdrop-blur-xl hover:bg-white/20 border border-white/15">
            <Search size={20}/>
          </button>
        </div>
      </header>

      {/* ── Quick Actions ── */}
      <section className="px-6 mb-10">
        <div className="grid grid-cols-6 gap-3">
          {quick.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveCategory(a.id)}
              className="group flex flex-col items-center text-xs"
            >
              <div className={`size-14 rounded-2xl flex items-center justify-center mb-1 border
                               bg-opacity-10 border-white/10 bg-gradient-to-br ${a.grad}
                               group-active:scale-95 transition`}>
                <a.icon size={20}/>
              </div>
              <span className="text-gray-300 group-hover:text-white transition">{a.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Live Events ── */}
      <section className="px-6 mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="size-2 bg-red-500 rounded-full animate-pulse" /> Live Now
        </h2>
        <div className="space-y-4">
          {live.map((e,i) => (
            <div key={i}
                 className="p-6 rounded-3xl border border-red-500/25
                            bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-xl">
              {e.teams ? (
                <div className="flex justify-between items-center">
                  <Team team={e.teams[0]} score={e.scores[0]} theme="from-yellow-400 to-yellow-600" />
                  <div className="text-center">
                    <div className="flex items-center gap-2 justify-center text-red-400 text-xs mb-1">
                      <span className="size-2 bg-red-500 rounded-full animate-pulse" /> {e.status}
                    </div>
                    <div className="font-medium">{e.time}</div>
                    <div className="text-gray-400 text-xs">{e.viewers}</div>
                  </div>
                  <Team team={e.teams[1]} score={e.scores[1]} theme="from-purple-500 to-purple-700" />
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-1">{e.title}</h3>
                  <div className="flex justify-center gap-4 text-gray-300 text-sm">
                    <span className="bg-orange-500 text-black px-2 rounded-full font-semibold">{e.status}</span>
                    <span>{e.time}</span>
                    <span>{e.viewers}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Trending Movies ── */}
      <Carousel
        title="Trending Movies"
        icon={Film}
        accent="red"
        onViewAll={() => setActiveCategory('movies')}
        items={movies}
        renderItem={(m, idx) => <MovieCard key={m.id} movie={m} rank={idx}/>}
      />

      {/* ── Top Charts ── */}
      <MusicChart tracks={trendingMusic} onViewAll={() => setActiveCategory('music')} />

      {/* ── Breaking News ── */}
      <NewsList articles={news} onViewAll={() => setActiveCategory('news')} />

      {/* ── Scroll-to-top FAB ── */}
      {/* <button
        onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-6 size-11 rounded-full
                   bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl text-white flex items-center justify-center"
      >
        <ChevronUp size={18}/>
      </button> */}
    </div>
  );
};

/* ─────────────────── helper components ─────────────────── */
const Team = ({ team, score, theme }) => (
  <div className="flex flex-col items-center">
    <div className={`size-14 rounded-full flex items-center justify-center bg-gradient-to-br ${theme}`}>
      <span className="font-bold">{team}</span>
    </div>
    <div className="text-xl font-bold mt-1">{score}</div>
  </div>
);

const Carousel = ({ title, icon:Icon, accent, onViewAll, items, renderItem }) => (
  <section className="px-6 mb-10">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Icon size={22} className={`text-${accent}-500`}/> {title}
      </h2>
      <button
        onClick={onViewAll}
        className={`text-${accent}-400 border border-${accent}-500/25 bg-${accent}-500/10
                    px-3 py-1.5 rounded-full text-xs font-medium`}
      >
        View All <ArrowRight size={14} className="inline ml-1"/>
      </button>
    </div>

    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
      {items.map(renderItem)}
    </div>
  </section>
);

const MovieCard = ({ movie, rank }) => (
  <div className="w-36 shrink-0 snap-start group">
    <div className="relative rounded-2xl overflow-hidden shadow-xl">
      <img
        loading="lazy"
        src={movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : 'https://images.unsplash.com/photo-1489599510068-3ba4c8d8d39b?w=300&h=450&fit=crop'}
        alt={movie.title}
        className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition"/>
      <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded
                       flex items-center gap-1">
        <Star size={10} className="text-yellow-400"/> {movie.vote_average?.toFixed(1)}
      </span>
      {rank < 3 && (
        <span className="absolute top-2 left-2 bg-red-500 text-xs font-bold px-1.5 py-0.5 rounded
                         flex items-center gap-0.5">
          <TrendingUp size={10}/> #{rank+1}
        </span>
      )}
    </div>
    <h3 className="mt-2 text-sm font-medium leading-tight line-clamp-2">{movie.title}</h3>
  </div>
);

/* ─────────────────── MUSIC CHART ─────────────────── */
const MusicChart = ({ tracks, onViewAll }) => (
  <section className="px-6 mb-10">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold flex items-center">
        <Music size={22} className="text-green-500 mr-1"/> Top Charts
      </h2>
      <button
        onClick={onViewAll}
        className="text-green-400 border border-green-500/25 bg-green-500/10
                   px-3 py-1.5 rounded-full text-xs font-medium"
      >
        View All <ArrowRight size={14} className="inline ml-1"/>
      </button>
    </div>

    <div className="bg-white/5 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10">
      {tracks.map((t,i) => (
        <div key={i}
             className="flex items-center p-5 border-b border-white/10 last:border-b-0
                        hover:bg-white/5 transition-colors group">
          <div className="w-8 text-center mr-4">
            <span className={`text-lg font-bold ${i<3?'text-yellow-400':'text-gray-400'}`}>{i+1}</span>
          </div>

          <div className="relative mr-4">
            <img loading="lazy" src={t.image} alt={t.title}
                 className="w-14 h-14 object-cover rounded-xl shadow-md"/>
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0
                            group-hover:opacity-100 transition flex items-center justify-center">
              <PlayCircle size={20} className="text-white"/>
            </div>
            {t.trending && (
              <div className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full
                              flex items-center justify-center">
                <Flame size={8} className="text-white"/>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-medium group-hover:text-green-400 transition">{t.title}</h3>
              {t.trending && <TrendingUp size={12} className="text-red-500"/>}
            </div>
            <p className="text-xs text-gray-400">{t.artist}</p>
            <p className="text-xs text-gray-500">{t.album}</p>
          </div>

          <div className="text-right mr-4">
            <p className="text-sm font-semibold">{t.plays}</p>
            <p className="text-xs text-gray-400">{t.duration}</p>
          </div>

          <div className="flex items-center gap-2">
            <IconButton icon={Heart}/>
            <IconButton icon={Share2}/>
            <IconButton icon={Volume2} className="text-green-400 hover:text-green-300"/>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ─────────────────── NEWS LIST ─────────────────── */
const NewsList = ({ articles, onViewAll }) => (
  <section className="px-6 mb-10">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold flex items-center">
        <Newspaper size={22} className="text-blue-500 mr-1"/> Breaking News
      </h2>
      <button
        onClick={onViewAll}
        className="text-blue-400 border border-blue-500/25 bg-blue-500/10
                   px-3 py-1.5 rounded-full text-xs font-medium"
      >
        All News <ArrowRight size={14} className="inline ml-1"/>
      </button>
    </div>

    <div className="space-y-4">
      {articles.map((a,i) => (
        <div key={i}
             className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10
                        hover:bg-white/10 transition-colors group">
          <div className="flex">
            <div className="w-32 h-32 shrink-0">
              <img loading="lazy" src={a.urlToImage ??
                   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'}
                   alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition"/>
            </div>
            <div className="flex-1 p-5">
              <div className="flex justify-between mb-2 text-xs">
                <div className="flex gap-2 items-center">
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {a.source?.name ?? 'News'}
                  </span>
                  {i<2 && (
                    <span className="flex items-center gap-0.5 text-red-500">
                      <TrendingUp size={10}/> Trending
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock size={10}/>
                  {new Date(a.publishedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                </span>
              </div>

              <h3 className="font-semibold mb-1 group-hover:text-blue-400 transition line-clamp-2">
                {a.title}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2">{a.description}</p>

              <div className="flex justify-between items-center mt-3 text-xs">
                <span className="text-gray-400">3 min read</span>
                <div className="flex items-center gap-2">
                  <IconButton icon={Bookmark}/>
                  <IconButton icon={Share2}/>
                  <a href={a.url} target="_blank" rel="noopener noreferrer"
                     className="text-blue-400 flex items-center hover:text-blue-300">
                    Read More <ChevronRight size={12}/>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ─────────────────── small helpers ─────────────────── */
const IconButton = ({ icon:Icon, className='' }) => (
  <button
    className={`text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 ${className}`}
  >
    <Icon size={16}/>
  </button>
);

export default Home;
