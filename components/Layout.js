/* eslint-disable react/display-name */
// components/Layout.js
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Navigation from './Navigation';

/* ───────── CLIENT-ONLY PAGES ───────── */
const Home = dynamic(() => import('./Home'), { ssr: false });
const Movies = dynamic(() => import('./Movies'), { ssr: false });
const BudgetManager = dynamic(() => import('./BudgetManager'), { ssr: false });
const NotesManager = dynamic(() => import('./NotesManager'), { ssr: false });
const News = dynamic(() => import('./News'), { ssr: false });
const MultiDrive = dynamic(() => import('./MultiDriveFileManager'), { ssr: false });
const Sports = dynamic(() => import('./Sports'), { ssr: false });
const Profile = dynamic(() => import('./Profile'), { ssr: false });
const AIPage = dynamic(() => import('./AIPage'), { ssr: false });
const PersonalDashboard = dynamic(() => import('./PersonalDashboard'), { ssr: false });

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
  </div>
);

const ROUTES = {
  home: { label: 'Home', view: Home },
  movies: { label: 'Movies', view: Movies },
  budget: { label: 'Budget', view: PersonalDashboard }, // Changed to PersonalDashboard
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
    const C = ROUTES[category]?.view || (() => <Spinner />);
    
    if (category === 'home') return () => <C setActiveCategory={setCategory} initialMovies={initialMovies} initialNews={initialNews} />;
    if (category === 'movies') return () => <C initialData={initialMovies} />;
    if (category === 'news') return () => <C initialData={initialNews} />;
    if (category === 'profile') return () => <C user={user} setUser={setUser} />;
    return C;
  }, [category, user, initialMovies, initialNews]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* MAIN CONTENT - Full Screen */}
      <main className="pb-20"> {/* Bottom padding for nav bar */}
        <Page />
      </main>

      {/* BOTTOM NAVIGATION - Always Visible */}
      <Navigation active={category} setActive={setCategory} items={ROUTES} />
    </div>
  );
}
