// components/Navigation.js
import {
  Home, Film, DollarSign, StickyNote, Newspaper,
  HardDrive, Trophy, User, Brain, MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation({ active, setActive }) {
  const [showMore, setShowMore] = useState(false);
  
  // Primary navigation items (always visible)
  const primaryLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ai', label: 'AI', icon: Brain },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Secondary navigation items (in "More" menu)
  const secondaryLinks = [
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'drives', label: 'Drives', icon: HardDrive },
    { id: 'sports', label: 'Sports', icon: Trophy },
  ];

  // All links combined for checking if active item is in secondary
  const allLinks = [...primaryLinks, ...secondaryLinks];
  const isActiveInSecondary = secondaryLinks.some(link => link.id === active);

  /* Hide/show on scroll */
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShow(false);
        setShowMore(false); // Hide more menu when scrolling
      } else if (currentScrollY < lastScrollY) {
        setShow(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
             onClick={() => setShowMore(false)} />
      )}

      {/* More Menu Popup */}
      {showMore && (
        <div className="fixed bottom-20 right-4 z-50 bg-black/90 backdrop-blur-xl border border-white/20 
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
                        ? 'bg-white/25 text-white border border-white/30'
                        : 'hover:bg-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-xs mt-1 font-medium">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="mx-2 mb-2 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl">
          {/* Safe area padding for iPhone */}
          <div className="px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              {/* Primary Navigation Items */}
              {primaryLinks.map(link => {
                const Icon = link.icon;
                const isActive = active === link.id;
                
                return (
                  <button
                    key={link.id}
                    onClick={() => setActive(link.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 flex-1 mx-1 ${
                      isActive
                        ? 'bg-white/25 backdrop-blur-xl transform scale-105 shadow-lg border border-white/30'
                        : 'hover:bg-white/10 active:scale-95'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[10px] mt-1 font-medium transition-colors duration-200 leading-tight ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}>
                      {link.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse" />
                    )}
                  </button>
                );
              })}

              {/* More Button */}
              <button
                onClick={handleMoreClick}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 flex-1 mx-1 relative ${
                  showMore || isActiveInSecondary
                    ? 'bg-white/25 backdrop-blur-xl transform scale-105 shadow-lg border border-white/30'
                    : 'hover:bg-white/10 active:scale-95'
                }`}
              >
                <MoreHorizontal
                  size={20}
                  className={`transition-all duration-200 ${
                    showMore || isActiveInSecondary ? 'text-white rotate-90' : 'text-gray-400'
                  }`}
                  strokeWidth={showMore || isActiveInSecondary ? 2.5 : 2}
                />
                <span className={`text-[10px] mt-1 font-medium transition-colors duration-200 leading-tight ${
                  showMore || isActiveInSecondary ? 'text-white' : 'text-gray-400'
                }`}>
                  More
                </span>
                
                {/* Active indicator for secondary items */}
                {isActiveInSecondary && (
                  <div className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse" />
                )}
                
                {/* Notification dot for more items */}
                {!isActiveInSecondary && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
