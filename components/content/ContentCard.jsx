import React, { useState } from 'react';
import { Play, Heart, Star, Calendar, Clock, Info, Bookmark, Eye } from 'lucide-react';
import { CONTENT_TYPES, GENRE_MAP } from '../../utils/constants';

const ContentCard = ({ 
  content, 
  contentType, 
  onPlay, 
  onToggleWatchlist, 
  onShowDetails,
  isInWatchlist = false,
  isWatched = false 
}) => {
  // HOOKS MUST BE CALLED FIRST - before any conditional returns
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // NULL CHECK AFTER HOOKS
  if (!content) {
    console.warn('ContentCard: No content provided');
    return (
      <div className="relative w-full aspect-[2/3] bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-gray-400 text-sm">Content Loading...</p>
        </div>
      </div>
    );
  }

  // Safe property access - content is guaranteed to exist here
  const title = content.title || content.name || 'Untitled';
  const releaseDate = content.release_date || content.first_air_date;
  const rating = content.vote_average || 0;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
  const contentId = content.id;
  
  // Safe genre mapping
  const genres = (content.genre_ids || [])
    .slice(0, 2)
    .map(id => GENRE_MAP[id])
    .filter(Boolean);
  
  const isTV = contentType === CONTENT_TYPES.TV || contentType === CONTENT_TYPES.ANIME;

  const handleImageLoad = () => setImageLoaded(true);

  const getContentTypeIcon = () => {
    switch (contentType) {
      case CONTENT_TYPES.MOVIE: return '🎬';
      case CONTENT_TYPES.TV: return '📺';
      case CONTENT_TYPES.ANIME: return '🎌';
      default: return '🎬';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'from-green-400 to-emerald-400';
    if (rating >= 6) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  // Event handlers with additional safety
  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎬 Play clicked for:', title);
    if (onPlay && typeof onPlay === 'function') {
      onPlay(content);
    }
  };

  const handleDetailsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📋 Details clicked for:', title);
    if (onShowDetails && typeof onShowDetails === 'function') {
      onShowDetails(content);
    }
  };

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📚 Watchlist clicked for:', title);
    if (onToggleWatchlist && typeof onToggleWatchlist === 'function' && contentId) {
      onToggleWatchlist(contentId);
    }
  };

  const handleCardClick = () => {
    console.log('🖱️ Card clicked for:', title);
    if (onShowDetails && typeof onShowDetails === 'function') {
      onShowDetails(content);
    }
  };

  return (
    <div 
      className="group relative cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Main Card */}
      <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 ${
        isHovered ? 'shadow-purple-500/25 scale-105 border-blue-500/50' : 'shadow-black/50'
      }`}>
        {/* Poster Image */}
        <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900">
          {content.poster_path ? (
            <>
              {/* Loading Skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
              
              <img
                src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
                alt={title}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                }`}
                onLoad={handleImageLoad}
                onError={() => {
                  console.warn('Failed to load image for:', title);
                  setImageLoaded(true);
                }}
                crossOrigin="anonymous"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center bg-gradient-to-br from-gray-700 to-gray-800">
              <span className="text-4xl sm:text-6xl mb-2 sm:mb-4 opacity-70">{getContentTypeIcon()}</span>
              <h3 className="text-white font-bold text-sm sm:text-lg leading-tight mb-2 line-clamp-2 px-2">{title}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{year}</p>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Top Left Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col space-y-1 sm:space-y-2 z-10">
            {/* Rating Badge */}
            {rating > 0 && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg bg-gradient-to-r ${getRatingColor(rating)} text-white font-bold text-xs shadow-lg backdrop-blur-sm`}>
                <Star size={10} className="sm:hidden" fill="currentColor" />
                <Star size={12} className="hidden sm:block" fill="currentColor" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}

            {/* Content Type Badge */}
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-medium shadow-lg">
              <span>{getContentTypeIcon()}</span>
              <span className="hidden sm:inline">
                {contentType === CONTENT_TYPES.ANIME ? 'Anime' : isTV ? 'Series' : 'Movie'}
              </span>
            </div>

            {/* Quality Badge */}
            <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg">
              HD
            </div>
          </div>

          {/* Top Right Badges */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col space-y-1 sm:space-y-2 z-10">
            {/* Watchlist Badge */}
            {isInWatchlist && (
              <div className="p-1.5 sm:p-2 rounded-full bg-red-500/90 backdrop-blur-sm text-white shadow-lg">
                <Heart size={12} className="sm:hidden" fill="currentColor" />
                <Heart size={14} className="hidden sm:block" fill="currentColor" />
              </div>
            )}

            {/* Watched Badge */}
            {isWatched && (
              <div className="p-1.5 sm:p-2 rounded-full bg-green-500/90 backdrop-blur-sm text-white shadow-lg">
                <Eye size={12} className="sm:hidden" />
                <Eye size={14} className="hidden sm:block" />
              </div>
            )}
          </div>

          {/* Mobile Action Buttons - Always Visible */}
          <div className="sm:hidden absolute bottom-2 right-2 flex space-x-2 z-20">
            <button
              onClick={handlePlayClick}
              type="button"
              className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full shadow-lg transition-all duration-200 transform active:scale-95"
            >
              <Play size={14} className="text-white ml-0.5" fill="currentColor" />
            </button>
            <button
              onClick={handleWatchlistClick}
              type="button"
              className={`p-2.5 rounded-full shadow-lg transition-all duration-200 transform active:scale-95 ${
                isInWatchlist 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
              }`}
            >
              <Heart size={14} className="text-white" fill={isInWatchlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Desktop Hover Actions - Only show when image is loaded or no poster */}
          <div className={`hidden sm:flex absolute inset-0 items-center justify-center transition-all duration-300 z-20 ${
            (imageLoaded || !content.poster_path) ? (
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            ) : 'opacity-0'
          }`}>
            <div className="flex items-center space-x-3">
              {/* Main Play Button */}
              <button
                onClick={handlePlayClick}
                type="button"
                className="group/play flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm z-30"
              >
                <Play size={20} className="lg:hidden text-white ml-1 group-hover/play:scale-110 transition-transform duration-200" fill="currentColor" />
                <Play size={24} className="hidden lg:block text-white ml-1 group-hover/play:scale-110 transition-transform duration-200" fill="currentColor" />
              </button>

              {/* Quick Actions */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleDetailsClick}
                  type="button"
                  className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110 z-30"
                  title="View Details"
                >
                  <Info size={16} className="lg:hidden text-white" />
                  <Info size={18} className="hidden lg:block text-white" />
                </button>
                
                <button
                  onClick={handleWatchlistClick}
                  type="button"
                  className={`flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 backdrop-blur-sm rounded-full transition-all duration-300 transform hover:scale-110 z-30 ${
                    isInWatchlist 
                      ? 'bg-red-500/90 text-white hover:bg-red-600/90' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Heart size={16} className="lg:hidden" fill={isInWatchlist ? 'currentColor' : 'none'} />
                  <Heart size={18} className="hidden lg:block" fill={isInWatchlist ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar - Desktop Only on Hover */}
          <div className={`hidden sm:block absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent transition-transform duration-500 z-10 ${
            (imageLoaded || !content.poster_path) ? (
              isHovered ? 'translate-y-0' : 'translate-y-full'
            ) : 'translate-y-full'
          }`}>
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-blue-400 transition-colors" onClick={handleDetailsClick}>
              {title}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar size={12} />
                <span>{year}</span>
              </div>
              {isTV && content.number_of_seasons && (
                <div className="flex items-center space-x-2">
                  <Clock size={12} />
                  <span>{content.number_of_seasons} Season{content.number_of_seasons > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-gray-200 border border-white/10"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-medium">Available</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                {isInWatchlist && (
                  <div className="flex items-center space-x-1 text-red-400">
                    <Heart size={10} fill="currentColor" />
                    <span>Liked</span>
                  </div>
                )}
                {isWatched && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <Eye size={10} />
                    <span>Watched</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading Animation Border */}
          {!imageLoaded && content.poster_path && (
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Enhanced Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-2xl -z-10 scale-110 transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
};

export default ContentCard;