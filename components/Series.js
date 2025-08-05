import { useState, useEffect } from 'react';
import { Star, Play, Calendar, Clock, Users, Award } from 'lucide-react';

const Series = () => {
  const [series, setSeries] = useState([]);
  const [category, setCategory] = useState('trending');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'trending', name: '🔥 Trending', color: 'bg-red-500' },
    { id: 'netflix', name: '📺 Netflix', color: 'bg-red-600' },
    { id: 'hbo', name: '🎭 HBO', color: 'bg-purple-600' },
    { id: 'disney', name: '🏰 Disney+', color: 'bg-blue-600' },
    { id: 'amazon', name: '📦 Prime', color: 'bg-blue-500' },
  ];

  useEffect(() => {
    fetchSeries();
  }, [category]);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      // Demo data - replace with TMDB TV API
      const demoSeries = [
        {
          id: 1,
          title: 'The Last of Us',
          image: '/api/placeholder/300/450',
          rating: 9.2,
          year: 2023,
          seasons: 1,
          episodes: 9,
          platform: 'HBO',
          genre: ['Drama', 'Horror', 'Thriller'],
          description: 'A post-apocalyptic story of survival and humanity'
        },
        {
          id: 2,
          title: 'Wednesday',
          image: '/api/placeholder/300/450',
          rating: 8.5,
          year: 2022,
          seasons: 1,
          episodes: 8,
          platform: 'Netflix',
          genre: ['Comedy', 'Horror', 'Mystery'],
          description: 'Wednesday Addams navigates her years as a student'
        },
        {
          id: 3,
          title: 'House of the Dragon',
          image: '/api/placeholder/300/450',
          rating: 8.8,
          year: 2022,
          seasons: 2,
          episodes: 18,
          platform: 'HBO',
          genre: ['Drama', 'Fantasy', 'Action'],
          description: 'The Targaryen civil war for the Iron Throne'
        },
        {
          id: 4,
          title: 'Stranger Things',
          image: '/api/placeholder/300/450',
          rating: 9.0,
          year: 2023,
          seasons: 4,
          episodes: 42,
          platform: 'Netflix',
          genre: ['Sci-Fi', 'Horror', 'Drama'],
          description: 'Kids uncover supernatural mysteries in Hawkins'
        },
        {
          id: 5,
          title: 'The Mandalorian',
          image: '/api/placeholder/300/450',
          rating: 8.7,
          year: 2023,
          seasons: 3,
          episodes: 24,
          platform: 'Disney+',
          genre: ['Sci-Fi', 'Adventure', 'Action'],
          description: 'A bounty hunter travels the galaxy'
        },
        {
          id: 6,
          title: 'The Boys',
          image: '/api/placeholder/300/450',
          rating: 8.9,
          year: 2024,
          seasons: 4,
          episodes: 32,
          platform: 'Prime',
          genre: ['Action', 'Comedy', 'Superhero'],
          description: 'Dark take on superheroes and corruption'
        }
      ];
      setSeries(demoSeries);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
    setLoading(false);
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'Netflix': 'bg-red-600',
      'HBO': 'bg-purple-600',
      'Disney+': 'bg-blue-600',
      'Prime': 'bg-blue-500',
      'Apple TV+': 'bg-gray-800'
    };
    return colors[platform] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📺 TV Series</h1>
          <p className="text-gray-600">Binge-worthy shows just for you</p>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat.id
                  ? `${cat.color} text-white shadow-lg`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-4">
            {series.map((show) => (
              <div key={show.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex">
                  <div className="relative w-32 h-48 flex-shrink-0">
                    <img
                      src={show.image}
                      alt={show.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
                      <Star size={10} fill="currentColor" className="text-yellow-400" />
                      <span className="text-xs font-medium">{show.rating}</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-indigo-600 p-2 rounded-full shadow-lg">
                      <Play size={12} className="text-white" fill="currentColor" />
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{show.title}</h3>
                        <span className={`text-xs text-white px-2 py-1 rounded-full ${getPlatformColor(show.platform)}`}>
                          {show.platform}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Award size={20} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{show.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{show.year}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users size={12} />
                          <span>{show.seasons} {show.seasons === 1 ? 'Season' : 'Seasons'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{show.episodes} Episodes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {show.genre.slice(0, 3).map((g, idx) => (
                        <span key={idx} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                          {g}
                        </span>
                      ))}
                    </div>
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

export default Series;
