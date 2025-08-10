// components/Navigation.js
import {
  Home, Film, TrendingUp, StickyNote, Newspaper,
  HardDrive, Trophy, User, Brain
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation({ active, setActive }) {
  const links = [
    { id:'home',   label:'Home',   icon:Home },
    { id:'movies', label:'Movies', icon:Film },
    { id:'budget', label:'Stocks', icon:TrendingUp },
    { id:'ai',     label:'AI',     icon:Brain },
    { id:'notes',  label:'Notes',  icon:StickyNote },
    { id:'news',   label:'News',   icon:Newspaper },
    { id:'drives', label:'Drives', icon:HardDrive },
    { id:'sports', label:'Sports', icon:Trophy },
    { id:'profile',label:'Profile',icon:User },
  ];

  /* Hide/show on scroll */
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShow(false); // Hide when scrolling down
      } else if (currentScrollY < lastScrollY) {
        setShow(true);  // Show when scrolling up
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
      show ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="mx-4 mb-4 bg-black/70 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl">
        <div className="flex h-16 items-center justify-center overflow-x-auto scrollbar-hide px-2">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = active === link.id;
            
            return (
              <button
                key={link.id}
                onClick={() => setActive(link.id)}
                className={`flex flex-col items-center justify-center p-2 min-w-[70px] mx-1 rounded-2xl transition-all duration-300 ${
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
                  {link.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
