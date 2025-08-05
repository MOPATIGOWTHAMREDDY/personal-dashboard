import { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Heart, 
  Star, 
  Film, 
  Music, 
  Newspaper, 
  Tv,
  Zap,
  Trophy,
  MoreHorizontal,
  ChevronRight,
  Clock,
  TrendingUp,
  Flame,
  Eye,
  ThumbsUp,
  Share2,
  Bookmark,
  Calendar,
  Users,
  Award,
  Volume2,
  PlayCircle,
  ArrowRight
} from 'lucide-react';

const Home = ({ setActiveCategory }) => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [movies, setMovies] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMovies(), fetchNews()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY || 'd20da4614eefb21107f726bae23e6994'}&language=en-US&page=1`
      );
      const data = await response.json();
      setMovies(data.results?.slice(0, 6) || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=general&pageSize=5&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY || '1238cc84e5c748aaa00cda1d60a877e0'}`
      );
      const data = await response.json();
      setNews(data.articles?.slice(0, 4) || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const quickActions = [
    { id: 'movies', title: 'Movies', icon: Film, gradient: 'from-red-500/80 to-pink-600/80', count: '2.1k' },
    { id: 'music', title: 'Music', icon: Music, gradient: 'from-green-500/80 to-emerald-600/80', count: '12k' },
    { id: 'news', title: 'News', icon: Newspaper, gradient: 'from-blue-500/80 to-cyan-600/80', count: '89' },
    { id: 'series', title: 'TV Shows', icon: Tv, gradient: 'from-purple-500/80 to-violet-600/80', count: '856' },
    { id: 'anime', title: 'Anime', icon: Zap, gradient: 'from-orange-500/80 to-yellow-600/80', count: '432' },
    { id: 'sports', title: 'Sports', icon: Trophy, gradient: 'from-indigo-500/80 to-blue-600/80', count: '156' },
  ];

  const trendingMusic = [
    { 
      title: 'Anti-Hero', 
      artist: 'Taylor Swift', 
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', 
      plays: '2.1B',
      duration: '3:20',
      album: 'Midnights',
      trending: true
    },
    { 
      title: 'Flowers', 
      artist: 'Miley Cyrus', 
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', 
      plays: '1.8B',
      duration: '3:37',
      album: 'Endless Summer',
      trending: false
    },
    { 
      title: 'Unholy', 
      artist: 'Sam Smith', 
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop', 
      plays: '1.5B',
      duration: '2:56',
      album: 'Gloria',
      trending: true
    },
    { 
      title: 'As It Was', 
      artist: 'Harry Styles', 
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', 
      plays: '2.5B',
      duration: '2:47',
      album: "Harry's House",
      trending: false
    }
  ];

  const liveEvents = [
    {
      title: 'NBA Finals Game 7',
      teams: ['GSW', 'LAL'],
      scores: [112, 115],
      status: 'LIVE',
      time: 'Q4 2:45',
      viewers: '12.5M'
    },
    {
      title: 'Grammy Awards 2024',
      status: 'STARTING SOON',
      time: '8:00 PM ET',
      viewers: '8.2M expected'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your entertainment hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Enhanced Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Discover
            </h1>
            <p className="text-gray-400 text-lg">{greeting}! What's your mood today?</p>
            <p className="text-gray-500 text-sm mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20">
              <Search size={20} className="text-white" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
          </div>
        </div>

        {/* Enhanced Category Icons */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {quickActions.map((action, index) => (
            <div key={action.id} className="flex flex-col items-center group">
              <button 
                onClick={() => setActiveCategory(action.id)}
                className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-2 hover:bg-white/20 transition-all duration-300 border border-white/10 group-hover:scale-110 group-hover:border-white/30"
              >
                <action.icon size={22} className="text-white group-hover:scale-110 transition-transform" />
              </button>
              <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{action.title}</span>
              <span className="text-xs text-gray-500 font-medium">{action.count}</span>
            </div>
          ))}
          <div className="flex flex-col items-center group">
            <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-2 hover:bg-white/20 transition-all duration-300 border border-white/10 group-hover:scale-110">
              <MoreHorizontal size={22} className="text-white" />
            </button>
            <span className="text-xs text-gray-300 group-hover:text-white transition-colors">More</span>
          </div>
        </div>
      </div>

      {/* Live Events */}
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
          Live Now
        </h2>
        
        <div className="space-y-4">
          {liveEvents.map((event, index) => (
            <div key={index} className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-xl rounded-3xl p-6 border border-red-500/20">
              {event.teams ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">{event.teams[0]}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{event.scores[0]}</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-400 font-bold text-sm">{event.status}</span>
                    </div>
                    <div className="text-white font-medium">{event.time}</div>
                    <div className="text-gray-400 text-sm">{event.viewers} watching</div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{event.scores[1]}</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{event.teams[1]}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <div className="flex items-center justify-center space-x-4 text-gray-300">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.status}
                    </span>
                    <span>{event.time}</span>
                    <span>{event.viewers}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Trending Movies */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Film className="mr-2 text-red-500" size={24} />
            Trending Movies
          </h2>
          <button 
            onClick={() => setActiveCategory('movies')}
            className="flex items-center text-red-400 font-semibold bg-red-500/10 backdrop-blur-xl px-4 py-2 rounded-full hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-shrink-0 w-40 group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                <img 
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://images.unsplash.com/photo-1489599510068-3ba4c8d8d39b?w=300&h=450&fit=crop'} 
                  alt={movie.title}
                  className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1 border border-white/20">
                  <Star size={12} fill="currentColor" className="text-yellow-400" />
                  <span className="text-xs font-semibold">{movie.vote_average?.toFixed(1)}</span>
                </div>
                
                {/* Trending Badge */}
                {index < 3 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center">
                    <TrendingUp size={10} className="mr-1" />
                    #{index + 1}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 border border-white/30">
                    <Heart size={12} className="text-white" />
                  </button>
                  <button className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors">
                    <Play size={12} className="text-white ml-0.5" />
                  </button>
                </div>
                
                {/* Movie Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center space-x-2 text-xs text-gray-300 mb-1">
                    <span>{movie.release_date?.split('-')[0]}</span>
                    <span>•</span>
                    <span>{movie.adult ? '18+' : 'PG-13'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Eye size={10} />
                    <span>{(movie.popularity / 100).toFixed(1)}k views</span>
                  </div>
                </div>
              </div>
              
              {/* Movie Title */}
              <div className="mt-3">
                <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{movie.release_date?.split('-')[0]}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Eye size={10} />
                    <span>{(movie.popularity / 100).toFixed(1)}k</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Trending Music */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Music className="mr-2 text-green-500" size={24} />
            Top Charts
          </h2>
          <button 
            onClick={() => setActiveCategory('music')}
            className="flex items-center text-green-400 font-semibold bg-green-500/10 backdrop-blur-xl px-4 py-2 rounded-full hover:bg-green-500/20 transition-colors border border-green-500/20"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/10">
          {trendingMusic.map((track, index) => (
            <div key={index} className="flex items-center p-5 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-all duration-200 group">
              {/* Rank */}
              <div className="w-8 text-center mr-4">
                <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {index + 1}
                </span>
              </div>
              
              {/* Album Art */}
              <div className="relative group cursor-pointer mr-4">
                <img 
                  src={track.image} 
                  alt={track.title}
                  className="w-14 h-14 object-cover rounded-xl shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <PlayCircle size={20} className="text-white" />
                </div>
                {track.trending && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <Flame size={8} className="text-white" />
                  </div>
                )}
              </div>
              
              {/* Track Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                    {track.title}
                  </h3>
                  {track.trending && (
                    <TrendingUp size={14} className="text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">{track.artist}</p>
                <p className="text-xs text-gray-500">{track.album}</p>
              </div>
              
              {/* Stats */}
              <div className="text-right mr-4">
                <p className="text-sm font-semibold text-white">{track.plays}</p>
                <p className="text-xs text-gray-400">{track.duration}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/10">
                  <Heart size={16} />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                  <Share2 size={16} />
                </button>
                <button className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-full hover:bg-green-500/20">
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Latest News */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Newspaper className="mr-2 text-blue-500" size={24} />
            Breaking News
          </h2>
          <button 
            onClick={() => setActiveCategory('news')}
            className="flex items-center text-blue-400 font-semibold bg-blue-500/10 backdrop-blur-xl px-4 py-2 rounded-full hover:bg-blue-500/20 transition-colors border border-blue-500/20"
          >
            All News <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="space-y-4">
          {news.map((article, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 hover:bg-white/10 cursor-pointer group">
              <div className="flex">
                {/* Article Image */}
                <div className="w-32 h-32 flex-shrink-0">
                  <img 
                    src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Article Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-semibold">
                        {article.source?.name || 'News'}
                      </span>
                      {index < 2 && (
                        <div className="flex items-center text-red-500 text-xs">
                          <TrendingUp size={12} className="mr-1" />
                          Trending
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-400 text-xs">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(article.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-white mb-2 text-lg group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-3">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>3 min read</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded">
                        <Bookmark size={14} />
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded">
                        <Share2 size={14} />
                      </button>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-medium flex items-center"
                      >
                        Read More <ChevronRight size={12} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="px-6 mb-32">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Award className="mr-2 text-yellow-500" size={24} />
          Your Activity
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-6 text-white shadow-xl border border-purple-500/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <Film size={24} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-1">127</div>
            <div className="text-sm text-gray-300 font-medium mb-2">Movies Watched</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">This month: +12</div>
              <div className="text-xs text-green-400 font-medium">↑ 8.5%</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-3xl p-6 text-white shadow-xl border border-green-500/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <Music size={24} className="text-green-400 group-hover:scale-110 transition-transform" />
              <Volume2 size={16} className="text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-1">2.1k</div>
            <div className="text-sm text-gray-300 font-medium mb-2">Songs Played</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">This week: +89</div>
              <div className="text-xs text-green-400 font-medium">↑ 12.3%</div>
            </div>
          </div>
        </div>
        
        {/* Additional Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="text-xl font-bold text-white mb-1">48h</div>
            <div className="text-xs text-gray-400">Watch Time</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="text-xl font-bold text-white mb-1">156</div>
            <div className="text-xs text-gray-400">Favorites</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="text-xl font-bold text-white mb-1">23</div>
            <div className="text-xs text-gray-400">Playlists</div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Quick Access */}
      <div className="fixed bottom-8 right-6 z-50">
        <button className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 border-2 border-white/20">
          <Search size={20} />
        </button>
      </div>
    </div>
  );
};

export default Home;