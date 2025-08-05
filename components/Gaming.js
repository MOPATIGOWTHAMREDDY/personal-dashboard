import { useState, useEffect } from 'react';
import { Gamepad2, Star, Users, Download, Trophy, Target, Zap } from 'lucide-react';

const Gaming = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'trending', name: '🔥 Trending', color: 'bg-red-500' },
    { id: 'pc', name: '💻 PC Games', color: 'bg-blue-500' },
    { id: 'mobile', name: '📱 Mobile', color: 'bg-green-500' },
    { id: 'console', name: '🎮 Console', color: 'bg-purple-500' },
    { id: 'esports', name: '🏆 Esports', color: 'bg-yellow-500' },
  ];

  const games = [
    {
      id: 1,
      title: 'Elden Ring',
      image: '/api/placeholder/300/450',
      rating: 9.6,
      platform: ['PC', 'PlayStation', 'Xbox'],
      genre: ['Action', 'RPG', 'Adventure'],
      price: '$59.99',
      description: 'Epic fantasy action RPG from FromSoftware',
      players: '1M+ active'
    },
    {
      id: 2,
      title: 'Call of Duty: MW3',
      image: '/api/placeholder/300/450',
      rating: 8.9,
      platform: ['PC', 'PlayStation', 'Xbox'],
      genre: ['Shooter', 'Action', 'Multiplayer'],
      price: '$69.99',
      description: 'Latest installment in the Modern Warfare series',
      players: '50M+ active'
    },
    {
      id: 3,
      title: 'Genshin Impact',
      image: '/api/placeholder/300/450',
      rating: 9.2,
      platform: ['Mobile', 'PC', 'PlayStation'],
      genre: ['RPG', 'Adventure', 'Gacha'],
      price: 'Free',
      description: 'Open-world action RPG with stunning visuals',
      players: '100M+ downloads'
    },
    {
      id: 4,
      title: 'Spider-Man 2',
      image: '/api/placeholder/300/450',
      rating: 9.4,
      platform: ['PlayStation 5'],
      genre: ['Action', 'Adventure', 'Superhero'],
      price: '$69.99',
      description: 'Swing through New York as Spider-Man',
      players: '5M+ sold'
    },
    {
      id: 5,
      title: 'PUBG Mobile',
      image: '/api/placeholder/300/450',
      rating: 8.7,
      platform: ['Mobile'],
      genre: ['Battle Royale', 'Shooter'],
      price: 'Free',
      description: 'Battle royale on mobile devices',
      players: '1B+ downloads'
    },
    {
      id: 6,
      title: 'Baldur\'s Gate 3',
      image: '/api/placeholder/300/450',
      rating: 9.8,
      platform: ['PC', 'PlayStation', 'Xbox'],
      genre: ['RPG', 'Strategy', 'Adventure'],
      price: '$59.99',
      description: 'Epic RPG adventure with deep storytelling',
      players: '10M+ sold'
    }
  ];

  const esportsNews = [
    {
      id: 1,
      title: 'Worlds 2024 Championship Finals',
      summary: 'Epic League of Legends tournament concludes',
      time: '3h ago',
      game: 'League of Legends'
    },
    {
      id: 2,
      title: 'CS2 Major Tournament Announced',
      summary: 'New Counter-Strike 2 major coming next month',
      time: '5h ago',
      game: 'Counter-Strike 2'
    },
    {
      id: 3,
      title: 'Valorant Champions Tour Update',
      summary: 'New teams qualified for international event',
      time: '8h ago',
      game: 'Valorant'
    }
  ];

  const getPlatformColor = (platform) => {
    const colors = {
      'PC': 'bg-blue-100 text-blue-600',
      'PlayStation': 'bg-blue-600 text-white',
      'Xbox': 'bg-green-600 text-white',
      'Mobile': 'bg-green-100 text-green-600',
      'Nintendo': 'bg-red-100 text-red-600'
    };
    return colors[platform] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎮 Gaming</h1>
          <p className="text-gray-600">Latest games, news & esports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.color} text-white shadow-lg`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Games Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex">
                <div className="relative w-28 h-40 flex-shrink-0">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
                    <Star size={10} fill="currentColor" className="text-yellow-400" />
                    <span className="text-xs font-medium">{game.rating}</span>
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{game.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-bold text-green-600">{game.price}</span>
                        {game.price === 'Free' && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                      {game.price === 'Free' ? 'Download' : 'Buy'}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{game.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{game.players}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {game.platform.slice(0, 2).map((platform, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${getPlatformColor(platform)}`}>
                        {platform}
                      </span>
                    ))}
                    {game.platform.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        +{game.platform.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {game.genre.slice(0, 2).map((g, idx) => (
                      <span key={idx} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Esports Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="mr-2 text-yellow-500" size={24} />
            Esports News
          </h2>
          
          <div className="space-y-4">
            {esportsNews.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                    {article.game}
                  </span>
                  <span className="text-xs text-gray-500">{article.time}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                <p className="text-sm text-gray-600">{article.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gaming;
