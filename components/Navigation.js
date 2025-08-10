/* eslint-disable react-hooks/rules-of-hooks */
import {
  Home, Film, TrendingUp, StickyNote, Newspaper,
  HardDrive, Trophy, User, Brain, DollarSign, MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation({ active, setActive }) {
  if (!setActive || typeof setActive !== 'function') {
    console.error('Navigation: setActive prop is missing or not a function');
    return null;
  }

  const [showMore, setShowMore] = useState(false);
  
  const primaryLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ai', label: 'AI', icon: Brain },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: DollarSign },
  ];

  const secondaryLinks = [
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'drives', label: 'Drives', icon: HardDrive },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const isActiveInSecondary = secondaryLinks.some(link => link.id === active);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMore(false);
    if (showMore) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMore]);

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowMore(!showMore);
  };

  const handleSecondaryClick = (linkId) => {
    setActive(linkId);
    setShowMore(false);
  };

  const handlePrimaryClick = (linkId) => {
    setActive(linkId);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
             onClick={() => setShowMore(false)} />
      )}

      {/* More Menu Popup */}
      {showMore && (
        <div className="fixed bottom-20 right-4 z-50 bg-black/95 backdrop-blur-2xl border border-white/20 
                        rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {secondaryLinks.map(link => {
                const Icon = link.icon;
                const isActive = active === link.id;
                
                return (
                  <button
                    key={link.id}
                    onClick={() => handleSecondaryClick(link.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[80px] ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg border border-white/30'
                        : 'hover:bg-white/10 text-gray-300 hover:text-white hover:scale-105'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] mt-1 font-medium">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation - Compact iOS Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="mx-3 mb-3 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-2xl">
            {/* Main Nav Content - Reduced padding */}
            <div className="px-2 py-2">
              <div className="flex items-center justify-between">
                {/* Primary Navigation Items */}
                {primaryLinks.map(link => {
                  const Icon = link.icon;
                  const isActive = active === link.id;
                  
                  return (
                    <button
                      key={link.id}
                      onClick={() => handlePrimaryClick(link.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 flex-1 mx-0.5 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-lg scale-105'
                          : 'hover:bg-white/8 text-gray-400 hover:text-white active:scale-95'
                      }`}
                    >
                      <Icon
                        size={20}
                        className="transition-colors duration-200"
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className="text-[9px] mt-0.5 font-semibold transition-colors duration-200 leading-tight">
                        {link.label}
                      </span>
                      {/* Active indicator */}
                      {isActive && (
                        <div className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse" />
                      )}
                    </button>
                  );
                })}

                {/* More Button */}
                <button
                  onClick={handleMoreClick}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 flex-1 mx-0.5 relative ${
                    showMore || isActiveInSecondary
                      ? 'bg-white/15 text-white shadow-lg scale-105'
                      : 'hover:bg-white/8 text-gray-400 hover:text-white active:scale-95'
                  }`}
                >
                  <MoreHorizontal
                    size={20}
                    className={`transition-all duration-300 ${
                      showMore || isActiveInSecondary ? 'rotate-90' : ''
                    }`}
                    strokeWidth={showMore || isActiveInSecondary ? 2.5 : 2}
                  />
                  <span className="text-[9px] mt-0.5 font-semibold transition-colors duration-200 leading-tight">
                    More
                  </span>
                  
                  {/* Active indicator for secondary items */}
                  {(isActiveInSecondary && !showMore) && (
                    <div className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse" />
                  )}
                  
                  {/* Notification dot */}
                  {!isActiveInSecondary && !showMore && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Minimal safe area bottom padding */}
            <div className="h-[max(0.5rem,env(safe-area-inset-bottom))]" />
          </div>
        </div>
      </nav>
    </>
  );
}