import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Heart,
  Zap,
  Flame,
  Star,
  Calendar,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  Eye,
  RefreshCw,
  ChevronDown,
  Filter,
  MapPin,
  Wifi,
  WifiOff,
  ArrowLeft
} from 'lucide-react';

// Custom hook for news management
export const useNews = (initialCategory = 'general') => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(initialCategory);
  const [country, setCountry] = useState('us');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const fetchNews = useCallback(async (newsCategory = category, countryCode = country, pageNum = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fallback data if API fails
      const fallbackData = [
        {
          id: 1,
          title: "Breaking: Technology Advances in AI Research",
          description: "Latest developments in artificial intelligence are transforming multiple industries with unprecedented speed.",
          source: { name: "Tech News" },
          publishedAt: new Date().toISOString(),
          url: "#",
          urlToImage: null
        },
        {
          id: 2,
          title: "Global Markets Show Strong Performance",
          description: "Stock markets worldwide are experiencing significant growth as economic indicators remain positive.",
          source: { name: "Financial Times" },
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          url: "#",
          urlToImage: null
        },
        {
          id: 3,
          title: "Climate Action Initiatives Gain Momentum",
          description: "New environmental policies are being implemented across major cities to combat climate change.",
          source: { name: "Green News" },
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          url: "#",
          urlToImage: null
        }
      ];

      // Try to fetch from API, but use fallback on error
      try {
        const apiKey = process.env.NEXT_PUBLIC_NEWS_KEY;
        if (apiKey && apiKey !== 'YOUR_NEWS_API_KEY') {
          const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=${countryCode}&category=${newsCategory}&page=${pageNum}&pageSize=20&apiKey=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.articles && data.articles.length > 0) {
              const articles = data.articles.map((article, index) => ({
                ...article,
                id: article.url || `${newsCategory}-${pageNum}-${index}`
              }));

              if (pageNum === 1) {
                setNews(articles);
              } else {
                setNews(prev => [...prev, ...articles]);
              }
              setTotalResults(data.totalResults || articles.length);
              setPage(pageNum);
              return;
            }
          }
        }
      } catch (apiError) {
        console.log('API error, using fallback data:', apiError);
      }

      // Use fallback data
      if (pageNum === 1) {
        setNews(fallbackData);
        setTotalResults(fallbackData.length);
      }
      setPage(pageNum);

    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
      if (pageNum === 1) {
        setNews([]);
        setTotalResults(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [category, country]);

  const changeCategory = useCallback((newCategory) => {
    setCategory(newCategory);
    fetchNews(newCategory, country, 1);
  }, [fetchNews, country]);

  const changeCountry = useCallback((newCountry) => {
    setCountry(newCountry);
    fetchNews(category, newCountry, 1);
  }, [fetchNews, category]);

  useEffect(() => {
    fetchNews();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    category,
    country,
    page,
    totalResults,
    isOnline,
    refetch: fetchNews,
    changeCategory,
    changeCountry
  };
};

const News = () => {
  const { 
    news, 
    isLoading, 
    error, 
    category, 
    country, 
    isOnline, 
    refetch, 
    changeCategory, 
    changeCountry 
  } = useNews();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
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

  const countries = [
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' },
    { code: 'de', name: 'Germany', flag: '🇩🇪' },
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'jp', name: 'Japan', flag: '🇯🇵' },
    { code: 'in', name: 'India', flag: '🇮🇳' },
  ];

  const filteredNews = news.filter(article =>
    article?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentCategory = categories.find(cat => cat.id === category);
  const currentCountry = countries.find(c => c.code === country);

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
        day: 'numeric'
      });
    }
  };

  const handleBookmark = (articleId) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedArticles(newBookmarks);
  };

  const handleLike = (articleId) => {
    const newLikes = new Set(likedArticles);
    if (newLikes.has(articleId)) {
      newLikes.delete(articleId);
    } else {
      newLikes.add(articleId);
    }
    setLikedArticles(newLikes);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="px-4 pt-16 pb-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to News</span>
          </button>

          <div className="max-w-4xl mx-auto">
            <div className="aspect-video mb-6 overflow-hidden rounded-2xl bg-gray-800">
              {selectedArticle.urlToImage ? (
                <Image
                  src={selectedArticle.urlToImage}
                  alt={selectedArticle.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Globe size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mb-4 text-sm">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full">
                {selectedArticle.source?.name}
              </span>
              <span className="text-gray-400">{formatDate(selectedArticle.publishedAt)}</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
              {selectedArticle.title}
            </h1>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {selectedArticle.description}
            </p>

            <div className="flex items-center space-x-4 mb-6">
              <button 
                onClick={() => handleLike(selectedArticle.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  likedArticles.has(selectedArticle.id) ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart size={16} />
                <span>Like</span>
              </button>
              <button 
                onClick={() => handleBookmark(selectedArticle.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  bookmarkedArticles.has(selectedArticle.id) ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400 hover:text-blue-400'
                }`}
              >
                <Bookmark size={16} />
                <span>Save</span>
              </button>
              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors ml-auto"
              >
                <span>Read Full Article</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="px-4 pt-16 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Globe className="mr-3 text-blue-500" size={28} />
              News
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{isOnline ? 'Live' : 'Offline'}</span>
              </div>
              <div className="text-gray-400">
                {filteredNews.length} articles
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => refetch()}
            className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all border border-white/20"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={`text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
          />
        </div>

        {/* Country Selector */}
        <div className="mb-4">
          <button
            onClick={() => setShowCountrySelector(!showCountrySelector)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 hover:bg-white/15 transition-all"
          >
            <MapPin size={16} className="text-blue-400" />
            <span>{currentCountry?.flag} {currentCountry?.name}</span>
            <ChevronDown size={16} className={`transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
          </button>

          {showCountrySelector && (
            <div className="mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {countries.map((countryItem) => (
                  <button
                    key={countryItem.code}
                    onClick={() => {
                      changeCountry(countryItem.code);
                      setShowCountrySelector(false);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                      country === countryItem.code
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{countryItem.flag}</span>
                    <span className="truncate">{countryItem.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories - Mobile Optimized */}
        <div className="mb-6">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => changeCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                    category === cat.id
                      ? `bg-${cat.color}-600 text-white shadow-lg`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  <IconComponent size={14} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="px-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-700/50 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-700/50 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-700/50 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-24">
          {filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="mx-auto text-gray-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((article, index) => (
                <div 
                  key={article.id || index} 
                  className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 cursor-pointer transition-all group"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      {article.urlToImage ? (
                        <Image
                          src={article.urlToImage}
                          alt={article.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                          <Globe size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          {article.source?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-sm text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(article.id);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${
                              likedArticles.has(article.id) ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-red-400'
                            }`}
                          >
                            <Heart size={12} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(article.id);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${
                              bookmarkedArticles.has(article.id) ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-blue-400'
                            }`}
                          >
                            <Bookmark size={12} />
                          </button>
                        </div>
                        
                        <button className="flex items-center space-x-1 text-blue-400 text-xs">
                          <span>Read</span>
                          <Eye size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default News;