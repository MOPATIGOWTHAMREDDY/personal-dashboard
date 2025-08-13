import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, Calendar, Clock, Play, Heart, Bookmark, Search, Filter,
  Grid, List, ChevronDown, Plus, ExternalLink, Tv, Film,
  TrendingUp, Award, Users, Eye, BookOpen, Sparkles, X,
  Edit, Trash2, Save, Monitor, Youtube, Globe, ChevronRight,
  Info, PlayCircle, Zap, Gamepad2
} from 'lucide-react';

// Content types
const CONTENT_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
  ANIME: 'anime'
};

// Custom hook for content (movies, TV shows, anime)
const useContent = (initialData = []) => {
  const [content, setContent] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('popular');
  const [contentType, setContentType] = useState(CONTENT_TYPES.MOVIE);

  const fetchContent = useCallback(async (pageNum = 1, contentCategory = category, type = contentType) => {
    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '';
      if (type === CONTENT_TYPES.MOVIE) {
        endpoint = `/api/proxy/tmdb/movie/${contentCategory}`;
      } else if (type === CONTENT_TYPES.TV) {
        endpoint = `/api/proxy/tmdb/tv/${contentCategory}`;
      } else if (type === CONTENT_TYPES.ANIME) {
        endpoint = `/api/proxy/tmdb/discover/tv`;
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        language: 'en-US'
      });

      if (type === CONTENT_TYPES.ANIME) {
        params.set('with_genres', '16');
        params.set('with_original_language', 'ja');
      }

      const url = `${endpoint}?${params.toString()}`;
      console.log('🔄 Fetching:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Proxy-Secret': process.env.NEXT_PUBLIC_PROXY_SECRET || 'development',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setContent(data.results || []);
      } else {
        setContent(prev => [...prev, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error('❌ Error fetching content:', err);
      setError(err.message);
      if (pageNum === 1) {
        setContent([]);
        setTotalPages(1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [category, contentType]);

  const searchContent = useCallback(async (query, type = contentType) => {
    if (!query.trim()) {
      fetchContent(1);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '';
      if (type === CONTENT_TYPES.MOVIE) {
        endpoint = '/api/proxy/tmdb/search/movie';
      } else if (type === CONTENT_TYPES.TV || type === CONTENT_TYPES.ANIME) {
        endpoint = '/api/proxy/tmdb/search/tv';
      }

      const params = new URLSearchParams({
        query: query,
        page: '1',
        language: 'en-US'
      });

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'X-Proxy-Secret': process.env.NEXT_PUBLIC_PROXY_SECRET || 'development',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let results = data.results || [];

      // Filter for anime if searching anime
      if (type === CONTENT_TYPES.ANIME) {
        results = results.filter(item => 
          item.genre_ids?.includes(16) || // Animation genre
          item.origin_country?.includes('JP') || // Japanese origin
          item.original_language === 'ja' // Japanese language
        );
      }

      setContent(results);
      setTotalPages(data.total_pages || 1);
      setPage(1);
    } catch (err) {
      console.error('❌ Error searching content:', err);
      setError(err.message);
      setContent([]);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, fetchContent]);

  const changeCategory = useCallback((newCategory) => {
    setCategory(newCategory);
    setPage(1);
    fetchContent(1, newCategory);
  }, [fetchContent]);

  const changeContentType = useCallback((newType) => {
    setContentType(newType);
    setPage(1);
    setCategory('popular');
    fetchContent(1, 'popular', newType);
  }, [fetchContent]);

  const loadMore = useCallback(() => {
    if (page < totalPages) {
      fetchContent(page + 1);
    }
  }, [page, totalPages, fetchContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { 
    content, 
    isLoading, 
    error, 
    page,
    totalPages,
    category,
    contentType,
    refetch: fetchContent, 
    loadMore,
    changeCategory,
    changeContentType,
    searchContent,
    hasMore: page < totalPages
  };
};

// Compact Content Details Modal Component
const ContentDetailsModal = ({ content, isOpen, onClose, customSources, onAddSource, onDeleteSource, contentType }) => {
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Pre-configured default sources
  const defaultSources = [
    {
      id: 'goodplayer',
      name: 'GoodPlayer',
      url: contentType === CONTENT_TYPES.MOVIE 
        ? 'https://goodplayer.netlify.app/?movie_id={movie_id}'
        : 'https://goodplayer.netlify.app/?serie_id={serie_id}',
      searchPattern: contentType === CONTENT_TYPES.MOVIE 
        ? 'https://goodplayer.netlify.app/?movie_id={movie_id}'
        : 'https://goodplayer.netlify.app/?serie_id={serie_id}',
      icon: Monitor,
      color: 'green',
      featured: true
    },
    {
      id: 'justwatch',
      name: 'JustWatch',
      url: 'https://www.justwatch.com',
      searchPattern: 'https://www.justwatch.com/us/search?q={title}',
      icon: ExternalLink,
      color: 'blue'
    },
    {
      id: 'imdb',
      name: 'IMDb',
      url: 'https://www.imdb.com',
      searchPattern: 'https://www.imdb.com/find?q={title}',
      icon: Star,
      color: 'yellow'
    },
    {
      id: 'netflix',
      name: 'Netflix',
      url: 'https://www.netflix.com',
      searchPattern: 'https://www.netflix.com/search?q={title}',
      icon: Tv,
      color: 'red'
    }
  ];

  if (!isOpen || !content) return null;

  const handleAddSource = () => {
    if (newSourceName.trim() && newSourceUrl.trim()) {
      onAddSource({
        name: newSourceName.trim(),
        url: newSourceUrl.trim(),
        id: Date.now(),
        searchPattern: newSourceUrl.includes('{') ? newSourceUrl : null,
        icon: Globe,
        color: 'gray'
      });
      setNewSourceName('');
      setNewSourceUrl('');
      setShowAddSource(false);
    }
  };

  const getContentUrl = (source, contentTitle, contentId) => {
    if (source.searchPattern) {
      let url = source.searchPattern;
      
      if (url.includes('{movie_id}')) {
        url = url.replace('{movie_id}', contentId);
      }
      
      if (url.includes('{serie_id}')) {
        url = url.replace('{serie_id}', contentId);
      }
      
      if (url.includes('{title}')) {
        url = url.replace('{title}', encodeURIComponent(contentTitle));
      }
      
      return url;
    }
    
    return source.url;
  };

  const allSources = [...defaultSources, ...customSources];
  const featuredSources = allSources.filter(s => s.featured);
  const regularSources = allSources.filter(s => !s.featured);

  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const rating = content.vote_average;
  const overview = content.overview;

  // Get content type specific details
  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;
  const genres = content.genre_ids?.map(id => {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
      10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
      10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
    };
    return genreMap[id];
  }).filter(Boolean) || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <div className="flex items-start p-4 pb-2">
            <div className="w-16 h-24 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden mr-4">
              {content.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${content.poster_path}`}
                  alt={title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="text-gray-400">
                  {contentType === CONTENT_TYPES.MOVIE ? <Film size={20} /> : <Tv size={20} />}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-white mb-1 leading-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors ml-2"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex items-center space-x-3 text-sm mb-2">
                {contentType === CONTENT_TYPES.ANIME && (
                  <span className="bg-pink-600/20 text-pink-400 px-2 py-0.5 rounded text-xs font-medium">
                    Anime
                  </span>
                )}
                {isTV && contentType !== CONTENT_TYPES.ANIME && (
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                    TV Show
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400" fill="currentColor" />
                  <span className="text-white font-medium">{rating?.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">
                  {releaseDate ? new Date(releaseDate).getFullYear() : 'TBA'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* TV Show specific info */}
          {isTV && (
            <div className="px-4 pb-2">
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                {content.number_of_seasons && (
                  <span>{content.number_of_seasons} Season{content.number_of_seasons > 1 ? 's' : ''}</span>
                )}
                {content.number_of_episodes && (
                  <span>{content.number_of_episodes} Episodes</span>
                )}
                {content.status && (
                  <span className={`px-2 py-1 rounded ${
                    content.status === 'Returning Series' ? 'bg-green-600/20 text-green-400' :
                    content.status === 'Ended' ? 'bg-red-600/20 text-red-400' :
                    'bg-blue-600/20 text-blue-400'
                  }`}>
                    {content.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Info size={16} className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('watch')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'watch' 
                  ? 'text-green-400 border-b-2 border-green-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PlayCircle size={16} className="inline mr-2" />
              Watch
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Description */}
              {overview && (
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">{overview}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Release:</span>
                  <div className="text-white font-medium mt-1">
                    {releaseDate ? new Date(releaseDate).toLocaleDateString() : 'TBA'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Rating:</span>
                  <div className="text-white font-medium mt-1 flex items-center">
                    <Star size={12} className="text-yellow-400 mr-1" fill="currentColor" />
                    {rating?.toFixed(1)}/10
                  </div>
                </div>
                {content.original_language && (
                  <div>
                    <span className="text-gray-400">Language:</span>
                    <div className="text-white font-medium mt-1 uppercase">
                      {content.original_language}
                    </div>
                  </div>
                )}
                {isTV && content.episode_run_time && content.episode_run_time[0] && (
                  <div>
                    <span className="text-gray-400">Episode:</span>
                    <div className="text-white font-medium mt-1">
                      {content.episode_run_time} min
                    </div>
                  </div>
                )}
              </div>

              {/* Episode Info for TV Shows */}
              {isTV && (
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-medium text-sm">Episodes</h5>
                    {content.last_episode_to_air && (
                      <span className="text-xs text-gray-400">
                        Latest: S{content.last_episode_to_air.season_number}E{content.last_episode_to_air.episode_number}
                      </span>
                    )}
                  </div>
                  {content.next_episode_to_air && (
                    <div className="text-xs text-green-400">
                      Next: S{content.next_episode_to_air.season_number}E{content.next_episode_to_air.episode_number} • {new Date(content.next_episode_to_air.air_date).toLocaleDateString()}
                    </div>
                  )}
                  {content.last_episode_to_air && (
                    <div className="text-xs text-gray-400 mt-1">
                      &quot;{content.last_episode_to_air.name}&ldquo; • {new Date(content.last_episode_to_air.air_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'watch' && (
            <div className="space-y-4">
              {/* Add Source Form */}
              {showAddSource && (
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/50">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Source name"
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 text-sm"
                    />
                    <input
                      type="url"
                      placeholder={`URL (use {${contentType === CONTENT_TYPES.MOVIE ? 'movie_id' : 'serie_id'}} or {title})`}
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 text-sm"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddSource}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddSource(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Featured Sources */}
              {featuredSources.length > 0 && (
                <div>
                  {featuredSources.map((source) => {
                    const IconComponent = source.icon;
                    return (
                      <div
                        key={source.id}
                        className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <IconComponent size={16} className="text-green-400" />
                          <div>
                            <span className="text-white font-medium text-sm">{source.name}</span>
                            <div className="text-xs text-green-300">Primary Source</div>
                          </div>
                        </div>
                        <a
                          href={getContentUrl(source, title, content.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                        >
                          {contentType === CONTENT_TYPES.MOVIE ? 'Watch' : 'Watch Series'}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Regular Sources */}
              {regularSources.length > 0 && (
                <div className="space-y-2">
                  {regularSources.map((source) => {
                    const IconComponent = source.icon;
                    return (
                      <div
                        key={source.id}
                        className="bg-gray-800/30 border border-gray-600/50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <IconComponent size={14} className={`text-${source.color}-400`} />
                          <span className="text-white text-sm">{source.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <a
                            href={getContentUrl(source, title, content.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs"
                          >
                            Go
                          </a>
                          {customSources.find(cs => cs.id === source.id) && (
                            <button
                              onClick={() => onDeleteSource(source.id)}
                              className="text-gray-400 hover:text-red-400 p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Source Button */}
              <button
                onClick={() => setShowAddSource(!showAddSource)}
                className="w-full border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-3 text-gray-400 hover:text-gray-300 transition-all duration-300 text-sm"
              >
                <Plus size={16} className="inline mr-2" />
                Add Custom Source
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Content Card Component
const ContentCard = ({ 
  content, 
  contentType,
  viewMode, 
  onAddToWatchlist, 
  onMarkAsWatched, 
  onShowDetails,
  watchlist, 
  watched 
}) => {
  const isInWatchlist = watchlist.includes(content.id);
  const isWatched = watched.includes(content.id);
  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-900/70 transition-all duration-300 border border-gray-800/50">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-24 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {content.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${content.poster_path}`}
                alt={title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="text-gray-400">
                {contentType === CONTENT_TYPES.MOVIE ? <Film size={20} /> : <Tv size={20} />}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-white text-lg">{title}</h3>
              {contentType === CONTENT_TYPES.ANIME && (
                <span className="bg-pink-600/20 text-pink-400 px-2 py-0.5 rounded text-xs font-medium">
                  Anime
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{content.overview}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400" fill="currentColor" />
                <span className="text-white font-semibold">{content.vote_average?.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-400">{releaseDate ? new Date(releaseDate).getFullYear() : 'TBA'}</span>
              </div>
              {isTV && (
                <div className="flex items-center space-x-1">
                  <Tv size={14} className="text-blue-400" />
                  <span className="text-blue-400">Series</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onShowDetails(content)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300"
            >
              <Play size={16} fill="currentColor" />
              <span>Details</span>
            </button>
            <button
              onClick={() => onAddToWatchlist(content.id)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isInWatchlist 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Heart size={16} fill={isInWatchlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer relative">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
        <div className="w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700/50 overflow-hidden">
          {content.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
              alt={title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 w-full h-full">
              {contentType === CONTENT_TYPES.MOVIE ? (
                <Film size={48} className="text-gray-400 mb-4 opacity-50" />
              ) : (
                <Tv size={48} className="text-gray-400 mb-4 opacity-50" />
              )}
              <h3 className="text-white font-bold text-lg text-center leading-tight">
                {title}
              </h3>
              <p className="text-gray-400 text-sm mt-2 text-center">
                {releaseDate ? new Date(releaseDate).getFullYear() : 'TBA'}
              </p>
            </div>
          )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
          <Star size={12} fill="currentColor" className="text-yellow-400" />
          <span className="text-xs font-semibold">{content.vote_average?.toFixed(1)}</span>
        </div>
        
        {/* Content Type Badge */}
        {contentType === CONTENT_TYPES.ANIME && (
          <div className="absolute top-3 left-3 bg-pink-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <Gamepad2 size={12} />
            <span className="text-xs">Anime</span>
          </div>
        )}
        
        {isTV && contentType !== CONTENT_TYPES.ANIME && (
          <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <Tv size={12} />
            <span className="text-xs">Series</span>
          </div>
        )}
        
        {/* Watchlist Badge */}
        {isInWatchlist && (
          <div className="absolute top-12 left-3 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <Heart size={12} fill="currentColor" />
            <span className="text-xs">Watchlist</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onShowDetails(content)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300"
            >
              <Play size={14} fill="currentColor" />
              <span className="text-sm font-semibold">Details</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onAddToWatchlist(content.id)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isInWatchlist 
                    ? 'bg-red-600 text-white' 
                    : 'bg-black/50 text-gray-300 hover:bg-black/70 hover:text-white backdrop-blur-sm'
                }`}
              >
                <Heart size={14} fill={isInWatchlist ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={() => onMarkAsWatched(content.id)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isWatched 
                    ? 'bg-green-600 text-white' 
                    : 'bg-black/50 text-gray-300 hover:bg-black/70 hover:text-white backdrop-blur-sm'
                }`}
              >
                <Eye size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Info */}
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-blue-400 transition-colors flex-1">
            {title}
          </h3>
          {contentType === CONTENT_TYPES.ANIME && (
            <Gamepad2 size={12} className="text-pink-400 flex-shrink-0" />
          )}
          {isTV && contentType !== CONTENT_TYPES.ANIME && (
            <Tv size={12} className="text-blue-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={12} />
            <span>{releaseDate ? new Date(releaseDate).getFullYear() : 'TBA'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>{isTV ? 'Series' : `${Math.floor(Math.random() * 60 + 90)}min`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const MediaHubApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watched, setWatched] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentDetails, setShowContentDetails] = useState(false);
  const [customSources, setCustomSources] = useState([]);
  
  const { 
    content, 
    isLoading, 
    error, 
    category,
    contentType,
    changeCategory,
    changeContentType,
    searchContent,
    loadMore,
    hasMore
  } = useContent();

  // Content type configurations
  const contentTypes = [
    { 
      id: CONTENT_TYPES.MOVIE, 
      name: 'Movies', 
      icon: Film, 
      color: 'blue',
      categories: [
        { id: 'popular', name: 'Popular', icon: TrendingUp },
        { id: 'top_rated', name: 'Top Rated', icon: Award },
        { id: 'upcoming', name: 'Upcoming', icon: Calendar },
        { id: 'now_playing', name: 'Now Playing', icon: Play }
      ]
    },
    { 
      id: CONTENT_TYPES.TV, 
      name: 'TV Shows', 
      icon: Tv, 
      color: 'green',
      categories: [
        { id: 'popular', name: 'Popular', icon: TrendingUp },
        { id: 'top_rated', name: 'Top Rated', icon: Award },
        { id: 'on_the_air', name: 'On Air', icon: Zap },
        { id: 'airing_today', name: 'Airing Today', icon: Calendar }
      ]
    },
    { 
      id: CONTENT_TYPES.ANIME, 
      name: 'Anime', 
      icon: Gamepad2, 
      color: 'pink',
      categories: [
        { id: 'popular', name: 'Popular', icon: TrendingUp },
        { id: 'top_rated', name: 'Top Rated', icon: Award },
        { id: 'on_the_air', name: 'Ongoing', icon: Zap },
        { id: 'airing_today', name: 'New Episodes', icon: Calendar }
      ]
    }
  ];

  const currentContentType = contentTypes.find(ct => ct.id === contentType);
  const categories = currentContentType?.categories || [];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchContent(value, contentType);
    }, 500);
  };

  const addToWatchlist = (contentId) => {
    setWatchlist(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const markAsWatched = (contentId) => {
    setWatched(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const showContentDetailsModal = (content) => {
    setSelectedContent(content);
    setShowContentDetails(true);
  };

  const addCustomSource = (source) => {
    setCustomSources(prev => [...prev, source]);
  };

  const deleteCustomSource = (sourceId) => {
    setCustomSources(prev => prev.filter(source => source.id !== sourceId));
  };

  const stats = {
    total: content.length,
    watchlist: watchlist.length,
    watched: watched.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/50 backdrop-blur-xl border-b border-gray-800/50 z-40">
        <div className="px-6 py-4">
          {/* Main Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Film size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MediaHub
                  </h1>
                  <p className="text-sm text-gray-400">Movies • TV Shows • Anime</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.watchlist}</div>
                <div className="text-xs text-gray-400">Watchlist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.watched}</div>
                <div className="text-xs text-gray-400">Watched</div>
              </div>
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="flex items-center space-x-2 mb-4">
            {contentTypes.map(ct => {
              const IconComponent = ct.icon;
              return (
                <button
                  key={ct.id}
                  onClick={() => changeContentType(ct.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    contentType === ct.id
                      ? `bg-gradient-to-r from-${ct.color}-600 to-${ct.color}-700 text-white shadow-lg`
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700'
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="font-semibold">{ct.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${currentContentType?.name.toLowerCase()}...`}
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-800/50 rounded-xl border border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-l-xl transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-r-xl transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl transition-all duration-300 border ${
                  showFilters 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className={`px-6 pb-4 transition-all duration-300 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => changeCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    category === cat.id
                      ? `bg-gradient-to-r from-${currentContentType?.color}-600 to-${currentContentType?.color}-700 text-white shadow-lg`
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700'
                  }`}
                >
                  <IconComponent size={16} />
                  <span className="text-sm font-semibold">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6">
            Error: {error}
          </div>
        )}

        {isLoading && content.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400">Loading {currentContentType?.name.toLowerCase()}...</p>
          </div>
        ) : (
          <>
            {/* Content Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
                : "space-y-4"
            }>
              {content.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  contentType={contentType}
                  viewMode={viewMode}
                  onAddToWatchlist={addToWatchlist}
                  onMarkAsWatched={markAsWatched}
                  onShowDetails={showContentDetailsModal}
                  watchlist={watchlist}
                  watched={watched}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !isLoading && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Load More {currentContentType?.name}
                </button>
              </div>
            )}

            {/* Loading More Indicator */}
            {isLoading && content.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content Details Modal */}
      <ContentDetailsModal
        content={selectedContent}
        contentType={contentType}
        isOpen={showContentDetails}
        onClose={() => {
          setShowContentDetails(false);
          setSelectedContent(null);
        }}
        customSources={customSources}
        onAddSource={addCustomSource}
        onDeleteSource={deleteCustomSource}
      />
    </div>
  );
};

export default MediaHubApp;
