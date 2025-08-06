import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navigation from './Navigation';
import Home from './Home';

// Lazy load heavy components
const Movies = dynamic(() => import('./Movies'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const Music = dynamic(() => import('./Music'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const News = dynamic(() => import('./News'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const FileManager = dynamic(() => import('./FileManager'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const Anime = dynamic(() => import('./Anime'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const Series = dynamic(() => import('./Series'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const Sports = dynamic(() => import('./Sports'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const Gaming = dynamic(() => import('./Gaming'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const Trending = dynamic(() => import('./Trending'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

const Profile = dynamic(() => import('./Profile'), { 
  ssr: false, 
  loading: () => <LoadingSpinner /> 
});

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

const Layout = ({ initialMovies = [], initialNews = [] }) => {
  const [activeCategory, setActiveCategory] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('dashboardUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const renderContent = () => {
    switch (activeCategory) {
      case 'home':
        return <Home setActiveCategory={setActiveCategory} initialMovies={initialMovies} initialNews={initialNews} />;
      case 'movies':
        return <Movies initialData={initialMovies} />;
      case 'series':
        return <Series />;
      case 'anime':
        return <Anime />;
      case 'music':
        return <Music user={user} />;
      case 'news':
        return <News initialData={initialNews} />;
      case 'files':
        return <FileManager />; // Added FileManager
      case 'sports':
        return <Sports />;
      case 'gaming':
        return <Gaming />;
      case 'trending':
        return <Trending />;
      case 'profile':
        return <Profile user={user} setUser={setUser} />;
      default:
        return <Home setActiveCategory={setActiveCategory} initialMovies={initialMovies} initialNews={initialNews} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Layout;
