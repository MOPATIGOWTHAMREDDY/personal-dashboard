import { useState, useEffect } from 'react';
import { Star, Calendar, Clock, Play, Heart, Bookmark } from 'lucide-react';
import Image from 'next/image';

const Movies = ({ initialData = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState(initialData || []); // Fix: ensure array

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_TMDB_KEY || process.env.NEXT_PUBLIC_TMDB_KEY === 'your_tmdb_key_here') {
        // Use demo data if no API key
        setMovies([
          {
            id: 1,
            title: 'Dune: Part Two',
            poster_path: null,
            vote_average: 8.8,
            release_date: '2024-03-01',
            overview: 'Epic sci-fi continuation of the Dune saga'
          },
          {
            id: 2,
            title: 'Oppenheimer',
            poster_path: null,
            vote_average: 8.6,
            release_date: '2023-07-21',
            overview: 'Biographical thriller about J. Robert Oppenheimer'
          },
          {
            id: 3,
            title: 'The Dark Knight',
            poster_path: null,
            vote_average: 9.0,
            release_date: '2008-07-18',
            overview: 'Batman raises the stakes in his war on crime'
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies(initialData || []); // Fallback to initial data
    }
    setLoading(false);
  };

  // Fix: Ensure movies is always an array
  const safeMovies = Array.isArray(movies) ? movies : [];
  const filteredMovies = safeMovies.filter(movie =>
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎬 Movies</h1>
            <p className="text-gray-400 text-lg">Discover amazing films</p>
          </div>
          <div className="w-full md:w-80 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="px-6 pb-32">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Image
                    src={movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=' + encodeURIComponent(movie.title)
                    }
                    alt={movie.title}
                    width={200}
                    height={300}
                    className="w-full h-72 object-cover"
                  />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
                    <Star size={12} fill="currentColor" className="text-yellow-400" />
                    <span className="text-xs font-semibold">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                  
                  {/* Play Button */}
                  <button className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                  </button>
                </div>
                
                {/* Movie Info */}
                <div className="mt-4">
                  <h3 className="font-bold text-white text-sm line-clamp-2 mb-2">{movie.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                    </div>
                    <button className="text-red-500 hover:text-red-400 transition-colors">
                      <Heart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
