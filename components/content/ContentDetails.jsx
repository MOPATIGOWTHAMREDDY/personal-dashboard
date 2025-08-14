import React, { useState, useEffect } from 'react';
import { X, Play, Heart, Star, Calendar, Clock, Globe, Bookmark, Share2, ExternalLink, Youtube, Award } from 'lucide-react';
import { useIMDB } from '../../hooks/useIMDB';
import { useYouTube } from '../../hooks/useYouTube';
import { GENRE_MAP, CONTENT_TYPES } from '../../utils/constants';

const ContentDetails = ({ 
  content, 
  contentType,
  isOpen, 
  onClose, 
  onPlay,
  onToggleWatchlist,
  isInWatchlist = false,
  videoSources = []
}) => {
  // Always call hooks - no conditional rendering for hooks
  const [activeTab, setActiveTab] = useState('overview');
  const [showTrailer, setShowTrailer] = useState(false);
  
  // These hooks must ALWAYS be called, regardless of content state
  const { imdbData, isLoading: imdbLoading } = useIMDB(content?.id || null, contentType);
  const { trailers, isLoading: trailersLoading } = useYouTube(
    content?.id || null, 
    contentType, 
    content?.title || content?.name || ''
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setShowTrailer(false);
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore background scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Early return AFTER all hooks are called
  if (!isOpen || !content) {
    return null;
  }

  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const rating = content.vote_average;
  const overview = content.overview;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;

  const genres = content.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [];
  const mainTrailer = trailers?.find(t => t.type === 'Trailer') || trailers?.[0];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Globe },
    { id: 'watch', name: 'Watch Now', icon: Play },
    { id: 'trailers', name: 'Trailers', icon: Youtube },
    { id: 'details', name: 'Details', icon: Award }
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out ${title} on CinemaStream!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Show success message
        console.log('Link copied to clipboard!');
      } catch (err) {
        console.log('Failed to copy to clipboard');
      }
    }
  };

  const handleClose = () => {
    setShowTrailer(false);
    onClose();
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎬 Playing from details:', title);
    onPlay(content);
  };

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📚 Toggling watchlist for:', title);
    onToggleWatchlist(content.id);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl w-full max-w-6xl my-4 border border-white/20 shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
          
          {/* Fixed Header with Backdrop */}
          <div className="relative h-48 sm:h-80 flex-shrink-0">
            {/* Backdrop Image */}
            {content.backdrop_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w1280${content.backdrop_path}`}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              type="button"
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 sm:p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-300 hover:scale-110 z-10"
            >
              <X size={20} className="sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>

            {/* Content Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-24 h-36 sm:w-48 sm:h-72 bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/20">
                  {content.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-3xl sm:text-6xl">🎬</span>
                    </div>
                  )}
                </div>

                {/* Title & Info */}
                <div className="flex-1 text-white">
                  <h1 className="text-2xl sm:text-5xl font-black mb-2 sm:mb-4 leading-tight">{title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-6 mb-3 sm:mb-4">
                    {/* TMDB Rating */}
                    {rating > 0 && (
                      <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl">
                        <Star size={16} className="sm:hidden text-yellow-400" fill="currentColor" />
                        <Star size={20} className="hidden sm:block text-yellow-400" fill="currentColor" />
                        <span className="font-bold text-sm sm:text-lg">{rating.toFixed(1)}</span>
                        <span className="text-xs sm:text-sm text-gray-300">TMDB</span>
                      </div>
                    )}

                    {/* IMDB Rating */}
                    {imdbData && imdbData.imdb_rating && imdbData.imdb_rating !== 'N/A' && (
                      <div className="flex items-center space-x-2 bg-orange-500/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl">
                        <Award size={16} className="sm:hidden text-orange-400" />
                        <Award size={20} className="hidden sm:block text-orange-400" />
                        <span className="font-bold text-sm sm:text-lg">{imdbData.imdb_rating}</span>
                        <span className="text-xs sm:text-sm text-gray-300">IMDb</span>
                      </div>
                    )}

                    {/* Year */}
                    <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl">
                      <Calendar size={16} className="sm:hidden text-blue-400" />
                      <Calendar size={20} className="hidden sm:block text-blue-400" />
                      <span className="font-bold text-sm sm:text-base">{year}</span>
                    </div>

                    {/* Duration/Seasons */}
                    {isTV && content.number_of_seasons && (
                      <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl">
                        <Clock size={16} className="sm:hidden text-green-400" />
                        <Clock size={20} className="hidden sm:block text-green-400" />
                        <span className="font-bold text-sm sm:text-base">{content.number_of_seasons} Season{content.number_of_seasons > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                    {genres.slice(0, 5).map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-4 py-1 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-white/30"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <button
                      onClick={handlePlayClick}
                      type="button"
                      className="group flex items-center space-x-2 sm:space-x-3 px-4 sm:px-8 py-2 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <Play size={18} className="sm:hidden" fill="currentColor" />
                      <Play size={24} className="hidden sm:block group-hover:scale-110 transition-transform duration-200" fill="currentColor" />
                      <span>Watch Now</span>
                    </button>

                    <button
                      onClick={handleWatchlistToggle}
                      type="button"
                      className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                        isInWatchlist
                          ? 'bg-red-500/90 hover:bg-red-600 text-white'
                          : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30'
                      }`}
                    >
                      <Heart size={18} className="sm:hidden" fill={isInWatchlist ? 'currentColor' : 'none'} />
                      <Heart size={24} className="hidden sm:block" fill={isInWatchlist ? 'currentColor' : 'none'} />
                    </button>

                    {mainTrailer && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        type="button"
                        className="p-2 sm:p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Youtube size={18} className="sm:hidden" />
                        <Youtube size={24} className="hidden sm:block" />
                      </button>
                    )}

                    <button
                      onClick={handleShare}
                      type="button"
                      className="p-2 sm:p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 transition-all duration-300 transform hover:scale-105"
                    >
                      <Share2 size={18} className="sm:hidden" />
                      <Share2 size={24} className="hidden sm:block" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-2 overflow-x-auto">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                    className={`flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent size={16} className="sm:hidden" />
                    <IconComponent size={18} className="hidden sm:block" />
                    <span className="text-sm sm:text-base">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Synopsis</h3>
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                      {overview || 'No synopsis available for this content.'}
                    </p>
                  </div>
                  
                  {imdbData && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">IMDb Information</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">Rating</span>
                          <div className="text-white font-bold text-lg">{imdbData.imdb_rating || 'N/A'}/10</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Votes</span>
                          <div className="text-white font-bold text-lg">{imdbData.imdb_votes || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Metascore</span>
                          <div className="text-white font-bold text-lg">{imdbData.metascore || 'N/A'}/100</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'watch' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg sm:text-xl">Stream Now</h3>
                        <p className="text-gray-300 text-sm sm:text-base">Watch with premium sources</p>
                      </div>
                      <div className="text-2xl sm:text-4xl">🎬</div>
                    </div>
                    <button
                      onClick={handlePlayClick}
                      type="button"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <Play size={20} className="sm:hidden" fill="currentColor" />
                        <Play size={24} className="hidden sm:block" fill="currentColor" />
                        <span>Watch {isTV ? 'Series' : 'Movie'}</span>
                      </div>
                    </button>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                    <h3 className="text-white font-bold text-base sm:text-lg mb-4">Available Sources ({videoSources.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {videoSources.filter(s => s.featured).slice(0, 6).map(source => (
                        <div key={source.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-white font-medium text-sm sm:text-base">{source.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {source.quality && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">
                                {source.quality}
                              </span>
                            )}
                            <span className="text-yellow-400">⭐</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trailers' && (
                <div className="space-y-6">
                  {trailersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : trailers && trailers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {trailers.map(trailer => (
                        <div key={trailer.key} className="group cursor-pointer">
                          <div className="relative bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden aspect-video hover:scale-105 transition-transform duration-300">
                            <img
                              src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                              alt={trailer.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                                type="button"
                                className="p-3 sm:p-4 bg-red-600 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200"
                              >
                                <Play size={20} className="sm:hidden text-white ml-1" fill="currentColor" />
                                <Play size={24} className="hidden sm:block text-white ml-1" fill="currentColor" />
                              </button>
                            </div>
                          </div>
                          <h4 className="text-white font-medium mt-3 text-sm sm:text-base line-clamp-1">{trailer.name}</h4>
                          <p className="text-gray-400 text-xs sm:text-sm">{trailer.type} • YouTube</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Youtube size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400">No trailers available for this content.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h3 className="text-white font-bold text-base sm:text-lg mb-4">Basic Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-400 text-sm">Release Date</span>
                          <div className="text-white font-medium">{releaseDate ? new Date(releaseDate).toLocaleDateString() : 'TBA'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Original Language</span>
                          <div className="text-white font-medium uppercase">{content.original_language || 'Unknown'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Popularity</span>
                          <div className="text-white font-medium">{content.popularity?.toFixed(0) || 'N/A'}</div>
                        </div>
                        {content.vote_count && (
                          <div>
                            <span className="text-gray-400 text-sm">Vote Count</span>
                            <div className="text-white font-medium">{content.vote_count.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h3 className="text-white font-bold text-base sm:text-lg mb-4">Content Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-400 text-sm">Type</span>
                          <div className="text-white font-medium">
                            {contentType === CONTENT_TYPES.ANIME ? 'Anime Series' : isTV ? 'TV Series' : 'Movie'}
                          </div>
                        </div>
                        {isTV && content.number_of_seasons && (
                          <>
                            <div>
                              <span className="text-gray-400 text-sm">Seasons</span>
                              <div className="text-white font-medium">{content.number_of_seasons}</div>
                            </div>
                            {content.number_of_episodes && (
                              <div>
                                <span className="text-gray-400 text-sm">Episodes</span>
                                <div className="text-white font-medium">{content.number_of_episodes}</div>
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <span className="text-gray-400 text-sm">Adult Content</span>
                          <div className="text-white font-medium">{content.adult ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Status</span>
                          <div className="text-white font-medium">{content.status || 'Released'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && mainTrailer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              type="button"
              className="absolute -top-12 right-0 p-2 text-white hover:text-red-400 transition-colors duration-200"
            >
              <X size={32} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${mainTrailer.key}?autoplay=1`}
              title={mainTrailer.name}
              className="w-full h-full rounded-xl sm:rounded-2xl"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ContentDetails;