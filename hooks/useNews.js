import { useState, useEffect, useCallback } from 'react';

export const useNews = (initialCategory = 'general') => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const fetchNews = useCallback(async (newsCategory = category, pageNum = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use your API route instead of direct API call for better mobile support
      const response = await fetch(
        `/api/news?category=${newsCategory}&page=${pageNum}&pageSize=20`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || 'API Error');
      }

      const articles = data.articles || [];
      
      if (pageNum === 1) {
        setNews(articles);
      } else {
        setNews(prev => [...prev, ...articles]);
      }
      
      setTotalResults(data.totalResults || articles.length);
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
  }, [category]);

  const changeCategory = useCallback((newCategory) => {
    setCategory(newCategory);
    fetchNews(newCategory, 1);
  }, [fetchNews]);

  const loadMore = useCallback(() => {
    if (news.length < totalResults) {
      fetchNews(category, page + 1);
    }
  }, [fetchNews, category, page, news.length, totalResults]);

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
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    category,
    page,
    totalResults,
    isOnline,
    refetch: fetchNews,
    changeCategory,
    loadMore,
    hasMore: news.length < totalResults
  };
};
