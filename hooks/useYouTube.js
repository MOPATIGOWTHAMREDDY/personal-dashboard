import { useState, useEffect } from 'react';

export const useYouTube = (tmdbId, type = 'movie', title = '') => {
  const [trailers, setTrailers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrailers = async () => {
      if (!tmdbId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Use your existing TMDB proxy API for videos
        const response = await fetch(
          `/api/proxy/tmdb/${type}/${tmdbId}/videos?language=en-US`,
          {
            headers: {
              'Accept': 'application/json',
              'X-Proxy-Secret': process.env.NEXT_PUBLIC_PROXY_SECRET || 'development',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Videos API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter and prioritize trailers
        const videoTrailers = data.results?.filter(video => 
          video.site === 'YouTube' && 
          (video.type === 'Trailer' || video.type === 'Teaser')
        ).sort((a, b) => {
          // Prioritize official trailers
          if (a.type === 'Trailer' && b.type === 'Teaser') return -1;
          if (a.type === 'Teaser' && b.type === 'Trailer') return 1;
          return 0;
        }) || [];
        
        setTrailers(videoTrailers);
        
        // If no trailers found, you could add a fallback search here
        if (videoTrailers.length === 0 && title) {
          console.log(`No trailers found for: ${title}`);
          // Could implement YouTube search API here as fallback
        }
        
      } catch (err) {
        console.warn('Trailers fetch failed:', err.message);
        setError(err.message);
        setTrailers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrailers();
  }, [tmdbId, type, title]);

  return { trailers, isLoading, error };
};