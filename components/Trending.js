import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Star, Play, Heart, Bookmark, ChevronRight, Clock, Users, Eye } from 'lucide-react';


const Trending = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);

  const filters = [
    { id: 'all', name: '🔥 All Trending', color: 'bg-red-500' },
    { id: 'movies', name: '🎬 Movies', color: 'bg-blue-500' },
    { id: 'music', name: '🎵 Music', color: 'bg-green-500' },
    { id: 'series', name: '📺 Series', color: 'bg-purple-500' },
    { id: 'anime', name: '⚡ Anime', color: 'bg-orange-500' },
    { id: 'news', name: '📰 News', color: 'bg-cyan-500' },
    { id: 'sports', name: '⚽ Sports', color: 'bg-emerald-500' },
    { id: 'gaming', name: '🎮 Gaming', color: 'bg-indigo-500' },
  ];

  const timeRanges = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' },
  ];

  // Trending Movies
  const trendingMovies = [
    {
      id: 1,
      title: 'Dune: Part Two',
      type: 'movie',
      image: '/api/placeholder/300/450',
      rating: 8.8,
      trendingScore: 98,
      views: '2.5M',
      description: 'Epic sci-fi continuation of the Dune saga',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      year: 2024,
      duration: '2h 46m',
      trending_reason: 'Oscar buzz'
    },
    {
      id: 2,
      title: 'Oppenheimer',
      type: 'movie',
      image: '/api/placeholder/300/450',
      rating: 8.6,
      trendingScore: 94,
      views: '3.1M',
      description: 'Biographical thriller about J. Robert Oppenheimer',
      genre: ['Biography', 'Drama', 'History'],
      year: 2023,
      duration: '3h 0m',
      trending_reason: 'Awards season'
    },
    {
      id: 3,
      title: 'Barbie',
      type: 'movie',
      image: '/api/placeholder/300/450',
      rating: 7.9,
      trendingScore: 92,
      views: '4.2M',
      description: 'Comedy adventure in Barbie\'s perfect world',
      genre: ['Comedy', 'Adventure', 'Fantasy'],
      year: 2023,
      duration: '1h 54m',
      trending_reason: 'Cultural phenomenon'
    }
  ];

  // Trending Music
  const trendingMusic = [
    {
      id: 1,
      title: 'Anti-Hero',
      artist: 'Taylor Swift',
      type: 'music',
      image: '/api/placeholder/300/300',
      plays: '2.1B',
      trendingScore: 99,
      album: 'Midnights',
      duration: '3:20',
      genre: ['Pop', 'Alternative'],
      trending_reason: 'Viral on TikTok'
    },
    {
      id: 2,
      title: 'Flowers',
      artist: 'Miley Cyrus',
      type: 'music',
      image: '/api/placeholder/300/300',
      plays: '1.8B',
      trendingScore: 96,
      album: 'Endless Summer Vacation',
      duration: '3:20',
      genre: ['Pop', 'Dance'],
      trending_reason: 'Grammy winner'
    },
    {
      id: 3,
      title: 'Unholy',
      artist: 'Sam Smith ft. Kim Petras',
      type: 'music',
      image: '/api/placeholder/300/300',
      plays: '1.5B',
      trendingScore: 93,
      album: 'Gloria',
      duration: '2:36',
      genre: ['Pop', 'Dance'],
      trending_reason: 'Chart topper'
    }
  ];

  // Trending Series
  const trendingSeries = [
    {
      id: 1,
      title: 'The Last of Us',
      type: 'series',
      image: '/api/placeholder/300/450',
      rating: 9.2,
      trendingScore: 97,
      views: '15.3M',
      platform: 'HBO',
      seasons: 1,
      episodes: 9,
      genre: ['Drama', 'Horror', 'Thriller'],
      trending_reason: 'Season 2 announced'
    },
    {
      id: 2,
      title: 'Wednesday',
      type: 'series',
      image: '/api/placeholder/300/450',
      rating: 8.5,
      trendingScore: 95,
      views: '12.7M',
      platform: 'Netflix',
      seasons: 1,
      episodes: 8,
      genre: ['Comedy', 'Horror', 'Mystery'],
      trending_reason: 'Dance went viral'
    }
  ];

  // Trending Anime
  const trendingAnime = [
    {
      id: 1,
      title: 'Attack on Titan Final Season',
      type: 'anime',
      image: '/api/placeholder/300/450',
      rating: 9.8,
      trendingScore: 99,
      views: '45.2M',
      episodes: 24,
      status: 'Completed',
      genre: ['Action', 'Drama', 'Fantasy'],
      trending_reason: 'Epic finale'
    },
    {
      id: 2,
      title: 'Demon Slayer: Hashira Training',
      type: 'anime',
      image: '/api/placeholder/300/450',
      rating: 9.5,
      trendingScore: 96,
      views: '32.1M',
      episodes: 12,
      status: 'Ongoing',
      genre: ['Action', 'Supernatural'],
      trending_reason: 'New season hype'
    }
  ];

  // Trending News
  const trendingNews = [
    {
      id: 1,
      title: 'Marvel Announces Phase 6 Movies',
      type: 'news',
      summary: 'Disney reveals ambitious slate of superhero films for 2024-2026',
      category: 'Entertainment',
      time: '2h ago',
      views: '892K',
      trendingScore: 88,
      trending_reason: 'Breaking news'
    },
    {
      id: 2,
      title: 'Netflix Password Sharing Crackdown Results',
      type: 'news',
      summary: 'Streaming giant reports subscriber growth after policy changes',
      category: 'Technology',
      time: '4h ago',
      views: '654K',
      trendingScore: 85,
      trending_reason: 'Industry impact'
    }
  ];

  // Trending Sports
  const trendingSports = [
    {
      id: 1,
      title: 'Champions League Final 2024',
      type: 'sports',
      summary: 'Manchester City vs Real Madrid set for epic showdown',
      league: 'UEFA Champions League',
      time: 'Tonight 8:00 PM',
      viewers: '200M expected',
      trendingScore: 94,
      trending_reason: 'Biggest match of year'
    }
  ];

  // Trending Gaming
  const trendingGaming = [
    {
      id: 1,
      title: 'Elden Ring: Shadow of the Erdtree',
      type: 'gaming',
      image: '/api/placeholder/300/450',
      rating: 9.8,
      platform: ['PC', 'PlayStation', 'Xbox'],
      price: '$39.99',
      players: '5M+ pre-orders',
      trendingScore: 97,
      trending_reason: 'DLC launch'
    }
  ];

  // Combine all trending content
  const getAllTrendingContent = () => {
    const allContent = [
      ...trendingMovies,
      ...trendingMusic,
      ...trendingSeries,
      ...trendingAnime,
      ...trendingNews,
      ...trendingSports,
      ...trendingGaming
    ];
    return allContent.sort((a, b) => b.trendingScore - a.trendingScore);
  };

  const getFilteredContent = () => {
    if (activeFilter === 'all') {
      return getAllTrendingContent();
    }
    
    const contentMap = {
      movies: trendingMovies,
      music: trendingMusic,
      series: trendingSeries,
      anime: trendingAnime,
      news: trendingNews,
      sports: trendingSports,
      gaming: trendingGaming
    };
    
    return contentMap[activeFilter] || [];
  };

  const getTypeEmoji = (type) => {
    const emojis = {
      movie: '🎬',
      music: '🎵',
      series: '📺',
      anime: '⚡',
      news: '📰',
      sports: '⚽',
      gaming: '🎮'
    };
    return emojis[type] || '🔥';
  };

  const getTypeColor = (type) => {
    const colors = {
      movie: 'bg-blue-100 text-blue-600',
      music: 'bg-green-100 text-green-600',
      series: 'bg-purple-100 text-purple-600',
      anime: 'bg-orange-100 text-orange-600',
      news: 'bg-cyan-100 text-cyan-600',
      sports: 'bg-emerald-100 text-emerald-600',
      gaming: 'bg-indigo-100 text-indigo-600'
    };
    return colors[type] || 'bg-red-100 text-red-600';
  };

  const renderTrendingItem = (item, index) => {
    const isTopTrending = index < 3;
    
    if (item.type === 'news' || item.type === 'sports') {
      return (
        <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getTypeEmoji(item.type)}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(item.type)}`}>
                {item.type.toUpperCase()}
              </span>
              {isTopTrending && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-bold">
                  #{index + 1} TRENDING
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-red-500">
              <Flame size={16} />
              <span className="text-sm font-bold">{item.trendingScore}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{item.summary}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{item.time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye size={14} />
                <span>{item.views || item.viewers}</span>
              </div>
            </div>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              {item.trending_reason}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
        <div className="flex">
          {/* Image */}
          <div className="relative w-24 h-32 flex-shrink-0">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {item.rating && (
              <div className="absolute top-1 left-1 bg-black bg-opacity-80 text-white px-1.5 py-0.5 rounded flex items-center space-x-1">
                <Star size={8} fill="currentColor" className="text-yellow-400" />
                <span className="text-xs font-medium">{item.rating}</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-red-500 p-1.5 rounded-full">
              <Play size={8} className="text-white" fill="currentColor" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeEmoji(item.type)}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(item.type)}`}>
                  {item.type.toUpperCase()}
                </span>
                {isTopTrending && (
                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-bold">
                    #{index + 1}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-red-500">
                <Flame size={14} />
                <span className="text-sm font-bold">{item.trendingScore}</span>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
              {item.title}
              {item.artist && <span className="text-gray-500 font-normal"> - {item.artist}</span>}
            </h3>
            
            {item.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <div className="flex items-center space-x-3">
                {item.views && (
                  <div className="flex items-center space-x-1">
                    <Eye size={10} />
                    <span>{item.views}</span>
                  </div>
                )}
                {item.plays && (
                  <div className="flex items-center space-x-1">
                    <Users size={10} />
                    <span>{item.plays}</span>
                  </div>
                )}
                {item.year && <span>{item.year}</span>}
                {item.duration && <span>{item.duration}</span>}
                {item.platform && <span>{item.platform}</span>}
              </div>
            </div>
            
            {item.trending_reason && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {item.trending_reason}
              </span>
            )}
            
            {item.genre && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.genre.slice(0, 2).map((g, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp size={32} className="text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">Trending</h1>
            </div>
            <div className="flex items-center space-x-2 text-red-500">
              <Flame size={24} />
              <span className="font-bold">HOT</span>
            </div>
          </div>
          <p className="text-gray-600">{`Whats popular right now across all categories`}</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="px-6 py-3 bg-white border-b border-gray-100">
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                timeRange === range.id
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-6 py-4">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.id
                  ? `${filter.color} text-white shadow-lg`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Score Legend */}
      <div className="px-6 mb-4">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">🔥 Trending Score</h3>
            <span className="text-sm opacity-90">Live Updated</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">90+</div>
              <div className="text-xs opacity-90">Viral</div>
            </div>
            <div>
              <div className="text-lg font-bold">70+</div>
              <div className="text-xs opacity-90">Hot</div>
            </div>
            <div>
              <div className="text-lg font-bold">50+</div>
              <div className="text-xs opacity-90">Rising</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Content */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div>
            {getFilteredContent().length > 0 ? (
              getFilteredContent().map((item, index) => renderTrendingItem(item, index))
            ) : (
              <div className="text-center py-12">
                <Flame size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No trending content found</p>
                <p className="text-gray-400">Try a different filter</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {!loading && getFilteredContent().length > 0 && (
        <div className="px-6 pb-6">
          <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2">
            <span>Load More Trending</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Trending;
