import { useState, useEffect, useCallback } from 'react';

export const useMovies = (initialData = []) => {
  const [movies, setMovies] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('popular');

  const fetchMovies = useCallback(async (pageNum = 1, movieCategory = category) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY || 'd20da4614eefb21107f726bae23e6994';

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieCategory}?api_key=${apiKey}&language=en-US&page=${pageNum}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setMovies(data.results || []);
      } else {
        setMovies(prev => [...prev, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message);
      if (pageNum === 1) {
        setMovies([]);
        setTotalPages(1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  const loadMore = useCallback(() => {
    if (page < totalPages) {
      fetchMovies(page + 1);
    }
  }, [page, totalPages, fetchMovies]);

  const changeCategory = useCallback((newCategory) => {
    setCategory(newCategory);
    setPage(1);
    fetchMovies(1, newCategory);
  }, [fetchMovies]);

  const searchMovies = useCallback(async (query) => {
    if (!query.trim()) {
      fetchMovies(1);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY || 'd20da4614eefb21107f726bae23e6994';

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setPage(1);
    } catch (err) {
      console.error('Error searching movies:', err);
      setError(err.message);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { 
    movies, 
    isLoading, 
    error, 
    page,
    totalPages,
    category,
    refetch: fetchMovies, 
    loadMore,
    changeCategory,
    searchMovies,
    hasMore: page < totalPages
  };
};