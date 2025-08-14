import { useState, useEffect, useCallback } from 'react';
import { CONTENT_TYPES } from '../utils/constants'; // Fixed import path

export const useContent = (initialData = []) => {
  // ... rest of the code remains the same
  const [content, setContent] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('popular');
  const [contentType, setContentType] = useState(CONTENT_TYPES.MOVIE);

  const fetchContent = useCallback(async (pageNum = 1, contentCategory = category, type = contentType) => {
    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '';
      if (type === CONTENT_TYPES.MOVIE) {
        endpoint = `/api/proxy/tmdb/movie/${contentCategory}`;
      } else if (type === CONTENT_TYPES.TV) {
        endpoint = `/api/proxy/tmdb/tv/${contentCategory}`;
      } else if (type === CONTENT_TYPES.ANIME) {
        endpoint = `/api/proxy/tmdb/discover/tv`;
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        language: 'en-US'
      });

      if (type === CONTENT_TYPES.ANIME) {
        params.set('with_genres', '16');
        params.set('with_original_language', 'ja');
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'X-Proxy-Secret': process.env.NEXT_PUBLIC_PROXY_SECRET || 'development',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setContent(data.results || []);
      } else {
        setContent(prev => [...prev, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error('❌ Error fetching content:', err);
      setError(err.message);
      if (pageNum === 1) {
        setContent([]);
        setTotalPages(1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [category, contentType]);

  const searchContent = useCallback(async (query, type = contentType) => {
    if (!query.trim()) {
      fetchContent(1);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '';
      if (type === CONTENT_TYPES.MOVIE) {
        endpoint = '/api/proxy/tmdb/search/movie';
      } else if (type === CONTENT_TYPES.TV || type === CONTENT_TYPES.ANIME) {
        endpoint = '/api/proxy/tmdb/search/tv';
      }

      const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&page=1&language=en-US`, {
        headers: {
          'Accept': 'application/json',
          'X-Proxy-Secret': process.env.NEXT_PUBLIC_PROXY_SECRET || 'development',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let results = data.results || [];

      if (type === CONTENT_TYPES.ANIME) {
        results = results.filter(item => 
          item.genre_ids?.includes(16) || 
          item.origin_country?.includes('JP') || 
          item.original_language === 'ja'
        );
      }

      setContent(results);
      setTotalPages(data.total_pages || 1);
      setPage(1);
    } catch (err) {
      console.error('❌ Error searching content:', err);
      setError(err.message);
      setContent([]);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, fetchContent]);

  const changeCategory = useCallback((newCategory) => {
    setCategory(newCategory);
    setPage(1);
    fetchContent(1, newCategory);
  }, [fetchContent]);

  const changeContentType = useCallback((newType) => {
    setContentType(newType);
    setPage(1);
    setCategory('popular');
    fetchContent(1, 'popular', newType);
  }, [fetchContent]);

  const loadMore = useCallback(() => {
    if (page < totalPages) {
      fetchContent(page + 1);
    }
  }, [page, totalPages, fetchContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { 
    content, 
    isLoading, 
    error, 
    page,
    totalPages,
    category,
    contentType,
    refetch: fetchContent, 
    loadMore,
    changeCategory,
    changeContentType,
    searchContent,
    hasMore: page < totalPages
  };
};