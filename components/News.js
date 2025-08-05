import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  Eye, 
  Share2, 
  Bookmark, 
  Filter, 
  Search, 
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  Heart,
  MessageCircle,
  Globe,
  Zap,
  Flame,
  Star
} from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [likedArticles, setLikedArticles] = useState(new Set());

  const categories = [
    { id: 'general', name: 'General', icon: Globe, color: 'blue' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'green' },
    { id: 'entertainment', name: 'Entertainment', icon: Star, color: 'purple' },
    { id: 'health', name: 'Health', icon: Heart, color: 'red' },
    { id: 'science', name: 'Science', icon: Zap, color: 'indigo' },
    { id: 'sports', name: 'Sports', icon: Flame, color: 'orange' },
    { id: 'technology', name: 'Technology', icon: Zap, color: 'cyan' },
  ];

  useEffect(() => {
    fetchNews();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [category, sortBy]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      const apiKey = process.env.REACT_APP_NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_KEY;
      
      if (!apiKey) {
        throw new Error('News API key not found. Please set REACT_APP_NEWS_API_KEY or NEXT_PUBLIC_NEWS_KEY in your environment variables.');
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=${category}&sortBy=${sortBy}&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'API Error');
      }
      
      setNews(data.articles || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (index) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(index)) {
      newBookmarks.delete(index);
    } else {
      newBookmarks.add(index);
    }
    setBookmarkedArticles(newBookmarks);
  };

  const handleLike = (index) => {
    const newLikes = new Set(likedArticles);
    if (newLikes.has(index)) {
      newLikes.delete(index);
    } else {
      newLikes.add(index);
    }
    setLikedArticles(newLikes);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredNews = news.filter(article =>
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentCategory = categories.find(cat => cat.id === category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Zap className="mr-3 text-blue-500" size={32} />
              Breaking News
            </h1>
            <p className="text-gray-400 text-lg">Stay updated with the latest stories</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span>{isOnline ? 'Live Updates' : 'Offline Mode'}</span>
              </div>
              <div className="text-gray-500 text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={fetchNews}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
              disabled={loading}
            >
              <RefreshCw size={20} className={`text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                  category === cat.id
                    ? `bg-${cat.color}-600 text-white shadow-lg`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                <IconComponent size={16} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="publishedAt">Latest</option>
                <option value="popularity">Popular</option>
                <option value="relevancy">Relevant</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-400">
              {filteredNews.length} articles found
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-6 mb-6">
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="text-red-400 font-medium">Unable to fetch latest news</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button 
              onClick={fetchNews}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10">
                <div className="w-full h-48 bg-gray-700/50 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-700/50 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-700/50 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-700/50 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {filteredNews.length > 0 && (
            <div className="px-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Flame className="mr-2 text-orange-500" size={24} />
                Featured Story
              </h2>
              
              <div className="relative overflow-hidden rounded-3xl group cursor-pointer">
                <div className="aspect-video">
                  <img
                    src={filteredNews[0].urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop'}
                    alt={filteredNews[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';
                    }}
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${currentCategory?.color}-500 text-white`}>
                      {currentCategory?.name}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3 line-clamp-2">
                    {filteredNews[0].title}
                  </h2>
                  
                  <p className="text-gray-300 text-lg mb-4 line-clamp-2">
                    {filteredNews[0].description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-gray-300 text-sm">
                      <span>{filteredNews[0].source?.name}</span>
                      <span>•</span>
                      <span>{formatDate(filteredNews[0].publishedAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleLike(0)}
                        className={`p-2 rounded-full transition-colors ${
                          likedArticles.has(0) ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <Heart size={16} />
                      </button>
                      <button 
                        onClick={() => handleBookmark(0)}
                        className={`p-2 rounded-full transition-colors ${
                          bookmarkedArticles.has(0) ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <Bookmark size={16} />
                      </button>
                      <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* News Grid */}
          <div className="px-6 mb-32">
            {filteredNews.length === 0 && !loading ? (
              <div className="text-center py-16">
                <AlertCircle className="mx-auto text-gray-500 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
                <p className="text-gray-500">
                  {error ? 'There was an error loading news. Please try again.' : 'Try adjusting your search or category filter'}
                </p>
                {error && (
                  <button 
                    onClick={fetchNews}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.slice(1).map((article, index) => (
                  <div key={index + 1} className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 hover:bg-white/10 cursor-pointer group transform hover:-translate-y-2">
                    <div className="relative">
                      <div className="aspect-video">
                        <img
                          src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
                          }}
                        />
                      </div>
                      
                      <div className="absolute top-3 left-3">
                        <span className={`bg-${currentCategory?.color}-500 text-white px-3 py-1 rounded-full text-xs font-bold`}>
                          {article.source?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-white mb-3 line-clamp-2 text-lg group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleLike(index + 1)}
                            className={`p-2 rounded-full transition-colors ${
                              likedArticles.has(index + 1) ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            <Heart size={14} />
                          </button>
                          <button 
                            onClick={() => handleBookmark(index + 1)}
                            className={`p-2 rounded-full transition-colors ${
                              bookmarkedArticles.has(index + 1) ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                            }`}
                          >
                            <Bookmark size={14} />
                          </button>
                          <button className="p-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Share2 size={14} />
                          </button>
                          <button className="p-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <MessageCircle size={14} />
                          </button>
                        </div>
                        
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium text-sm bg-blue-500/10 px-3 py-1 rounded-full hover:bg-blue-500/20 transition-colors"
                        >
                          <span>Read</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default News;