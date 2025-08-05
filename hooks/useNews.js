import { useState, useEffect, useCallback } from 'react';

export const useNews = (initialCategory = 'general') => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fetchNews = useCallback(async (newsCategory = category, pageNum = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_NEWS_KEY || '1238cc84e5c748aaa00cda1d60a877e0';
      
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=${newsCategory}&page=${pageNum}&pageSize=20&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
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
  }, [category, isOnline]);  const searchNews = useCallback(async (query) => {
    if (!query.trim()) {
      fetchNews(category, 1);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_NEWS_KEY || '1238cc84e5c748aaa00cda1d60a877e0';

      if (!isOnline) {
        throw new Error('No internet connection');
      }

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Search API Error');
      }
      
      setNews(data.articles || []);
      setTotalResults(data.totalResults || 0);
      setPage(1);
    } catch (err) {
      console.error('Error searching news:', err);
      setError(err.message);
      setNews([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, category, fetchNews]);

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
    searchNews,
    hasMore: news.length < totalResults
  };
};

// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useFavorites.js
import { useLocalStorage } from './useLocalStorage';

export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('favorites', {
    movies: [],
    music: [],
    news: []
  });

  const addToFavorites = (type, item) => {
    setFavorites(prev => ({
      ...prev,
      [type]: [...prev[type], { ...item, addedAt: new Date().toISOString() }]
    }));
  };

  const removeFromFavorites = (type, itemId) => {
    setFavorites(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== itemId)
    }));
  };

  const isFavorite = (type, itemId) => {
    return favorites[type].some(item => item.id === itemId);
  };

  const toggleFavorite = (type, item) => {
    if (isFavorite(type, item.id)) {
      removeFromFavorites(type, item.id);
    } else {
      addToFavorites(type, item);
    }
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
};