import React from 'react';
import { Sparkles, TrendingUp, Clock, Heart } from 'lucide-react';

const Header = ({ stats, featuredSources }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-2xl">
                <Sparkles size={32} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
              CinemaStream
            </h1>
            
            <p className="text-xl text-blue-200/80 max-w-2xl mx-auto leading-relaxed">
              Experience unlimited streaming with premium quality sources and zero interruptions
            </p>

            <div className="flex items-center justify-center mt-6 space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</div>
                  <div className="text-sm text-blue-200/70">Total Content</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{featuredSources}</div>
                  <div className="text-sm text-blue-200/70">Premium Sources</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-blue-200/70">Always Online</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-red-400 to-pink-400 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Heart size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.watchlist}</div>
                  <div className="text-sm text-blue-200/70">In Watchlist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;