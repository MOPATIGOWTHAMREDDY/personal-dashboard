import React, { useState, useEffect, useCallback } from 'react';
import { X, Settings, Monitor, AlertTriangle, CheckCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { videoSources } from '../../utils/videoSources';
import { CONTENT_TYPES } from '../../utils/constants';

const EnhancedVideoPlayer = ({ content, contentType, isOpen, onClose }) => {
  const [selectedSource, setSelectedSource] = useState(videoSources.find(s => s.featured) || videoSources[0]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  
  // Enhanced state management
  const [loadingSource, setLoadingSource] = useState(false);
  const [sourceError, setSourceError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [workingSources, setWorkingSources] = useState(new Set());
  const [failedSources, setFailedSources] = useState(new Set());
  const [autoFallback, setAutoFallback] = useState(true);

  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;
  const title = content?.title || content?.name;

  // Group sources
  const pstreamSources = videoSources.filter(s => s.key.includes('pstream'));
  const featuredSources = videoSources.filter(s => s.featured);
  const regularSources = videoSources.filter(s => !s.featured);

  // Fetch TV details
  useEffect(() => {
    if (isOpen && content && isTV) {
      fetchTVDetails();
    }
  }, [isOpen, content, isTV]);

  const fetchTVDetails = async () => {
    if (!content?.id) return;
    
    try {
      setIsLoadingSeasons(true);
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
    resetSourceStates();
  };

  const getStreamUrl = () => {
    if (!content?.id || !selectedSource) return '';
    
    if (isTV) {
      return selectedSource.getTVUrl(content.id, selectedSeason, selectedEpisode);
    } else {
      return selectedSource.getMovieUrl(content.id);
    }
  };

  // Auto-fallback logic
  const tryNextPStreamSource = useCallback(() => {
    if (!autoFallback) return false;
    
    const currentIndex = pstreamSources.findIndex(s => s.key === selectedSource.key);
    const nextPStreamSource = pstreamSources[currentIndex + 1];
    
    if (nextPStreamSource && !failedSources.has(nextPStreamSource.key)) {
      console.log(`🔄 Auto-switching to ${nextPStreamSource.name}`);
      handleSourceChange(nextPStreamSource.key, true);
      return true;
    }
    
    const workingFeaturedSources = featuredSources.filter(s => 
      !failedSources.has(s.key) && s.key !== selectedSource.key
    );
    
    if (workingFeaturedSources.length > 0) {
      console.log(`🔄 Auto-switching to ${workingFeaturedSources[0].name}`);
      handleSourceChange(workingFeaturedSources[0].key, true);
      return true;
    }
    
    return false;
  }, [selectedSource, pstreamSources, featuredSources, failedSources, autoFallback]);

  const handleSourceChange = useCallback((newSourceKey, isAutoFallback = false) => {
    const newSource = videoSources.find(s => s.key === newSourceKey);
    if (!newSource) return;

    setLoadingSource(true);
    setSourceError(false);
    
    if (!isAutoFallback) {
      setRetryCount(0);
    }
    
    setSelectedSource(newSource);
    console.log(`🎬 Switching to: ${newSource.name}`);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setLoadingSource(false);
    setSourceError(false);
    setWorkingSources(prev => new Set([...prev, selectedSource.key]));
    console.log(`✅ ${selectedSource.name} loaded successfully`);
  }, [selectedSource]);

  const handleIframeError = useCallback(() => {
    console.log(`❌ ${selectedSource.name} failed to load`);
    setLoadingSource(false);
    setSourceError(true);
    setFailedSources(prev => new Set([...prev, selectedSource.key]));
    
    if (autoFallback && retryCount < 3) {
      setTimeout(() => {
        if (tryNextPStreamSource()) {
          setRetryCount(prev => prev + 1);
        }
      }, 2000);
    }
  }, [selectedSource, autoFallback, retryCount, tryNextPStreamSource]);

  const resetSourceStates = () => {
    setWorkingSources(new Set());
    setFailedSources(new Set());
    setRetryCount(0);
    setSourceError(false);
  };

  const retryCurrentSource = () => {
    setFailedSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedSource.key);
      return newSet;
    });
    setSourceError(false);
    setLoadingSource(true);
  };

  useEffect(() => {
    if (isOpen && content) {
      resetSourceStates();
    }
  }, [isOpen, content, selectedSeason, selectedEpisode]);

  if (!isOpen || !content) return null;

  const getSourceStatus = (sourceKey) => {
    if (workingSources.has(sourceKey)) return 'working';
    if (failedSources.has(sourceKey)) return 'failed';
    return 'unknown';
  };

  const getSourceIcon = (status) => {
    switch (status) {
      case 'working': return <CheckCircle size={12} className="text-green-400" />;
      case 'failed': return <AlertTriangle size={12} className="text-red-400" />;
      default: return <Monitor size={12} className="text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden border border-white/20 shadow-2xl flex flex-col">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-gray-400">
                  {isTV ? `S${selectedSeason}E${selectedEpisode}` : 'Movie'} • {selectedSource.name}
                </span>
                {selectedSource.serverType && (
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                    {selectedSource.serverType}
                  </span>
                )}
                {getSourceIcon(getSourceStatus(selectedSource.key))}
              </div>
            </div>
          </div>
          
          {/* Enhanced Source Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedSource.key}
              onChange={(e) => handleSourceChange(e.target.value)}
              className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-64"
              disabled={loadingSource}
            >
              <optgroup label="⭐ PStream Servers">
                {pstreamSources.map((source) => (
                  <option key={source.key} value={source.key} className="bg-gray-800">
                    🎬 {source.name} {getSourceStatus(source.key) === 'working' ? '✅' : getSourceStatus(source.key) === 'failed' ? '❌' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎯 Featured Sources">
                {featuredSources.filter(s => !s.key.includes('pstream')).map((source) => (
                  <option key={source.key} value={source.key} className="bg-gray-800">
                    ⭐ {source.name} {getSourceStatus(source.key) === 'working' ? '✅' : getSourceStatus(source.key) === 'failed' ? '❌' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="📺 Backup Sources">
                {regularSources.map((source) => (
                  <option key={source.key} value={source.key} className="bg-gray-800">
                    {source.name} {getSourceStatus(source.key) === 'working' ? '✅' : getSourceStatus(source.key) === 'failed' ? '❌' : ''}
                  </option>
                ))}
              </optgroup>
            </select>
            
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl text-sm">
              {loadingSource ? (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="animate-spin w-4 h-4 border border-yellow-400 border-t-transparent rounded-full"></div>
                  <span>Loading...</span>
                </div>
              ) : sourceError ? (
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle size={16} />
                  <span>Failed</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle size={16} />
                  <span>Ready</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <label className="text-gray-400">Auto-Switch:</label>
              <input
                type="checkbox"
                checked={autoFallback}
                onChange={(e) => setAutoFallback(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* PStream Server Quick Switcher */}
        {selectedSource.key.includes('pstream') && (
          <div className="px-6 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-blue-300">
                <Settings size={18} />
                <span className="font-medium">PStream Servers:</span>
              </div>
              <div className="flex items-center space-x-3">
                {pstreamSources.map(source => (
                  <button
                    key={source.key}
                    onClick={() => handleSourceChange(source.key)}
                    disabled={loadingSource}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                      selectedSource.key === source.key
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : getSourceStatus(source.key) === 'failed'
                        ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                        : getSourceStatus(source.key) === 'working'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {getSourceIcon(getSourceStatus(source.key))}
                    <span>{source.serverType || 'Default'}</span>
                  </button>
                ))}
                
                {sourceError && (
                  <button
                    onClick={retryCurrentSource}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-sm font-medium hover:bg-yellow-500/30 transition-all duration-300 flex items-center space-x-2"
                  >
                    <RotateCcw size={16} />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TV Controls */}
        {isTV && (
          <div className="px-6 py-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-400 font-medium">Season:</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                    className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
                    disabled={isLoadingSeasons || loadingSource}
                  >
                    {seasons.map((season) => (
                      <option key={season.season_number} value={season.season_number} className="bg-gray-800">
                        {season.name || `Season ${season.season_number}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-400 font-medium">Episode:</label>
                  <select
                    value={selectedEpisode}
                    onChange={(e) => {
                      setSelectedEpisode(parseInt(e.target.value));
                      resetSourceStates();
                    }}
                    className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white text-sm"
                    disabled={loadingSource}
                  >
                    {episodes.map((episode) => (
                      <option key={episode.episode_number} value={episode.episode_number} className="bg-gray-800">
                        {episode.episode_number}. {episode.name || `Episode ${episode.episode_number}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (selectedEpisode > 1) {
                        setSelectedEpisode(selectedEpisode - 1);
                        resetSourceStates();
                      }
                    }}
                    disabled={selectedEpisode <= 1 || loadingSource}
                    className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => {
                      if (selectedEpisode < episodes.length) {
                        setSelectedEpisode(selectedEpisode + 1);
                        resetSourceStates();
                      }
                    }}
                    disabled={selectedEpisode >= episodes.length || loadingSource}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <span className="text-green-400">{workingSources.size} working</span> • 
                <span className="text-red-400 ml-1">{failedSources.size} failed</span> • 
                <span className="text-yellow-400 ml-1">Retry #{retryCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Player */}
        <div className="flex-1 bg-black relative">
          {loadingSource && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animation-delay-1000"></div>
                </div>
                <p className="text-xl font-semibold">Loading {selectedSource.name}...</p>
                <p className="text-sm text-gray-400 mt-2">
                  {selectedSource.serverType && `Server: ${selectedSource.serverType}`}
                </p>
                {retryCount > 0 && (
                  <p className="text-xs text-yellow-400 mt-3">Attempt #{retryCount + 1}</p>
                )}
              </div>
            </div>
          )}

          {getStreamUrl() ? (
            <iframe
              key={`${selectedSource.key}-${content.id}-${selectedSeason}-${selectedEpisode}-${retryCount}`}
              src={getStreamUrl()}
              title={`${title} - ${selectedSource.name}`}
              className="w-full h-full"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen={true}
              webkitAllowFullScreen={true}
              mozAllowFullScreen={true}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone; payment; geolocation"
              referrerPolicy="no-referrer"
              loading="eager"
              style={{ 
                width: '100%', 
                height: '100%',
                border: 'none',
                outline: 'none',
                background: 'black',
                display: 'block'
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Monitor size={64} className="mx-auto mb-6 opacity-50" />
                <p className="text-xl font-medium">Preparing {selectedSource?.name}...</p>
                <p className="text-sm mt-2 text-yellow-400">
                  Generating secure stream URL...
                </p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {sourceError && !loadingSource && (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-20">
              <div className="text-center text-white max-w-lg p-8">
                <AlertTriangle size={64} className="mx-auto mb-6 text-red-400" />
                <h3 className="text-2xl font-bold mb-4">Stream Unavailable</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {selectedSource.name} couldn't load this content.
                  {autoFallback && retryCount < 3 ? ' Trying alternative servers...' : ' Please try a different source.'}
                </p>
                
                <div className="space-y-4">
                  <div className="text-sm text-gray-400 mb-3">Try these alternatives:</div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {pstreamSources
                      .filter(s => s.key !== selectedSource.key && !failedSources.has(s.key))
                      .slice(0, 3)
                      .map(source => (
                      <button
                        key={source.key}
                        onClick={() => handleSourceChange(source.key)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2"
                      >
                        <span>{source.name}</span>
                        {getSourceIcon(getSourceStatus(source.key))}
                      </button>
                    ))}
                    
                    {featuredSources
                      .filter(s => !s.key.includes('pstream') && !failedSources.has(s.key))
                      .slice(0, 2)
                      .map(source => (
                      <button
                        key={source.key}
                        onClick={() => handleSourceChange(source.key)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                      >
                        {source.name}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={retryCurrentSource}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-3 mx-auto mt-6"
                  >
                    <RotateCcw size={18} />
                    <span>Retry {selectedSource.name}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="px-6 py-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎬</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{selectedSource.name}</span>
                    {selectedSource.featured && <span className="text-yellow-400">⭐</span>}
                    {selectedSource.serverType && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                        {selectedSource.serverType}
                      </span>
                    )}
                    {getSourceIcon(getSourceStatus(selectedSource.key))}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Status: {loadingSource ? '⏳ Loading' : sourceError ? '❌ Error' : '✅ Ready'}
                  </div>
                </div>
              </div>
              
              {isTV && (
                <div className="text-gray-400">
                  <span className="text-blue-400">📺</span> S{selectedSeason}E{selectedEpisode} of {episodes.length}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-gray-400">
              <div className="text-xs">
                <span className="text-green-400">{workingSources.size} working</span> • 
                <span className="text-red-400">{failedSources.size} failed</span>
              </div>
              
              <button
                onClick={() => {
                  const url = getStreamUrl();
                  if (url) {
                    navigator.clipboard.writeText(url);
                    // You could add a toast notification here
                  }
                }}
                className="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded-lg hover:bg-white/10"
              >
                📋 Copy URL
              </button>
              
              <a
                href={getStreamUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-xs px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <span>🔗 Open in New Tab</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;