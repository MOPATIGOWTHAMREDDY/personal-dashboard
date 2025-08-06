import { Home, Film, Music, Newspaper, Cloud, MoreHorizontal, Trophy, TrendingUp, Zap, Gamepad2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navigation = ({ activeCategory, setActiveCategory }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { id: 'home', label: 'Browse', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'files', label: 'Files', icon: Cloud },
    { id: 'more', label: 'More', icon: MoreHorizontal, isMore: true },
  ];

  const moreItems = [
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'anime', label: 'Anime', icon: Zap },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'profile', label: 'Profile', icon: MoreHorizontal },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setShowMoreMenu(false); // Hide more menu when nav hides
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (itemId) => {
    if (itemId === 'more') {
      setShowMoreMenu(!showMoreMenu);
    } else {
      setActiveCategory(itemId);
      setShowMoreMenu(false);
    }
  };

  // Check if active category is in more items
  const isMoreItemActive = moreItems.some(item => item.id === activeCategory);

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowMoreMenu(false)}
        />
      )}

      {/* More Menu Popup */}
      {showMoreMenu && (
        <div className="fixed bottom-24 left-4 right-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-3xl border border-white/20 rounded-3xl p-4 shadow-2xl">
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-xs mt-2 font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className={`mx-4 mb-6 bg-black/60 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl transition-all duration-300 ${
          isScrolled ? 'bg-black/80 border-white/20' : 'bg-black/40 border-white/10'
        }`}>
          <div className="flex justify-around items-center h-16 px-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isMore ? isMoreItemActive : activeCategory === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-all duration-300 rounded-2xl ${
                    isActive
                      ? 'bg-white/25 backdrop-blur-xl transform scale-105 shadow-lg border border-white/25'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon
                    size={20}
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
                  {isActive && !item.isMore && (
                    <div className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse"></div>
                  )}
                  {item.isMore && isMoreItemActive && (
                    <div className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Hide scrollbar for navigation */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Navigation;
