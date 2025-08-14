import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Sparkles, TrendingUp } from 'lucide-react';

const SearchBar = ({ 
  searchTerm, 
  onSearch, 
  suggestions = [], 
  isLoading = false,
  totalSources = 0 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const trendingSearches = [
    "Spider-Man", "The Batman", "Stranger Things", "Wednesday", 
    "Avatar", "Top Gun", "House of Dragon", "The Bear"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const clearSearch = () => {
    onSearch('');
    inputRef.current?.focus();
  };

  const handleTrendingClick = (term) => {
    onSearch(term);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={inputRef}>
      {/* Search Input */}
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'scale-105' : 'scale-100'
      }`}>
        <div className={`relative bg-white/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
          isFocused 
            ? 'border-blue-400/60 shadow-2xl shadow-blue-500/20' 
            : 'border-white/20 shadow-lg'
        }`}>
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search 
              size={20} 
              className={`transition-colors duration-300 ${
                isFocused ? 'text-blue-400' : 'text-gray-400'
              }`} 
            />
          </div>

          {/* Input Field */}
          <input
            type="text"
            placeholder={`Search from ${totalSources} premium sources...`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full pl-12 pr-20 py-4 bg-transparent text-white placeholder-gray-400 text-lg focus:outline-none"
          />

          {/* Loading/Clear Button */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
            )}
            
            {searchTerm && !isLoading && (
              <button
                onClick={clearSearch}
                className="p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <X size={16} className="text-gray-400 hover:text-white" />
              </button>
            )}

            <button className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg">
              <Filter size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Animated Border */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse -z-10 blur-sm"></div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-50">
          {/* Quick Stats */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Quick Search</span>
              <div className="flex items-center space-x-2 text-green-400">
                <Sparkles size={14} />
                <span>{totalSources} sources ready</span>
              </div>
            </div>
          </div>

          {/* Trending Searches */}
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp size={16} className="text-orange-400" />
              <span className="text-sm font-medium text-white">Trending Now</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trendingSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(term)}
                  className="text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200 text-sm"
                >
                  🔥 {term}
                </button>
              ))}
            </div>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-white/10 p-4">
              <div className="text-sm font-medium text-white mb-2">Suggestions</div>
              <div className="space-y-1">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <Search size={14} className="inline mr-2 opacity-50" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;