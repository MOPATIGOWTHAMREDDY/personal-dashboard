import React, { useState } from 'react';
import ContentCard from './ContentCard';
import { Grid3X3, List, Loader2, Plus, Film, TrendingUp } from 'lucide-react';

const ContentGrid = ({ 
  content, 
  contentType, 
  isLoading,
  hasMore,
  viewMode = 'grid',
  onViewModeChange,
  onLoadMore,
  onPlay,
  onToggleWatchlist,
  onShowDetails,
  watchlist = [],
  watched = []
}) => {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter out null/undefined content items
  const validContent = (content || []).filter(item => item && (item.title || item.name));

  // Loading state when no content
  if (isLoading && validContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        <div className="relative mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animation-delay-1000 m-2"></div>
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">Loading amazing content...</h3>
        <p className="text-gray-400 text-sm sm:text-lg">Finding the best sources for you</p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs sm:text-sm">Premium sources ready</span>
        </div>
      </div>
    );
  }

  // Empty state when no results
  if (!isLoading && validContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6">
          <span className="text-3xl sm:text-4xl opacity-50">🎭</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">No content found</h3>
        <p className="text-gray-400 text-center max-w-md text-sm sm:text-base px-4">
          Try adjusting your search terms or browse different categories to discover amazing content.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
        >
          Refresh & Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {validContent.length.toLocaleString()} Results
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm">Live updates</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 self-start sm:self-auto">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Grid View"
          >
            <Grid3X3 size={16} className="sm:hidden" />
            <Grid3X3 size={18} className="hidden sm:block" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="List View"
          >
            <List size={16} className="sm:hidden" />
            <List size={18} className="hidden sm:block" />
          </button>
        </div>
      </div>

      {/* Content Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
          {validContent.map((item, index) => (
            <div
              key={`${item.id || index}-${index}`}
              className="transform transition-all duration-500"
              style={{ 
                animationDelay: `${(index % 21) * 50}ms`,
                opacity: 0,
                animation: `fadeInUp 0.6s ease-out ${(index % 21) * 50}ms forwards`
              }}
            >
              <ContentCard
                content={item}
                contentType={contentType}
                onPlay={onPlay}
                onToggleWatchlist={onToggleWatchlist}
                onShowDetails={onShowDetails}
                isInWatchlist={watchlist.includes(item?.id)}
                isWatched={watched.includes(item?.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {validContent.map((item, index) => (
            <div
              key={`${item.id || index}-${index}-list`}
              className="transform transition-all duration-500"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: 0,
                animation: `fadeInLeft 0.6s ease-out ${index * 100}ms forwards`
              }}
            >
              <ContentListItem
                content={item}
                contentType={contentType}
                onPlay={onPlay}
                onToggleWatchlist={onToggleWatchlist}
                onShowDetails={onShowDetails}
                isInWatchlist={watchlist.includes(item?.id)}
                isWatched={watched.includes(item?.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-8 sm:pt-12">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore || isLoading}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              {loadingMore ? (
                <Loader2 size={18} className="sm:hidden animate-spin" />
              ) : (
                <Plus size={18} className="sm:hidden" />
              )}
              {loadingMore ? (
                <Loader2 size={20} className="hidden sm:block animate-spin" />
              ) : (
                <Plus size={20} className="hidden sm:block" />
              )}
              <span className="text-sm sm:text-base">
                {loadingMore ? 'Loading...' : 'Load More Content'}
              </span>
            </div>
            
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoading && validContent.length > 0 && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm sm:text-base">Loading more amazing content...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Keep the existing ContentListItem component...
const ContentListItem = ({ 
  content, 
  contentType, 
  onPlay, 
  onToggleWatchlist, 
  onShowDetails,
  isInWatchlist = false,
  isWatched = false 
}) => {
  // Add null check here too
  if (!content) {
    return null;
  }

  const title = content.title || content.name || 'Untitled';
  const releaseDate = content.release_date || content.first_air_date;
  const rating = content.vote_average || 0;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
  const isTV = contentType === 'tv' || contentType === 'anime';

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-400 bg-green-400/20';
    if (rating >= 6) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/30 hover:border-blue-500/30 group">
      {/* Poster */}
      <div className="w-16 h-24 sm:w-20 sm:h-30 bg-gray-700 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => onShowDetails(content)}>
        {content.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${content.poster_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <Film size={20} className="text-gray-400" />
          </div>
        )}
        
        {/* Quick Play Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(content);
            }}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
          >
            <Play size={14} className="text-white ml-0.5" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1 sm:mb-2">
          <h3 
            className="text-white font-semibold text-base sm:text-lg cursor-pointer hover:text-blue-400 transition-colors line-clamp-1 flex-1" 
            onClick={() => onShowDetails(content)}
          >
            {title}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            {rating > 0 && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${getRatingColor(rating)}`}>
                <span>★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2 text-xs sm:text-sm text-gray-400">
          <span>{year}</span>
          {isTV && content.number_of_seasons && (
            <>
              <span>•</span>
              <span className="hidden sm:inline">{content.number_of_seasons} Season{content.number_of_seasons > 1 ? 's' : ''}</span>
              <span className="sm:hidden">S{content.number_of_seasons}</span>
            </>
          )}
          {isInWatchlist && (
            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
              ❤️ Liked
            </span>
          )}
          {isWatched && (
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
              👁️ Watched
            </span>
          )}
        </div>
        
        {content.overview && (
          <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {content.overview}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        <button
          onClick={() => onPlay(content)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
          title="Play Now"
        >
          <Play size={14} className="sm:hidden" fill="currentColor" />
          <Play size={16} className="hidden sm:block" fill="currentColor" />
        </button>
        <button
          onClick={() => onToggleWatchlist(content.id)}
          className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
            isInWatchlist 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-red-500/25' 
              : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
          }`}
          title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <Heart size={14} className="sm:hidden" fill={isInWatchlist ? 'currentColor' : 'none'} />
          <Heart size={16} className="hidden sm:block" fill={isInWatchlist ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onShowDetails(content)}
          className="bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          title="View Details"
        >
          <Film size={14} className="sm:hidden" />
          <Film size={16} className="hidden sm:block" />
        </button>
      </div>
    </div>
  );
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}

export default ContentGrid;