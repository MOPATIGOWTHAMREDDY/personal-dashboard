import { useState, useEffect } from 'react';
import { Trophy, Calendar, Clock, Users, TrendingUp, Target } from 'lucide-react';

const Sports = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'live', name: '🔴 Live', color: 'bg-red-500' },
    { id: 'football', name: '⚽ Football', color: 'bg-green-500' },
    { id: 'basketball', name: '🏀 Basketball', color: 'bg-orange-500' },
    { id: 'tennis', name: '🎾 Tennis', color: 'bg-yellow-500' },
    { id: 'formula1', name: '🏎️ Formula 1', color: 'bg-red-600' },
  ];

  const liveGames = [
    {
      id: 1,
      sport: 'Football',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      homeScore: 2,
      awayScore: 1,
      time: '67\'',
      status: 'LIVE',
      league: 'Premier League'
    },
    {
      id: 2,
      sport: 'Basketball',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      homeScore: 89,
      awayScore: 92,
      time: 'Q4 8:45',
      status: 'LIVE',
      league: 'NBA'
    },
    {
      id: 3,
      sport: 'Tennis',
      homeTeam: 'Djokovic',
      awayTeam: 'Nadal',
      homeScore: '6-4, 2-3',
      awayScore: '',
      time: 'Set 2',
      status: 'LIVE',
      league: 'ATP Finals'
    }
  ];

  const upcomingGames = [
    {
      id: 1,
      sport: 'Football',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      date: 'Today, 8:00 PM',
      league: 'La Liga'
    },
    {
      id: 2,
      sport: 'Formula 1',
      event: 'Monaco Grand Prix',
      date: 'Sunday, 2:00 PM',
      league: 'F1 Championship'
    }
  ];

  const news = [
    {
      id: 1,
      title: 'Messi Scores Hat-trick in Champions League',
      summary: 'Incredible performance leads PSG to victory',
      time: '2h ago',
      sport: 'Football'
    },
    {
      id: 2,
      title: 'NBA Finals Schedule Announced',
      summary: 'Championship series begins next week',
      time: '4h ago',
      sport: 'Basketball'
    },
    {
      id: 3,
      title: 'Tennis Grand Slam Updates',
      summary: 'Wimbledon preparations underway',
      time: '6h ago',
      sport: 'Tennis'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚽ Sports</h1>
          <p className="text-gray-600">Live scores, news & highlights</p>
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
        {/* Live Games */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            <h2 className="text-xl font-bold text-gray-900">Live Games</h2>
          </div>
          
          <div className="space-y-4">
            {liveGames.map((game) => (
              <div key={game.id} className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                    {game.league}
                  </span>
                  <div className="flex items-center text-red-500 text-sm font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                    {game.status}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{game.homeTeam}</span>
                      <span className="text-2xl font-bold text-gray-900">{game.homeScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{game.awayTeam}</span>
                      <span className="text-2xl font-bold text-gray-900">{game.awayScore}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">{game.time}</div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Games */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2" size={24} />
            Upcoming
          </h2>
          
          <div className="space-y-3">
            {upcomingGames.map((game) => (
              <div key={game.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {game.homeTeam && game.awayTeam 
                        ? `${game.homeTeam} vs ${game.awayTeam}`
                        : game.event
                      }
                    </h3>
                    <p className="text-sm text-gray-500">{game.league}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{game.date}</div>
                    <button className="text-xs text-blue-600 mt-1">Set Reminder</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sports News */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Sports News
          </h2>
          
          <div className="space-y-4">
            {news.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {article.sport}
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

export default Sports;
