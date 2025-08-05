import { useState, useEffect } from 'react';
import { User, Settings, Heart, Bookmark, Clock, BarChart3, Music, Film, Gamepad2 } from 'lucide-react';

const Profile = ({ user, setUser }) => {
  const [stats, setStats] = useState({
    moviesWatched: 127,
    songsPlayed: 2341,
    hoursListened: 456,
    favoriteGenre: 'Action',
    streakDays: 15
  });

  const [recentActivity, setRecentActivity] = useState([
    { type: 'movie', title: 'Dune: Part Two', time: '2 hours ago', icon: Film },
    { type: 'music', title: 'Anti-Hero - Taylor Swift', time: '4 hours ago', icon: Music },
    { type: 'game', title: 'Elden Ring', time: '6 hours ago', icon: Gamepad2 },
    { type: 'movie', title: 'Oppenheimer', time: '1 day ago', icon: Film },
  ]);

  const saveProfile = () => {
    localStorage.setItem('dashboardUser', JSON.stringify(user));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name || 'Your Profile'}
              </h1>
              <p className="text-gray-600">Entertainment enthusiast</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-4 text-white">
            <Film size={24} className="mb-2" />
            <div className="text-2xl font-bold">{stats.moviesWatched}</div>
            <div className="text-sm opacity-90">Movies Watched</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-4 text-white">
            <Music size={24} className="mb-2" />
            <div className="text-2xl font-bold">{stats.songsPlayed}</div>
            <div className="text-sm opacity-90">Songs Played</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 text-white">
            <Clock size={24} className="mb-2" />
            <div className="text-2xl font-bold">{stats.hoursListened}</div>
            <div className="text-sm opacity-90">Hours Listened</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-white">
            <BarChart3 size={24} className="mb-2" />
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <div className="text-sm opacity-90">Day Streak</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2" size={24} />
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center p-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">{activity.type}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
              <Heart size={24} className="text-red-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Favorites</div>
                <div className="text-sm text-gray-500">Your liked content</div>
              </div>
            </button>
            <button className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
              <Bookmark size={24} className="text-blue-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Watchlist</div>
                <div className="text-sm text-gray-500">Saved for later</div>
              </div>
            </button>
            <button className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
              <Settings size={24} className="text-gray-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Settings</div>
                <div className="text-sm text-gray-500">App preferences</div>
              </div>
            </button>
            <button className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
              <BarChart3 size={24} className="text-purple-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Analytics</div>
                <div className="text-sm text-gray-500">Your stats</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
