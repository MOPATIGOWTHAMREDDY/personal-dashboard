import { useState, useEffect } from 'react';
import { Star, Play, Calendar, Clock, Heart, Bookmark } from 'lucide-react';

const Anime = () => {
  const [animes, setAnimes] = useState([]);
  const [filter, setFilter] = useState('trending');
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'trending', name: '🔥 Trending', color: 'bg-red-500' },
    { id: 'top-rated', name: '⭐ Top Rated', color: 'bg-yellow-500' },
    { id: 'new', name: '🆕 New', color: 'bg-green-500' },
    { id: 'popular', name: '👑 Popular', color: 'bg-purple-500' },
  ];

  useEffect(() => {
    fetchAnimes();
  }, [filter]);

  const fetchAnimes = async () => {
    setLoading(true);
    try {
      // Demo data - replace with Jikan API or MyAnimeList API
      const demoAnimes = [
        {
          id: 1,
          title: 'Attack on Titan Final Season',
          image: '/api/placeholder/300/450',
          rating: 9.8,
          year: 2023,
          episodes: 24,
          status: 'Completed',
          genre: ['Action', 'Drama', 'Fantasy'],
          description: 'The final arc of humanity\'s fight against titans'
        },
        {
          id: 2,
          title: 'Demon Slayer: Hashira Training',
          image: '/api/placeholder/300/450',
          rating: 9.5,
          year: 2024,
          episodes: 12,
          status: 'Ongoing',
          genre: ['Action', 'Supernatural'],
          description: 'Tanjiro trains with the Hashira'
        },
        {
          id: 3,
          title: 'Jujutsu Kaisen Season 2',
          image: '/api/placeholder/300/450',
          rating: 9.3,
          year: 2023,
          episodes: 23,
          status: 'Completed',
          genre: ['Action', 'School', 'Supernatural'],
          description: 'The Shibuya Incident arc'
        },
        {
          id: 4,
          title: 'Chainsaw Man',
          image: '/api/placeholder/300/450',
          rating: 9.1,
          year: 2022,
          episodes: 12,
          status: 'Completed',
          genre: ['Action', 'Supernatural'],
          description: 'Denji becomes Chainsaw Man'
        },
        {
          id: 5,
          title: 'One Piece: Wano Arc',
          image: '/api/placeholder/300/450',
          rating: 9.4,
          year: 2023,
          episodes: 100,
          status: 'Ongoing',
          genre: ['Adventure', 'Comedy', 'Shounen'],
          description: 'The legendary Wano Country arc'
        },
        {
          id: 6,
          title: 'My Hero Academia Season 7',
          image: '/api/placeholder/300/450',
          rating: 8.9,
          year: 2024,
          episodes: 25,
          status: 'Ongoing',
          genre: ['Action', 'School', 'Superhero'],
          description: 'Heroes face their greatest challenge'
        }
      ];
      setAnimes(demoAnimes);
    } catch (error) {
      console.error('Error fetching anime:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Anime</h1>
          <p className="text-gray-600">Discover amazing anime series</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === filterItem.id
                  ? `${filterItem.color} text-white shadow-lg`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterItem.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {animes.map((anime) => (
              <div key={anime.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
                    <Star size={12} fill="currentColor" className="text-yellow-400" />
                    <span className="text-xs font-medium">{anime.rating}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 p-2 rounded-full">
                    <Heart size={16} className="text-gray-600" />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-purple-600 p-3 rounded-full shadow-lg">
                    <Play size={16} className="text-white" fill="currentColor" />
                  </div>
                  <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                    anime.status === 'Ongoing' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {anime.status}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{anime.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{anime.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{anime.year}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{anime.episodes} eps</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {anime.genre.slice(0, 2).map((g, idx) => (
                      <span key={idx} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                        {g}
                      </span>
                    ))}
                    {anime.genre.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        +{anime.genre.length - 2}
                      </span>
                    )}
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

export default Anime;
