/* eslint-disable react/display-name */
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Brain, Home as HomeIcon } from 'lucide-react';
import Navigation from './Navigation';

const Home = dynamic(() => import('./Home'), { ssr: false });
const Movies = dynamic(() => import('./Movies'), { ssr: false });
const PersonalDashboard = dynamic(() => import('./PersonalDashboard'), { ssr: false });
const NotesManager = dynamic(() => import('./NotesManager'), { ssr: false });
const News = dynamic(() => import('./News'), { ssr: false });
const MultiDrive = dynamic(() => import('./MultiDriveFileManager'), { ssr: false });
const Sports = dynamic(() => import('./Sports'), { ssr: false });
const Profile = dynamic(() => import('./Profile'), { ssr: false });
const AIPage = dynamic(() => import('./AIPage'), { ssr: false });
const NSEStocksPage = dynamic(() => import('./NSELiveTradingBot'), { ssr: false });

const ROUTES = {
  home: { label: 'Home', view: Home },
  movies: { label: 'Movies', view: Movies },
  stocks: { label: 'Stocks', view: NSEStocksPage },
  budget: { label: 'Budget', view: PersonalDashboard },
  ai: { label: 'AI', view: AIPage },
  notes: { label: 'Notes', view: NotesManager },
  news: { label: 'News', view: News },
  drives: { label: 'Drives', view: MultiDrive },
  sports: { label: 'Sports', view: Sports },
  profile: { label: 'Profile', view: Profile },
};

export default function Layout({ initialMovies = [], initialNews = [] }) {
  const [category, setCategory] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem('dashboardUser');
      if (s) setUser(JSON.parse(s));
    } catch {}
  }, []);

  const Page = useMemo(() => {
  const C = ROUTES[category]?.view || (() => <div>Loading...</div>);
      
  if (category === 'home') {
    return () => <C setActiveCategory={setCategory} initialMovies={initialMovies} initialNews={initialNews} />;
  }
  if (category === 'movies') {
    return () => <C initialData={initialMovies} />;
  }
  if (category === 'news') {
    return () => <C initialData={initialNews} />;
  }
  if (category === 'profile') {
    return () => <C user={user} setUser={setUser} />;
  }
  if (category === 'ai') {
    return () => <C setActiveCategory={setCategory} />;
  }
  return C;
}, [category, user, initialMovies, initialNews]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* AI Split View Layout */}
      {category === 'ai' ? (
        <div className="flex h-screen">
          {/* Left Sidebar - Mini Home */}
          <div className="w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <HomeIcon size={20} />
                Quick Access
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory('home')}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="font-medium">← Back to Home</div>
                  <div className="text-xs text-gray-400">Return to main dashboard</div>
                </button>
                
                {/* Quick shortcuts */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    { id: 'stocks', label: 'Stocks', icon: '📈' },
                    { id: 'budget', label: 'Budget', icon: '💰' },
                    { id: 'news', label: 'News', icon: '📰' },
                    { id: 'notes', label: 'Notes', icon: '📝' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setCategory(item.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
                    >
                      <div className="text-lg">{item.icon}</div>
                      <div className="text-xs">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - AI Chat */}
          <div className="flex-1 relative">
            <Page />
          </div>
        </div>
      ) : (
        /* Normal Layout for other components */
        <main className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <Page />
        </main>
      )}
      
      {/* Navigation - Hidden in AI split view */}
      {category !== 'ai' && (
        <Navigation 
          active={category}
          setActive={setCategory}
        />
      )}
      
      {/* Mini AI Toggle when not in AI mode */}
      {category !== 'ai' && (
        <button
          onClick={() => setCategory('ai')}
          className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-200
                     border border-white/20 backdrop-blur-sm"
        >
          <Brain size={20} />
        </button>
      )}
    </div>
  );
}