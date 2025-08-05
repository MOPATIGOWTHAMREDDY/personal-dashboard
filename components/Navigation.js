import { Home, Film, Music, Newspaper, TrendingUp, User, MoreHorizontal } from 'lucide-react';

const Navigation = ({ activeCategory, setActiveCategory }) => {
  const navItems = [
    { id: 'home', label: 'Browse', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'profile', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <>
      {/* Bottom Navigation - Modern iOS Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-8 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex justify-around items-center h-20 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 transition-all duration-300 rounded-2xl ${
                    isActive 
                      ? 'bg-white/20 backdrop-blur-xl transform scale-105 shadow-lg border border-white/20' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon 
                    size={22} 
                    className={`transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 bg-white rounded-full mt-1 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;