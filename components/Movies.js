import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, Calendar, Clock, Play, Heart, Bookmark, Search, Filter,
  Grid, List, ChevronDown, Plus, ExternalLink, Tv, Film,
  TrendingUp, Award, Users, Eye, BookOpen, Sparkles, X,
  Edit, Trash2, Save, Monitor, Youtube, Globe, ChevronRight,
  Info, PlayCircle, Zap, Gamepad2, ArrowLeft, Settings
} from 'lucide-react';

// Content types
const CONTENT_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
  ANIME: 'anime'
};

// ALL Video Sources with CORRECTED PStream URL
// Enhanced Video Sources with Multiple PStream Server Options
const VIDEO_SOURCES = [
  // PStream StreamBox - Usually works best
  {
    key: "pstream-streambox",
    name: "PStream (StreamBox)",
    movieUrlPattern: "https://iframe.pstream.mov/embed/tmdb-movie-{id}?server=streambox&theme=default&language=en&logo=false&allinone=true",
    tvUrlPattern: "https://iframe.pstream.mov/embed/tmdb-tv-{id}/{season}/{episode}?server=streambox&theme=default&language=en&logo=false&allinone=true",
    featured: true,
    serverType: "streambox"
  },
  // PStream Default
  {
    key: "pstream-default",
    name: "PStream (Default)",
    movieUrlPattern: "https://iframe.pstream.mov/embed/tmdb-movie-{id}?theme=default&language=en&logo=false",
    tvUrlPattern: "https://iframe.pstream.mov/embed/tmdb-tv-{id}/{season}/{episode}?theme=default&language=en&logo=false",
    featured: true,
    serverType: "default"
  },
  // PStream Media URL
  {
    key: "pstream-media",
    name: "PStream (Media)",
    movieUrlPattern: "https://iframe.pstream.mov/media/tmdb-movie-{id}?theme=default&language=en&logo=false",
    tvUrlPattern: "https://iframe.pstream.mov/media/tmdb-tv-{id}/{season}/{episode}?theme=default&language=en&logo=false",
    featured: true,
    serverType: "media"
  },
  // PStream with Full Parameters
  {
    key: "pstream-full",
    name: "PStream (Enhanced)",
    movieUrlPattern: "https://iframe.pstream.mov/embed/tmdb-movie-{id}?t=00:00&theme=default&language=en&logo=false&downloads=true&has-watchparty=false&language-order=en,hi,fr,de,nl,pt&allinone=true&scale=0.9&fedapi=true&interface-settings=true&tips=false",
    tvUrlPattern: "https://iframe.pstream.mov/embed/tmdb-tv-{id}/{season}/{episode}?t=00:00&theme=default&language=en&logo=false&downloads=true&has-watchparty=false&language-order=en,hi,fr,de,nl,pt&allinone=true&scale=0.9&fedapi=true&interface-settings=true&tips=false",
    featured: true,
    serverType: "enhanced"
  },
  
  // Other Featured Sources
  {
    key: "vidlink",
    name: "VidLink",
    movieUrlPattern: "https://vidlink.pro/movie/{id}?autoplay=true&title=true",
    tvUrlPattern: "https://vidlink.pro/tv/{id}/{season}/{episode}?autoplay=true&title=true",
    featured: true
  },
  {
    key: "vidsrc-xyz",
    name: "VidSrc.xyz",
    movieUrlPattern: "https://vidsrc.xyz/embed/movie?tmdb={id}&ds_lang=en",
    tvUrlPattern: "https://vidsrc.xyz/embed/tv?tmdb={id}&season={season}&episode={episode}&ds_lang=en",
    featured: true
  },
  
  // All your other sources...
  {
    key: "autoembed",
    name: "AutoEmbed",
    movieUrlPattern: "https://player.autoembed.cc/embed/movie/{id}?autoplay=true",
    tvUrlPattern: "https://player.autoembed.cc/embed/tv/{id}/{season}/{episode}?autoplay=true"
  },
  {
    key: "2embed",
    name: "2Embed",
    movieUrlPattern: "https://www.2embed.cc/embed/{id}",
    tvUrlPattern: "https://www.2embed.cc/embed/tv/{id}&s={season}&e={episode}"
  },
  {
    key: "multiembed",
    name: "MultiEmbed",
    movieUrlPattern: "https://multiembed.mov/video_id={id}&tmdb=1",
    tvUrlPattern: "https://multiembed.mov/video_id={id}&tmdb=1&s={season}&e={episode}"
  },
  {
    key: "2embed-org",
    name: "2Embed.org",
    movieUrlPattern: "https://2embed.org/embed/movie/{id}",
    tvUrlPattern: "https://2embed.org/embed/tv/{id}/{season}/{episode}"
  },
  {
    key: "autoembed-co",
    name: "AutoEmbed.co",
    movieUrlPattern: "https://autoembed.co/movie/tmdb/{id}",
    tvUrlPattern: "https://autoembed.co/tv/tmdb/{id}-{season}-{episode}"
  },
  {
    key: "moviesapi",
    name: "MoviesAPI",
    movieUrlPattern: "https://moviesapi.club/movie/{id}",
    tvUrlPattern: "https://moviesapi.club/tv/{id}-{season}-{episode}"
  },
  {
    key: "nontongo",
    name: "NontonGo",
    movieUrlPattern: "https://www.NontonGo.win/embed/movie/{id}",
    tvUrlPattern: "https://www.NontonGo.win/embed/tv/{id}/{season}/{episode}"
  },
  {
    key: "111movies",
    name: "111Movies",
    movieUrlPattern: "https://111movies.com/movie/{id}",
    tvUrlPattern: "https://111movies.com/tv/{id}/{season}/{episode}"
  },
  {
    key: "flicky",
    name: "Flicky",
    movieUrlPattern: "https://flicky.host/embed/movie?id={id}",
    tvUrlPattern: "https://flicky.host/embed/tv?id={id}/{season}/{episode}"
  },
  {
    key: "vidjoy",
    name: "VidJoy",
    movieUrlPattern: "https://vidjoy.pro/embed/movie/{id}",
    tvUrlPattern: "https://vidjoy.pro/embed/tv/{id}/{season}/{episode}"
  },
  {
    key: "embed-su",
    name: "Embed.su",
    movieUrlPattern: "https://embed.su/embed/movie/{id}",
    tvUrlPattern: "https://embed.su/embed/tv/{id}/{season}/{episode}"
  },
  {
    key: "primewire",
    name: "PrimeWire",
    movieUrlPattern: "https://www.primewire.tf/embed/movie?tmdb={id}",
    tvUrlPattern: "https://www.primewire.tf/embed/tv?tmdb={id}&season={season}&episode={episode}"
  },
  {
    key: "smashystream",
    name: "SmashyStream",
    movieUrlPattern: "https://embed.smashystream.com/playere.php?tmdb={id}",
    tvUrlPattern: "https://embed.smashystream.com/playere.php?tmdb={id}&season={season}&episode={episode}"
  },
  {
    key: "vidstream",
    name: "VidStream",
    movieUrlPattern: "https://vidstream.site/embed/movie/{id}",
    tvUrlPattern: "https://vidstream.site/embed/tv/{id}/{episode}"
  },
  {
    key: "videasy",
    name: "Videasy",
    movieUrlPattern: "https://player.videasy.net/movie/{id}",
    tvUrlPattern: "https://player.videasy.net/tv/{id}/{season}/{episode}"
  },
  {
    key: "vidsrc-wtf-2",
    name: "VidSrc.wtf (API 2)",
    movieUrlPattern: "https://vidsrc.wtf/api/2/movie?id={id}",
    tvUrlPattern: "https://vidsrc.wtf/api/2/tv?id={id}&s={season}&e={episode}"
  },
  {
    key: "vidsrc-wtf-3",
    name: "VidSrc.wtf (API 3)",
    movieUrlPattern: "https://vidsrc.wtf/api/3/movie?id={id}",
    tvUrlPattern: "https://vidsrc.wtf/api/3/tv?id={id}&s={season}&e={episode}"
  },
  {
    key: "vidfast",
    name: "VidFast",
    movieUrlPattern: "https://vidfast.pro/movie/{id}?autoPlay=true",
    tvUrlPattern: "https://vidfast.pro/tv/{id}/{season}/{episode}?autoPlay=true"
  },
  {
    key: "vidbinge",
    name: "VidBinge",
    movieUrlPattern: "https://vidbinge.dev/embed/movie/{id}",
    tvUrlPattern: "https://vidbinge.dev/embed/tv/{id}/{season}/{episode}"
  }
];

// Video Source Helper Functions
const createVideoSource = (source) => ({
  key: source.key,
  name: source.name,
  featured: source.featured || false,
  getMovieUrl: (id) => source.movieUrlPattern.replace('{id}', id.toString()),
  getTVUrl: (id, season, episode) => 
    source.tvUrlPattern
      .replace('{id}', id.toString())
      .replace('{season}', season.toString())
      .replace('{episode}', episode.toString())
});

const videoSources = VIDEO_SOURCES.map(createVideoSource);

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

// Video Player Modal Component with ALL SOURCES (NO SANDBOX)
const VideoPlayerModal = ({ content, isOpen, onClose, contentType }) => {
  const [selectedSource, setSelectedSource] = useState(videoSources.find(s => s.featured) || videoSources[0]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);

  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;
  const title = content?.title || content?.name;

  // Fetch TV show seasons and episodes
  useEffect(() => {
    if (isOpen && content && isTV) {
      fetchTVDetails();
    }
  }, [isOpen, content, isTV]);

  const fetchTVDetails = async () => {
    if (!content?.id) return;
    
    try {
      setIsLoadingSeasons(true);
      
      // Fetch TV show details to get seasons
      const response = await fetch(`/api/proxy/tmdb/tv/${content.id}?language=en-US`, {
        headers: {
          'Accept': 'application/json',
          'X-Proxy-Secret': process.env.NEXT_PUBLIC_PROXY_SECRET || 'development',
        }
      });

      if (response.ok) {
        const tvDetails = await response.json();
        const seasonList = tvDetails.seasons?.filter(season => season.season_number > 0) || [];
        setSeasons(seasonList);
        
        if (seasonList.length > 0) {
          setSelectedSeason(1);
          fetchEpisodes(1);
        }
      }
    } catch (err) {
      console.error('Error fetching TV details:', err);
      // Create dummy seasons/episodes for fallback
      setSeasons([{ season_number: 1, episode_count: 20, name: 'Season 1' }]);
      setEpisodes(Array.from({ length: 20 }, (_, i) => ({
        episode_number: i + 1,
        name: `Episode ${i + 1}`
      })));
    } finally {
      setIsLoadingSeasons(false);
    }
  };

  const fetchEpisodes = async (seasonNumber) => {
    if (!content?.id) return;
    
    try {
      const response = await fetch(`/api/proxy/tmdb/tv/${content.id}/season/${seasonNumber}?language=en-US`, {
        headers: {
          'Accept': 'application/json',
          'X-Proxy-Secret': process.env.NEXT_PUBLIC_PROXY_SECRET || 'development',
        }
      });

      if (response.ok) {
        const seasonDetails = await response.json();
        setEpisodes(seasonDetails.episodes || []);
        setSelectedEpisode(1);
      }
    } catch (err) {
      console.error('Error fetching episodes:', err);
      // Fallback episodes
      const selectedSeasonData = seasons.find(s => s.season_number === seasonNumber);
      const episodeCount = selectedSeasonData?.episode_count || 20;
      setEpisodes(Array.from({ length: episodeCount }, (_, i) => ({
        episode_number: i + 1,
        name: `Episode ${i + 1}`
      })));
      setSelectedEpisode(1);
    }
  };

  const handleSeasonChange = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    fetchEpisodes(seasonNumber);
  };

  const getStreamUrl = () => {
    if (!content?.id || !selectedSource) return '';
    
    if (isTV) {
      return selectedSource.getTVUrl(content.id, selectedSeason, selectedEpisode);
    } else {
      return selectedSource.getMovieUrl(content.id);
    }
  };

  if (!isOpen || !content) return null;

  // Group sources for better organization
  const featuredSources = videoSources.filter(s => s.featured);
  const regularSources = videoSources.filter(s => !s.featured);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-gray-400 text-sm">
                {isTV ? `S${selectedSeason}E${selectedEpisode}` : 'Movie'} • {selectedSource.name}
              </p>
            </div>
          </div>
          
          {/* Source Selector with ALL SOURCES */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedSource.key}
              onChange={(e) => setSelectedSource(videoSources.find(s => s.key === e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-48"
            >
              <optgroup label="⭐ Featured Sources">
                {featuredSources.map((source) => (
                  <option key={source.key} value={source.key}>
                    ⭐ {source.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="📺 All Sources">
                {regularSources.map((source) => (
                  <option key={source.key} value={source.key}>
                    {source.name}
                  </option>
                ))}
              </optgroup>
            </select>
            
            {/* Source Info */}
            <div className="hidden md:block bg-gray-800/50 px-3 py-2 rounded-lg text-xs text-gray-400">
              {videoSources.length} sources available
            </div>
          </div>
        </div>

        {/* TV Show Controls */}
        {isTV && (
          <div className="p-4 bg-gray-800/50 border-b border-gray-700">
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              {/* Season Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-400">Season:</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  disabled={isLoadingSeasons}
                >
                  {seasons.map((season) => (
                    <option key={season.season_number} value={season.season_number}>
                      {season.name || `Season ${season.season_number}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episode Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-400">Episode:</label>
                <select
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  {episodes.map((episode) => (
                    <option key={episode.episode_number} value={episode.episode_number}>
                      {episode.episode_number}. {episode.name || `Episode ${episode.episode_number}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episode Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => selectedEpisode > 1 && setSelectedEpisode(selectedEpisode - 1)}
                  disabled={selectedEpisode <= 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => selectedEpisode < episodes.length && setSelectedEpisode(selectedEpisode + 1)}
                  disabled={selectedEpisode >= episodes.length}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Next →
                </button>
              </div>

              {/* Auto Next Episode Toggle */}
              <div className="flex items-center space-x-2 ml-auto">
                <label className="text-xs text-gray-400">Auto Next:</label>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Video Player - NO SANDBOX! */}
        <div className="flex-1 bg-black relative">
          {getStreamUrl() ? (
            <iframe
              src={getStreamUrl()}
              title={`${title} - ${selectedSource.name}`}
              className="w-full h-full border-0"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
              style={{ 
                width: '100%', 
                height: '100%',
                border: 'none',
                outline: 'none'
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Loading player...</p>
                <p className="text-sm mt-2">Source: {selectedSource?.name}</p>
                <p className="text-xs mt-1 text-gray-500">
                  URL: {getStreamUrl() ? 'Generated' : 'Generating...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-gray-800/50 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                🎬 <strong className="text-white ml-1">{selectedSource.name}</strong>
                {selectedSource.featured && <span className="text-yellow-400 ml-1">⭐</span>}
              </span>
              {isTV && (
                <span>📺 S{selectedSeason}E{selectedEpisode} of {episodes.length}</span>
              )}
              <span className="text-xs">
                {videoSources.length} sources • {featuredSources.length} featured
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const url = getStreamUrl();
                  if (url) {
                    navigator.clipboard.writeText(url);
                    alert('Stream URL copied to clipboard! 📋');
                  }
                }}
                className="text-gray-400 hover:text-white transition-colors text-xs px-2 py-1 rounded hover:bg-gray-700"
              >
                📋 Copy URL
              </button>
              <a
                href={getStreamUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1 text-xs px-2 py-1 rounded hover:bg-gray-700"
              >
                <ExternalLink size={12} />
                <span>New Tab</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Details Modal Component (Enhanced with All Sources Info)
const ContentDetailsModal = ({ content, isOpen, onClose, customSources, onAddSource, onDeleteSource, contentType, onWatchNow }) => {
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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

  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const rating = content.vote_average;
  const overview = content.overview;
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

  const featuredSources = videoSources.filter(s => s.featured);
  const totalSources = videoSources.length;

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
              {overview && (
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">{overview}</p>
                </div>
              )}

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
                {isTV && content.number_of_seasons && (
                  <div>
                    <span className="text-gray-400">Seasons:</span>
                    <div className="text-white font-medium mt-1">
                      {content.number_of_seasons}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'watch' && (
            <div className="space-y-4">
              {/* Primary Watch Button */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Stream Now</h4>
                    <p className="text-gray-300 text-sm">Watch with embedded player</p>
                  </div>
                  <Monitor className="text-blue-400" size={24} />
                </div>
                <button
                  onClick={() => onWatchNow(content)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Play size={18} fill="currentColor" />
                  <span>{isTV ? 'Watch Series' : 'Watch Movie'}</span>
                </button>
              </div>

              {/* Enhanced Sources Info */}
              <div className="bg-gray-800/30 rounded-lg p-3">
                <h5 className="text-white font-medium mb-2 flex items-center">
                  <Settings size={16} className="mr-2" />
                  Streaming Sources ({totalSources} Available)
                </h5>
                
                {/* Featured Sources */}
                <div className="space-y-1 text-xs text-gray-400 mb-3">
                  <div className="text-sm text-gray-300 font-medium">⭐ Featured Sources:</div>
                  {featuredSources.map(source => (
                    <div key={source.key} className="flex items-center justify-between">
                      <span className="text-yellow-400">• {source.name}</span>
                      <span className="text-green-400">High Quality</span>
                    </div>
                  ))}
                </div>

                {/* All Sources Count */}
                <div className="bg-gray-700/50 rounded p-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Sources:</span>
                    <span className="text-white font-bold">{totalSources}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Featured:</span>
                    <span className="text-yellow-400 font-bold">{featuredSources.length}</span>
                  </div>
                  <div className="text-gray-400 mt-1">
                    Includes: PStream, VidLink, VidSrc, AutoEmbed, MultiEmbed & more
                  </div>
                </div>
              </div>

              {/* Add Custom Source */}
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
                      placeholder="URL"
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

// Content Card Component (Enhanced with source count info)
const ContentCard = ({ 
  content, 
  contentType,
  viewMode, 
  onAddToWatchlist, 
  onMarkAsWatched, 
  onShowDetails,
  onWatchNow,
  watchlist, 
  watched 
}) => {
  const isInWatchlist = watchlist.includes(content.id);
  const isWatched = watched.includes(content.id);
  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;

  const featuredCount = videoSources.filter(s => s.featured).length;

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
              <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded text-xs font-medium">
                {videoSources.length} Sources
              </span>
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
              onClick={() => onWatchNow(content)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300"
            >
              <Play size={16} fill="currentColor" />
              <span>Watch</span>
            </button>
            <button
              onClick={() => onShowDetails(content)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300"
            >
              <Info size={16} />
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
        
        {/* Sources Badge */}
        <div className="absolute top-3 left-3 bg-green-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
          <Monitor size={12} />
          <span className="text-xs font-semibold">{videoSources.length}</span>
        </div>
        
        {/* Content Type Badge */}
        {contentType === CONTENT_TYPES.ANIME && (
          <div className="absolute top-12 left-3 bg-pink-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <Gamepad2 size={12} />
            <span className="text-xs">Anime</span>
          </div>
        )}
        
        {isTV && contentType !== CONTENT_TYPES.ANIME && (
          <div className="absolute top-12 left-3 bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <Tv size={12} />
            <span className="text-xs">Series</span>
          </div>
        )}
        
        {/* Watchlist Badge */}
        {isInWatchlist && (
          <div className="absolute top-21 left-3 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <Heart size={12} fill="currentColor" />
            <span className="text-xs">Watchlist</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => onWatchNow(content)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 flex-1 mr-2 justify-center"
            >
              <Play size={14} fill="currentColor" />
              <span className="text-sm font-semibold">Watch Now</span>
            </button>
            
            <button
              onClick={() => onShowDetails(content)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-2 rounded-xl transition-all duration-300"
            >
              <Info size={14} />
            </button>
          </div>
          
          <div className="flex justify-center space-x-2">
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
            <Monitor size={12} />
            <span>{videoSources.length} sources</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component (Enhanced with all sources)
const MediaHubApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watched, setWatched] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentDetails, setShowContentDetails] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
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

  const watchNow = (content) => {
    setSelectedContent(content);
    setShowVideoPlayer(true);
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

  const featuredSources = videoSources.filter(s => s.featured);

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
                    LetsStream2 Enhanced
                  </h1>
                  <p className="text-sm text-gray-400">
                    Movies • TV Shows • Anime • {videoSources.length} Streaming Sources
                  </p>
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
                <div className="text-2xl font-bold text-green-500">{videoSources.length}</div>
                <div className="text-xs text-gray-400">Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{featuredSources.length}</div>
                <div className="text-xs text-gray-400">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.watchlist}</div>
                <div className="text-xs text-gray-400">Watchlist</div>
              </div>
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
            {contentTypes.map(ct => {
              const IconComponent = ct.icon;
              return (
                <button
                  key={ct.id}
                  onClick={() => changeContentType(ct.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap ${
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
                placeholder={`Search ${currentContentType?.name.toLowerCase()} from ${videoSources.length} sources...`}
                // ... continuing from where it was cut off ...

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

              {/* Sources Info Button */}
              <div className="hidden md:flex bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-400">
                <Monitor size={16} className="mr-2" />
                <span>{videoSources.length} Sources Ready</span>
              </div>
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
            
            {/* Sources Status */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 border border-green-600/30 rounded-xl text-green-400">
              <Zap size={16} />
              <span className="text-sm font-semibold">All {videoSources.length} Sources Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center">
            <X size={20} className="mr-3 flex-shrink-0" />
            <div>
              <strong>Error:</strong> {error}
              <div className="text-sm mt-1">Try switching to a different source or refresh the page.</div>
            </div>
          </div>
        )}

        {/* Sources Status Banner */}
        <div className="mb-6 bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">Streaming Ready</span>
              </div>
              <span className="text-gray-300">
                {videoSources.length} video sources loaded • {featuredSources.length} featured sources
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-yellow-400">
                <Star size={16} />
                <span>PStream, VidLink, VidSrc</span>
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <PlayCircle size={16} />
                <span>No Ads on Featured</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading && content.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400">Loading {currentContentType?.name.toLowerCase()}...</p>
            <p className="text-gray-500 text-sm mt-2">Preparing {videoSources.length} streaming sources</p>
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
                  onWatchNow={watchNow}
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <Plus size={18} />
                  <span>Load More {currentContentType?.name}</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {videoSources.length} sources ready
                  </span>
                </button>
              </div>
            )}

            {/* Loading More Indicator */}
            {isLoading && content.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-400">Loading more content...</span>
              </div>
            )}

            {/* No Content Message */}
            {!isLoading && content.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  {searchTerm ? (
                    <div>
                      <Search size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-xl">No results found for &quot;{searchTerm}&quot;</p>
                      <p className="text-sm mt-2">Try different keywords or browse categories</p>
                    </div>
                  ) : (
                    <div>
                      <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-xl">No content available</p>
                      <p className="text-sm mt-2">Check your connection and try again</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        content={selectedContent}
        contentType={contentType}
        isOpen={showVideoPlayer}
        onClose={() => {
          setShowVideoPlayer(false);
          setSelectedContent(null);
        }}
      />

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
        onWatchNow={watchNow}
      />

      {/* Footer */}
      <div className="bg-gray-950 border-t border-gray-800 px-6 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-white font-bold mb-3">LetsStream2 Enhanced</h3>
              <p className="text-gray-400 text-sm">
                Stream movies, TV shows, and anime with {videoSources.length} premium sources.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Features</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• {videoSources.length} Streaming Sources</li>
                <li>• {featuredSources.length} Featured HD Sources</li>
                <li>• No Ads on Premium Sources</li>
                <li>• Season/Episode Navigation</li>
                <li>• Multiple Quality Options</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Top Sources</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                {featuredSources.map(source => (
                  <li key={source.key}>• {source.name} ⭐</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Stats</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Content: {stats.total} items</li>
                <li>• Watchlist: {stats.watchlist} items</li>
                <li>• Watched: {stats.watched} items</li>
                <li>• Sources: {videoSources.length} active</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500 text-sm">
            <p>© 2024 LetsStream2 Enhanced • Built with ❤️ for movie lovers</p>
            <p className="mt-1">
              Powered by TMDB API • {videoSources.length} streaming sources • Updated 2024-08-14
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaHubApp;