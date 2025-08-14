import { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, Calendar, Clock, Users, TrendingUp, Target, Play, Eye, Wifi, WifiOff, 
  Search, Filter, Star, Heart, Share2, Download, Maximize2, Volume2, Settings,
  ChevronLeft, ChevronRight, RefreshCw, BarChart3, Globe, Zap, Award
} from 'lucide-react';

const AdvancedStreamedSports = () => {
  // Core State
  const [activeTab, setActiveTab] = useState('live');
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [streams, setStreams] = useState([]);
  const [error, setError] = useState(null);
  
  // Advanced Features State
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [filterPopular, setFilterPopular] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [streamQuality, setStreamQuality] = useState('auto');
  const [showStats, setShowStats] = useState(false);
  const [matchStats, setMatchStats] = useState({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage] = useState(12);
  
  // Stream Player State
  const [fullscreenStream, setFullscreenStream] = useState(null);
  const [streamVolume, setStreamVolume] = useState(80);
  const [streamSettings, setStreamSettings] = useState({
    autoplay: true,
    quality: 'auto',
    subtitles: false
  });

  const API_BASE = 'https://streamed.pk/api';

  // Enhanced Sport Categories with emojis and colors
  const sportConfig = {
    football: { emoji: '⚽', color: 'bg-green-500', name: 'Football' },
    basketball: { emoji: '🏀', color: 'bg-orange-500', name: 'Basketball' },
    tennis: { emoji: '🎾', color: 'bg-yellow-500', name: 'Tennis' },
    hockey: { emoji: '🏒', color: 'bg-blue-500', name: 'Hockey' },
    baseball: { emoji: '⚾', color: 'bg-red-500', name: 'Baseball' },
    mma: { emoji: '🥊', color: 'bg-purple-500', name: 'MMA' },
    boxing: { emoji: '🥊', color: 'bg-purple-600', name: 'Boxing' },
    volleyball: { emoji: '🏐', color: 'bg-indigo-500', name: 'Volleyball' },
    golf: { emoji: '⛳', color: 'bg-green-600', name: 'Golf' },
    racing: { emoji: '🏎️', color: 'bg-red-600', name: 'Racing' },
    cycling: { emoji: '🚴', color: 'bg-blue-600', name: 'Cycling' },
    swimming: { emoji: '🏊', color: 'bg-cyan-500', name: 'Swimming' },
    wrestling: { emoji: '🤼', color: 'bg-amber-600', name: 'Wrestling' },
    badminton: { emoji: '🏸', color: 'bg-lime-500', name: 'Badminton' },
    cricket: { emoji: '🏏', color: 'bg-emerald-500', name: 'Cricket' },
    rugby: { emoji: '🏉', color: 'bg-teal-500', name: 'Rugby' }
  };

  // Initialize component
  useEffect(() => {
    fetchSports();
    fetchMatches('live');
    loadFavorites();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh && activeTab === 'live') {
      interval = setInterval(() => {
        fetchMatches(activeTab);
      }, refreshInterval);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab, refreshInterval]);

  // Fetch matches when tab or filters change
  useEffect(() => {
    if (activeTab) {
      fetchMatches(activeTab);
    }
  }, [activeTab, filterPopular]);

  const loadFavorites = () => {
    const saved = JSON.parse(localStorage.getItem('streamedFavorites') || '[]');
    setFavorites(saved);
  };

  const saveFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    localStorage.setItem('streamedFavorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (matchId) => {
    const newFavorites = favorites.includes(matchId)
      ? favorites.filter(id => id !== matchId)
      : [...favorites, matchId];
    saveFavorites(newFavorites);
  };

  const fetchSports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/sports`);
      if (!response.ok) throw new Error('Failed to fetch sports');
      const sportsData = await response.json();
      setSports(sportsData);
    } catch (err) {
      console.error('Error fetching sports:', err);
      setError('Failed to load sports categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (category) => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint;
      const popularSuffix = filterPopular ? '/popular' : '';
      
      switch (category) {
        case 'live':
          endpoint = `${API_BASE}/matches/live${popularSuffix}`;
          break;
        case 'today':
          endpoint = `${API_BASE}/matches/all-today${popularSuffix}`;
          break;
        case 'popular':
          endpoint = `${API_BASE}/matches/all/popular`;
          break;
        case 'all':
          endpoint = `${API_BASE}/matches/all${popularSuffix}`;
          break;
        default:
          endpoint = `${API_BASE}/matches/${category}${popularSuffix}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Failed to fetch matches: ${response.status}`);
      const matchesData = await response.json();
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(`Failed to load ${category} matches`);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreams = async (match) => {
    if (!match.sources || match.sources.length === 0) {
      setError('No streams available for this match');
      return;
    }

    setSelectedMatch(match);
    setLoading(true);
    setError(null);

    try {
      // Try all available sources
      const streamPromises = match.sources.map(async (source) => {
        try {
          const response = await fetch(`${API_BASE}/stream/${source.source}/${source.id}`);
          if (response.ok) {
            const data = await response.json();
            return { source: source.source, streams: Array.isArray(data) ? data : [] };
          }
        } catch (err) {
          console.error(`Error fetching from ${source.source}:`, err);
        }
        return { source: source.source, streams: [] };
      });

      const results = await Promise.all(streamPromises);
      const allStreams = results.flatMap(result => 
        result.streams.map(stream => ({ ...stream, sourceType: result.source }))
      );
      
      setStreams(allStreams);
      
      if (allStreams.length === 0) {
        setError('No active streams found for this match');
      }
    } catch (err) {
      console.error('Error fetching streams:', err);
      setError('Failed to load streams for this match');
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchStats = async (matchId) => {
    // This would be a hypothetical endpoint for match statistics
    try {
      const response = await fetch(`${API_BASE}/matches/${matchId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setMatchStats(prev => ({ ...prev, [matchId]: stats }));
      }
    } catch (err) {
      console.error('Error fetching match stats:', err);
    }
  };

  const shareMatch = async (match) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: match.title,
          text: `Watch ${match.title} live!`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${match.title} - ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getSportConfig = (category) => {
    return sportConfig[category] || { emoji: '🏆', color: 'bg-gray-500', name: category };
  };

  // Filter matches based on search and filters
  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (match.teams?.home?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (match.teams?.away?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = selectedSport === 'all' || match.category === selectedSport;
    
    return matchesSearch && matchesSport;
  });

  // Pagination
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  const enhancedTabs = [
    { id: 'live', name: '🔴 Live', color: 'bg-red-500', count: matches.filter(m => m.status === 'live').length },
    { id: 'today', name: '📅 Today', color: 'bg-blue-500' },
    { id: 'popular', name: '🔥 Popular', color: 'bg-orange-500' },
    { id: 'all', name: '🌍 All Sports', color: 'bg-purple-500' },
    ...sports.slice(0, 8).map(sport => {
      const config = getSportConfig(sport.id);
      return {
        id: sport.id,
        name: `${config.emoji} ${config.name}`,
        color: config.color,
        count: matches.filter(m => m.category === sport.id).length
      };
    })
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Advanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🏆 Streamed Sports Pro
              </h1>
              <p className="text-gray-600">Advanced live streaming platform with real-time updates</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-full transition-all ${
                  autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
                title="Auto Refresh"
              >
                <RefreshCw size={20} className={autoRefresh ? 'animate-spin' : ''} />
              </button>
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                title="Show Statistics"
              >
                <BarChart3 size={20} />
              </button>
              
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <Globe size={16} className="text-gray-500 mr-2" />
                <span className="text-sm font-medium">{filteredMatches.length} matches</span>
              </div>
            </div>
          </div>

          {/* Advanced Search and Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search matches, teams, or sports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sports</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>
                  {getSportConfig(sport.id).emoji} {sport.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setFilterPopular(!filterPopular)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                filterPopular 
                  ? 'bg-orange-100 text-orange-600 border border-orange-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star size={16} />
              <span>Popular Only</span>
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
              title="Toggle View Mode"
            >
              {viewMode === 'grid' ? <Users size={18} /> : <Target size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {enhancedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                activeTab === tab.id
                  ? `${tab.color} text-white shadow-lg transform scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
              }`}
            >
              {tab.name}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 bg-black bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading matches...</p>
        </div>
      )}

      {/* Advanced Stream Viewer Modal */}
      {selectedMatch && streams.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMatch.title}</h2>
                  <p className="text-gray-500 mt-1">
                    {getSportConfig(selectedMatch.category).emoji} {selectedMatch.category.toUpperCase()} • 
                    {formatDate(selectedMatch.date)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => shareMatch(selectedMatch)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Share Match"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedMatch.id)}
                    className={`p-2 rounded-lg transition-all ${
                      favorites.includes(selectedMatch.id)
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title="Add to Favorites"
                  >
                    <Heart size={20} fill={favorites.includes(selectedMatch.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => {setSelectedMatch(null); setStreams([]);}}
                    className="text-gray-500 hover:text-gray-700 text-3xl p-1"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Stream Quality Selector */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={streamQuality}
                    onChange={(e) => setStreamQuality(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="auto">Auto Quality</option>
                    <option value="hd">HD Only</option>
                    <option value="sd">SD Only</option>
                  </select>
                  
                  <div className="flex items-center space-x-2">
                    <Volume2 size={16} />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={streamVolume}
                      onChange={(e) => setStreamVolume(e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">{streamVolume}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Zap size={16} />
                  <span>{streams.length} streams available</span>
                </div>
              </div>
              
              {/* Streams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams
                  .filter(stream => {
                    if (streamQuality === 'hd') return stream.hd;
                    if (streamQuality === 'sd') return !stream.hd;
                    return true;
                  })
                  .map((stream) => (
                  <div key={stream.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Stream {stream.streamNo}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {stream.sourceType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {stream.hd && (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded font-bold">
                            HD
                          </span>
                        )}
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {stream.language}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <a
                        href={stream.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
                      >
                        <Play size={16} />
                        <span>Watch Stream</span>
                      </a>
                      
                      <button
                        onClick={() => setFullscreenStream(stream)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
                      >
                        <Maximize2 size={16} />
                        <span>Fullscreen</span>
                      </button>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <div>Quality: {stream.hd ? 'High Definition' : 'Standard Definition'}</div>
                      <div>Source: {stream.sourceType.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Statistics Dashboard */}
        {showStats && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="mr-2" size={24} />
              Live Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">{matches.length}</div>
                <div className="text-sm opacity-90">Total Matches</div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">
                  {matches.filter(m => activeTab === 'live').length}
                </div>
                <div className="text-sm opacity-90">Live Now</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">{sports.length}</div>
                <div className="text-sm opacity-90">Sports Categories</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                <div className="text-2xl font-bold">{favorites.length}</div>
                <div className="text-sm opacity-90">Favorites</div>
              </div>
            </div>
          </div>
        )}

        {/* Matches Display */}
        {!loading && currentMatches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                {activeTab === 'live' && (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                    Live Matches
                  </>
                )}
                {activeTab === 'today' && <><Calendar className="mr-3" size={28} />Today's Matches</>}
                {activeTab === 'popular' && <><TrendingUp className="mr-3" size={28} />Popular Matches</>}
                {activeTab === 'all' && <><Trophy className="mr-3" size={28} />All Matches</>}
                {!['live', 'today', 'popular', 'all'].includes(activeTab) && (
                  <>
                    <Award className="mr-3" size={28} />
                    {getSportConfig(activeTab).emoji} {sports.find(s => s.id === activeTab)?.name || activeTab} Matches
                  </>
                )}
              </h2>
              
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstMatch + 1}-{Math.min(indexOfLastMatch, filteredMatches.length)} of {filteredMatches.length}
              </div>
            </div>
            
            {/* Enhanced Matches Grid */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {currentMatches.map((match) => {
                const sportConfig = getSportConfig(match.category);
                const isFavorite = favorites.includes(match.id);
                
                return (
                  <div 
                    key={match.id} 
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${sportConfig.color} overflow-hidden`}
                  >
                    {/* Match Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs text-white px-3 py-1 rounded-full font-medium ${sportConfig.color}`}>
                          {sportConfig.emoji} {match.category.toUpperCase()}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {match.popular && (
                            <span className="text-xs bg-gradient-to-r from-orange-400 to-red-400 text-white px-2 py-1 rounded-full font-bold animate-pulse">
                              🔥 HOT
                            </span>
                          )}
                          
                          {activeTab === 'live' && (
                            <div className="flex items-center text-red-500 text-sm font-bold">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                              LIVE
                            </div>
                          )}
                          
                          <button
                            onClick={() => toggleFavorite(match.id)}
                            className={`p-1 rounded-full transition-all ${
                              isFavorite 
                                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Match Title */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
                        {match.title}
                      </h3>
                      
                      {/* Team Information */}
                      {match.teams && (
                        <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
                          {match.teams.home && (
                            <div className="flex items-center space-x-2 flex-1">
                              {match.teams.home.badge && (
                                <img
                                  src={`${API_BASE}/images/badge/${match.teams.home.badge}.webp`}
                                  alt={match.teams.home.name}
                                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                  onError={(e) => {
                                    e.target.src = `data:image/svg+xml;base64,${btoa(`
                                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="16" cy="16" r="16" fill="${sportConfig.color.replace('bg-', '#')}"/>
                                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
                                          ${match.teams.home.name.charAt(0)}
                                        </text>
                                      </svg>
                                    `)}`;
                                  }}
                                />
                              )}
                              <span className="text-sm font-medium text-gray-700 truncate">
                                {match.teams.home.name}
                              </span>
                            </div>
                          )}
                          
                          <div className="px-2">
                            <span className="text-xs text-gray-400 font-bold">VS</span>
                          </div>
                          
                          {match.teams.away && (
                            <div className="flex items-center space-x-2 flex-1 justify-end">
                              <span className="text-sm font-medium text-gray-700 truncate">
                                {match.teams.away.name}
                              </span>
                              {match.teams.away.badge && (
                                <img
                                  src={`${API_BASE}/images/badge/${match.teams.away.badge}.webp`}
                                  alt={match.teams.away.name}
                                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                  onError={(e) => {
                                    e.target.src = `data:image/svg+xml;base64,${btoa(`
                                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="16" cy="16" r="16" fill="${sportConfig.color.replace('bg-', '#')}"/>
                                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
                                          ${match.teams.away.name.charAt(0)}
                                        </text>
                                      </svg>
                                    `)}`;
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Match Details */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{formatDate(match.date)}</span>
                        </div>
                        
                        {match.sources && (
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Wifi size={12} />
                            <span>{match.sources.length} source{match.sources.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {match.sources && match.sources.length > 0 ? (
                          <button
                            onClick={() => fetchStreams(match)}
                            className={`flex-1 ${sportConfig.color} hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg`}
                          >
                            <Eye size={14} />
                            <span>Watch Live</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 cursor-not-allowed"
                          >
                            <WifiOff size={14} />
                            <span>No Stream</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => shareMatch(match)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                          title="Share Match"
                        >
                          <Share2 size={14} />
                        </button>
                        
                        <button
                          onClick={() => fetchMatchStats(match.id)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                          title="Match Stats"
                        >
                          <BarChart3 size={14} />
                        </button>
                      </div>
                      
                      {/* Match Stats Preview */}
                      {matchStats[match.id] && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{matchStats[match.id].possession}%</div>
                              <div className="text-gray-500">Possession</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{matchStats[match.id].shots}</div>
                              <div className="text-gray-500">Shots</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">{matchStats[match.id].corners}</div>
                              <div className="text-gray-500">Corners</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Match Poster Preview */}
                    {match.poster && (
                      <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200">
                        <img
                          src={`${API_BASE}${match.poster}.webp`}
                          alt={match.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {e.target.style.display = 'none'}}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play size={24} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Favorites Section */}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="mr-3 text-red-500" size={28} />
              Your Favorites
            </h2>
            
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500">Add matches to your favorites to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.filter(match => favorites.includes(match.id)).map(match => (
                  <div key={match.id} className="border rounded-xl p-4 hover:shadow-md transition-all">
                    <h3 className="font-semibold text-gray-900 mb-2">{match.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{formatDate(match.date)}</p>
                    <button
                      onClick={() => fetchStreams(match)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all"
                    >
                      Watch Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMatches.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="max-w-md mx-auto">
              {searchTerm ? (
                <>
                  <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No matches found</h3>
                  <p className="text-gray-500 mb-6">
                    No matches found for "{searchTerm}". Try adjusting your search terms.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <WifiOff className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No matches available</h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === 'live' 
                      ? 'No live matches at the moment. Check back later!' 
                      : `No ${activeTab} matches available right now.`
                    }
                  </p>
                  <button
                    onClick={() => fetchMatches(activeTab)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-all"
                  >
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Settings Panel */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white rounded-full shadow-lg border border-gray-200">
            <button
              onClick={() => document.getElementById('settings-panel').classList.toggle('hidden')}
              className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
          
          <div id="settings-panel" className="hidden absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64">
            <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Auto-refresh live matches</span>
                </label>
              </div>
              
              {autoRefresh && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Refresh interval</label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    <option value={15000}>15 seconds</option>
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={120000}>2 minutes</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Default stream quality</label>
                <select
                  value={streamQuality}
                  onChange={(e) => setStreamQuality(e.target.value)}
                  className="w-full text-sm border rounded px-2 py-1"
                >
                  <option value="auto">Auto</option>
                  <option value="hd">HD Preferred</option>
                  <option value="sd">SD Preferred</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Matches per page</label>
                <select
                  value={matchesPerPage}
                  onChange={(e) => setMatchesPerPage(Number(e.target.value))}
                  className="w-full text-sm border rounded px-2 py-1"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setSports([]);
                  setMatches([]);
                  setFavorites([]);
                  localStorage.clear();
                  fetchSports();
                  fetchMatches(activeTab);
                }}
                className="w-full text-sm bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-all"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Stream Modal */}
        {fullscreenStream && (
          <div className="fixed inset-0 bg-black z-60 flex items-center justify-center">
            <div className="relative w-full h-full">
              <iframe
                src={fullscreenStream.embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={`Stream ${fullscreenStream.streamNo}`}
              />
              
              <button
                onClick={() => setFullscreenStream(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                ✕
              </button>
              
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                <div className="text-sm">
                  Stream {fullscreenStream.streamNo} • {fullscreenStream.language}
                  {fullscreenStream.hd && ' • HD'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedStreamedSports;